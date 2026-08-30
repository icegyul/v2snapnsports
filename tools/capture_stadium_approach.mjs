/* global process, document, window, console */
import { chromium } from "playwright";
import { Buffer } from "node:buffer";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
const appBaseUrl = normalizedBaseUrl.endsWith("/v2") ? normalizedBaseUrl : `${normalizedBaseUrl}/v2`;
const outputDir = process.env.STADIUM_APPROACH_EVIDENCE_DIR ?? "output/stadium-approach-evidence";
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: [
    "--use-gl=swiftshader",
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--disable-dev-shm-usage",
  ],
});

async function readState(page) {
  return page.locator(".stadium-approach-surface").evaluate((node) => ({
    requestedMode: node.getAttribute("data-requested-mode"),
    renderedMode: node.getAttribute("data-render-mode"),
    renderState: node.getAttribute("data-render-state"),
    progress: Number(node.getAttribute("data-approach-progress") ?? "0"),
    complete: node.getAttribute("data-approach-complete"),
    phase: document.querySelector(".stadium-approach-phase")?.textContent?.trim() ?? null,
    canvasReady: Boolean(document.querySelector(".stadium-approach-webgl-ready")),
    width: window.innerWidth,
    height: window.innerHeight,
  }));
}

async function capture(name, viewport, deviceScaleFactor = 1) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.stack ?? error.message));

  try {
    await page.goto(`${appBaseUrl}/home/approach`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => {
      const heading = document.querySelector(".stadium-approach-header h1");
      const surface = document.querySelector(".stadium-approach-surface");
      return heading?.textContent?.trim() === "경기장으로 다가가기"
        && surface?.getAttribute("data-render-state") === "READY"
        && Boolean(document.querySelector(".stadium-approach-webgl-ready"));
    }, { timeout: 30000 });

    const startState = await readState(page);
    const startShot = await page.screenshot({ path: `${outputDir}/${name}-start.png`, fullPage: true });

    await page.waitForFunction(() => {
      const surface = document.querySelector(".stadium-approach-surface");
      return Number(surface?.getAttribute("data-approach-progress") ?? "0") >= 0.48;
    }, { timeout: 45000 });
    const midState = await readState(page);
    const midShot = await page.screenshot({ path: `${outputDir}/${name}-mid.png`, fullPage: true });

    await page.waitForFunction(() => (
      document.querySelector(".stadium-approach-surface")?.getAttribute("data-approach-complete") === "true"
    ), { timeout: 60000 });
    const endState = await readState(page);
    const endShot = await page.screenshot({ path: `${outputDir}/${name}-end.png`, fullPage: true });

    const evidence = {
      name,
      startState,
      midState,
      endState,
      frameChangedStartToMid: Buffer.compare(startShot, midShot) !== 0,
      frameChangedMidToEnd: Buffer.compare(midShot, endShot) !== 0,
      consoleErrors,
    };
    await fs.writeFile(`${outputDir}/${name}.json`, JSON.stringify(evidence, null, 2));
    await context.close();
    return evidence;
  } catch (error) {
    const bodyText = await page.locator("body").innerText().catch(() => "<body unavailable>");
    const html = await page.content().catch(() => "<html unavailable>");
    const debug = {
      name,
      url: page.url(),
      viewport,
      consoleErrors,
      bodyText: bodyText.slice(0, 12000),
      error: error instanceof Error ? (error.stack ?? error.message) : String(error),
    };
    await page.screenshot({ path: `${outputDir}/${name}-failure.png`, fullPage: true }).catch(() => {});
    await fs.writeFile(`${outputDir}/${name}-failure.json`, JSON.stringify(debug, null, 2));
    await fs.writeFile(`${outputDir}/${name}-failure.html`, html);
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
  const valid = result.startState.renderState === "READY"
    && result.startState.renderedMode !== "STATIC"
    && result.startState.canvasReady
    && result.startState.progress < 0.48
    && result.midState.progress >= 0.48
    && result.midState.progress < 1
    && result.endState.complete === "true"
    && result.endState.progress === 1
    && result.endState.phase === "경기장 내부 진입"
    && result.frameChangedStartToMid
    && result.frameChangedMidToEnd
    && result.consoleErrors.length === 0;
  if (!valid) {
    console.error(`stadium approach verification failed for ${result.name}`, result);
    process.exitCode = 1;
  }
}
