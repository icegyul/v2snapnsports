/* global process, document, window, console */
import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const outputDir = process.env.STADIUM_EVIDENCE_DIR ?? "output/stadium-visual-evidence";
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

async function capture(name, viewport, deviceScaleFactor = 1) {
  const context = await browser.newContext({ viewport, deviceScaleFactor });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "나의 경기장" }).waitFor({ timeout: 15000 });
  await page.locator(".stadium-webgl-canvas").waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(1500);
  const state = await page.locator(".stadium-interaction-surface").evaluate((node) => ({
    requestedMode: node.getAttribute("data-requested-mode"),
    renderedMode: node.getAttribute("data-rendered-mode"),
    canvasReady: Boolean(document.querySelector(".stadium-webgl-ready")),
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  await page.screenshot({ path: `${outputDir}/${name}.png`, fullPage: true });
  await fs.writeFile(`${outputDir}/${name}.json`, JSON.stringify({ state, consoleErrors }, null, 2));
  await context.close();
  return { name, state, consoleErrors };
}

const results = [];
results.push(await capture("desktop-1440x1000", { width: 1440, height: 1000 }));
results.push(await capture("mobile-390x844", { width: 390, height: 844 }, 2));
await fs.writeFile(`${outputDir}/summary.json`, JSON.stringify(results, null, 2));
await browser.close();

for (const result of results) {
  if (!result.state.canvasReady || result.state.renderedMode === "STATIC") {
    console.error(`stadium visual verification failed for ${result.name}`, result);
    process.exitCode = 1;
  }
}
