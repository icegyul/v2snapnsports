/* global process, document, console */
import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
const appBaseUrl = normalizedBaseUrl.endsWith("/v2") ? normalizedBaseUrl : `${normalizedBaseUrl}/v2`;
const outputDir = process.env.STADIUM_DEFAULT_ENTRY_EVIDENCE_DIR ?? "output/stadium-default-entry-evidence";
await fs.mkdir(outputDir, { recursive: true });

// Override on hosts where SwiftShader cannot hold the scene
// (e.g. STADIUM_BROWSER_GL_ARGS="--use-angle=d3d11" on Windows).
const browserGlArgs = (process.env.STADIUM_BROWSER_GL_ARGS
  ?? "--use-gl=swiftshader --enable-webgl --ignore-gpu-blocklist --disable-dev-shm-usage")
  .split(" ")
  .filter(Boolean);

const browser = await chromium.launch({ headless: true, args: browserGlArgs });

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
    await page.waitForFunction(() => {
      const heading = document.querySelector(".stadium-home-header h1");
      const surface = document.querySelector(".stadium-interaction-surface");
      return heading?.textContent?.trim() === "나의 경기장"
        && Boolean(surface)
        && Boolean(document.querySelector(".stadium-webgl-ready"));
    }, { timeout: 30000 });

    const homeUrl = page.url();

    // P0-A: user-controlled zoom must work on the Home surface.
    // Let the one-shot intro camera settle first so the zoom baseline is real.
    await page.waitForTimeout(3000);
    const homeSurface = page.locator(".stadium-interaction-surface");
    const zoomBefore = Number(await homeSurface.getAttribute("data-zoom"));
    await homeSurface.hover();
    await page.mouse.wheel(0, -400);
    await page.waitForTimeout(300);
    const zoomAfter = Number(await homeSurface.getAttribute("data-zoom"));
    const homeScreenshot = await page.screenshot({ path: `${outputDir}/${name}-home.png`, fullPage: true });

    await page.getByRole("button", { name: "경기장 입장" }).click();
    await page.waitForURL(/\/v2\/home\/full$/, { timeout: 15000 });
    await page.waitForFunction(() => {
      const surface = document.querySelector(".full-journey-surface");
      return surface?.getAttribute("data-render-state") === "READY"
        && surface.getAttribute("data-live-scoreboard") === "true"
        && document.querySelectorAll(".full-journey-canvas-ready").length === 1;
    }, { timeout: 30000 });

    const fullUrl = page.url();

    // P0-B contract: entry lands on the tactical field, not a cinematic.
    const tactics = await page.locator(".full-journey-surface").evaluate((node) => ({
      entryView: node.getAttribute("data-entry-view"),
      stage: node.getAttribute("data-journey-stage"),
      teammateCount: Number(node.getAttribute("data-formation-teammate-count") ?? "-1"),
      liveScoreboard: node.getAttribute("data-live-scoreboard"),
      markerCount: document.querySelectorAll("[data-testid='tactics-marker']").length,
      anchorCount: document.querySelectorAll("[data-testid='full-journey-anchor']").length,
      selected: document.querySelector(".team-tactics-field")?.getAttribute("data-selected-marker"),
      bodyText: document.body.innerText,
    }));
    const canvasCount = await page.locator(".full-journey-canvas").count();
    const tacticsScreenshot = await page.screenshot({ path: `${outputDir}/${name}-tactics.png`, fullPage: true });

    // P0-C: teammate selection changes the active connection.
    await page.locator("[aria-label='동료 등번호 4, DF']").click();
    const selection = await page.locator(".team-tactics-field").evaluate((node) => ({
      selected: node.getAttribute("data-selected-marker"),
      connection: node.querySelectorAll("[data-connection-to='4']").length,
    }));

    // The cinematic journey stays reachable behind an explicit action.
    await page.getByRole("button", { name: "시네마틱 입장" }).click();
    await page.waitForFunction(() => (
      document.querySelector(".full-journey-surface")?.getAttribute("data-entry-view") === "CINEMATIC"
    ), { timeout: 10000 });
    const skip = page.getByRole("button", { name: "빠른 입장" });
    await skip.waitFor({ state: "visible", timeout: 15000 });
    await page.waitForFunction(() => !document.querySelector(".full-journey-skip")?.hasAttribute("disabled"), { timeout: 30000 });
    await skip.click();
    await page.waitForFunction(() => (
      document.querySelector(".full-journey-surface")?.getAttribute("data-journey-complete") === "true"
    ), { timeout: 10000 });

    const cinematicFinal = await page.locator(".full-journey-surface").evaluate((node) => ({
      stage: node.getAttribute("data-journey-stage"),
      complete: node.getAttribute("data-journey-complete"),
      anchorCount: Number(node.getAttribute("data-spatial-anchor-count") ?? "-1"),
      anchors: document.querySelectorAll("[data-testid='full-journey-anchor']").length,
    }));
    const spatialScreenshot = await page.screenshot({ path: `${outputDir}/${name}-spatial.png`, fullPage: true });

    // And the tactical field is one action away again.
    await page.getByRole("button", { name: "전술 필드 보기" }).click();
    await page.waitForFunction(() => (
      document.querySelector(".full-journey-surface")?.getAttribute("data-entry-view") === "TACTICS"
    ), { timeout: 10000 });

    const result = {
      name,
      homeUrl,
      fullUrl,
      zoomBefore,
      zoomAfter,
      tactics,
      canvasCount,
      selection,
      cinematicFinal,
      homeFrameCaptured: homeScreenshot.length > 0,
      tacticsFrameCaptured: tacticsScreenshot.length > 0,
      spatialFrameCaptured: spatialScreenshot.length > 0,
      consoleErrors,
    };
    await fs.writeFile(`${outputDir}/${name}.json`, JSON.stringify(result, null, 2));
    await context.close();
    return result;
  } catch (error) {
    const debug = {
      name,
      url: page.url(),
      consoleErrors,
      bodyText: (await page.locator("body").innerText().catch(() => "")).slice(0, 14000),
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
  const valid = result.homeUrl.endsWith("/v2/home")
    && result.fullUrl.endsWith("/v2/home/full")
    && result.zoomAfter > result.zoomBefore
    && result.tactics.entryView === "TACTICS"
    && result.tactics.stage === "FORMATION"
    && result.tactics.teammateCount === 3
    && result.tactics.liveScoreboard === "true"
    && result.tactics.markerCount === 4
    && result.tactics.anchorCount === 0
    && result.tactics.selected === "OWN"
    && result.tactics.bodyText.includes("TEAM TACTICS")
    && result.tactics.bodyText.includes("4-3-3")
    && result.tactics.bodyText.includes("#8")
    && !result.tactics.bodyText.includes("Fixture Player")
    && result.canvasCount === 1
    && result.selection.selected === "4"
    && result.selection.connection === 1
    && result.cinematicFinal.stage === "SPATIAL_HOME"
    && result.cinematicFinal.complete === "true"
    && result.cinematicFinal.anchorCount === 5
    && result.cinematicFinal.anchors === 5
    && result.homeFrameCaptured
    && result.tacticsFrameCaptured
    && result.spatialFrameCaptured
    && result.consoleErrors.length === 0;
  if (!valid) {
    console.error(`default full entry verification failed for ${result.name}`, result);
    process.exitCode = 1;
  }
}
