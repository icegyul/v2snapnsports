/* global process, console, window */
// Walks the locker-room card the way a player would: arrive from the career
// passport, read the card, turn it over for the career record, come back.
import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const appBaseUrl = `${baseUrl.replace(/\/+$/, "")}/v2`;
const outputDir = process.env.PLAYER_CARD_EVIDENCE_DIR ?? "output/player-card-evidence";
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

async function run(label, viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.stack ?? error.message));

  // Reachable from the career passport, not only by typing a URL.
  await page.goto(`${appBaseUrl}/player/me/career`, { waitUntil: "domcontentloaded" });
  const entry = page.getByRole("link", { name: "마이 카드" });
  record(`${label}: reachable from career passport`, await entry.isVisible());
  await entry.click();
  await page.waitForURL(/\/v2\/player\/me\/card$/, { timeout: 20000 });

  const card = page.locator(".player-card");
  await card.waitFor({ timeout: 20000 });
  const tier = await card.getAttribute("data-card-tier");
  record(`${label}: card front`, (await card.getAttribute("data-card-face")) === "FRONT"
    && ["BRONZE", "SILVER", "GOLD"].includes(tier), `tier ${tier}`);
  record(`${label}: six ability gauges`, (await page.getByTestId("player-card-stat").count()) === 6);
  const rating = await page.locator(".player-card-rating").textContent();
  record(`${label}: rating shown`, /^\d{2,3}$/.test((rating ?? "").trim()), `rating ${rating}`);
  await page.screenshot({ path: `${outputDir}/${label}-front.png` });

  await page.getByRole("button", { name: "커리어 기록 보기" }).click();
  await page.locator(".player-card-back").waitFor({ timeout: 10000 });
  record(`${label}: turns over to career`, (await card.getAttribute("data-card-face")) === "BACK"
    && (await page.locator(".player-card-timeline li").count()) >= 1);
  await page.screenshot({ path: `${outputDir}/${label}-back.png` });

  await page.getByRole("button", { name: "카드 앞면 보기" }).click();
  await page.locator(".player-card-front").waitFor({ timeout: 10000 });
  record(`${label}: turns back to the card`, (await card.getAttribute("data-card-face")) === "FRONT");

  // Photo: pick a real file, confirm it lands on the card, survives a reload,
  // and can be removed again.
  await page.setInputFiles('input[aria-label="카드 사진 올리기"]', "tools/fixtures/test-portrait.png");
  await page.locator(".player-card-photo").waitFor({ timeout: 10000 });
  record(`${label}: photo lands on the card`, (await page.locator(".player-card-silhouette").count()) === 0);
  await page.screenshot({ path: `${outputDir}/${label}-photo.png` });

  const stored = await page.evaluate(() => window.localStorage.getItem("snapn:v2:player-photo"));
  record(`${label}: photo kept on the device only`,
    typeof stored === "string" && stored.startsWith("data:image/jpeg;base64,"),
    `${Math.round((stored?.length ?? 0) / 1024)}KB`);

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".player-card-photo").waitFor({ timeout: 20000 });
  record(`${label}: photo survives a reload`, true);

  await page.getByRole("button", { name: "사진 삭제" }).click();
  await page.locator(".player-card-silhouette").waitFor({ timeout: 10000 });
  record(`${label}: photo can be removed`,
    (await page.evaluate(() => window.localStorage.getItem("snapn:v2:player-photo"))) === null);

  const blocking = consoleErrors.filter((text) => !text.includes("favicon"));
  record(`${label}: no console errors`, blocking.length === 0, blocking.slice(0, 2).join(" | "));
  await context.close();
}

try {
  await run("desktop", { width: 1280, height: 900 });
  await run("mobile", { width: 430, height: 932 });
} finally {
  await browser.close();
}

const failed = checks.filter((check) => !check.pass);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
if (failed.length > 0) process.exit(1);
