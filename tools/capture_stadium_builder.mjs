/* global process, document, console, Blob */
import { chromium } from "playwright";
import fs from "node:fs/promises";
import { compareFrames, histogramDistance, summarizeFrame } from "./stadium-frame-analysis.mjs";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
const appBaseUrl = normalizedBaseUrl.endsWith("/v2") ? normalizedBaseUrl : `${normalizedBaseUrl}/v2`;
const outputDir = process.env.STADIUM_BUILDER_EVIDENCE_DIR ?? "output/stadium-builder-evidence";
const smokeOnly = process.env.STADIUM_BUILDER_SMOKE_ONLY === "1";
const viewportMode = process.env.STADIUM_BUILDER_VIEWPORT ?? "both";
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

const representativePresets = [
  { family: "URBAN_COMPACT", preset: "urban-compact-two", label: "urban" },
  { family: "NIGHT_EVENT", preset: "night-event-cyan", label: "night-event" },
  { family: "OPEN_AIR", preset: "open-air-park", label: "park" },
];

const browser = await chromium.launch({
  headless: true,
  args: (process.env.STADIUM_BROWSER_GL_ARGS ?? "--use-gl=swiftshader --enable-webgl --ignore-gpu-blocklist --disable-dev-shm-usage").split(" ").filter(Boolean),
});

async function builderState(page) {
  return page.evaluate(() => {
    const preview = document.querySelector(".stadium-builder-preview-panel");
    return {
      previewState: document.querySelector(".stadium-builder-preview-state")?.getAttribute("data-preview-state") ?? null,
      preset: preview?.getAttribute("data-rendered-preset") ?? null,
      renderedSeatPattern: preview?.getAttribute("data-seat-pattern") ?? null,
      renderedFacadeProfile: preview?.getAttribute("data-facade-profile") ?? null,
      renderedLightingProfile: preview?.getAttribute("data-lighting-profile") ?? null,
      renderedEnvironmentProfile: preview?.getAttribute("data-environment-profile") ?? null,
      renderRevision: Number(preview?.getAttribute("data-render-revision") ?? 0),
      triangleCount: Number(preview?.getAttribute("data-triangle-count") ?? 0),
      validatorClass: document.querySelector(".stadium-builder-validator")?.className ?? null,
      validatorText: document.querySelector(".stadium-builder-validator")?.textContent?.replace(/\s+/g, " ").trim() ?? null,
      saveText: document.querySelector(".stadium-builder-save-message")?.textContent?.trim() ?? null,
      stepCount: document.querySelectorAll(".stadium-builder-steps button").length,
      canvasReady: Boolean(document.querySelector(".stadium-builder-preview-canvas.is-ready")),
      bodyText: document.body.innerText,
      contextEvents: globalThis.__stadiumBuilderContextEvents ?? { lost: 0, restored: 0 },
    };
  });
}

async function waitForSettledProfile(page, attribute, value, previousRevision) {
  const handle = await page.waitForFunction(({ attribute, value, previousRevision }) => {
    const preview = document.querySelector(".stadium-builder-preview-panel");
    const revision = Number(preview?.getAttribute("data-render-revision") ?? 0);
    const state = document.querySelector(".stadium-builder-preview-state")?.getAttribute("data-preview-state");
    if (preview?.getAttribute(attribute) !== value || revision <= previousRevision || state === "INITIALIZING") return null;
    return { state, revision };
  }, { attribute, value, previousRevision }, { timeout: 30000 });
  const settled = await handle.jsonValue();
  if (settled?.state !== "READY") throw new Error(`Builder preview settled as ${settled?.state ?? "UNKNOWN"} for ${attribute}=${value}`);
  await page.waitForTimeout(1750);
}

async function decodeScreenshotPixels(page, pngBase64, region) {
  const values = await page.evaluate(async ({ encoded, region }) => {
    const binary = globalThis.atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    const bitmap = await globalThis.createImageBitmap(new Blob([bytes], { type: "image/png" }));
    const source = region === "seat"
      ? { x: 0, y: Math.floor(bitmap.height * 0.26), width: bitmap.width, height: Math.floor(bitmap.height * 0.33) }
      : { x: 0, y: 0, width: bitmap.width, height: bitmap.height };
    const sampleWidth = Math.min(144, source.width);
    const sampleHeight = Math.min(144, source.height);
    const scratch = document.createElement("canvas");
    scratch.width = sampleWidth;
    scratch.height = sampleHeight;
    const context = scratch.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("builder screenshot decoder unavailable");
    context.drawImage(bitmap, source.x, source.y, source.width, source.height, 0, 0, sampleWidth, sampleHeight);
    bitmap.close();
    const rgba = context.getImageData(0, 0, sampleWidth, sampleHeight).data;
    const sampled = new Uint8ClampedArray(sampleWidth * sampleHeight * 4);
    sampled.set(rgba);
    return Array.from(sampled);
  }, { encoded: pngBase64, region });
  return new Uint8ClampedArray(values);
}

