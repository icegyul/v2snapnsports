/* global process, console, document, window */
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "/Users/fiftyfy14/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
const base = process.env.PACK03_URL || "http://127.0.0.1:4175/v2";
const output = path.resolve("docs/implementation/evidence/pack03");
const roles = [["COACH", "코치 워크스페이스", "01-coach"], ["TEAM_MANAGER", "팀 매니저 워크스페이스", "02-team-manager"], ["CLUB_DIRECTOR", "클럽 디렉터 워크스페이스", "03-club-director"], ["REFEREE", "심판 워크스페이스", "04-referee"], ["AGENT", "에이전트 워크스페이스", "05-agent"], ["ANALYST", "분석가 워크스페이스", "06-analyst"]];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", env: { ...process.env, TMPDIR: "/Volumes/700gb" }, args: ["--disable-crash-reporter", "--disable-breakpad"] });
try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
    const page = await browser.newPage({ viewport }); const errors = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); }); page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${base}/manager`, { waitUntil: "networkidle" }); await page.getByRole("heading", { name: "매니저 워크스페이스", exact: true }).waitFor();
    for (const [role, heading, id] of roles) {
      await page.getByRole("button", { name: `${role} 역할로 전환` }).click();
      await page.getByRole("heading", { name: heading, exact: true }).waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, `${role} overflow`);
      if (viewport.width === 390) await page.screenshot({ path: path.join(output, `${id}-standard-mobile.png`), fullPage: true });
    }
    await page.goto(`${base}/manager`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "COACH 역할로 전환" }).click(); await page.getByRole("button", { name: "훈련 세션 시작" }).waitFor();
    await page.getByRole("button", { name: "REFEREE 역할로 전환" }).click(); await page.getByRole("heading", { name: "심판 워크스페이스", exact: true }).waitFor();
    assert.equal(await page.getByRole("button", { name: "훈련 세션 시작" }).count(), 0, "stale Coach privilege");
    assert.deepEqual(errors, [], `${viewport.width}px console errors`); await page.close();
  }
  const interaction = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await interaction.goto(`${base}/manager`, { waitUntil: "networkidle" }); await interaction.getByRole("button", { name: "AGENT 역할로 전환" }).click();
  await interaction.getByRole("button", { name: "보호자 또는 구단 검토 요청" }).click(); await interaction.getByText("보호자 또는 구단 중재 경로", { exact: true }).waitFor();
  console.log("PASS: PACK03 browser E2E 6 workspaces × 3 viewports, stale-role deny, Agent mediation");
} finally { await browser.close(); }
