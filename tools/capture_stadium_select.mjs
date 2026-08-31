/* global process, document, console, window */
import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const appBaseUrl = `${baseUrl.replace(/\/+$/, "")}/v2`;
const outputDir = process.env.STADIUM_SELECT_EVIDENCE_DIR ?? "output/stadium-select-evidence";
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

const context = await browser.newContext({ viewport: { width: 430, height: 932 }, reducedMotion: "no-preference" });
const page = await context.newPage();
const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(error.stack ?? error.message));

try {
  // 1. Home starts on the default stadium and exposes the picker entry.
  await page.goto(`${appBaseUrl}/home`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".stadium-webgl-ready", { timeout: 30000 });
  const surface = page.locator(".stadium-interaction-surface");
  record("home default preset", (await surface.getAttribute("data-stadium-preset")) === "signature-arc");
  const entry = page.getByRole("link", { name: "경기장 선택" });
  record("picker entry visible", await entry.isVisible());
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `${outputDir}/01-home-default.png` });

  // 2. Picker page renders every preset card and a live 3D preview.
  await entry.click();
  await page.waitForURL(/\/v2\/home\/stadium$/, { timeout: 15000 });
  const cards = page.getByRole("radio");
  await cards.first().waitFor({ timeout: 15000 });
  await page.waitForFunction(() => document.querySelectorAll('[role="radio"]').length >= 8, { timeout: 15000 });
  record("preset card count", (await cards.count()) >= 8, String(await cards.count()));
  await page.waitForFunction(() => {
    const preview = document.querySelector(".stadium-select-preview");
    return preview?.getAttribute("data-preview-state") === "READY";
  }, { timeout: 30000 });
  record("live preview ready", true);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${outputDir}/02-picker-default.png` });

  // 3. Tapping a card refocuses the live preview onto its recipe.
  await page.getByRole("radio", { name: /나이트 이벤트/ }).click();
  await page.waitForFunction(() => {
    const preview = document.querySelector(".stadium-select-preview");
    return preview?.getAttribute("data-preview-preset") === "night-cyan"
      && preview.getAttribute("data-preview-state") === "READY";
  }, { timeout: 30000 });
  record("preview refocus on tap", true);
  const checked = page.locator('[role="radio"][aria-checked="true"]');
  record("card checked state", (await checked.getAttribute("data-preset-id")) === "night-cyan");
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${outputDir}/03-picker-night.png` });

  // 4. Confirming persists the choice and reskins the home stadium.
  await page.getByRole("button", { name: "이 경기장 사용" }).click();
  await page.waitForURL(/\/v2\/home$/, { timeout: 15000 });
  await page.waitForSelector(".stadium-webgl-ready", { timeout: 30000 });
  record(
    "home reskinned after confirm",
    (await page.locator(".stadium-interaction-surface").getAttribute("data-stadium-preset")) === "night-cyan",
  );
  const stored = await page.evaluate(() => window.localStorage.getItem("snapn:v2:stadium-selection"));
  record("selection persisted", stored === "night-cyan", String(stored));
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `${outputDir}/04-home-night.png` });

  // 5. Reload keeps the selection (persistence survives a fresh session).
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".stadium-webgl-ready", { timeout: 30000 });
  record(
    "selection survives reload",
    (await page.locator(".stadium-interaction-surface").getAttribute("data-stadium-preset")) === "night-cyan",
  );

  const blockingErrors = consoleErrors.filter((text) => !text.includes("favicon"));
  record("no console errors", blockingErrors.length === 0, blockingErrors.slice(0, 3).join(" | "));
} finally {
  await browser.close();
}

const failed = checks.filter((check) => !check.pass);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
if (failed.length > 0) process.exit(1);