async function captureCanvasFrame(page, name, frames, region = "full") {
  const screenshot = await page.locator(".stadium-builder-preview-canvas").screenshot({ path: `${outputDir}/${name}.png` });
  const pixels = await decodeScreenshotPixels(page, screenshot.toString("base64"), region);
  const summary = summarizeFrame(pixels);
  frames.set(name, { pixels, summary });
  return summary;
}

function frameComparison(frames, left, right) {
  const leftFrame = frames.get(left);
  const rightFrame = frames.get(right);
  if (!leftFrame || !rightFrame) throw new Error(`missing frame comparison ${left} -> ${right}`);
  return {
    left,
    right,
    ...compareFrames(leftFrame.pixels, rightFrame.pixels),
    histogramDistance: histogramDistance(leftFrame.summary.luminanceHistogram, rightFrame.summary.luminanceHistogram),
    meanLuminanceDelta: Math.abs(leftFrame.summary.meanLuminance - rightFrame.summary.meanLuminance),
  };
}

async function selectPreset(page, family, preset) {
  const previousRevision = (await builderState(page)).renderRevision;
  await page.getByLabel("스타일 컬렉션").selectOption(family);
  await page.getByLabel("설계 프리셋").selectOption(preset);
  await waitForSettledProfile(page, "data-rendered-preset", preset, previousRevision);
}

async function selectVisualControl(page, label, value, attribute) {
  const previousRevision = (await builderState(page)).renderRevision;
  await page.getByLabel(label).selectOption(value);
  await waitForSettledProfile(page, attribute, value, previousRevision);
}

