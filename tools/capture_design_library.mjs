/* global process, console */
// Saving a second stadium used to destroy the first. This walks the shelf:
// save two designs, load one back, rename it, delete it.
import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const appBaseUrl = `${baseUrl.replace(/\/+$/, "")}/v2`;
const outputDir = process.env.DESIGN_LIBRARY_EVIDENCE_DIR ?? "output/design-library-evidence";
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

const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

try {
  await page.goto(`${appBaseUrl}/home/builder`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".stadium-builder-library", { timeout: 30000 });
  await page.waitForTimeout(1200);

  const save = async (name) => {
    await page.getByLabel("설계 이름").fill(name);
    await page.getByRole("button", { name: "이름 붙여 저장" }).click();
    await page.waitForTimeout(350);
  };

  await save("우리 홈 경기장");
  await save("야간 원정");
  const names = await page.locator(".stadium-builder-library-name").allTextContents();
  record("keeps both designs", names.length === 2 && names.includes("우리 홈 경기장") && names.includes("야간 원정"), names.join(", "));
  record("newest first", names[0] === "야간 원정", names[0]);
  await page.screenshot({ path: `${outputDir}/library.png` });

  await page.locator(".stadium-builder-library-list li").last().getByRole("button", { name: "불러오기" }).click();
  await page.waitForTimeout(400);
  record("loads a saved design", (await page.locator(".stadium-builder-save-message").textContent())?.includes("불러왔습니다") === true);

  page.once("dialog", (dialog) => dialog.accept("홈 경기장 v2"));
  await page.getByRole("button", { name: "우리 홈 경기장 이름 바꾸기" }).click();
  await page.waitForTimeout(400);
  record("renames a design", (await page.locator(".stadium-builder-library-name").allTextContents()).includes("홈 경기장 v2"));

  await page.getByRole("button", { name: "홈 경기장 v2 삭제" }).click();
  await page.waitForTimeout(400);
  const left = await page.locator(".stadium-builder-library-name").allTextContents();
  record("deletes a design", left.length === 1 && left[0] === "야간 원정", left.join(", "));

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".stadium-builder-library", { timeout: 30000 });
  record("shelf survives a reload", (await page.locator(".stadium-builder-library-name").allTextContents()).includes("야간 원정"));

  const blocking = errors.filter((text) => !text.includes("favicon"));
  record("no console errors", blocking.length === 0, blocking.slice(0, 2).join(" | "));
} finally {
  await context.close();
  await browser.close();
}

const failed = checks.filter((check) => !check.pass);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
if (failed.length > 0) process.exit(1);
