/* global process, console, document, window */
// Renders the real interior scene to jpg posters used by the STATIC
// fallback, so low-end devices see the same first impression as WebGL.
import { chromium } from "playwright";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const appBaseUrl = `${baseUrl.replace(/\/+$/, "")}/v2`;

const browser = await chromium.launch({
  headless: true,
  args: (process.env.STADIUM_BROWSER_GL_ARGS ?? "--use-angle=d3d11").split(" ").filter(Boolean),
});

async function capture(viewport, deviceScaleFactor, out) {
  const context = await browser.newContext({ viewport, deviceScaleFactor });
  const page = await context.newPage();
  await page.goto(`${appBaseUrl}/home`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".stadium-webgl-ready", { timeout: 30000 });
  await page.evaluate(() => {
    const selectors = [".stadium-home-header", ".stadium-enter-cue", ".stadium-select-entry", ".stadium-rise-hint", ".stadium-service-data-note", ".bottom-navigation", ".stadium-quality-chip"];
    for (const selector of selectors) {
      for (const el of document.querySelectorAll(selector)) el.style.setProperty("display", "none", "important");
    }
  });
  await page.waitForTimeout(2800);
  const hidden = await page.evaluate(() => {
    const header = document.querySelector(".stadium-home-header");
    return header ? window.getComputedStyle(header).display : "missing";
  });
  console.log("header display:", hidden);
  await page.screenshot({ path: out, type: "jpeg", quality: 84 });
  console.log("saved", out);
  await context.close();
}

await capture({ width: 1600, height: 1000 }, 1, "apps/web/src/assets/stadium-interior-poster-desktop.jpg");
await capture({ width: 430, height: 932 }, 2, "apps/web/src/assets/stadium-interior-poster-mobile.jpg");
await browser.close();
