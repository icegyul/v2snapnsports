/* global process, document, console */
import { chromium } from "playwright";
import { Buffer } from "node:buffer";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
const appBaseUrl = normalizedBaseUrl.endsWith("/v2") ? normalizedBaseUrl : `${normalizedBaseUrl}/v2`;
const outputDir = process.env.STADIUM_PROJECTION_EVIDENCE_DIR ?? "output/stadium-digital-projection-evidence";
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--disable-dev-shm-usage"],
});

async function state(page) {
  return page.locator(".digital-projection-surface").evaluate((node) => ({
    requestedMode: node.getAttribute("data-requested-mode"),
    renderedMode: node.getAttribute("data-render-mode"),
    renderState: node.getAttribute("data-render-state"),
    progress: Number(node.getAttribute("data-projection-progress") ?? "0"),
    complete: node.getAttribute("data-projection-complete"),
    canvasReady: Boolean(document.querySelector(".digital-projection-ready")),
    dataVisible: Boolean(document.querySelector(".digital-projection-data-visible")),
    headline: document.querySelector(".digital-projection-data strong")?.textContent?.trim() ?? null,
    detail: Array.from(document.querySelectorAll(".digital-projection-data small")).map((node) => node.textContent?.trim() ?? ""),
    hud: document.querySelector(".digital-projection-hud > span")?.textContent?.trim() ?? null,
    bodyText: document.body.innerText,
  }));
}

async function capture(name, viewport, deviceScaleFactor = 1) {
  const context = await browser.newContext({ viewport, deviceScaleFactor, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.stack ?? error.message));

  try {
    await page.goto(`${appBaseUrl}/home/projection`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => {
      const heading = document.querySelector(".digital-projection-header h1");
      const surface = document.querySelector(".digital-projection-surface");
      return heading?.textContent?.trim() === "디지털 프로젝션"
        && surface?.getAttribute("data-render-state") === "READY"
        && Boolean(document.querySelector(".digital-projection-ready"));
    }, { timeout: 30000 });

    const start = await state(page);
    const startShot = await page.screenshot({ path: `${outputDir}/${name}-start.png`, fullPage: true });

    await page.waitForFunction(() => Number(
      document.querySelector(".digital-projection-surface")?.getAttribute("data-projection-progress") ?? "0",
    ) >= 0.52, { timeout: 70000, polling: 250 });
    const mid = await state(page);
    const midShot = await page.screenshot({ path: `${outputDir}/${name}-mid.png`, fullPage: true });

    await page.waitForFunction(() => (
      document.querySelector(".digital-projection-surface")?.getAttribute("data-projection-complete") === "true"
    ), { timeout: 100000, polling: 300 });
    const end = await state(page);
    const endShot = await page.screenshot({ path: `${outputDir}/${name}-end.png`, fullPage: true });

    const nextHref = await page.locator(".digital-projection-footer a").getAttribute("href");
    const evidence = {
      name,
      start,
      mid,
      end,
      nextHref,
      frameChangedStartToMid: Buffer.compare(startShot, midShot) !== 0,
      frameChangedMidToEnd: Buffer.compare(midShot, endShot) !== 0,
      consoleErrors,
    };
    await fs.writeFile(`${outputDir}/${name}.json`, JSON.stringify(evidence, null, 2));
    await context.close();
    return evidence;
  } catch (error) {
    const debug = {
      name,
      url: page.url(),
      consoleErrors,
      bodyText: (await page.locator("body").innerText().catch(() => "")).slice(0, 12000),
      error: error instanceof Error ? (error.stack ?? error.message) : String(error),
    };
    await page.screenshot({ path: `${outputDir}/${name}-failure.png`, fullPage: true }).catch(() => {});
    await fs.writeFile(`${outputDir}/${name}-failure.json`, JSON.stringify(debug, null, 2));
    await context.close();
    throw error;
  }
}

const results = [];
try {
  results.push(await capture("desktop-1440x1000", { width: 1440, height: 1000 }));
  results.push(await capture("mobile-390x844", { width: 390, height: 844 }, 2));
  await fs.writeFile(`${outputDir}/summary.json`, JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}

for (const result of results) {
  const valid = result.start.renderState === "READY"
    && result.start.renderedMode !== "STATIC"
    && result.start.canvasReady
    && result.mid.progress >= 0.52
    && result.mid.progress < 1
    && result.mid.dataVisible
    && result.end.complete === "true"
    && result.end.progress === 1
    && result.end.dataVisible
    && result.end.headline === "#8 · 중앙 미드필더"
    && result.end.detail.some((value) => value.includes("DEMO U17 A팀") && value.includes("4-3-3") && value.includes("연결 동료 3명"))
    && result.end.detail.includes("데모 팀 상태 · 일정 확인 필요")
    && result.end.hud === "프로젝션 준비 완료"
    && result.nextHref === "/home/position"
    && !result.end.bodyText.includes("Fixture Player")
    && result.frameChangedStartToMid
    && result.frameChangedMidToEnd
    && result.consoleErrors.length === 0;
  if (!valid) {
    console.error(`digital projection verification failed for ${result.name}`, result);
    process.exitCode = 1;
  }
}
