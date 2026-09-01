/* global process, console, document, getComputedStyle */
// Old-phone pass. Two things break a screen on a weak device: the renderer
// tier it falls back to, and text that is too small or too low-contrast to
// read. This drives every quality tier at a small old-Android viewport and
// measures contrast against what is actually painted behind the text.
import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const appBaseUrl = `${baseUrl.replace(/\/+$/, "")}/v2`;
const outputDir = process.env.LOW_END_EVIDENCE_DIR ?? "output/low-end-evidence";
await fs.mkdir(outputDir, { recursive: true });

const browserGlArgs = (process.env.STADIUM_BROWSER_GL_ARGS
  ?? "--use-gl=swiftshader --enable-webgl --ignore-gpu-blocklist --disable-dev-shm-usage")
  .split(" ")
  .filter(Boolean);

// A 360x640 screen is still the floor for older Android handsets.
const OLD_PHONE = { width: 360, height: 640 };

const browser = await chromium.launch({ headless: true, args: browserGlArgs });
const checks = [];
const record = (name, pass, detail = "") => {
  checks.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const CONTRAST_SCRIPT = () => {
  const luminance = (rgb) => {
    const channel = (value) => {
      const c = value / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
  };
  const parse = (value) => {
    const parts = value.match(/[\d.]+/g);
    if (!parts) return null;
    return { rgb: [Number(parts[0]), Number(parts[1]), Number(parts[2])], alpha: parts[3] === undefined ? 1 : Number(parts[3]) };
  };
  const over = (front, back) => front.rgb.map((c, i) => c * front.alpha + back[i] * (1 - front.alpha));

  // Walk up for the first ancestor that actually paints a background.
  const backdrop = (element) => {
    let node = element;
    let stack = [];
    while (node && node !== document.documentElement) {
      const parsed = parse(getComputedStyle(node).backgroundColor);
      if (parsed && parsed.alpha > 0) stack.push(parsed);
      if (parsed && parsed.alpha >= 0.99) break;
      node = node.parentElement;
    }
    let base = [7, 16, 24];
    for (const layer of stack.reverse()) base = over(layer, base);
    return base;
  };

  const results = [];
  const seen = new Set();
  for (const element of document.querySelectorAll("a, button, h1, h2, p, span, strong, dt, dd, li")) {
    const text = (element.textContent || "").trim();
    if (!text || text.length > 60) continue;
    if (element.querySelector("a, button, h1, h2, p, span, strong, dt, dd, li")) continue;
    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) < 0.15) continue;
    const box = element.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) continue;
    const key = `${text}|${Math.round(box.x)}|${Math.round(box.y)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const front = parse(style.color);
    if (!front) continue;
    const back = backdrop(element);
    const blended = over(front, back);
    const lighter = Math.max(luminance(blended), luminance(back));
    const darker = Math.min(luminance(blended), luminance(back));
    const ratio = (lighter + 0.05) / (darker + 0.05);
    const size = Number.parseFloat(style.fontSize);
    const weight = Number(style.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    results.push({ text: text.slice(0, 28), size, ratio: Math.round(ratio * 100) / 100, required: large ? 3 : 4.5 });
  }
  return results;
};

async function auditRoute(page, label, route, readySelector) {
  await page.goto(`${appBaseUrl}${route}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(readySelector, { timeout: 30000 });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${outputDir}/${label}.png` });

  const contrast = await page.evaluate(CONTRAST_SCRIPT);
  const failing = contrast.filter((item) => item.ratio < item.required);
  record(`${label}: text contrast`, failing.length === 0,
    failing.slice(0, 4).map((item) => `"${item.text}" ${item.ratio}:1 <${item.required}`).join(" | "));

  const tiny = contrast.filter((item) => item.size < 11);
  record(`${label}: nothing under 11px`, tiny.length === 0,
    tiny.slice(0, 3).map((item) => `"${item.text}" ${item.size}px`).join(" | "));

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  record(`${label}: no sideways scroll`, overflow <= 1, `${overflow}px`);
}

try {
  // 1. Every rendering tier must actually paint on an old phone.
  for (const quality of ["full", "fast", "light", "static"]) {
    const context = await browser.newContext({ viewport: OLD_PHONE, deviceScaleFactor: 2 });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto(`${appBaseUrl}/home?quality=${quality}`, { waitUntil: "domcontentloaded" });
    const surface = page.locator(".stadium-interaction-surface");
    await surface.waitFor({ timeout: 30000 });
    await page.waitForTimeout(3200);

    const rendered = await surface.getAttribute("data-render-mode");
    const state = await surface.getAttribute("data-render-state");
    const painted = await page.evaluate(() => {
      const canvas = document.querySelector(".stadium-webgl-canvas");
      const poster = document.querySelector(".stadium-static-fallback");
      const visible = (el) => Boolean(el) && getComputedStyle(el).display !== "none";
      return { canvas: visible(canvas), poster: visible(poster) };
    });
    const ok = quality === "static"
      ? rendered === "STATIC" && state === "FALLBACK" && painted.poster
      : rendered === quality.toUpperCase() && state === "READY" && painted.canvas;
    record(`quality=${quality}: renders`, ok, `mode ${rendered}, state ${state}`);

    const blocking = errors.filter((text) => !text.includes("favicon"));
    record(`quality=${quality}: no errors`, blocking.length === 0, blocking.slice(0, 2).join(" | "));
    await page.screenshot({ path: `${outputDir}/quality-${quality}.png` });
    await context.close();
  }

  // 2. Legibility of the screens a player actually reads, on that same phone.
  const context = await browser.newContext({ viewport: OLD_PHONE, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await auditRoute(page, "old-phone-home", "/home", ".stadium-board");
  await auditRoute(page, "old-phone-card", "/player/me/card", ".player-card");
  await auditRoute(page, "old-phone-tactics", "/home/full", ".team-tactics-field");
  await auditRoute(page, "old-phone-picker", "/home/stadium", ".stadium-select-cards");
  await context.close();
} finally {
  await browser.close();
}

const failed = checks.filter((check) => !check.pass);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
if (failed.length > 0) process.exit(1);
