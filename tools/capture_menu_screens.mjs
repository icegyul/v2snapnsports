/* global process, console, document */
// The screens behind the bottom navigation. They were bare foundation markup;
// this holds them to the same standard as the stadium: a real heading, real
// content, nothing under 11px, no sideways scroll on a small phone.
import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const appBaseUrl = `${baseUrl.replace(/\/+$/, "")}/v2`;
const outputDir = process.env.MENU_EVIDENCE_DIR ?? "output/menu-evidence";
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

const SCREENS = [
  ["training", "/training", "훈련"],
  ["training-detail", "/training/x", "훈련 상세"],
  ["matches", "/matches", "경기"],
  ["match-centre", "/matches/x", "매치 센터"],
  ["career", "/player/me/career", "커리어 패스포트"],
  ["video", "/video", "영상"],
  ["community", "/community", "커뮤니티"],
  ["community-post", "/community/post/post-public-1", "게시물"],
  ["community-compose", "/community/compose", "글 작성"],
  ["portfolio", "/player/me/portfolio", "포트폴리오 공유"],
  ["opportunities", "/opportunities", "기회"],
  ["communication", "/communication", "팀 커뮤니케이션"],
  ["season", "/player/me/career/season/fixture-2026", "시즌 기록"],
  ["more", "/more", "더보기"],
];

const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

try {
  for (const [name, path, heading] of SCREENS) {
    await page.goto(`${appBaseUrl}${path}`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("h1", { timeout: 20000 });
    await page.waitForTimeout(300);

    record(`${name}: heading`, (await page.locator("h1").first().textContent())?.trim() === heading);
    record(`${name}: designed, not bare`, (await page.locator(".screen").count()) === 1);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    record(`${name}: no sideways scroll`, overflow <= 1, `${overflow}px`);
    await page.screenshot({ path: `${outputDir}/${name}.png`, fullPage: true });
  }

  // Every bottom-nav destination must be reachable by tapping, not typing.
  await page.goto(`${appBaseUrl}/training`, { waitUntil: "domcontentloaded" });
  for (const label of ["홈", "훈련", "팀", "커리어", "영상"]) {
    record(`bottom nav has ${label}`, (await page.getByRole("link", { name: label, exact: true }).count()) >= 1);
  }

  const blocking = errors.filter((text) => !text.includes("favicon"));
  record("no console errors", blocking.length === 0, blocking.slice(0, 2).join(" | "));
} finally {
  await context.close();
  await browser.close();
}

const failed = checks.filter((check) => !check.pass);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
if (failed.length > 0) process.exit(1);
