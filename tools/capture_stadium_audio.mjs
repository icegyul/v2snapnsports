/* global process, document, console */
import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
const appBaseUrl = normalizedBaseUrl.endsWith("/v2") ? normalizedBaseUrl : `${normalizedBaseUrl}/v2`;
const outputDir = process.env.STADIUM_AUDIO_EVIDENCE_DIR ?? "output/stadium-audio-evidence";
await fs.mkdir(outputDir, { recursive: true });

const fullEntryCues = new Set(["APPROACH", "PITCH", "PROJECTION", "POSITION", "FORMATION", "SPATIAL_HOME"]);

const browser = await chromium.launch({
  headless: true,
  args: (process.env.STADIUM_BROWSER_GL_ARGS ?? "--use-gl=swiftshader --enable-webgl --ignore-gpu-blocklist --disable-dev-shm-usage").split(" ").filter(Boolean),
});

async function audioState(page) {
  return page.locator(".stadium-audio-dock").evaluate((node) => ({
    state: node.getAttribute("data-audio-state"),
    context: node.getAttribute("data-audio-context"),
    lastCue: node.getAttribute("data-audio-last-cue"),
    cueCount: Number(node.getAttribute("data-audio-cue-count") ?? "-1"),
    buttonLabel: node.querySelector("button")?.getAttribute("aria-label") ?? null,
  }));
}

