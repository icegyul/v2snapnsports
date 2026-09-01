/* global process, console, document */
// The way in: role selection and sign-in, on an old phone, including that the
// screens tell the truth about what is and is not connected.
import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const appBaseUrl = `${baseUrl.replace(/\/+$/, "")}/v2`;
const outputDir = process.env.AUTH_EVIDENCE_DIR ?? "output/auth-evidence";
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

const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

try {
  // Role selection records a preference and says it is not permission.
  await page.goto(`${appBaseUrl}/signup/role`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "매니저로 시작" }).click();
  record("role choice is recorded", (await page.getByRole("button", { name: "매니저로 시작" }).getAttribute("aria-pressed")) === "true");
  record("role choice explains it is not permission", ((await page.getByRole("status").textContent()) ?? "").includes("소속 확인"));
  await page.screenshot({ path: `${outputDir}/signup-role.png` });

  // Choosing manager still does not open a manager screen.
  await page.goto(`${appBaseUrl}/manager/coach`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  record("manager screens stay shut after choosing manager", (await page.locator('[aria-label="접근 거부"]').count()) === 1);

  // Sign-in validates, then reports honestly that it is not connected.
  await page.goto(`${appBaseUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "로그인" }).click();
  record("empty form is refused client-side", (await page.getByText("이메일을 입력해 주세요.").count()) === 1);

  await page.getByLabel("이메일").fill("player@example.com");
  await page.getByLabel("비밀번호").fill("longenoughpw");
  await page.getByRole("button", { name: "로그인" }).click();
  const message = await page.getByRole("status").textContent();
  record("says sign-in is not connected yet", (message ?? "").includes("준비 중"), message ?? "");
  await page.screenshot({ path: `${outputDir}/login.png` });

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  record("no sideways scroll on a 360px screen", overflow <= 1, `${overflow}px`);

  const blocking = errors.filter((text) => !text.includes("favicon"));
  record("no console errors", blocking.length === 0, blocking.slice(0, 2).join(" | "));
} finally {
  await context.close();
  await browser.close();
}

const failed = checks.filter((check) => !check.pass);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
if (failed.length > 0) process.exit(1);
