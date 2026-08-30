/* global process, document, console */
import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
const appBaseUrl = normalizedBaseUrl.endsWith("/v2") ? normalizedBaseUrl : `${normalizedBaseUrl}/v2`;
const outputDir = process.env.STADIUM_AUDIO_EVIDENCE_DIR ?? "output/stadium-audio-evidence";
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--disable-dev-shm-usage"],
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
    await page.goto(`${appBaseUrl}/home`, { waitUntil: "domcontentloaded" });
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
        && Number(dock.getAttribute("data-audio-cue-count") ?? "0") >= 1
        && dock.getAttribute("data-audio-last-cue") === "HOME";
    }, { timeout: 15000 });
    const enabledHome = await audioState(page);

    await page.locator("a.stadium-enter-link").click();
    await page.waitForFunction(() => {
      const heading = document.querySelector(".stadium-approach-header h1");
      const dock = document.querySelector(".stadium-audio-dock");
      return heading?.textContent?.trim() === "경기장으로 다가가기"
        && dock?.getAttribute("data-audio-state") === "ENABLED"
        && dock.getAttribute("data-audio-last-cue") === "APPROACH"
        && Number(dock.getAttribute("data-audio-cue-count") ?? "0") >= 2;
    }, { timeout: 30000 });
    const enabledApproach = await audioState(page);

    await page.getByRole("button", { name: "경기장 사운드 음소거" }).click();
    await page.waitForSelector(".stadium-audio-dock[data-audio-state='MUTED']", { timeout: 5000 });
    const muted = await audioState(page);

    await page.getByRole("button", { name: "경기장 사운드 다시 켜기" }).click();
    await page.waitForFunction((previousCount) => {
      const dock = document.querySelector(".stadium-audio-dock");
      return dock?.getAttribute("data-audio-state") === "ENABLED"
        && Number(dock.getAttribute("data-audio-cue-count") ?? "0") > Number(previousCount);
    }, enabledApproach.cueCount, { timeout: 10000 });
    const unmuted = await audioState(page);

    await page.locator(".bottom-navigation a[href='/training']").click();
    await page.waitForFunction(() => !document.querySelector(".stadium-audio-dock"), { timeout: 10000 });
    const dockAbsentOutsideStadium = await page.locator(".stadium-audio-dock").count() === 0;

    await page.locator(".bottom-navigation a[href='/home']").click();
    await page.waitForSelector(".stadium-audio-dock[data-audio-state='MUTED']", { timeout: 15000 });
    const returnedHome = await audioState(page);

    await page.screenshot({ path: `${outputDir}/${name}.png`, fullPage: true });
    const evidence = {
      name,
      initial,
      beforeGesture,
      enabledHome,
      enabledApproach,
      muted,
      unmuted,
      returnedHome,
      dockRect,
      navRect,
      dockClearOfNav,
      dockAbsentOutsideStadium,
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
    && result.enabledHome.lastCue === "HOME"
    && result.enabledHome.cueCount === 1
    && result.enabledApproach.state === "ENABLED"
    && result.enabledApproach.lastCue === "APPROACH"
    && result.enabledApproach.cueCount === 2
    && result.muted.state === "MUTED"
    && result.unmuted.state === "ENABLED"
    && result.unmuted.cueCount === 3
    && result.dockAbsentOutsideStadium
    && result.returnedHome.state === "MUTED"
    && result.dockClearOfNav
    && result.dockRect.width >= 44
    && result.dockRect.height >= 42
    && result.consoleErrors.length === 0;
  if (!valid) {
    console.error(`stadium audio verification failed for ${result.name}`, result);
    process.exitCode = 1;
  }
}
