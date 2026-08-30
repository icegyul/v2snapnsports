/* global process, document, console */
import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
const appBaseUrl = normalizedBaseUrl.endsWith("/v2") ? normalizedBaseUrl : `${normalizedBaseUrl}/v2`;
const outputDir = process.env.STADIUM_SPATIAL_EVIDENCE_DIR ?? "output/stadium-spatial-home-evidence";
await fs.mkdir(outputDir, { recursive: true });

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

async function capture(name, viewport, deviceScaleFactor = 1) {
  const context = await browser.newContext({ viewport, deviceScaleFactor, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.stack ?? error.message));

  try {
    await page.goto(`${appBaseUrl}/home/team`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => {
      const heading = document.querySelector(".spatial-home-header h1");
      const surface = document.querySelector(".spatial-home-3d-surface");
      return heading?.textContent?.trim() === "나의 팀 공간"
        && surface?.getAttribute("data-render-state") === "READY"
        && Boolean(document.querySelector(".spatial-home-3d-ready"));
    }, { timeout: 30000 });

    const state = await page.locator(".spatial-home-3d-surface").evaluate((node) => ({
      requestedMode: node.getAttribute("data-requested-mode"),
      renderedMode: node.getAttribute("data-render-mode"),
      renderState: node.getAttribute("data-render-state"),
      anchorCount: Number(node.getAttribute("data-spatial-anchor-count") ?? "-1"),
      teammateCount: Number(node.getAttribute("data-formation-teammate-count") ?? "-1"),
      canvasReady: Boolean(document.querySelector(".spatial-home-3d-ready")),
      modeChip: document.querySelector(".spatial-home-mode-chip")?.textContent?.trim() ?? null,
      scoreboard: document.querySelector(".spatial-home-scoreboard strong")?.textContent?.trim() ?? null,
      bodyText: document.body.innerText,
    }));

    const anchors = await page.locator("[data-testid='spatial-anchor']").evaluateAll((nodes) => nodes.map((node) => ({
      kind: node.getAttribute("data-spatial-kind"),
      title: node.querySelector("strong")?.textContent?.trim() ?? null,
      href: node.getAttribute("href"),
      rect: (() => {
        const rect = node.getBoundingClientRect();
        return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left, width: rect.width, height: rect.height };
      })(),
    })));

    const navTop = await page.locator(".bottom-navigation").evaluate((node) => node.getBoundingClientRect().top);
    const clickable = anchors.every((anchor) => anchor.rect.width >= 44 && anchor.rect.height >= 44);
    const expectedRoutes = expectedAnchors.every(([kind, title, href]) => anchors.some((anchor) => (
      anchor.kind === kind && anchor.title === title && anchor.href === href
    )));

    await page.locator(".spatial-home-3d-surface").scrollIntoViewIfNeeded();
    const screenshot = `${outputDir}/${name}.png`;
    await page.screenshot({ path: screenshot, fullPage: true });

    const result = {
      name,
      state,
      anchors,
      navTop,
      clickable,
      expectedRoutes,
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
  const valid = result.state.renderState === "READY"
    && result.state.renderedMode !== "STATIC"
    && result.state.canvasReady
    && result.state.anchorCount === 5
    && result.state.teammateCount === 3
    && result.state.modeChip?.includes("LIVE 3D")
    && result.state.scoreboard === "데모 팀 상태 · 일정 확인 필요"
    && result.state.bodyText.includes("다음 훈련 · 데모 일정")
    && result.state.bodyText.includes("다음 경기 · 데모 일정")
    && !result.state.bodyText.includes("DEVELOPMENT PREVIEW")
    && !result.state.bodyText.includes("Fixture Player")
    && result.anchors.length === 5
    && result.clickable
    && result.expectedRoutes
    && result.consoleErrors.length === 0;
  if (!valid) {
    console.error(`spatial home verification failed for ${result.name}`, result);
    process.exitCode = 1;
  }
}
