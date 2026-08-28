/* global process, console, document, window */
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "/Users/fiftyfy14/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const base = process.env.PACK02_URL || "http://127.0.0.1:4173/v2";
const output = path.resolve("docs/implementation/evidence/pack02");
const screens = [["01-career-passport", "/player/me/career", "커리어 패스포트"], ["02-career-season", "/player/me/career/season/fixture-2026", "시즌 기록"], ["03-team-communication", "/communication", "팀 커뮤니케이션"], ["04-opportunity", "/opportunities", "기회"], ["05-portfolio-share", "/player/me/portfolio", "포트폴리오 공유"]];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", env: { ...process.env, TMPDIR: "/Volumes/700gb" }, args: ["--disable-crash-reporter", "--disable-breakpad"] });
try {
  for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 768, height: 1024 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", (error) => errors.push(error.message));
    for (const [id, route, heading] of screens) {
      await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
      await page.getByRole("heading", { name: heading, exact: true }).waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, `${route} horizontal overflow`);
      if (viewport.width === 390) await page.screenshot({ path: path.join(output, `${id}-standard-mobile.png`), fullPage: true });
    }
    assert.deepEqual(errors, [], `${viewport.width}px console errors`);
    await page.close();
  }
  const interaction = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await interaction.goto(`${base}/communication`, { waitUntil: "networkidle" });
  await interaction.getByRole("button", { name: "운영 메시지 보내기" }).click();
  await interaction.getByText("운영 메시지가 저장되었습니다", { exact: true }).waitFor();
  await interaction.goto(`${base}/opportunities`, { waitUntil: "networkidle" });
  await interaction.getByRole("button", { name: "기회 검토 요청" }).click();
  await interaction.getByText("보호자 또는 구단 검토 경로", { exact: true }).waitFor();
  await interaction.goto(`${base}/player/me/portfolio`, { waitUntil: "networkidle" });
  await interaction.getByRole("button", { name: "보호자 또는 구단 경유 공유 설정" }).click();
  await interaction.getByText("공유 범위가 설정되었습니다", { exact: true }).waitFor();
  await interaction.getByRole("button", { name: "공유 철회" }).click();
  await interaction.getByText("공유가 철회되었습니다", { exact: true }).waitFor();
  await interaction.close();
  console.log("PASS: PACK02 browser E2E 5 screens × 3 viewports, 5 screenshots");
} finally { await browser.close(); }
