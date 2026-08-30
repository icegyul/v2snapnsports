/* global process, document, console */
import { chromium } from "playwright";
import { Buffer } from "node:buffer";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
const appBaseUrl = normalizedBaseUrl.endsWith("/v2") ? normalizedBaseUrl : `${normalizedBaseUrl}/v2`;
const outputDir = process.env.STADIUM_BUILDER_EVIDENCE_DIR ?? "output/stadium-builder-evidence";
await fs.mkdir(outputDir, { recursive: true });

const families = [
  "NEO_ARC",
  "CIVIC_RING",
  "URBAN_COMPACT",
  "OPEN_AIR",
  "LIGHT_CANOPY",
  "GREEN_PARK",
  "NIGHT_EVENT",
  "MONOLITH",
  "COMMUNITY",
  "HORIZON",
];

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--disable-dev-shm-usage"],
});

async function builderState(page) {
  return page.evaluate(() => ({
    previewState: document.querySelector(".stadium-builder-preview-state")?.getAttribute("data-preview-state") ?? null,
    preset: document.querySelector(".stadium-builder-preview-head strong")?.textContent?.trim() ?? null,
    validatorClass: document.querySelector(".stadium-builder-validator")?.className ?? null,
    validatorText: document.querySelector(".stadium-builder-validator")?.textContent?.replace(/\s+/g, " ").trim() ?? null,
    saveText: document.querySelector(".stadium-builder-save-message")?.textContent?.trim() ?? null,
    stepCount: document.querySelectorAll(".stadium-builder-steps button").length,
    canvasReady: Boolean(document.querySelector(".stadium-builder-preview-canvas.is-ready")),
    bodyText: document.body.innerText,
  }));
}

