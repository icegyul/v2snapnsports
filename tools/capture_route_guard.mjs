/* global process, console */
// Direct-URL deny. Every manager and admin screen used to render for anyone
// who knew the path; this proves they no longer do, and that the screens a
// player should reach still open.
import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const appBaseUrl = `${baseUrl.replace(/\/+$/, "")}/v2`;
const outputDir = process.env.ROUTE_GUARD_EVIDENCE_DIR ?? "output/route-guard-evidence";
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: (process.env.STADIUM_BROWSER_GL_ARGS ?? "--use-angle=d3d11").split(" ").filter(Boolean),
});
const checks = [];
const record = (name, pass, detail = "") => {
  checks.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const context = await browser.newContext({ viewport: { width: 430, height: 932 } });
const page = await context.newPage();

const DENIED = [
  "/admin",
  "/admin/audit",
  "/admin/privacy",
  "/admin/safeguarding",
  "/manager",
  "/manager/coach",
  "/manager/club",
];
const ALLOWED = [
  ["/home", ".stadium-interaction-surface"],
  ["/training", "h1"],
  ["/matches", "h1"],
  ["/player/me/card", ".player-card"],
  ["/login", "h1"],
  ["/signup/role", "h1"],
];

try {
  for (const path of DENIED) {
    await page.goto(`${appBaseUrl}${path}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(700);
    const denied = await page.locator('[aria-label="접근 거부"]').count();
    record(`denies ${path}`, denied === 1);
  }
  await page.goto(`${appBaseUrl}/admin/audit`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${outputDir}/denied-admin.png` });

  for (const [path, selector] of ALLOWED) {
    await page.goto(`${appBaseUrl}${path}`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(selector, { timeout: 25000 });
    const denied = await page.locator('[aria-label="접근 거부"]').count();
    record(`allows ${path}`, denied === 0);
  }
} finally {
  await context.close();
  await browser.close();
}

const failed = checks.filter((check) => !check.pass);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
if (failed.length > 0) process.exit(1);
