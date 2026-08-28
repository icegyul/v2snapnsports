/* global process, console, document, window */
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "/Users/fiftyfy14/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const base = process.env.PACK01_URL || "http://127.0.0.1:4173/v2";
const output = path.resolve("docs/implementation/evidence/pack01");
const screens = [["01-training-home", "/training", "훈련"], ["02-training-detail", "/training/training-1", "훈련 상세"], ["03-match-detail", "/matches", "경기"], ["04-match-center", "/matches/match-2", "매치 센터"], ["05-tactical-board", "/tactics/tactic-3", "전술 보드"], ["06-tactical-playback", "/tactics/tactic-3/playback", "전술 재생"]];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", env: { ...process.env, TMPDIR: "/Volumes/700gb" }, args: ["--disable-crash-reporter", "--disable-breakpad"] });
try {
  for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 768, height: 1024 }]) {
    const page = await browser.newPage({ viewport }); const errors = []; const failedResponses = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(`${message.text()} @ ${message.location().url}`); }); page.on("pageerror", (error) => errors.push(error.message)); page.on("response", (response) => { if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`); });
    for (const [id, route, heading] of screens) { await page.goto(`${base}${route}`, { waitUntil: "networkidle" }); await page.getByRole("heading", { name: heading, exact: true }).waitFor(); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, `${route} overflow`); if (viewport.width === 390) await page.screenshot({ path: path.join(output, `${id}-standard-mobile.png`), fullPage: true }); }
    assert.deepEqual(errors, [], `${viewport.width} console errors; ${failedResponses.join(" | ")}`); await page.close();
  }
  console.log("PASS: PACK01 browser E2E 6 screens × 3 viewports, 6 screenshots");
} finally { await browser.close(); }
