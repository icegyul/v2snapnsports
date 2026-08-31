import assert from "node:assert/strict";
import test from "node:test";
import { compareFrames, histogramDistance, summarizeFrame } from "./stadium-frame-analysis.mjs";

test("identical frames have zero visual delta", () => {
  const frame = new Uint8ClampedArray([10, 20, 30, 255, 40, 50, 60, 255]);
  assert.deepEqual(compareFrames(frame, frame), {
    changedPixelRatio: 0,
    meanAbsoluteChannelDelta: 0,
  });
});

test("different luminance and colors produce measurable delta", () => {
  const dark = new Uint8ClampedArray([0, 0, 0, 255, 20, 20, 20, 255]);
  const bright = new Uint8ClampedArray([100, 30, 10, 255, 80, 100, 120, 255]);

  assert.equal(compareFrames(dark, bright).changedPixelRatio, 1);
  assert.ok(summarizeFrame(bright).meanLuminance > summarizeFrame(dark).meanLuminance);
  assert.ok(histogramDistance(summarizeFrame(dark).luminanceHistogram, summarizeFrame(bright).luminanceHistogram) > 0);
});

test("summary reports normalized histogram and channel means", () => {
  const summary = summarizeFrame(new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 255, 255]));

  assert.equal(summary.luminanceHistogram.reduce((sum, value) => sum + value, 0), 1);
  assert.deepEqual(summary.meanRgb, { red: 127.5, green: 0, blue: 127.5 });
});
