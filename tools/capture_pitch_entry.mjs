/* global process, document, window, console */
import { chromium } from "playwright";
import { Buffer } from "node:buffer";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
const appBaseUrl = normalizedBaseUrl.endsWith("/v2") ? normalizedBaseUrl : `${normalizedBaseUrl}/v2`;
const outputDir = process.env.STADIUM_PITCH_ENTRY_EVIDENCE_DIR ?? "output/stadium-pitch-entry-evidence";
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--disable-dev-shm-usage"],
});

async function readState(page) {
  return page.locator(".pitch-entry-surface").evaluate((node) => ({
    requestedMode: node.getAttribute("data-requested-mode"),
    renderedMode: node.getAttribute("data-render-mode"),
    renderState: node.getAttribute("data-render-state"),
    progress: Number(node.getAttribute("data-pitch-entry-progress") ?? "0"),
    complete: node.getAttribute("data-pitch-entry-complete"),
    phase: document.querySelector(".pitch-entry-phase")?.textContent?.trim() ?? null,
    canvasReady: Boolean(document.querySelector(".pitch-entry-webgl-ready")),
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
    await page.goto(`${appBaseUrl}/home/enter`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => {
      const heading = document.querySelector(".pitch-entry-header h1");
      const surface = document.querySelector(".pitch-entry-surface");
      return heading?.textContent?.trim() === "피치 진입"
        && surface?.getAttribute("data-render-state") === "READY"
        && Boolean(document.querySelector(".pitch-entry-webgl-ready"));
    }, { timeout: 30000 });

    const startState = await readState(page);
    const startShot = await page.screenshot({ path: `${outputDir}/${name}-start.png`, fullPage: true });

    await page.waitForFunction(() => Number(
      document.querySelector(".pitch-entry-surface")?.getAttribute("data-pitch-entry-progress") ?? "0",
    ) >= 0.48, { timeout: 60000, polling: 250 });
    const midState = await readState(page);
    const midShot = await page.screenshot({ path: `${outputDir}/${name}-mid.png`, fullPage: true });

    await page.waitForFunction(() => (
      document.querySelector(".pitch-entry-surface")?.getAttribute("data-pitch-entry-complete") === "true"
    ), { timeout: 90000, polling: 300 });
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
    && result.endState.phase === "피치 레벨"
    && result.frameChangedStartToMid
    && result.frameChangedMidToEnd
    && result.consoleErrors.length === 0;
  if (!valid) {
    console.error(`pitch entry verification failed for ${result.name}`, result);
    process.exitCode = 1;
  }
}
