/* global process, console */
import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const appBaseUrl = `${baseUrl.replace(/\/+$/, "")}/v2`;
const outputDir = process.env.STADIUM_TACTICS_EVIDENCE_DIR ?? "output/stadium-tactics-diy-evidence";
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

async function run(name, viewport, flow) {
  const context = await browser.newContext({ viewport, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.stack ?? error.message));
  try {
    await flow(page);
    const blocking = consoleErrors.filter((text) => !text.includes("favicon"));
    record(`${name}: no console errors`, blocking.length === 0, blocking.slice(0, 2).join(" | "));
  } finally {
    await context.close();
  }
}

// 1. FC-style tactics field on /home/full (desktop + mobile).
for (const [label, viewport] of [["desktop", { width: 1280, height: 800 }], ["mobile", { width: 430, height: 932 }]]) {
  await run(`tactics-${label}`, viewport, async (page) => {
    await page.goto(`${appBaseUrl}/home/full`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".team-tactics-field", { timeout: 30000 });
    await page.waitForTimeout(2200);

    const markers = page.getByTestId("tactics-marker");
    record(`tactics-${label}: 4 cards`, (await markers.count()) === 4);
    const ratings = await page.locator(".team-tactics-rating").allTextContents();
    record(`tactics-${label}: ratings shown`, ratings.length === 4 && ratings.every((value) => /^\d{2,3}$/.test(value)));
    record(`tactics-${label}: detail panel default OWN`,
      (await page.locator(".team-tactics-panel").getAttribute("data-panel-player")) === "OWN");
    await page.screenshot({ path: `${outputDir}/tactics-${label}-default.png` });

    // Cards layer like the game (nearer card in front), so tap the visible
    // top edge of the far card the way a real user would.
    await page.getByRole("button", { name: "동료 등번호 11, FW" }).click({ position: { x: 26, y: 12 } });
    await page.waitForTimeout(400);
    record(`tactics-${label}: panel follows selection`,
      (await page.locator(".team-tactics-panel").getAttribute("data-panel-player")) === "11");
    await page.screenshot({ path: `${outputDir}/tactics-${label}-selected.png` });
  });
}

// 2. DIY: builder -> apply -> home renders the custom stadium -> picker lists it.
await run("diy-flow", { width: 1280, height: 800 }, async (page) => {
  await page.goto(`${appBaseUrl}/home/stadium`, { waitUntil: "domcontentloaded" });
  const diyLink = page.getByRole("link", { name: /직접 만들기/ });
  record("diy-flow: DIY entry on picker", await diyLink.isVisible());
  await diyLink.click();
  await page.waitForURL(/\/v2\/home\/builder$/, { timeout: 20000 });
  await page.waitForSelector(".stadium-builder-preview-canvas", { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outputDir}/diy-builder.png` });

  await page.getByRole("button", { name: /이 경기장 사용/ }).click();
  await page.waitForURL(/\/v2\/home$/, { timeout: 20000 });
  await page.waitForSelector(".stadium-webgl-ready", { timeout: 30000 });
  record("diy-flow: home uses custom stadium",
    (await page.locator(".stadium-interaction-surface").getAttribute("data-stadium-preset")) === "custom-diy");
  await page.waitForTimeout(2400);
  await page.screenshot({ path: `${outputDir}/diy-home.png` });

  await page.goto(`${appBaseUrl}/home/stadium`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".stadium-select-cards", { timeout: 20000 });
  record("diy-flow: custom card listed", await page.getByText("나의 DIY 경기장").first().isVisible());
  record("diy-flow: premium badges listed", (await page.getByText("프리미엄 · 출시 기념 무료").count()) >= 1);
  await page.screenshot({ path: `${outputDir}/diy-picker.png`, fullPage: true });
});

await browser.close();

const failed = checks.filter((check) => !check.pass);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
if (failed.length > 0) process.exit(1);
