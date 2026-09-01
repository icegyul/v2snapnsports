import { coverSquare, isSupportedPhotoType, MAX_PHOTO_DATA_URL_BYTES } from "./playerPhotoStorage";

// Turns a picked file into a small square JPEG data URL. Downscaling happens
// on the device before anything is stored, so a 12MP phone photo becomes a
// few tens of kilobytes and never strains the storage budget.
//
// Re-encoding through a canvas also drops every EXIF field the camera wrote —
// including GPS coordinates. For a product whose players may be minors that is
// not a side effect to lose: only the pixels survive this function.

const OUTPUT_SIZE = 640;
const QUALITY_STEPS = [0.82, 0.7, 0.58, 0.46];
/** Portraits usually put the face high in frame, so bias the crop upward. */
const VERTICAL_BIAS = 0.32;

export type PreparePhotoResult =
  | Readonly<{ status: "READY"; dataUrl: string }>
  | Readonly<{ status: "UNSUPPORTED_TYPE" }>
  | Readonly<{ status: "UNREADABLE" }>
  | Readonly<{ status: "TOO_LARGE" }>;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image decode failed"));
    };
    image.src = url;
  });
}

export async function preparePlayerPhoto(file: File): Promise<PreparePhotoResult> {
  if (!isSupportedPhotoType(file.type)) return { status: "UNSUPPORTED_TYPE" };

  let image: HTMLImageElement;
  try {
    image = await loadImage(file);
  } catch {
    return { status: "UNREADABLE" };
  }

  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (!width || !height) return { status: "UNREADABLE" };

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const context = canvas.getContext("2d");
  if (!context) return { status: "UNREADABLE" };

  const crop = coverSquare(width, height, VERTICAL_BIAS);
  context.imageSmoothingQuality = "high";
  context.drawImage(image, crop.sx, crop.sy, crop.size, crop.size, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  // Step the quality down until the encoded photo fits the storage budget.
  for (const quality of QUALITY_STEPS) {
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (dataUrl.length <= MAX_PHOTO_DATA_URL_BYTES) return { status: "READY", dataUrl };
  }
  return { status: "TOO_LARGE" };
}