async function capture(name, viewport, deviceScaleFactor = 1) {
  const context = await browser.newContext({ viewport, deviceScaleFactor, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.stack ?? error.message));

  try {
    await page.goto(`${appBaseUrl}/home/builder`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => {
      const heading = document.querySelector(".stadium-builder-header h1");
      const preview = document.querySelector(".stadium-builder-preview-state");
      return heading?.textContent?.trim() === "나의 경기장 만들기"
        && preview?.getAttribute("data-preview-state") === "READY"
        && Boolean(document.querySelector(".stadium-builder-preview-canvas.is-ready"));
    }, { timeout: 30000 });

    const initial = await builderState(page);
    const initialShot = await page.screenshot({ path: `${outputDir}/${name}-initial.png`, fullPage: true });
    const familySelect = page.getByLabel("스타일 패밀리");
    const presetSelect = page.getByLabel("프리셋");
    const familyOptionCount = await familySelect.locator("option").count();
    const presetCounts = {};
    const presetIds = [];
    for (const family of families) {
      await familySelect.selectOption(family);
      await page.waitForTimeout(60);
      const options = presetSelect.locator("option");
      const count = await options.count();
      presetCounts[family] = count;
      for (let index = 0; index < count; index += 1) {
        presetIds.push(await options.nth(index).getAttribute("value"));
      }
    }

    await familySelect.selectOption("NIGHT_EVENT");
    await presetSelect.selectOption("night-event-cyan");
    await page.waitForFunction(() => (
      document.querySelector(".stadium-builder-preview-head strong")?.textContent?.trim() === "night-event-cyan"
      && document.querySelector(".stadium-builder-preview-state")?.getAttribute("data-preview-state") === "READY"
    ), { timeout: 30000 });
    const changedShot = await page.screenshot({ path: `${outputDir}/${name}-night-event.png`, fullPage: true });

    const steps = page.locator(".stadium-builder-steps button");
    await steps.nth(3).click();
    await page.getByLabel("Stand Profile").selectOption("DOUBLE_DECK");
    await page.waitForFunction(() => document.querySelector(".stadium-builder-validator")?.classList.contains("has-errors"), { timeout: 5000 });
    const invalid = await builderState(page);

    await page.getByLabel("Stand Profile").selectOption("TRIPLE_DECK");
    await page.waitForFunction(() => document.querySelector(".stadium-builder-validator")?.classList.contains("is-valid"), { timeout: 5000 });
    const repaired = await builderState(page);

    await page.getByRole("button", { name: "저장" }).click();
    await page.waitForFunction(() => document.querySelector(".stadium-builder-save-message")?.textContent?.includes("revision 1 저장 완료"), { timeout: 5000 });
    const saved = await builderState(page);
    const storedBeforeReload = await page.evaluate(() => JSON.parse(localStorage.getItem("snapn:v2:stadium-builder:draft") ?? "null"));

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelector(".stadium-builder-preview-state")?.getAttribute("data-preview-state") === "READY", { timeout: 30000 });
    const reloaded = await builderState(page);
    const storedAfterReload = await page.evaluate(() => JSON.parse(localStorage.getItem("snapn:v2:stadium-builder:draft") ?? "null"));
    const finalShot = await page.screenshot({ path: `${outputDir}/${name}-saved.png`, fullPage: true });

    const evidence = {
      name,
      initial,
      familyOptionCount,
      presetCounts,
      presetIds,
      invalid,
      repaired,
      saved,
      reloaded,
      storedBeforeReload,
      storedAfterReload,
      previewChanged: Buffer.compare(initialShot, changedShot) !== 0,
      savedFrameCaptured: finalShot.length > 0,
      consoleErrors,
    };
    await fs.writeFile(`${outputDir}/${name}.json`, JSON.stringify(evidence, null, 2));
    await context.close();
    return evidence;
  } catch (error) {
    const debug = {
      name,
      url: page.url(),
      consoleErrors,
      bodyText: (await page.locator("body").innerText().catch(() => "")).slice(0, 16000),
      error: error instanceof Error ? (error.stack ?? error.message) : String(error),
    };
    await page.screenshot({ path: `${outputDir}/${name}-failure.png`, fullPage: true }).catch(() => {});
    await fs.writeFile(`${outputDir}/${name}-failure.json`, JSON.stringify(debug, null, 2));
    await context.close();
    throw error;
  }
}

const results = [];
try {
  results.push(await capture("desktop-1440x1000", { width: 1440, height: 1000 }));
  results.push(await capture("mobile-390x844", { width: 390, height: 844 }, 2));
  await fs.writeFile(`${outputDir}/summary.json`, JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}

for (const result of results) {
  const uniquePresets = new Set(result.presetIds.filter(Boolean));
  const allFamiliesHaveTwo = families.every((family) => result.presetCounts[family] === 2);
  const valid = result.initial.previewState === "READY"
    && result.initial.canvasReady
    && result.initial.stepCount === 7
    && result.familyOptionCount === 10
    && allFamiliesHaveTwo
    && result.presetIds.length === 20
    && uniquePresets.size === 20
    && result.invalid.validatorClass?.includes("has-errors")
    && result.invalid.validatorText?.includes("STAND")
    && result.repaired.validatorClass?.includes("is-valid")
    && result.saved.saveText === "revision 1 저장 완료"
    && result.storedBeforeReload?.revision === 1
    && result.storedBeforeReload?.selectedPresetId === "night-event-cyan"
    && result.storedAfterReload?.revision === 1
    && result.reloaded.preset === "night-event-cyan"
    && result.previewChanged
    && result.savedFrameCaptured
    && !result.reloaded.bodyText.includes("Wembley")
    && !result.reloaded.bodyText.includes("Camp Nou")
    && !result.reloaded.bodyText.includes("Bernab")
    && !result.reloaded.bodyText.includes("Old Trafford")
    && result.consoleErrors.length === 0;
  if (!valid) {
    console.error(`stadium builder verification failed for ${result.name}`, result);
    process.exitCode = 1;
  }
}
