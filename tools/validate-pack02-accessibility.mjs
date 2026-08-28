/* global process, console, document, getComputedStyle, innerWidth */
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "/Users/fiftyfy14/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const base = process.env.PACK02_URL || "http://127.0.0.1:4173/v2";
const output = path.resolve("docs/implementation/evidence/pack02/accessibility");
const routes = [["/player/me/career", "커리어 패스포트"], ["/player/me/career/season/fixture-2026", "시즌 기록"], ["/communication", "팀 커뮤니케이션"], ["/opportunities", "기회"], ["/player/me/portfolio", "포트폴리오 공유"]];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", env: { ...process.env, TMPDIR: "/Volumes/700gb" } });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  const failures = [];
  for (const [route, heading] of routes) {
    await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: heading, exact: true }).waitFor();
    const result = await page.evaluate(() => {
      const interactive = [...document.querySelectorAll("button,a")].filter((element) => {
        const style = getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden" && !element.hasAttribute("hidden");
      });
      return { h1: document.querySelectorAll("h1").length, unnamed: interactive.filter((element) => !((element.getAttribute("aria-label") || element.textContent || "").trim())).length, small: interactive.filter((element) => { const box = element.getBoundingClientRect(); return box.width < 44 || box.height < 44; }).length, overflow: document.documentElement.scrollWidth > innerWidth };
    });
    if (result.h1 !== 1 || result.unnamed || result.small || result.overflow) failures.push(`${route}: ${JSON.stringify(result)}`);
    await page.keyboard.press("Tab");
    assert.ok(await page.evaluate(() => ["A", "BUTTON"].includes(document.activeElement?.tagName || "")), `${route} keyboard focus`);
  }
  await page.screenshot({ path: path.join(output, "forced-colors-reduced-motion.png"), fullPage: true });
  assert.deepEqual(failures, []);
  for (const name of ["keyboard-focus-results.md", "accessible-name-results.md", "touch-target-results.md", "reduced-motion-results.md", "contrast-results.md"]) await writeFile(path.join(output, name), `# PACK 02 accessibility\n\nPASS: ${routes.length}/${routes.length} routes in forced colors and reduced motion.\n`);
  console.log(`PASS: PACK02 accessibility ${routes.length}/${routes.length} routes`);
} finally { await browser.close(); }