async function capture(name, viewport, deviceScaleFactor = 1) {
  const context = await browser.newContext({ viewport, deviceScaleFactor, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const consoleErrors = [];
  const frames = new Map();
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.stack ?? error.message));

  try {
    await page.goto(`${appBaseUrl}/home/builder`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => {
      const heading = document.querySelector(".stadium-builder-header h1");
      const preview = document.querySelector(".stadium-builder-preview-state");
      return heading?.textContent?.trim() === "스타디움 설계"
        && preview?.getAttribute("data-preview-state") === "READY"
        && Boolean(document.querySelector(".stadium-builder-preview-canvas.is-ready"));
    }, { timeout: 30000 });

    // Commercial Builder opens on a first-frame poster; the interactive WebGL
    // under verification here sits behind the explicit "3D로 둘러보기" action.
    const enterInteractive = page.locator(".stadium-builder-preview-enter");
    if (await enterInteractive.count()) {
      await enterInteractive.click();
      await page.waitForFunction(() => (
        !document.querySelector(".stadium-builder-preview-enter")
      ), { timeout: 10000 });
    }

    await page.evaluate(() => {
      globalThis.__stadiumBuilderContextEvents = { lost: 0, restored: 0 };
      const canvas = document.querySelector(".stadium-builder-preview-canvas");
      canvas?.addEventListener("webglcontextlost", () => { globalThis.__stadiumBuilderContextEvents.lost += 1; });
      canvas?.addEventListener("webglcontextrestored", () => { globalThis.__stadiumBuilderContextEvents.restored += 1; });
    });
    await page.waitForTimeout(1750);

    const initial = await builderState(page);
    await page.screenshot({ path: `${outputDir}/${name}-initial.png`, fullPage: true });
    await captureCanvasFrame(page, `${name}-initial-canvas`, frames);

    const familySelect = page.getByLabel("스타일 컬렉션");
    const presetSelect = page.getByLabel("설계 프리셋");
    const familyOptionCount = await familySelect.locator("option").count();
    const presetCounts = {};
    const presetIds = [];
    for (const family of families) {
      await familySelect.selectOption(family);
      await page.waitForTimeout(50);
      const options = presetSelect.locator("option");
      const count = await options.count();
      presetCounts[family] = count;
      for (let index = 0; index < count; index += 1) presetIds.push(await options.nth(index).getAttribute("value"));
    }

    const representativeSummaries = {};
    for (const representative of representativePresets) {
      await selectPreset(page, representative.family, representative.preset);
      representativeSummaries[representative.label] = await captureCanvasFrame(page, `${name}-${representative.label}`, frames);
    }

    if (smokeOnly) {
      const evidence = {
        name,
        initial,
        representativeSummaries,
        comparisons: [
          frameComparison(frames, `${name}-urban`, `${name}-night-event`),
          frameComparison(frames, `${name}-night-event`, `${name}-park`),
        ],
        consoleErrors,
      };
      await fs.writeFile(`${outputDir}/${name}.json`, JSON.stringify(evidence, null, 2));
      await context.close();
      return evidence;
    }

    const exhaustiveVisuals = !name.startsWith("mobile-");
    if (exhaustiveVisuals) {
      await selectPreset(page, "NEO_ARC", "neo-arc-day");
      await page.getByRole("button", { name: "5단계 좌석" }).click();
      for (const pattern of ["MONO", "DUO", "GRADIENT"]) {
        await selectVisualControl(page, "좌석 패턴", pattern, "data-seat-pattern");
        await captureCanvasFrame(page, `${name}-seat-${pattern.toLowerCase()}`, frames, "seat");
      }

      await page.getByRole("button", { name: "6단계 외관·조명" }).click();
      for (const facade of ["SOLID_RIB", "GLASS_BAND", "LIGHT_FRAME"]) {
        await selectVisualControl(page, "외관 구조", facade, "data-facade-profile");
        await captureCanvasFrame(page, `${name}-facade-${facade.toLowerCase()}`, frames);
      }
      for (const lighting of ["DAYLIGHT", "BALANCED", "EVENT"]) {
        await selectVisualControl(page, "조명 장면", lighting, "data-lighting-profile");
        await captureCanvasFrame(page, `${name}-lighting-${lighting.toLowerCase()}`, frames);
      }

      await page.getByRole("button", { name: "7단계 환경" }).click();
      for (const environment of ["URBAN", "PARK", "COASTAL", "CIVIC", "NIGHT_EVENT"]) {
        await selectVisualControl(page, "주변 환경", environment, "data-environment-profile");
        await captureCanvasFrame(page, `${name}-environment-${environment.toLowerCase()}`, frames);
      }
    }

    const comparisons = [
      frameComparison(frames, `${name}-urban`, `${name}-night-event`),
      frameComparison(frames, `${name}-night-event`, `${name}-park`),
    ];
    if (exhaustiveVisuals) {
      comparisons.push(
        frameComparison(frames, `${name}-seat-mono`, `${name}-seat-duo`),
        frameComparison(frames, `${name}-seat-duo`, `${name}-seat-gradient`),
        frameComparison(frames, `${name}-facade-solid_rib`, `${name}-facade-glass_band`),
        frameComparison(frames, `${name}-facade-glass_band`, `${name}-facade-light_frame`),
        frameComparison(frames, `${name}-lighting-daylight`, `${name}-lighting-balanced`),
        frameComparison(frames, `${name}-lighting-balanced`, `${name}-lighting-event`),
        frameComparison(frames, `${name}-environment-urban`, `${name}-environment-park`),
        frameComparison(frames, `${name}-environment-park`, `${name}-environment-coastal`),
        frameComparison(frames, `${name}-environment-coastal`, `${name}-environment-civic`),
        frameComparison(frames, `${name}-environment-civic`, `${name}-environment-night_event`),
      );
    }

    await page.getByRole("button", { name: "1단계 스타일" }).click();
    await page.getByLabel("스타일 컬렉션").waitFor();
    const revisionBeforeBurst = (await builderState(page)).renderRevision;
    for (let index = 0; index < 30; index += 1) {
      await familySelect.selectOption(families[index % families.length]);
      await page.waitForTimeout(35);
    }
    await familySelect.selectOption("NIGHT_EVENT");
    await presetSelect.selectOption("night-event-cyan");
    await waitForSettledProfile(page, "data-rendered-preset", "night-event-cyan", revisionBeforeBurst);
    const afterBurst = await builderState(page);
    const rapidSwitch = {
      renderRevisionBefore: revisionBeforeBurst,
      renderRevisionAfter: afterBurst.renderRevision,
      renderRevisionDelta: afterBurst.renderRevision - revisionBeforeBurst,
      contextEvents: afterBurst.contextEvents,
      previewState: afterBurst.previewState,
    };

    await page.getByRole("button", { name: "4단계 관람석" }).click();
    await page.getByLabel("스탠드 구조").selectOption("DOUBLE_DECK");
    await page.waitForFunction(() => document.querySelector(".stadium-builder-validator")?.classList.contains("has-errors"), { timeout: 5000 });
    const invalid = await builderState(page);
    await page.getByLabel("스탠드 구조").selectOption("TRIPLE_DECK");
    await page.waitForFunction(() => document.querySelector(".stadium-builder-validator")?.classList.contains("is-valid"), { timeout: 5000 });
    const repaired = await builderState(page);

    await page.getByRole("button", { name: "저장" }).click();
    await page.waitForFunction(() => document.querySelector(".stadium-builder-save-message")?.textContent?.includes("revision 1 저장 완료"), { timeout: 5000 });
    const saved = await builderState(page);
    const storedBeforeReload = await page.evaluate(() => JSON.parse(globalThis.localStorage.getItem("snapn:v2:stadium-builder:draft") ?? "null"));
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelector(".stadium-builder-preview-state")?.getAttribute("data-preview-state") === "READY", { timeout: 30000 });
    const reloaded = await builderState(page);
    const storedAfterReload = await page.evaluate(() => JSON.parse(globalThis.localStorage.getItem("snapn:v2:stadium-builder:draft") ?? "null"));
    await page.screenshot({ path: `${outputDir}/${name}-saved.png`, fullPage: true });

    const evidence = {
      name,
      initial,
      familyOptionCount,
      presetCounts,
      presetIds,
      representativeSummaries,
      comparisons,
      rapidSwitch,
      invalid,
      repaired,
      saved,
      reloaded,
      storedBeforeReload,
      storedAfterReload,
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
  if (viewportMode !== "mobile") results.push(await capture("desktop-1440x1000", { width: 1440, height: 1000 }));
  if (viewportMode !== "desktop") results.push(await capture("mobile-390x844", { width: 390, height: 844 }, 2));
  await fs.writeFile(`${outputDir}/summary.json`, JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}

for (const result of results) {
  if (smokeOnly) {
    const valid = result.comparisons.every((comparison) => comparison.changedPixelRatio >= 0.02
      && comparison.meanAbsoluteChannelDelta >= 2
      && comparison.histogramDistance >= 0.015)
      && result.consoleErrors.length === 0;
    if (!valid) {
      console.error(`stadium builder visual smoke failed for ${result.name}`, result);
      process.exitCode = 1;
    }
    continue;
  }
  const uniquePresets = new Set(result.presetIds.filter(Boolean));
  const allFamiliesHaveTwo = families.every((family) => result.presetCounts[family] === 2);
  const representativeComparisons = result.comparisons.slice(0, 2);
  const isolatedComparisons = result.comparisons.slice(2);
  const lightingLuminanceDelta = Math.abs(
    result.representativeSummaries.urban.meanLuminance
    - result.representativeSummaries["night-event"].meanLuminance,
  );
  const valid = result.initial.previewState === "READY"
    && result.initial.canvasReady
    && result.initial.stepCount === 7
    && result.initial.triangleCount > 0
    && result.familyOptionCount === 10
    && allFamiliesHaveTwo
    && result.presetIds.length === 20
    && uniquePresets.size === 20
    && result.invalid.validatorClass?.includes("has-errors")
    && result.invalid.validatorText?.includes("관람석")
    && result.repaired.validatorClass?.includes("is-valid")
    && result.saved.saveText === "revision 1 저장 완료"
    && result.storedBeforeReload?.revision === 1
    && result.storedBeforeReload?.selectedPresetId === "night-event-cyan"
    && result.storedAfterReload?.revision === 1
    && result.reloaded.preset === "night-event-cyan"
    && representativeComparisons.every((comparison) => comparison.changedPixelRatio >= 0.02
      && comparison.meanAbsoluteChannelDelta >= 2
      && comparison.histogramDistance >= 0.015)
    && isolatedComparisons.every((comparison) => comparison.changedPixelRatio >= 0.02
      && comparison.meanAbsoluteChannelDelta >= 2)
    && lightingLuminanceDelta >= 1.5
    && result.rapidSwitch.previewState === "READY"
    && result.rapidSwitch.renderRevisionDelta <= 3
    && result.rapidSwitch.contextEvents.lost === 0
    && result.consoleErrors.length === 0
    && !result.reloaded.bodyText.includes("Wembley")
    && !result.reloaded.bodyText.includes("Camp Nou")
    && !result.reloaded.bodyText.includes("Bernab")
    && !result.reloaded.bodyText.includes("Old Trafford");
  if (!valid) {
    console.error(`stadium builder verification failed for ${result.name}`, result);
    process.exitCode = 1;
  }
}
