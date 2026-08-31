function assertRgba(rgba) {
  if (!(rgba instanceof Uint8ClampedArray) || rgba.length === 0 || rgba.length % 4 !== 0) {
    throw new TypeError("frame must be a non-empty Uint8ClampedArray of RGBA pixels");
  }
}

function luminance(red, green, blue) {
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

export function summarizeFrame(rgba) {
  assertRgba(rgba);
  const pixelCount = rgba.length / 4;
  const histogram = Array.from({ length: 16 }, () => 0);
  let redTotal = 0;
  let greenTotal = 0;
  let blueTotal = 0;
  let luminanceTotal = 0;
  let darkPixels = 0;
  let highlightPixels = 0;

  for (let index = 0; index < rgba.length; index += 4) {
    const red = rgba[index];
    const green = rgba[index + 1];
    const blue = rgba[index + 2];
    const value = luminance(red, green, blue);
    redTotal += red;
    greenTotal += green;
    blueTotal += blue;
    luminanceTotal += value;
    histogram[Math.min(15, Math.floor(value / 16))] += 1;
    if (value < 35) darkPixels += 1;
    if (value > 220) highlightPixels += 1;
  }

  return {
    meanLuminance: luminanceTotal / pixelCount,
    meanRgb: {
      red: redTotal / pixelCount,
      green: greenTotal / pixelCount,
      blue: blueTotal / pixelCount,
    },
    luminanceHistogram: histogram.map((count) => count / pixelCount),
    darkPixelRatio: darkPixels / pixelCount,
    highlightPixelRatio: highlightPixels / pixelCount,
  };
}

export function compareFrames(left, right) {
  assertRgba(left);
  assertRgba(right);
  if (left.length !== right.length) throw new RangeError("frames must have identical dimensions");
  const pixelCount = left.length / 4;
  let changedPixels = 0;
  let channelDelta = 0;

  for (let index = 0; index < left.length; index += 4) {
    const redDelta = Math.abs(left[index] - right[index]);
    const greenDelta = Math.abs(left[index + 1] - right[index + 1]);
    const blueDelta = Math.abs(left[index + 2] - right[index + 2]);
    channelDelta += redDelta + greenDelta + blueDelta;
    if (redDelta + greenDelta + blueDelta > 18) changedPixels += 1;
  }

  return {
    changedPixelRatio: changedPixels / pixelCount,
    meanAbsoluteChannelDelta: channelDelta / (pixelCount * 3),
  };
}

export function histogramDistance(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== 16 || right.length !== 16) {
    throw new TypeError("histograms must contain sixteen normalized bins");
  }
  return left.reduce((distance, value, index) => distance + Math.abs(value - right[index]), 0) / 2;
}
