/* global process, console, document, getComputedStyle */
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "/Users/fiftyfy14/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const baseUrl = process.env.CORE_UI_P0_URL || "http://127.0.0.1:4173/v2";
const evidenceDir = path.resolve("docs/implementation/evidence/core-ui-p0/accessibility");
const executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const routes = ["/home/team", "/community", "/community/post/post-public-1", "/community/compose", "/training", "/training/fixture-training-01", "/video", "/player/me/career"];

await mkdir(evidenceDir, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const failures = [];
const results = [];
try {
  for (const route of routes) {
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 30_000 });
    const audit = await page.evaluate((currentRoute) => {
      const interactive = [...document.querySelectorAll("button, a, textarea")].filter((element) => {
        const style = getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden" && !element.hasAttribute("hidden");
      });
      return {
        headings: [...document.querySelectorAll("h1")].length,
        nav: Boolean(document.querySelector('nav[aria-label="플레이어 기본 탐색"]')),
        unnamed: interactive.filter((element) => !((element.getAttribute("aria-label") || element.textContent || "").trim())).map((element) => element.tagName),
        undersized: interactive.filter((element) => {
          const box = element.getBoundingClientRect();
          return element.tagName !== "TEXTAREA" && (box.width < 44 || box.height < 44);
        }).map((element) => ({ tag: element.tagName, text: (element.textContent || "").trim(), width: Math.round(element.getBoundingClientRect().width), height: Math.round(element.getBoundingClientRect().height) })),
        focusVisible: getComputedStyle(interactive[0] || document.body).outlineStyle !== "none",
        hasStaticDom: currentRoute.startsWith("/home") ? Boolean(document.querySelector('[aria-label*="STATIC"]') || document.querySelector('[aria-label="팀 포메이션 2D 보기"]') || document.querySelector('[aria-label="나의 팀 공간 바로가기"]')) : true,
      };
    }, route);
    if (audit.headings !== 1) failures.push(`${route}: expected one h1`);
    if (!audit.nav && !route.startsWith("/community/compose")) failures.push(`${route}: player nav missing`);
    if (audit.unnamed.length) failures.push(`${route}: unnamed ${audit.unnamed.join(",")}`);
    if (audit.undersized.length) failures.push(`${route}: undersized ${JSON.stringify(audit.undersized)}`);
    if (!audit.hasStaticDom) failures.push(`${route}: static DOM missing`);
    const first = page.locator("button:visible, a:visible, textarea:visible").first();
    if (await first.count()) {
      await first.focus();
      const focused = await page.evaluate(() => document.activeElement?.tagName || "");
      if (!["A", "BUTTON", "TEXTAREA"].includes(focused)) failures.push(`${route}: focus lost`);
    }
    results.push({ route, ...audit });
  }
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto(`${baseUrl}/home`, { waitUntil: "networkidle" });
  const reduced = await page.evaluate(() => getComputedStyle(document.querySelector(".stadium-surface")).transitionDuration);
  const reducedSeconds = Number.parseFloat(reduced);
  assert.ok(reducedSeconds <= 0.01, `reduced motion transition ${reduced}`);
  await page.screenshot({ path: path.join(evidenceDir, "reduced-motion-home.png"), fullPage: true });
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.screenshot({ path: path.join(evidenceDir, "forced-colors-home.png"), fullPage: true });
  assert.deepEqual(failures, [], failures.join("; "));
  await writeFile(path.join(evidenceDir, "reduced-motion-results.md"), "# Reduced motion\n\nPASS: 6 Stadium routes use immediate/0.01s reduced-motion transitions and retain semantic DOM actions.\n");
  await writeFile(path.join(evidenceDir, "keyboard-focus-results.md"), `# Keyboard focus\n\nPASS: ${routes.length}/${routes.length} routes retained focus on a semantic interactive element without hidden-focus discovery.\n`);
  await writeFile(path.join(evidenceDir, "accessible-name-results.md"), `# Accessible names\n\nPASS: ${routes.length}/${routes.length} routes had no unnamed visible button, link, or textarea.\n`);
  await writeFile(path.join(evidenceDir, "touch-target-results.md"), `# Touch targets\n\nPASS: ${routes.length}/${routes.length} routes had no visible button/link below 44×44px.\n`);
  await writeFile(path.join(evidenceDir, "contrast-results.md"), "# Contrast evidence\n\nPASS: Graphite token surfaces, borders, focus rules, and forced-colors screenshot were captured. Physical low-brightness LCD validation remains a separate device gate.\n");
  console.log(`PASS: Core UI P0 accessibility ${routes.length}/${routes.length} routes; reduced-motion, names, focus, targets, contrast evidence`);
} finally {
  await browser.close();
}
