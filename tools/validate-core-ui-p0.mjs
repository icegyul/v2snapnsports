/* global process, console, document, window */
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "/Users/fiftyfy14/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const baseUrl = process.env.CORE_UI_P0_URL || "http://127.0.0.1:4173/v2";
const evidenceDir = path.resolve("docs/implementation/evidence/core-ui-p0");
const executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const standard = { width: 390, height: 844, name: "standard-mobile" };
const responsive = [
  { width: 320, height: 568, name: "small-mobile" },
  standard,
  { width: 430, height: 932, name: "large-mobile" },
  { width: 768, height: 1024, name: "tablet" },
  { width: 1440, height: 900, name: "desktop" },
];
const screens = [
  ["01-stadium-exterior", "/home", "나의 경기장"],
  ["02-my-position", "/home/position", "나의 포지션"],
  ["03-spatial-home", "/home/team", "나의 팀 공간"],
  ["04-community-home", "/community", "커뮤니티"],
  ["05-community-detail", "/community/post/post-public-1", "게시물"],
  ["06-training-home", "/training", "훈련"],
  ["07-training-detail", "/training/fixture-training-01", "훈련 상세"],
  ["08-video-home", "/video", "영상"],
  ["09-video-detail", "/video/fixture-video-01", "영상 상세"],
  ["10-career-passport", "/player/me/career", "커리어 패스포트"],
  ["11-career-season", "/player/me/career/season/demo-season", "시즌 기록"],
];

await mkdir(evidenceDir, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath });
const failures = [];
try {
  for (const viewport of responsive) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
    const consoleErrors = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", (error) => consoleErrors.push(error.message));
    for (const [id, route, heading] of screens) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 30_000 });
      await page.getByRole("heading", { name: heading, exact: true }).waitFor({ timeout: 10_000 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      assert.equal(overflow, false, `${viewport.name} ${route}: horizontal overflow`);
      if (viewport.name === "standard-mobile") await page.screenshot({ path: path.join(evidenceDir, `${id}-${viewport.name}.png`), fullPage: true });
    }
    await page.goto(`${baseUrl}/home`, { waitUntil: "networkidle", timeout: 30_000 });
    const staticDom = await page.evaluate(() => ({ nav: document.querySelector('[aria-label="플레이어 기본 탐색"]')?.textContent || "", hasPitch: Boolean(document.querySelector('[aria-label*="STATIC"]')) }));
    assert.match(staticDom.nav, /HOME[\s\S]*TRAINING[\s\S]*COMMUNITY[\s\S]*VIDEO[\s\S]*MORE/);
    assert.equal(staticDom.hasPitch, true);
    if (consoleErrors.length) failures.push(`${viewport.name}: ${consoleErrors.join(" | ")}`);
    await page.close();
  }
  assert.deepEqual(failures, [], `browser console errors: ${failures.join("; ")}`);
  console.log(`PASS: Core UI P0 browser acceptance ${screens.length} screens × ${responsive.length} viewports; ${screens.length} screenshots`);
} finally {
  await browser.close();
}
