/* global process, console, window */
import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const appBaseUrl = `${baseUrl.replace(/\/+$/, "")}/v2`;
const outputDir = process.env.STADIUM_INTERIOR_EVIDENCE_DIR ?? "output/stadium-interior-evidence";
await fs.mkdir(outputDir, { recursive: true });

const browserGlArgs = (process.env.STADIUM_BROWSER_GL_ARGS
  ?? "--use-gl=swiftshader --enable-webgl --ignore-gpu-blocklist --disable-dev-shm-usage")
  .split(" ")
  .filter(Boolean);

const browser = await chromium.launch({ headless: true, args: browserGlArgs });
const checks = [];
const record = (name, pass, detail = "") => {
  checks.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};

async function captureHome(name, presetId, viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.stack ?? error.message));

  await page.goto(`${appBaseUrl}/home`, { waitUntil: "domcontentloaded" });
  if (presetId) {
    await page.evaluate((id) => window.localStorage.setItem("snapn:v2:stadium-selection", id), presetId);
    await page.reload({ waitUntil: "domcontentloaded" });
  }
  await page.waitForSelector(".stadium-webgl-ready", { timeout: 30000 });
  await page.waitForTimeout(2600);

  const surface = page.locator(".stadium-interaction-surface");
  record(`${name}: preset applied`, (await surface.getAttribute("data-stadium-preset")) === (presetId ?? "signature-arc"));
  await page.screenshot({ path: `${outputDir}/${name}-rise0.png` });

  // Climb the stands via keyboard rise, then dolly in via wheel.
  await surface.focus();
  for (let i = 0; i < 5; i += 1) await page.keyboard.press("ArrowUp");
  await page.waitForTimeout(500);
  record(`${name}: rise climbs`, Number(await surface.getAttribute("data-rise")) > 0.5);
  await page.screenshot({ path: `${outputDir}/${name}-rise-high.png` });

  for (let i = 0; i < 4; i += 1) await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outputDir}/${name}-orbit.png` });

  const blocking = consoleErrors.filter((text) => !text.includes("favicon"));
  record(`${name}: no console errors`, blocking.length === 0, blocking.slice(0, 2).join(" | "));
  await context.close();
}

try {
  await captureHome("desktop-default", null, { width: 1280, height: 800 });
  await captureHome("mobile-night", "night-cyan", { width: 430, height: 932 });
  await captureHome("desktop-coastal", "coastal-open", { width: 1280, height: 800 });
} finally {
  await browser.close();
}

const failed = checks.filter((check) => !check.pass);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
if (failed.length > 0) process.exit(1);