async function rect(locator) {
  return locator.evaluate((node) => {
    const box = node.getBoundingClientRect();
    return { top: box.top, bottom: box.bottom, left: box.left, right: box.right, width: box.width, height: box.height };
  });
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
    // Commercial Home hides the audio dock; the stadium audio surface now
    // lives on the full-entry experience.
    await page.goto(`${appBaseUrl}/home/full`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".stadium-audio-dock[data-audio-state='LOCKED']", { timeout: 30000 });
    const initial = await audioState(page);
    await page.waitForTimeout(500);
    const beforeGesture = await audioState(page);

    const dockRect = await rect(page.locator(".stadium-audio-dock"));
    const navRect = await rect(page.locator(".bottom-navigation"));
    const dockClearOfNav = dockRect.bottom <= navRect.top - 4;

    await page.getByRole("button", { name: "경기장 사운드 켜기" }).click();
    await page.waitForFunction(() => {
      const dock = document.querySelector(".stadium-audio-dock");
      return dock?.getAttribute("data-audio-state") === "ENABLED"
        && dock.getAttribute("data-audio-context") === "running"
        && Number(dock.getAttribute("data-audio-cue-count") ?? "0") >= 1;
    }, { timeout: 15000 });
    const enabledHome = await audioState(page);

    // Stage cues fire along the cinematic journey, which starts behind its
    // explicit action in the tactical-first entry contract.
    await page.waitForFunction(() => (
      document.querySelector(".full-journey-surface")?.getAttribute("data-render-state") === "READY"
    ), { timeout: 30000 });
    await page.getByRole("button", { name: "시네마틱 입장" }).click();
    await page.waitForFunction(() => {
      const surface = document.querySelector(".full-journey-surface");
      const dock = document.querySelector(".stadium-audio-dock");
      const cue = dock?.getAttribute("data-audio-last-cue") ?? "";
      return surface?.getAttribute("data-render-state") === "READY"
        && dock?.getAttribute("data-audio-state") === "ENABLED"
        && ["APPROACH", "PITCH", "PROJECTION", "POSITION", "FORMATION", "SPATIAL_HOME"].includes(cue)
        && Number(dock.getAttribute("data-audio-cue-count") ?? "0") >= 2;
    }, { timeout: 60000 });
    const enabledFullEntry = await audioState(page);
    const fullEntryStage = await page.locator(".full-journey-surface").getAttribute("data-journey-stage");

    await page.getByRole("button", { name: "경기장 사운드 음소거" }).click();
    await page.waitForFunction(() => {
      const dock = document.querySelector(".stadium-audio-dock");
      if (!dock || dock.getAttribute("data-audio-state") !== "MUTED") return false;
      const box = dock.getBoundingClientRect();
      return box.width >= 44 && box.height >= 40;
    }, { timeout: 10000 });
    const muted = await audioState(page);

    await page.getByRole("button", { name: "경기장 사운드 다시 켜기" }).click();
    await page.waitForFunction((previousCount) => {
      const dock = document.querySelector(".stadium-audio-dock");
      return dock?.getAttribute("data-audio-state") === "ENABLED"
        && dock.getAttribute("data-audio-context") === "running"
        && Number(dock.getAttribute("data-audio-cue-count") ?? "0") > Number(previousCount);
    }, muted.cueCount, { timeout: 15000 });
    const unmuted = await audioState(page);

    await page.locator(".bottom-navigation a[href='/v2/training']").click();
    await page.waitForFunction(() => !document.querySelector(".stadium-audio-dock"), { timeout: 10000 });
    const dockAbsentOutsideStadium = await page.locator(".stadium-audio-dock").count() === 0;

    // The commercial Home stays dock-free; returning to the full entry must
    // restore the muted state.
    await page.locator(".bottom-navigation a[href='/v2/home']").click();
    await page.waitForFunction(() => Boolean(document.querySelector(".stadium-interaction-surface")), { timeout: 15000 });
    const dockAbsentOnHome = await page.locator(".stadium-audio-dock").count() === 0;

    // Client-side navigation back in, so the module-level audio state
    // survives (a full reload would legitimately reset it to LOCKED).
    await page.getByRole("button", { name: "경기장 입장" }).click();
    await page.waitForURL(/\/v2\/home\/full$/, { timeout: 15000 });
    await page.waitForFunction(() => {
      const dock = document.querySelector(".stadium-audio-dock");
      if (!dock || dock.getAttribute("data-audio-state") !== "MUTED") return false;
      const box = dock.getBoundingClientRect();
      return box.width >= 44 && box.height >= 40;
    }, { timeout: 15000 });
    const returnedHome = await audioState(page);
    const returnedDockRect = await rect(page.locator(".stadium-audio-dock"));

    await page.screenshot({ path: `${outputDir}/${name}.png`, fullPage: true });
    const evidence = {
      name,
      initial,
      beforeGesture,
      enabledHome,
      enabledFullEntry,
      fullEntryStage,
      muted,
      unmuted,
      returnedHome,
      dockRect,
      returnedDockRect,
      navRect,
      dockClearOfNav,
      dockAbsentOutsideStadium,
      dockAbsentOnHome,
      fullEntryUrl: page.url(),
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
      bodyText: (await page.locator("body").innerText().catch(() => "")).slice(0, 12000),
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
  const valid = result.initial.state === "LOCKED"
    && result.initial.context === "NONE"
    && result.initial.cueCount === 0
    && result.beforeGesture.state === "LOCKED"
    && result.beforeGesture.context === "NONE"
    && result.beforeGesture.cueCount === 0
    && result.enabledHome.state === "ENABLED"
    && result.enabledHome.context === "running"
    && fullEntryCues.has(result.enabledHome.lastCue)
    && result.enabledHome.cueCount >= 1
    && result.enabledFullEntry.state === "ENABLED"
    && result.enabledFullEntry.context === "running"
    && fullEntryCues.has(result.enabledFullEntry.lastCue)
    && result.enabledFullEntry.cueCount >= 2
    && fullEntryCues.has(result.fullEntryStage)
    && result.muted.state === "MUTED"
    && result.unmuted.state === "ENABLED"
    && result.unmuted.context === "running"
    && result.unmuted.cueCount > result.muted.cueCount
    && result.dockAbsentOutsideStadium
    && result.dockAbsentOnHome
    && result.returnedHome.state === "MUTED"
    && result.returnedDockRect.width >= 44
    && result.returnedDockRect.height >= 40
    && result.dockClearOfNav
    && result.dockRect.width >= 44
    && result.dockRect.height >= 42
    && result.consoleErrors.length === 0;
  if (!valid) {
    console.error(`stadium audio verification failed for ${result.name}`, result);
    process.exitCode = 1;
  }
}
