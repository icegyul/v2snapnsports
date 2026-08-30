/* global process, document, window, console */
import { chromium } from "playwright";
import { Buffer } from "node:buffer";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
const appBaseUrl = normalizedBaseUrl.endsWith("/v2") ? normalizedBaseUrl : `${normalizedBaseUrl}/v2`;
const outputDir = process.env.STADIUM_FORMATION_EVIDENCE_DIR ?? "output/stadium-team-formation-evidence";
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--disable-dev-shm-usage"],
});

async function state(page) {
  return page.locator(".team-formation-3d-surface").evaluate((node) => ({
    requestedMode: node.getAttribute("data-requested-mode"),
    renderedMode: node.getAttribute("data-render-mode"),
    renderState: node.getAttribute("data-render-state"),
    progress: Number(node.getAttribute("data-formation-progress") ?? "0"),
    complete: node.getAttribute("data-formation-complete"),
    teammateCount: Number(node.getAttribute("data-teammate-count") ?? "-1"),
    canvasReady: Boolean(document.querySelector(".team-formation-3d-ready")),
    visibleTeammates: document.querySelectorAll(".team-formation-roster span.is-visible").length,
    ownChip: document.querySelector(".team-formation-own-chip")?.textContent?.trim() ?? null,
    hud: document.querySelector(".team-formation-hud > span")?.textContent?.trim() ?? null,
    bodyText: document.body.innerText,
    width: window.innerWidth,
    height: window.innerHeight,
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
    await page.goto(`${appBaseUrl}/home/formation`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => {
      const heading = document.querySelector(".team-formation-header h1");
      const surface = document.querySelector(".team-formation-3d-surface");
      return heading?.textContent?.trim() === "나의 팀 포메이션"
        && surface?.getAttribute("data-render-state") === "READY"
        && Boolean(document.querySelector(".team-formation-3d-ready"));
    }, { timeout: 30000 });

    const start = await state(page);
    const startShot = await page.screenshot({ path: `${outputDir}/${name}-start.png`, fullPage: true });

    await page.waitForFunction(() => Number(
      document.querySelector(".team-formation-3d-surface")?.getAttribute("data-formation-progress") ?? "0",
    ) >= 0.55, { timeout: 70000, polling: 250 });
    const mid = await state(page);
    const midShot = await page.screenshot({ path: `${outputDir}/${name}-mid.png`, fullPage: true });

    await page.waitForFunction(() => (
      document.querySelector(".team-formation-3d-surface")?.getAttribute("data-formation-complete") === "true"
    ), { timeout: 100000, polling: 300 });
    const end = await state(page);
    const endShot = await page.screenshot({ path: `${outputDir}/${name}-end.png`, fullPage: true });

    const privacyLabels = await page.locator(".team-formation-roster span[aria-label^='동료 등번호']").evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("aria-label")),
    );

    const evidence = {
      name,
      start,
      mid,
      end,
      privacyLabels,
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
    && result.start.teammateCount === 3
    && result.mid.progress >= 0.55
    && result.mid.progress < 1
    && result.end.complete === "true"
    && result.end.progress === 1
    && result.end.visibleTeammates === 3
    && result.end.ownChip === "#8 · 나"
    && result.end.hud === "현재 연결 데이터 표시 완료"
    && result.privacyLabels.includes("동료 등번호 4, DF")
    && result.privacyLabels.includes("동료 등번호 7, MF")
    && result.privacyLabels.includes("동료 등번호 11, FW")
    && !result.end.bodyText.includes("Fixture Player")
    && result.frameChangedStartToMid
    && result.frameChangedMidToEnd
    && result.consoleErrors.length === 0;
  if (!valid) {
    console.error(`team formation verification failed for ${result.name}`, result);
    process.exitCode = 1;
  }
}
