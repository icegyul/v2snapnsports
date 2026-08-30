/* global process, document, console */
import { chromium } from "playwright";
import { Buffer } from "node:buffer";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
const appBaseUrl = normalizedBaseUrl.endsWith("/v2") ? normalizedBaseUrl : `${normalizedBaseUrl}/v2`;
const outputDir = process.env.STADIUM_FULL_ENTRY_EVIDENCE_DIR ?? "output/stadium-full-entry-evidence";
await fs.mkdir(outputDir, { recursive: true });

const expectedStages = ["APPROACH", "PITCH", "PROJECTION", "POSITION", "FORMATION", "SPATIAL_HOME"];
const screenshotStages = new Set(["APPROACH", "PROJECTION", "POSITION", "FORMATION", "SPATIAL_HOME"]);
const expectedAnchors = [
  ["PLAYER", "나", "/player/career"],
  ["TRAINING", "훈련", "/training"],
  ["TEAM", "팀", "/home/formation"],
  ["CAREER", "커리어", "/player/career"],
  ["VIDEO", "영상", "/video"],
];

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--disable-dev-shm-usage"],
});

async function journeyState(page) {
  const dom = await page.locator(".full-journey-surface").evaluate((node) => ({
    requestedMode: node.getAttribute("data-requested-mode"),
    renderedMode: node.getAttribute("data-render-mode"),
    renderState: node.getAttribute("data-render-state"),
    stage: node.getAttribute("data-journey-stage"),
    progress: Number(node.getAttribute("data-journey-progress") ?? "0"),
    complete: node.getAttribute("data-journey-complete"),
    liveScoreboard: node.getAttribute("data-live-scoreboard"),
    anchorCount: Number(node.getAttribute("data-spatial-anchor-count") ?? "-1"),
    teammateCount: Number(node.getAttribute("data-formation-teammate-count") ?? "-1"),
    canvasCount: document.querySelectorAll(".full-journey-canvas").length,
    canvasReadyCount: document.querySelectorAll(".full-journey-canvas-ready").length,
    bodyText: document.body.innerText,
  }));
  return { ...dom, url: page.url() };
}

async function finalAnchors(page) {
  return page.locator("[data-testid='full-journey-anchor']").evaluateAll((nodes) => nodes.map((node) => {
    const box = node.getBoundingClientRect();
    return {
      kind: node.getAttribute("data-spatial-kind"),
      title: node.querySelector("strong")?.textContent?.trim() ?? null,
      href: node.getAttribute("href"),
      ariaHidden: node.getAttribute("aria-hidden"),
      tabIndex: node.tabIndex,
      rect: { top: box.top, right: box.right, bottom: box.bottom, left: box.left, width: box.width, height: box.height },
    };
  }));
}

