/* global process, document, console */
import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
const appBaseUrl = normalizedBaseUrl.endsWith("/v2") ? normalizedBaseUrl : `${normalizedBaseUrl}/v2`;
const outputDir = process.env.STADIUM_DEFAULT_ENTRY_EVIDENCE_DIR ?? "output/stadium-default-entry-evidence";
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--disable-dev-shm-usage"],
});

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
    const homeScreenshot = await page.screenshot({ path: `${outputDir}/${name}-home.png`, fullPage: true });
    const footerHref = await page.locator(".stadium-enter-link").getAttribute("href");

    await page.getByRole("button", { name: "경기장을 눌러 입장하세요" }).click();
    await page.waitForURL(/\/v2\/home\/full$/, { timeout: 15000 });
    await page.waitForFunction(() => {
      const surface = document.querySelector(".full-journey-surface");
      return surface?.getAttribute("data-render-state") === "READY"
        && surface.getAttribute("data-live-scoreboard") === "true"
        && document.querySelectorAll(".full-journey-canvas-ready").length === 1;
    }, { timeout: 30000 });

    const fullUrl = page.url();
    const initialStage = await page.locator(".full-journey-surface").getAttribute("data-journey-stage");
    const canvasCount = await page.locator(".full-journey-canvas").count();
    const fullScreenshot = await page.screenshot({ path: `${outputDir}/${name}-full.png`, fullPage: true });

    const skip = page.getByRole("button", { name: "빠른 입장" });
    await skip.waitFor({ state: "visible", timeout: 10000 });
    await skip.click();
    await page.waitForFunction(() => (
      document.querySelector(".full-journey-surface")?.getAttribute("data-journey-complete") === "true"
    ), { timeout: 10000 });

    const final = await page.locator(".full-journey-surface").evaluate((node) => ({
      stage: node.getAttribute("data-journey-stage"),
      complete: node.getAttribute("data-journey-complete"),
      anchorCount: Number(node.getAttribute("data-spatial-anchor-count") ?? "-1"),
      teammateCount: Number(node.getAttribute("data-formation-teammate-count") ?? "-1"),
      liveScoreboard: node.getAttribute("data-live-scoreboard"),
      bodyText: document.body.innerText,
    }));
    const anchors = await page.locator("[data-testid='full-journey-anchor']").count();
    const result = {
      name,
      homeUrl,
      footerHref,
      fullUrl,
      initialStage,
      canvasCount,
      final,
      anchors,
      homeFrameCaptured: homeScreenshot.length > 0,
      fullFrameCaptured: fullScreenshot.length > 0,
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
    && result.footerHref === "/v2/home/full"
    && result.fullUrl.endsWith("/v2/home/full")
    && result.initialStage === "APPROACH"
    && result.canvasCount === 1
    && result.final.stage === "SPATIAL_HOME"
    && result.final.complete === "true"
    && result.final.anchorCount === 5
    && result.final.teammateCount === 3
    && result.final.liveScoreboard === "true"
    && result.final.bodyText.includes("4-3-3")
    && result.final.bodyText.includes("#8")
    && !result.final.bodyText.includes("Fixture Player")
    && result.anchors === 5
    && result.homeFrameCaptured
    && result.fullFrameCaptured
    && result.consoleErrors.length === 0;
  if (!valid) {
    console.error(`default full entry verification failed for ${result.name}`, result);
    process.exitCode = 1;
  }
}