async function captureJourney(name, viewport, deviceScaleFactor = 1) {
  const context = await browser.newContext({ viewport, deviceScaleFactor, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.stack ?? error.message));

  try {
    await page.goto(`${appBaseUrl}/home/full`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => {
      const heading = document.querySelector(".full-journey-header h1");
      const surface = document.querySelector(".full-journey-surface");
      return heading?.textContent?.trim() === "경기장 입장"
        && surface?.getAttribute("data-render-state") === "READY"
        && surface?.getAttribute("data-live-scoreboard") === "true"
        && Boolean(document.querySelector(".full-journey-canvas-ready"));
    }, { timeout: 30000 });

    const states = [];
    const shots = [];
    for (const stage of expectedStages) {
      await page.waitForFunction((expectedStage) => (
        document.querySelector(".full-journey-surface")?.getAttribute("data-journey-stage") === expectedStage
      ), stage, { timeout: 120000, polling: 150 });
      const state = await journeyState(page);
      states.push(state);
      if (screenshotStages.has(stage)) {
        const buffer = await page.screenshot({ path: `${outputDir}/${name}-${stage.toLowerCase()}.png`, fullPage: true });
        shots.push({ stage, buffer });
      }
    }

    const anchors = await finalAnchors(page);
    const navTop = await page.locator(".bottom-navigation").evaluate((node) => node.getBoundingClientRect().top);
    const anchorsClickable = anchors.every((anchor) => (
      anchor.ariaHidden === null
      && anchor.tabIndex >= 0
      && anchor.rect.width >= 44
      && anchor.rect.height >= 44
    ));
    const anchorsClearOfNav = anchors.every((anchor) => anchor.rect.bottom <= navTop - 4);
    const expectedRoutes = expectedAnchors.every(([kind, title, href]) => anchors.some((anchor) => (
      anchor.kind === kind && anchor.title === title && anchor.href === href
    )));
    const frameChanges = shots.slice(1).map((shot, index) => ({
      from: shots[index].stage,
      to: shot.stage,
      changed: Buffer.compare(shots[index].buffer, shot.buffer) !== 0,
    }));

    const result = {
      name,
      states,
      anchors,
      navTop,
      anchorsClickable,
      anchorsClearOfNav,
      expectedRoutes,
      frameChanges,
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

async function captureQuickEntry() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.stack ?? error.message));
  try {
    await page.goto(`${appBaseUrl}/home/full`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => {
      const surface = document.querySelector(".full-journey-surface");
      const button = document.querySelector(".full-journey-skip");
      return surface?.getAttribute("data-render-state") === "READY"
        && Boolean(button)
        && !button.hasAttribute("disabled");
    }, { timeout: 30000 });
    await page.getByRole("button", { name: "빠른 입장" }).click();
    await page.waitForFunction(() => (
      document.querySelector(".full-journey-surface")?.getAttribute("data-journey-complete") === "true"
    ), { timeout: 10000 });
    const state = await journeyState(page);
    const anchors = await finalAnchors(page);
    const result = {
      state,
      anchors,
      sameRoute: page.url().endsWith("/v2/home/full"),
      consoleErrors,
    };
    await page.screenshot({ path: `${outputDir}/mobile-quick-entry.png`, fullPage: true });
    await context.close();
    return result;
  } catch (error) {
    const debug = {
      url: page.url(),
      consoleErrors,
      bodyText: (await page.locator("body").innerText().catch(() => "")).slice(0, 14000),
      error: error instanceof Error ? (error.stack ?? error.message) : String(error),
    };
    await fs.writeFile(`${outputDir}/quick-entry-failure.json`, JSON.stringify(debug, null, 2));
    await context.close();
    throw error;
  }
}

const results = [];
let quickEntry;
try {
  results.push(await captureJourney("desktop-1440x1000", { width: 1440, height: 1000 }));
  results.push(await captureJourney("mobile-390x844", { width: 390, height: 844 }, 2));
  quickEntry = await captureQuickEntry();
  await fs.writeFile(`${outputDir}/summary.json`, JSON.stringify({ results, quickEntry }, null, 2));
} finally {
  await browser.close();
}

for (const result of results) {
  const stages = result.states.map((state) => state.stage);
  const finalState = result.states.at(-1);
  const allSameRoute = result.states.every((state) => state.url.endsWith("/v2/home/full"));
  const allSingleCanvas = result.states.every((state) => state.canvasCount === 1 && state.canvasReadyCount === 1);
  const valid = JSON.stringify(stages) === JSON.stringify(expectedStages)
    && allSameRoute
    && allSingleCanvas
    && finalState?.complete === "true"
    && finalState?.renderState === "READY"
    && finalState?.renderedMode !== "STATIC"
    && finalState?.liveScoreboard === "true"
    && finalState?.anchorCount === 5
    && finalState?.teammateCount === 3
    && finalState?.bodyText.includes("4-3-3")
    && finalState?.bodyText.includes("#8")
    && finalState?.bodyText.includes("중앙 미드필더")
    && finalState?.bodyText.includes("데모 팀 상태 · 일정 확인 필요")
    && !finalState?.bodyText.includes("Fixture Player")
    && result.anchors.length === 5
    && result.anchorsClickable
    && result.anchorsClearOfNav
    && result.expectedRoutes
    && result.frameChanges.every((item) => item.changed)
    && result.consoleErrors.length === 0;
  if (!valid) {
    console.error(`full stadium journey verification failed for ${result.name}`, result);
    process.exitCode = 1;
  }
}

const quickValid = quickEntry?.sameRoute
  && quickEntry.state.complete === "true"
  && quickEntry.state.stage === "SPATIAL_HOME"
  && quickEntry.state.canvasCount === 1
  && quickEntry.state.anchorCount === 5
  && quickEntry.anchors.length === 5
  && quickEntry.consoleErrors.length === 0;
if (!quickValid) {
  console.error("full stadium quick-entry verification failed", quickEntry);
  process.exitCode = 1;
}
