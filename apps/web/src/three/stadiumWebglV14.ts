import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import stadiumServiceSkyUrl from "../assets/stadium-service-sky.png";
import stadiumConcreteBoardUrl from "../assets/stadium-concrete-board.png";
import type { CoreVisualMode } from "../api/coreProductContracts";
import { resolveSeatPatternColor, resolveStadiumVisualProfile, type StadiumVisualProfile } from "./stadiumVisualProfile";
import { resolveServiceCamera } from "./stadiumServicePresentation";
import { resolveServiceArchitecture } from "./stadiumServiceArchitecture";

export interface StadiumTeamMarker {
  readonly x: number;
  readonly z: number;
  readonly shirtNumber: string;
  readonly position: string;
}

export interface StadiumScoreboardState {
  readonly headline: string;
  readonly formation: string;
  readonly training: string;
  readonly match: string;
}

export interface StadiumWebglRenderer {
  readonly triangleCount: number;
  resize(width: number, height: number, dpr: number): void;
  render(orbit: number, zoom: number, rise?: number): void;
  renderApproach?(progress: number): void;
  renderPitchEntry?(progress: number): void;
  renderPlayerPosition?(progress: number, x: number, z: number): void;
  renderTeamFormation?(progress: number, ownX: number, ownZ: number, teammates: readonly StadiumTeamMarker[]): void;
  renderDigitalProjection?(progress: number): void;
  updateScoreboard?(state: StadiumScoreboardState): void;
  destroy(): void;
}

export type StadiumColumnStyle = "straight" | "v" | "y";

export interface StadiumRecipe {
  tierCount: 1 | 2 | 3;
  roofCoverage: number;
  crowdDensity: number;
  seatColor: number;
  accentColor: number;
  columnStyle: StadiumColumnStyle;
  presentationProfile?: "SERVICE_HOME" | "SERVICE_BUILDER";
  bowlProfile?: "COMPACT" | "BALANCED" | "STEEP";
  roofProfile?: "OPEN_RING" | "HALF_CANOPY" | "FULL_CANOPY";
  standProfile?: "SINGLE_BOWL" | "DOUBLE_DECK" | "TRIPLE_DECK";
  seatPattern?: "MONO" | "DUO" | "GRADIENT";
  facadeProfile?: "SOLID_RIB" | "GLASS_BAND" | "LIGHT_FRAME";
  lightingProfile?: "DAYLIGHT" | "BALANCED" | "EVENT";
  environmentProfile?: "URBAN" | "PARK" | "COASTAL" | "CIVIC" | "NIGHT_EVENT";
}

export const BASE_STADIUM_RECIPE: StadiumRecipe = {
  tierCount: 3,
  roofCoverage: 0.94,
  crowdDensity: 0.91,
  seatColor: 0x152a46,
  accentColor: 0x149ee8,
  columnStyle: "y",
};

type TierSpec = {
  innerX: number;
  innerZ: number;
  outerX: number;
  outerZ: number;
  y0: number;
  y1: number;
  rows: number;
  peoplePerRow: number;
};

type CrowdPlacement = {
  x: number;
  y: number;
  z: number;
  angle: number;
  scale: number;
  shirt: THREE.Color;
  skin: THREE.Color;
};

const TAU = Math.PI * 2;

function hash(seed: number, salt: number): number {
  const value = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function addDisposable<T extends THREE.BufferGeometry | THREE.Material | THREE.Texture>(
  bag: Set<T>,
  value: T,
): T {
  bag.add(value);
  return value;
}

function makePitchTexture(textures: Set<THREE.Texture>): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1050;
  canvas.height = 680;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("stadium pitch canvas unavailable");

  const stripe = canvas.width / 20;
  for (let i = 0; i < 24; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? "#193f29" : "#1e492e";
    ctx.fillRect(i * stripe, 0, stripe + 1, canvas.height);
  }

  const vignette = ctx.createRadialGradient(525, 340, 40, 525, 340, 660);
  vignette.addColorStop(0, "rgba(238,244,222,0.026)");
  vignette.addColorStop(0.56, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,12,6,0.18)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 0.090;
  for (let i = 0; i < 5200; i += 1) {
    const x = (i * 131) % canvas.width;
    const y = (i * 71 + (i % 17) * 19) % canvas.height;
    ctx.fillStyle = i % 3 === 0 ? "#8da77c" : "#0a180e";
    ctx.fillRect(x, y, 1, i % 5 === 0 ? 2 : 1);
  }
  ctx.globalAlpha = 1;

  const line = 5;
  ctx.strokeStyle = "rgba(246,248,242,0.94)";
  ctx.fillStyle = "rgba(246,248,242,0.94)";
  ctx.lineWidth = line;
  ctx.strokeRect(line / 2, line / 2, canvas.width - line, canvas.height - line);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 91.5, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 4, 0, TAU);
  ctx.fill();

  const penaltyWidth = 403.2;
  const penaltyDepth = 165;
  const sixWidth = 183.2;
  const sixDepth = 55;
  const py = (canvas.height - penaltyWidth) / 2;
  const sy = (canvas.height - sixWidth) / 2;
  ctx.strokeRect(0, py, penaltyDepth, penaltyWidth);
  ctx.strokeRect(canvas.width - penaltyDepth, py, penaltyDepth, penaltyWidth);
  ctx.strokeRect(0, sy, sixDepth, sixWidth);
  ctx.strokeRect(canvas.width - sixDepth, sy, sixDepth, sixWidth);
  for (const x of [110, canvas.width - 110]) {
    ctx.beginPath();
    ctx.arc(x, canvas.height / 2, 3.5, 0, TAU);
    ctx.fill();
  }

  const texture = addDisposable(textures, new THREE.CanvasTexture(canvas));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function makeGrassBumpTexture(textures: Set<THREE.Texture>): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("stadium grass bump canvas unavailable");
  const image = ctx.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const i = (y * canvas.width + x) * 4;
      const blade = 104 + ((x * 17 + y * 31 + (x * y) % 37) % 48);
      image.data[i] = blade;
      image.data[i + 1] = blade;
      image.data[i + 2] = blade;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = addDisposable(textures, new THREE.CanvasTexture(canvas));
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(18, 12);
  return texture;
}
function makeEnvironmentTexture(textures: Set<THREE.Texture>): THREE.Texture {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("stadium environment canvas unavailable");

      const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
      sky.addColorStop(0, "#06101a");
      sky.addColorStop(0.34, "#162938");
      sky.addColorStop(0.60, "#344652");
      sky.addColorStop(0.78, "#1b242a");
      sky.addColorStop(1, "#080d11");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const cx of [96, 320, 704, 928]) {
        const glow = ctx.createRadialGradient(cx, 270, 3, cx, 270, 118);
        glow.addColorStop(0, "rgba(255,244,210,.95)");
        glow.addColorStop(.12, "rgba(255,229,174,.55)");
        glow.addColorStop(.42, "rgba(155,198,232,.16)");
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(cx - 130, 140, 260, 260);
      }

      const horizon = ctx.createLinearGradient(0, 236, 0, 310);
      horizon.addColorStop(0, "rgba(205,222,235,0)");
      horizon.addColorStop(.48, "rgba(205,222,235,.12)");
      horizon.addColorStop(1, "rgba(20,32,40,0)");
      ctx.fillStyle = horizon;
      ctx.fillRect(0, 230, canvas.width, 90);

      const texture = addDisposable(textures, new THREE.CanvasTexture(canvas));
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.needsUpdate = true;
      return texture;
    }

function makeBuilderSkyTexture(
  textures: Set<THREE.Texture>,
  profile: StadiumVisualProfile,
  environment: NonNullable<StadiumRecipe["environmentProfile"]>,
): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("stadium builder sky canvas unavailable");

  const top = new THREE.Color(profile.skyTop).getStyle();
  const horizon = new THREE.Color(profile.skyHorizon).getStyle();
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, top);
  gradient.addColorStop(0.56, top);
  gradient.addColorStop(0.84, horizon);
  gradient.addColorStop(1, new THREE.Color(profile.groundColor).getStyle());
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const glowX = environment === "NIGHT_EVENT" ? 720 : environment === "COASTAL" ? 260 : 690;
  const glowY = environment === "NIGHT_EVENT" ? 650 : 570;
  const glow = ctx.createRadialGradient(glowX, glowY, 8, glowX, glowY, environment === "NIGHT_EVENT" ? 270 : 190);
  glow.addColorStop(0, environment === "NIGHT_EVENT" ? "rgba(69,199,255,.33)" : "rgba(255,232,190,.62)");
  glow.addColorStop(0.28, environment === "NIGHT_EVENT" ? "rgba(21,128,194,.16)" : "rgba(255,205,150,.20)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (environment === "NIGHT_EVENT") {
    ctx.fillStyle = "rgba(215,239,255,.72)";
    for (let index = 0; index < 72; index += 1) {
      const x = hash(index, 41) * canvas.width;
      const y = hash(index, 87) * 560;
      const radius = 0.6 + hash(index, 12) * 1.4;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, TAU);
      ctx.fill();
    }
  }

  const texture = addDisposable(textures, new THREE.CanvasTexture(canvas));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

    function makeScoreboardTexture(textures: Set<THREE.Texture>): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("stadium scoreboard canvas unavailable");
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#07111c");
  gradient.addColorStop(0.5, "#0b2d4b");
  gradient.addColorStop(1, "#07111c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(89,190,255,.72)";
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  ctx.textAlign = "center";
  ctx.fillStyle = "#dff4ff";
  ctx.font = "700 72px Arial, sans-serif";
  ctx.fillText("SNAPN SPORTS", canvas.width / 2, 132);
  ctx.fillStyle = "#70c7ff";
  ctx.font = "600 38px Arial, sans-serif";
  ctx.fillText("MATCH CENTER", canvas.width / 2, 214);
  ctx.fillStyle = "rgba(255,255,255,.65)";
  ctx.font = "500 22px Arial, sans-serif";
  ctx.fillText("LIVE STADIUM", canvas.width / 2, 264);
  const texture = addDisposable(textures, new THREE.CanvasTexture(canvas));
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function clampScoreboardText(value: string, maxLength: number): string {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length <= maxLength ? clean : `${clean.slice(0, Math.max(1, maxLength - 1))}…`;
}

function paintLiveScoreboardTexture(texture: THREE.Texture, state: StadiumScoreboardState): void {
  const canvas = texture.image as HTMLCanvasElement | undefined;
  const ctx = canvas?.getContext?.("2d");
  if (!canvas || !ctx) return;

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#06101b");
  gradient.addColorStop(0.48, "#0a3456");
  gradient.addColorStop(1, "#06101b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(93,198,255,.88)";
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  ctx.textAlign = "left";
  ctx.fillStyle = "#78d1ff";
  ctx.font = "700 28px Arial, sans-serif";
  ctx.fillText("SNAPN SPORTS · TEAM STATE", 44, 54);

  ctx.fillStyle = "#effaff";
  ctx.font = "700 43px Arial, sans-serif";
  ctx.fillText(clampScoreboardText(state.headline, 32), 44, 112);

  ctx.fillStyle = "#8edcff";
  ctx.font = "700 28px Arial, sans-serif";
  ctx.fillText(`FORMATION  ${clampScoreboardText(state.formation, 14)}`, 44, 158);

  ctx.fillStyle = "rgba(239,250,255,.80)";
  ctx.font = "600 24px Arial, sans-serif";
  ctx.fillText(`TRAINING  ${clampScoreboardText(state.training, 34)}`, 44, 210);
  ctx.fillText(`MATCH     ${clampScoreboardText(state.match, 34)}`, 44, 252);

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(126,214,255,.72)";
  ctx.font = "700 20px Arial, sans-serif";
  ctx.fillText("LIVE SPATIAL HOME", canvas.width - 44, 292);
  texture.needsUpdate = true;
}

function makeAdBoardTexture(textures: Set<THREE.Texture>): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("stadium ad-board canvas unavailable");
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "#071522");
  gradient.addColorStop(0.46, "#0c3b60");
  gradient.addColorStop(1, "#071522");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#dff6ff";
  ctx.font = "700 58px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SNAPN SPORTS", 280, 102);
  ctx.fillStyle = "#65c7ff";
  ctx.font = "600 42px Arial, sans-serif";
  ctx.fillText("TRAIN SMART", 760, 100);
  ctx.fillStyle = "#dff6ff";
  ctx.fillText("MATCH INTELLIGENCE", 1240, 100);
  const texture = addDisposable(textures, new THREE.CanvasTexture(canvas));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
function ellipseSurfaceGeometry(
  geometries: Set<THREE.BufferGeometry>,
  innerX: number,
  innerZ: number,
  outerX: number,
  outerZ: number,
  y0: number,
  y1: number,
  segments: number,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const angle = (i / segments) * TAU;
    positions.push(
      Math.cos(angle) * innerX,
      y0,
      Math.sin(angle) * innerZ,
      Math.cos(angle) * outerX,
      y1,
      Math.sin(angle) * outerZ,
    );
  }
  for (let i = 0; i < segments; i += 1) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 3;
    const d = a + 2;
    indices.push(a, b, c, a, c, d);
  }
  const geometry = addDisposable(geometries, new THREE.BufferGeometry());
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function ellipseWallGeometry(
  geometries: Set<THREE.BufferGeometry>,
  radiusX: number,
  radiusZ: number,
  y0: number,
  y1: number,
  segments: number,
): THREE.BufferGeometry {
  return ellipseSurfaceGeometry(geometries, radiusX, radiusZ, radiusX, radiusZ, y0, y1, segments);
}

function aisleGeometry(
  geometries: Set<THREE.BufferGeometry>,
  spec: TierSpec,
  count: number,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  const width = 0.0095;
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * TAU;
    const a = angle - width;
    const b = angle + width;
    const start = positions.length / 3;
    positions.push(
      Math.cos(a) * spec.innerX, spec.y0 + 0.03, Math.sin(a) * spec.innerZ,
      Math.cos(b) * spec.innerX, spec.y0 + 0.03, Math.sin(b) * spec.innerZ,
      Math.cos(b) * spec.outerX, spec.y1 + 0.08, Math.sin(b) * spec.outerZ,
      Math.cos(a) * spec.outerX, spec.y1 + 0.08, Math.sin(a) * spec.outerZ,
    );
    indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
  }
  const geometry = addDisposable(geometries, new THREE.BufferGeometry());
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function beamBetween(
  group: THREE.Group,
  geometries: Set<THREE.BufferGeometry>,
  material: THREE.Material,
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  radialSegments = 6,
): THREE.Mesh {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const geometry = addDisposable(
    geometries,
    new THREE.CylinderGeometry(radius, radius, length, radialSegments, 1, false),
  );
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  group.add(mesh);
  return mesh;
}

function addEllipticRing(
  group: THREE.Group,
  geometries: Set<THREE.BufferGeometry>,
  material: THREE.Material,
  radiusX: number,
  radiusZ: number,
  y: number,
  tube: number,
): THREE.Mesh {
  const geometry = addDisposable(geometries, new THREE.TorusGeometry(radiusX, tube, 6, 144));
  const ring = new THREE.Mesh(geometry, material);
  ring.rotation.x = Math.PI / 2;
  // Torus lies in local XY; after the x-rotation local Y maps to world Z, so
  // the ellipse squash must be scale.y (scale.z only fattened the tube and
  // left the ring circular, floating in front of the elliptic facade).
  ring.scale.y = radiusZ / radiusX;
  ring.position.y = y;
  group.add(ring);
  return ring;
}

function addGoal(
  group: THREE.Group,
  geometries: Set<THREE.BufferGeometry>,
  white: THREE.Material,
  net: THREE.Material,
  side: -1 | 1,
): void {
  const x = side * 52.7;
  const back = side * 54.8;
  const postGeometry = addDisposable(geometries, new THREE.BoxGeometry(0.12, 2.44, 0.12));
  const barGeometry = addDisposable(geometries, new THREE.BoxGeometry(0.12, 0.12, 7.44));
  for (const z of [-3.66, 3.66]) {
    const post = new THREE.Mesh(postGeometry, white);
    post.position.set(x, 1.22, z);
    post.castShadow = true;
    group.add(post);
  }
  const bar = new THREE.Mesh(barGeometry, white);
  bar.position.set(x, 2.44, 0);
  bar.castShadow = true;
  group.add(bar);

  for (let i = -4; i <= 4; i += 1) {
    beamBetween(
      group,
      geometries,
      net,
      new THREE.Vector3(x, 0.08, i * 0.9),
      new THREE.Vector3(back, 0.08, i * 0.9),
      0.015,
      4,
    );
    beamBetween(
      group,
      geometries,
      net,
      new THREE.Vector3(back, 0.08, i * 0.9),
      new THREE.Vector3(back, 2.34, i * 0.9),
      0.013,
      4,
    );
  }
  for (let row = 0; row <= 5; row += 1) {
    const y = 0.08 + row * 0.45;
    for (const z of [-3.66, 3.66]) {
      beamBetween(
        group,
        geometries,
        net,
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(back, y, z),
        0.013,
        4,
      );
    }
  }
}

function crowdShirt(seed: number, accent: THREE.Color): THREE.Color {
  const value = hash(seed, 4);
  if (value > 0.985) return accent.clone().multiplyScalar(0.42 + hash(seed, 7) * 0.14);
  if (value > 0.925) return new THREE.Color(0x493b3c);
  if (value > 0.80) return new THREE.Color(0x50534d);
  if (value > 0.55) return new THREE.Color(0x454a4e);
  if (value > 0.30) return new THREE.Color(0x343a3f);
  return new THREE.Color(0x252b30);
}

function crowdSkin(seed: number): THREE.Color {
  const value = hash(seed, 8);
  if (value > 0.72) return new THREE.Color(0x695242);
  if (value > 0.40) return new THREE.Color(0x584338);
  return new THREE.Color(0x473730);
}

function crowdPlacements(spec: TierSpec, recipe: StadiumRecipe): CrowdPlacement[] {
  const result: CrowdPlacement[] = [];
  const rowDepthX = (spec.outerX - spec.innerX) / spec.rows;
  const rowDepthZ = (spec.outerZ - spec.innerZ) / spec.rows;
  const rise = (spec.y1 - spec.y0) / spec.rows;
  const accent = new THREE.Color(recipe.accentColor);
  for (let row = 0; row < spec.rows; row += 1) {
    const rowX = spec.innerX + rowDepthX * (row + 0.55);
    const rowZ = spec.innerZ + rowDepthZ * (row + 0.55);
    const rowY = spec.y0 + rise * row + 0.43;
    for (let slot = 0; slot < spec.peoplePerRow; slot += 1) {
      const seed = row * 10000 + slot;
      const section = Math.floor(slot / 18);
      const sectionNoise = hash(row * 83 + section * 19, 21);
      const localDensity = Math.max(0.62, Math.min(0.95, recipe.crowdDensity + (sectionNoise - 0.5) * 0.38));
      if (hash(seed, 1) > localDensity) continue;
      const angle = ((slot + 0.5 + (row % 2) * 0.38) / spec.peoplePerRow) * TAU + (hash(seed, 2) - 0.5) * 0.052;
      const radial = (hash(seed, 10) - 0.5) * 0.72;
      const scale = 0.78 + hash(seed, 3) * 0.48;
      result.push({
        x: Math.cos(angle) * (rowX + radial),
        y: rowY + (hash(seed, 11) - 0.5) * 0.22,
        z: Math.sin(angle) * (rowZ + radial * 0.72),
        angle,
        scale,
        shirt: crowdShirt(seed, accent),
        skin: crowdSkin(seed),
      });
    }
  }
  return result;
}

function addCrowd(
  group: THREE.Group,
  geometries: Set<THREE.BufferGeometry>,
  materials: Set<THREE.Material>,
  spec: TierSpec,
  recipe: StadiumRecipe,
): void {
  const placements = crowdPlacements(spec, recipe);
  const bodyGeometry = addDisposable(geometries, new THREE.CylinderGeometry(0.20, 0.16, 0.68, 6, 1));
  const headGeometry = addDisposable(geometries, new THREE.SphereGeometry(0.098, 7, 4));
  const bodyMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.90, metalness: 0.0 }),
  );
  const headMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.94, metalness: 0.0 }),
  );
  const bodies = new THREE.InstancedMesh(bodyGeometry, bodyMaterial, placements.length);
  const heads = new THREE.InstancedMesh(headGeometry, headMaterial, placements.length);
  const dummy = new THREE.Object3D();

  placements.forEach((placement, index) => {
    dummy.position.set(placement.x, placement.y, placement.z);
    dummy.rotation.set(0, -placement.angle + Math.PI / 2, 0);
    dummy.scale.set(placement.scale * 0.82, placement.scale, placement.scale * 0.82);
    dummy.updateMatrix();
    bodies.setMatrixAt(index, dummy.matrix);
    bodies.setColorAt(index, placement.shirt);

    dummy.position.set(placement.x, placement.y + 0.405 * placement.scale, placement.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(placement.scale * 0.92);
    dummy.updateMatrix();
    heads.setMatrixAt(index, dummy.matrix);
    heads.setColorAt(index, placement.skin);
  });
  bodies.instanceMatrix.needsUpdate = true;
  heads.instanceMatrix.needsUpdate = true;
  if (bodies.instanceColor) bodies.instanceColor.needsUpdate = true;
  if (heads.instanceColor) heads.instanceColor.needsUpdate = true;
  bodies.castShadow = false;
  bodies.receiveShadow = true;
  heads.castShadow = false;
  heads.receiveShadow = true;
  group.add(bodies, heads);
}

function addSeatBacks(
  group: THREE.Group,
  geometries: Set<THREE.BufferGeometry>,
  materials: Set<THREE.Material>,
  spec: TierSpec,
  recipe: StadiumRecipe,
): void {
  const count = spec.rows * spec.peoplePerRow;
  const geometry = addDisposable(geometries, new THREE.BoxGeometry(0.50, 0.38, 0.10));
  const material = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.72, metalness: 0.03 }),
  );
  const seats = new THREE.InstancedMesh(geometry, material, count);
  const dummy = new THREE.Object3D();
  const seatColor = new THREE.Color(recipe.seatColor);
  const rowDepthX = (spec.outerX - spec.innerX) / spec.rows;
  const rowDepthZ = (spec.outerZ - spec.innerZ) / spec.rows;
  const rise = (spec.y1 - spec.y0) / spec.rows;
  let index = 0;
  for (let row = 0; row < spec.rows; row += 1) {
    const rx = spec.innerX + rowDepthX * (row + 0.48);
    const rz = spec.innerZ + rowDepthZ * (row + 0.48);
    const y = spec.y0 + rise * row + 0.24;
    for (let slot = 0; slot < spec.peoplePerRow; slot += 1) {
      const angle = ((slot + 0.5 + (row % 2) * 0.42) / spec.peoplePerRow) * TAU;
      dummy.position.set(Math.cos(angle) * rx, y, Math.sin(angle) * rz);
      dummy.rotation.set(0, -angle + Math.PI / 2, 0);
      dummy.scale.set(0.92, 0.92, 0.92);
      dummy.updateMatrix();
      seats.setMatrixAt(index, dummy.matrix);
      seatColor.setHex(resolveSeatPatternColor(recipe, slot, spec.peoplePerRow));
      seats.setColorAt(index, seatColor);
      index += 1;
    }
  }
  seats.instanceMatrix.needsUpdate = true;
  if (seats.instanceColor) seats.instanceColor.needsUpdate = true;
  seats.receiveShadow = true;
  group.add(seats);
}
function addTier(
  group: THREE.Group,
  geometries: Set<THREE.BufferGeometry>,
  materials: Set<THREE.Material>,
  spec: TierSpec,
  recipe: StadiumRecipe,
  seatMaterial: THREE.Material,
  concreteMaterial: THREE.Material,
): void {
  const rowDepthX = (spec.outerX - spec.innerX) / spec.rows;
  const rowDepthZ = (spec.outerZ - spec.innerZ) / spec.rows;
  const rise = (spec.y1 - spec.y0) / spec.rows;

  for (let row = 0; row < spec.rows; row += 1) {
    const innerX = spec.innerX + rowDepthX * row;
    const innerZ = spec.innerZ + rowDepthZ * row;
    const outerX = spec.innerX + rowDepthX * (row + 1);
    const outerZ = spec.innerZ + rowDepthZ * (row + 1);
    const y = spec.y0 + rise * row;
    const nextY = spec.y0 + rise * (row + 1);

    const tread = new THREE.Mesh(
      ellipseSurfaceGeometry(geometries, innerX, innerZ, outerX, outerZ, y, y + 0.018, 192),
      seatMaterial,
    );
    tread.receiveShadow = true;
    group.add(tread);

    if (row < spec.rows - 1) {
      const riser = new THREE.Mesh(
        ellipseWallGeometry(geometries, outerX, outerZ, y + 0.018, nextY, 192),
        concreteMaterial,
      );
      group.add(riser);
    }
  }

  const frontRiser = new THREE.Mesh(
    ellipseWallGeometry(geometries, spec.innerX, spec.innerZ, spec.y0 - 1.15, spec.y0 + 0.04, 192),
    concreteMaterial,
  );
  group.add(frontRiser);

  const aisles = new THREE.Mesh(aisleGeometry(geometries, spec, spec.rows > 15 ? 22 : 20), concreteMaterial);
  aisles.position.y = 0.055;
  group.add(aisles);
  addSeatBacks(group, geometries, materials, spec, recipe);
  addCrowd(group, geometries, materials, spec, recipe);
}

function addColumns(
  group: THREE.Group,
  geometries: Set<THREE.BufferGeometry>,
  steel: THREE.Material,
  recipe: StadiumRecipe,
): void {
  const count = 24;
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * TAU;
    const base = new THREE.Vector3(Math.cos(angle) * 116, 6.0, Math.sin(angle) * 83.6);
    const roof = new THREE.Vector3(Math.cos(angle) * 116, 40.2, Math.sin(angle) * 84.0);
    if (recipe.columnStyle === "straight") {
      beamBetween(group, geometries, steel, base, roof, 0.32, 8);
      continue;
    }
    const splitY = recipe.columnStyle === "y" ? 27.0 : 20.0;
    const split = base.clone().lerp(roof, (splitY - base.y) / (roof.y - base.y));
    beamBetween(group, geometries, steel, base, split, 0.34, 8);
    const spread = recipe.columnStyle === "y" ? 0.055 : 0.040;
    const leftAngle = angle - spread;
    const rightAngle = angle + spread;
    beamBetween(
      group,
      geometries,
      steel,
      split,
      new THREE.Vector3(Math.cos(leftAngle) * 116, 40.2, Math.sin(leftAngle) * 84.0),
      0.26,
      8,
    );
    beamBetween(
      group,
      geometries,
      steel,
      split,
      new THREE.Vector3(Math.cos(rightAngle) * 116, 40.2, Math.sin(rightAngle) * 84.0),
      0.26,
      8,
    );
  }
}

function addRoof(
  group: THREE.Group,
  geometries: Set<THREE.BufferGeometry>,
  materials: Set<THREE.Material>,
  recipe: StadiumRecipe,
  profile: StadiumVisualProfile,
  roofMaterial: THREE.Material,
  steelMaterial: THREE.Material,
): void {
  const outerX = 120;
  const outerZ = 87;
  const innerX = 96.5 + (1 - recipe.roofCoverage) * 10;
  const innerZ = 68.5 + (1 - recipe.roofCoverage) * 7;
  const roof = new THREE.Mesh(
    ellipseSurfaceGeometry(geometries, innerX, innerZ, outerX, outerZ, 37.9 + profile.roofLift, 43.0 + profile.roofLift, 192),
    roofMaterial,
  );
  roof.castShadow = true;
  roof.receiveShadow = true;
  group.add(roof);

  for (let i = 0; i < 40; i += 1) {
    const angle = (i / 40) * TAU;
    const start = new THREE.Vector3(Math.cos(angle) * 116, 41.9 + profile.roofLift, Math.sin(angle) * 84.0);
    const end = new THREE.Vector3(Math.cos(angle) * innerX, 37.7 + profile.roofLift, Math.sin(angle) * innerZ);
    beamBetween(group, geometries, steelMaterial, start, end, 0.18, 6);
  }

  addEllipticRing(group, geometries, steelMaterial, innerX, innerZ, 37.65, 0.22);

// Visible underside structure: two catwalk rings and radial ribs prevent
// the canopy from reading as a single flat ceiling from pitch-level views.
addEllipticRing(group, geometries, steelMaterial, innerX + 4.8, innerZ + 3.2, 37.05, 0.10);
addEllipticRing(group, geometries, steelMaterial, outerX - 8.0, outerZ - 5.8, 38.25, 0.11);
for (let i = 0; i < 32; i += 1) {
  const ribAngle = (i / 32) * TAU;
  const ribStart = new THREE.Vector3(
    Math.cos(ribAngle) * (outerX - 7.5),
    38.15,
    Math.sin(ribAngle) * (outerZ - 5.4),
  );
  const ribEnd = new THREE.Vector3(
    Math.cos(ribAngle) * (innerX + 1.2),
    36.95,
    Math.sin(ribAngle) * (innerZ + 0.9),
  );
  beamBetween(group, geometries, steelMaterial, ribStart, ribEnd, 0.085, 6);
}

const catwalkLightMaterial = addDisposable(
  materials,
  new THREE.MeshStandardMaterial({
    color: 0xffe5b8,
    emissive: 0xffcf82,
    emissiveIntensity: 2.4,
    roughness: 0.38,
    metalness: 0.04,
  }),
);
const catwalkLightGeometry = addDisposable(geometries, new THREE.BoxGeometry(0.92, 0.075, 0.15));
const catwalkLights = new THREE.InstancedMesh(catwalkLightGeometry, catwalkLightMaterial, 48);
const catwalkDummy = new THREE.Object3D();
for (let i = 0; i < 48; i += 1) {
  const lightAngle = (i / 48) * TAU;
  catwalkDummy.position.set(
    Math.cos(lightAngle) * (innerX + 3.5),
    36.72,
    Math.sin(lightAngle) * (innerZ + 2.4),
  );
  catwalkDummy.rotation.set(0, -lightAngle, 0);
  catwalkDummy.updateMatrix();
  catwalkLights.setMatrixAt(i, catwalkDummy.matrix);
}
catwalkLights.instanceMatrix.needsUpdate = true;
group.add(catwalkLights);

const floodMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({
      color: 0xfff4cf,
      emissive: 0xffe0a0,
      emissiveIntensity: 3.9,
      roughness: 0.24,
      metalness: 0.1,
    }),
  );
  const floodGeometry = addDisposable(geometries, new THREE.BoxGeometry(1.55, 0.30, 0.48));
  const floods = new THREE.InstancedMesh(floodGeometry, floodMaterial, 72);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 72; i += 1) {
    const angle = (i / 72) * TAU;
    dummy.position.set(Math.cos(angle) * (innerX + 0.8), 37.1, Math.sin(angle) * (innerZ + 0.7));
    dummy.rotation.set(0, -angle, 0);
    dummy.updateMatrix();
    floods.setMatrixAt(i, dummy.matrix);
  }
  floods.instanceMatrix.needsUpdate = true;
  group.add(floods);
}

function addLightGlows(
  group: THREE.Group,
  textures: Set<THREE.Texture>,
  materials: Set<THREE.Material>,
): void {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const gradient = ctx.createRadialGradient(64, 64, 3, 64, 64, 62);
  gradient.addColorStop(0, "rgba(255,248,220,.96)");
  gradient.addColorStop(.18, "rgba(255,230,170,.62)");
  gradient.addColorStop(.48, "rgba(155,205,255,.18)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = addDisposable(textures, new THREE.CanvasTexture(canvas));
  const material = addDisposable(
    materials,
    new THREE.SpriteMaterial({
      map: texture,
      color: 0xfff3d3,
      transparent: true,
      opacity: 0.31,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  for (let i = 0; i < 20; i += 1) {
    const angle = (i / 24) * TAU;
    const sprite = new THREE.Sprite(material as THREE.SpriteMaterial);
    sprite.position.set(Math.cos(angle) * 95.6, 35.8, Math.sin(angle) * 67.8);
    sprite.scale.set(5.2, 3.6, 1);
    group.add(sprite);
  }
}
function addLighting(scene: THREE.Scene, highQuality: boolean, profile: StadiumVisualProfile): void {
  scene.add(new THREE.HemisphereLight(0xc3d2df, 0x101611, profile.hemisphereIntensity));
  scene.add(new THREE.AmbientLight(0xdce6ec, 0.15));

  const key = new THREE.DirectionalLight(profile.keyColor, profile.keyIntensity);
  key.position.set(-48, 72, 24);
  key.castShadow = highQuality;
  if (highQuality) {
    key.shadow.mapSize.set(1536, 1536);
    key.shadow.camera.near = 10;
    key.shadow.camera.far = 180;
    key.shadow.camera.left = -80;
    key.shadow.camera.right = 80;
    key.shadow.camera.top = 70;
    key.shadow.camera.bottom = -70;
    key.shadow.bias = -0.00035;
  }
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffdfb0, profile.fillIntensity);
  fill.position.set(54, 38, -42);
  scene.add(fill);

  const target = new THREE.Object3D();
  target.position.set(0, 0, 0);
  scene.add(target);
  for (const [x, z] of [
    [-82, -54],
    [82, -54],
    [-82, 54],
    [82, 54],
  ] as const) {
    const light = new THREE.SpotLight(0xfff1d2, highQuality ? 900 : 740, 230, 0.60, 0.66, 1.45);
    light.position.set(x, 42, z);
    light.target = target;
    scene.add(light);
  }

  if (profile.builderVisuals) {
    for (let index = 0; index < 8; index += 1) {
      const angle = (index / 8) * TAU;
      const practical = new THREE.PointLight(
        profile.practicalColor,
        profile.exposure >= 1.3 ? 720 : 420,
        105,
        1.7,
      );
      practical.position.set(Math.cos(angle) * 103, 22, Math.sin(angle) * 74);
      scene.add(practical);
    }
  }
}

function addStadiumOpenings(
  group: THREE.Group,
  geometries: Set<THREE.BufferGeometry>,
  materials: Set<THREE.Material>,
): void {
  const portalMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({
      color: 0x11161b,
      emissive: 0x1d1308,
      emissiveIntensity: 0.30,
      roughness: 0.88,
      metalness: 0.04,
    }),
  );
  const glassMaterial = addDisposable(
    materials,
    new THREE.MeshPhysicalMaterial({
      color: 0x243946,
      emissive: 0x07131b,
      emissiveIntensity: 0.38,
      roughness: 0.20,
      metalness: 0.20,
      clearcoat: 0.28,
      clearcoatRoughness: 0.32,
    }),
  );
  const corridorLightMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({
      color: 0xffe7b0,
      emissive: 0xffcc7c,
      emissiveIntensity: 2.25,
      roughness: 0.42,
      metalness: 0.04,
    }),
  );
  const portalGeometry = addDisposable(geometries, new THREE.BoxGeometry(4.8, 2.75, 1.42));
  const suiteGeometry = addDisposable(geometries, new THREE.BoxGeometry(6.1, 1.82, 0.68));
  const corridorGeometry = addDisposable(geometries, new THREE.BoxGeometry(3.5, 0.16, 0.18));
  for (const [rx, rz, y, count] of [[69, 48.5, 6.0, 7], [88, 62.0, 17.0, 8], [106, 75.0, 28.0, 6]] as const) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.PI + ((i + 0.5) / count) * Math.PI;
      const portal = new THREE.Mesh(portalGeometry, portalMaterial);
      portal.position.set(Math.cos(angle) * rx, y, Math.sin(angle) * rz);
      portal.rotation.y = -angle + Math.PI / 2;
      portal.castShadow = true;
      group.add(portal);

      const corridor = new THREE.Mesh(corridorGeometry, corridorLightMaterial);
      corridor.position.set(Math.cos(angle) * (rx - 0.48), y + 0.96, Math.sin(angle) * (rz - 0.34));
      corridor.rotation.y = -angle + Math.PI / 2;
      group.add(corridor);

      if (y > 10) {
        const suite = new THREE.Mesh(suiteGeometry, glassMaterial);
        suite.position.set(Math.cos(angle) * (rx - 0.56), y + 1.88, Math.sin(angle) * (rz - 0.40));
        suite.rotation.y = -angle + Math.PI / 2;
        group.add(suite);
      }
    }
  }
}

function addBuilderEnvironment(
  group: THREE.Group,
  geometries: Set<THREE.BufferGeometry>,
  materials: Set<THREE.Material>,
  recipe: StadiumRecipe,
  profile: StadiumVisualProfile,
): void {
  if (!profile.builderVisuals) return;
  const environment = recipe.environmentProfile ?? "CIVIC";
  const groundMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ color: profile.groundColor, roughness: 0.96, metalness: 0.02 }),
  );
  const groundGeometry = addDisposable(geometries, new THREE.CircleGeometry(265, 128));
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.25;
  ground.receiveShadow = true;
  group.add(ground);

  if (recipe.presentationProfile === "SERVICE_BUILDER") return;

  if (environment === "PARK") {
    const trunkGeometry = addDisposable(geometries, new THREE.CylinderGeometry(0.45, 0.62, 5.8, 7));
    const crownGeometry = addDisposable(geometries, new THREE.DodecahedronGeometry(4.8, 0));
    const trunkMaterial = addDisposable(materials, new THREE.MeshStandardMaterial({ color: 0x283329, roughness: 0.94 }));
    const crownMaterial = addDisposable(materials, new THREE.MeshStandardMaterial({ color: 0x244936, roughness: 0.88 }));
    const trunks = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, 46);
    const crowns = new THREE.InstancedMesh(crownGeometry, crownMaterial, 46);
    const dummy = new THREE.Object3D();
    for (let index = 0; index < 46; index += 1) {
      const angle = (index / 46) * TAU + hash(index, 5) * 0.06;
      const radius = 146 + hash(index, 11) * 34;
      const scale = 0.76 + hash(index, 19) * 0.52;
      dummy.position.set(Math.cos(angle) * radius, 2.65 * scale, Math.sin(angle) * radius * 0.72);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      trunks.setMatrixAt(index, dummy.matrix);
      dummy.position.y = 8.2 * scale;
      dummy.rotation.set(hash(index, 3) * 0.2, hash(index, 7) * Math.PI, hash(index, 17) * 0.12);
      dummy.scale.set(scale * 1.05, scale * 1.22, scale);
      dummy.updateMatrix();
      crowns.setMatrixAt(index, dummy.matrix);
    }
    trunks.instanceMatrix.needsUpdate = true;
    crowns.instanceMatrix.needsUpdate = true;
    group.add(trunks, crowns);
    return;
  }

  if (environment === "COASTAL") {
    const waterMaterial = addDisposable(
      materials,
      new THREE.MeshPhysicalMaterial({
        color: 0x163d50,
        roughness: 0.24,
        metalness: 0.12,
        clearcoat: 0.72,
        clearcoatRoughness: 0.18,
        transparent: true,
        opacity: 0.82,
      }),
    );
    const waterGeometry = addDisposable(geometries, new THREE.RingGeometry(176, 300, 128));
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.19;
    group.add(water);
    const horizonMaterial = addDisposable(
      materials,
      new THREE.MeshBasicMaterial({ color: 0x89d8ef, transparent: true, opacity: 0.22 }),
    );
    for (const z of [-144, -158, -172]) {
      const lineGeometry = addDisposable(geometries, new THREE.PlaneGeometry(340, 0.16));
      const line = new THREE.Mesh(lineGeometry, horizonMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, -0.05, z);
      group.add(line);
    }
    return;
  }

  const buildingCount = environment === "URBAN" ? 30 : environment === "NIGHT_EVENT" ? 24 : 20;
  const buildingGeometry = addDisposable(geometries, new THREE.BoxGeometry(7.5, 1, 7.5));
  const buildingMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({
      color: environment === "NIGHT_EVENT" ? 0x0c1824 : environment === "URBAN" ? 0x273139 : 0x343e43,
      emissive: environment === "NIGHT_EVENT" ? profile.practicalColor : 0x000000,
      emissiveIntensity: environment === "NIGHT_EVENT" ? 0.14 : 0,
      roughness: 0.72,
      metalness: 0.28,
    }),
  );
  const buildings = new THREE.InstancedMesh(buildingGeometry, buildingMaterial, buildingCount);
  const dummy = new THREE.Object3D();
  const viewAngle = 34 * Math.PI / 180;
  const backAngle = viewAngle + Math.PI;
  const skylineSpan = 2.35;
  for (let index = 0; index < buildingCount; index += 1) {
    const progress = index / (buildingCount - 1);
    const angle = backAngle - skylineSpan / 2 + progress * skylineSpan + (hash(index, 31) - 0.5) * 0.055;
    const radius = 182 + hash(index, 13) * 46;
    const height = 11 + hash(index, 73) * (environment === "URBAN" ? 36 : 22);
    dummy.position.set(Math.cos(angle) * radius, height / 2 - 0.1, Math.sin(angle) * radius * 0.72);
    dummy.rotation.y = -angle;
    dummy.scale.set(0.78 + hash(index, 9) * 0.82, height, 0.72 + hash(index, 47) * 0.66);
    dummy.updateMatrix();
    buildings.setMatrixAt(index, dummy.matrix);
  }
  buildings.instanceMatrix.needsUpdate = true;
  group.add(buildings);

  if (environment === "NIGHT_EVENT") {
    const beamGeometry = addDisposable(geometries, new THREE.CylinderGeometry(0.6, 2.8, 94, 12, 1, true));
    const beamMaterial = addDisposable(
      materials,
      new THREE.MeshBasicMaterial({
        color: profile.practicalColor,
        transparent: true,
        opacity: 0.055,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    for (let index = 0; index < 8; index += 1) {
      const angle = (index / 8) * TAU;
      const beam = new THREE.Mesh(beamGeometry, beamMaterial);
      beam.position.set(Math.cos(angle) * 101, 62, Math.sin(angle) * 72);
      beam.rotation.z = (index % 2 === 0 ? 1 : -1) * 0.08;
      group.add(beam);
    }
  }
}

function addExteriorFacade(
  group: THREE.Group,
  geometries: Set<THREE.BufferGeometry>,
  materials: Set<THREE.Material>,
  recipe: StadiumRecipe,
  profile: StadiumVisualProfile,
): void {
  const environment = recipe.environmentProfile ?? "CIVIC";
  const facade = recipe.facadeProfile ?? "GLASS_BAND";
  const serviceBuilder = recipe.presentationProfile === "SERVICE_BUILDER";
  const plazaColor = environment === "PARK"
    ? 0x17221b
    : environment === "COASTAL"
      ? 0x142129
      : environment === "NIGHT_EVENT"
        ? 0x090d12
        : environment === "URBAN"
          ? 0x15191e
          : 0x151b20;
  const baseColor = serviceBuilder ? 0x59656d : facade === "SOLID_RIB" ? 0x3c444b : facade === "LIGHT_FRAME" ? 0x414a51 : 0x343b42;
  const upperColor = serviceBuilder ? 0x53616a : facade === "SOLID_RIB" ? 0x46515a : facade === "LIGHT_FRAME" ? 0x596873 : 0x414d58;
  const plazaMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ color: plazaColor, roughness: 0.98, metalness: 0.02 }),
  );
  const baseMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({
      color: baseColor,
      emissive: recipe.lightingProfile === "EVENT" ? recipe.accentColor : 0x000000,
      emissiveIntensity: recipe.lightingProfile === "EVENT" ? 0.055 : 0,
      roughness: facade === "LIGHT_FRAME" ? 0.66 : 0.84,
      metalness: facade === "LIGHT_FRAME" ? 0.34 : 0.12,
      side: THREE.DoubleSide,
    }),
  );
  const upperMaterial = addDisposable(
    materials,
    new THREE.MeshPhysicalMaterial({
      color: upperColor,
      roughness: facade === "SOLID_RIB" ? 0.58 : 0.46,
      metalness: facade === "LIGHT_FRAME" ? 0.72 : 0.58,
      clearcoat: 0.10,
      clearcoatRoughness: 0.58,
      side: THREE.DoubleSide,
    }),
  );
  const glassMaterial = addDisposable(
    materials,
    new THREE.MeshPhysicalMaterial({
      color: serviceBuilder ? 0x4f6975 : facade === "LIGHT_FRAME" ? 0x24485c : facade === "SOLID_RIB" ? 0x343e46 : 0x17303e,
      emissive: serviceBuilder ? 0xf1d6a7 : facade === "LIGHT_FRAME" ? recipe.accentColor : 0x07131a,
      // LIGHT_FRAME reads as dark glass behind a luminous lattice, so its
      // glass recedes while GLASS_BAND stays the glowing ribbon.
      emissiveIntensity: serviceBuilder ? 0.24 : facade === "LIGHT_FRAME" ? 0.12 : facade === "SOLID_RIB" ? 0.02 : 0.44,
      roughness: serviceBuilder ? 0.26 : facade === "SOLID_RIB" ? 0.70 : 0.18,
      metalness: facade === "SOLID_RIB" ? 0.06 : facade === "LIGHT_FRAME" ? 0.28 : 0.18,
      transparent: facade !== "SOLID_RIB",
      opacity: serviceBuilder ? 0.68 : facade === "SOLID_RIB" ? 1 : 0.78,
      clearcoat: facade === "SOLID_RIB" ? 0.04 : 0.32,
      clearcoatRoughness: facade === "SOLID_RIB" ? 0.68 : 0.22,
      side: THREE.DoubleSide,
    }),
  );
  const finMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({
      color: facade === "LIGHT_FRAME" ? recipe.accentColor : facade === "SOLID_RIB" ? 0xa3adb5 : 0x929da6,
      emissive: facade === "LIGHT_FRAME" || recipe.lightingProfile === "EVENT" ? recipe.accentColor : 0x000000,
      emissiveIntensity: facade === "LIGHT_FRAME" ? 1.25 : recipe.lightingProfile === "EVENT" ? 0.10 : 0,
      roughness: facade === "SOLID_RIB" ? 0.52 : 0.38,
      metalness: 0.70,
    }),
  );
  const entranceMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({
      color: serviceBuilder ? 0x756956 : 0x17212a,
      emissive: serviceBuilder ? 0xf1d6a7 : 0x78cfff,
      emissiveIntensity: serviceBuilder ? 0.90 : 0.42,
      roughness: 0.28,
      metalness: 0.18,
    }),
  );
  const accentMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({
      color: recipe.accentColor,
      emissive: recipe.accentColor,
      // SERVICE_HOME keeps the identity accent as a quiet hairline, matching
      // the poster's "cyan only for focus and edges" art direction.
      emissiveIntensity: recipe.lightingProfile === "EVENT"
        ? 2.6
        : recipe.presentationProfile === "SERVICE_HOME" ? 0.6 : 1.6,
      roughness: 0.34,
      metalness: 0.28,
    }),
  );

  if (!recipe.presentationProfile?.startsWith("SERVICE_")) {
    const plazaGeometry = addDisposable(geometries, new THREE.PlaneGeometry(310, 230));
    const plaza = new THREE.Mesh(plazaGeometry, plazaMaterial);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = -0.18;
    plaza.receiveShadow = true;
    group.add(plaza);
  }

  const lowerWall = new THREE.Mesh(
    ellipseWallGeometry(geometries, 119.0, 84.4, 0.6, 10.4, 192),
    baseMaterial,
  );
  lowerWall.castShadow = true;
  lowerWall.receiveShadow = true;
  group.add(lowerWall);

  const glassBand = new THREE.Mesh(
    ellipseWallGeometry(geometries, 120.3, 85.3, 10.4, 17.2, 192),
    glassMaterial,
  );
  glassBand.castShadow = true;
  group.add(glassBand);

  const upperWall = new THREE.Mesh(
    ellipseWallGeometry(geometries, 121.5, 86.2, 17.2, 32.8, 192),
    upperMaterial,
  );
  upperWall.castShadow = true;
  upperWall.receiveShadow = true;
  group.add(upperWall);

  addEllipticRing(group, geometries, accentMaterial, 120.4, 85.4, 10.55, 0.16);
  addEllipticRing(group, geometries, finMaterial, 121.6, 86.3, 17.25, 0.14);
  addEllipticRing(group, geometries, finMaterial, 121.8, 86.5, 32.9, 0.20);

  const finWidth = facade === "SOLID_RIB" ? 0.82 : facade === "LIGHT_FRAME" ? 0.92 : 0.24;
  const finDepth = facade === "SOLID_RIB" ? 3.2 : facade === "LIGHT_FRAME" ? 2.6 : 1.1;
  const finGeometry = addDisposable(geometries, new THREE.BoxGeometry(finWidth, 15.2, finDepth));
  for (let i = 0; i < profile.facadeRibCount; i += 1) {
    const angle = (i / profile.facadeRibCount) * TAU;
    const fin = new THREE.Mesh(finGeometry, finMaterial);
    fin.position.set(Math.cos(angle) * 122.0, 24.9, Math.sin(angle) * 86.7);
    fin.rotation.y = -angle + Math.PI / 2;
    fin.castShadow = true;
    group.add(fin);
  }

  const entranceGeometry = addDisposable(geometries, new THREE.BoxGeometry(5.8, 3.5, 1.1));
  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * TAU;
    const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
    entrance.position.set(Math.cos(angle) * 119.6, 3.0, Math.sin(angle) * 84.9);
    entrance.rotation.y = -angle + Math.PI / 2;
    group.add(entrance);
  }
}

function addServiceExteriorArchitecture(
  group: THREE.Group,
  geometries: Set<THREE.BufferGeometry>,
  materials: Set<THREE.Material>,
  textures: Set<THREE.Texture>,
  recipe: StadiumRecipe,
  mode: Exclude<CoreVisualMode, "STATIC">,
  disposers: Array<() => void>,
): void {
  if (!recipe.presentationProfile?.startsWith("SERVICE_")) return;
  const architecture = resolveServiceArchitecture();

  // P1 board-formed concrete: procedural noise + faint vertical formwork
  // lines as color/bump so the blades stop reading as untextured plastic.
  const concreteCanvas = document.createElement("canvas");
  concreteCanvas.width = 128;
  concreteCanvas.height = 128;
  const concreteCtx = concreteCanvas.getContext("2d");
  if (concreteCtx) {
    concreteCtx.fillStyle = "#8a8f94";
    concreteCtx.fillRect(0, 0, 128, 128);
    let concreteSeed = 4241;
    const nextConcrete = () => {
      concreteSeed = (concreteSeed * 16807) % 2147483647;
      return concreteSeed / 2147483647;
    };
    for (let index = 0; index < 2600; index += 1) {
      const shade = 120 + Math.floor(nextConcrete() * 46);
      concreteCtx.fillStyle = `rgba(${shade}, ${shade + 3}, ${shade + 6}, 0.16)`;
      concreteCtx.fillRect(nextConcrete() * 128, nextConcrete() * 128, 1 + nextConcrete() * 2.5, 1 + nextConcrete() * 2.5);
    }
    for (let line = 0; line < 8; line += 1) {
      concreteCtx.fillStyle = "rgba(52, 58, 64, 0.16)";
      concreteCtx.fillRect(line * 16 + 6, 0, 1, 128);
      concreteCtx.fillStyle = "rgba(190, 196, 202, 0.08)";
      concreteCtx.fillRect(line * 16 + 7, 0, 1, 128);
    }
  }
  const concreteTexture = addDisposable(textures, new THREE.CanvasTexture(concreteCanvas));
  concreteTexture.wrapS = THREE.RepeatWrapping;
  concreteTexture.wrapT = THREE.RepeatWrapping;
  concreteTexture.repeat.set(1.6, 3.2);
  const concreteStandard = new THREE.MeshStandardMaterial({
    color: 0x6b747d,
    map: concreteTexture,
    bumpMap: concreteTexture,
    bumpScale: 0.3,
    roughness: 0.86,
    metalness: 0.03,
  });
  const concrete = addDisposable(materials, concreteStandard);
  // Progressive upgrade: swap the procedural stand-in for the photographic
  // board-formed concrete scan once it loads (P1 texture asset).
  new THREE.TextureLoader().load(stadiumConcreteBoardUrl, (boardTexture) => {
    boardTexture.colorSpace = THREE.SRGBColorSpace;
    boardTexture.wrapS = THREE.RepeatWrapping;
    boardTexture.wrapT = THREE.RepeatWrapping;
    boardTexture.repeat.set(1.4, 2.6);
    textures.add(boardTexture);
    concreteStandard.map = boardTexture;
    concreteStandard.bumpMap = boardTexture;
    concreteStandard.bumpScale = 0.4;
    concreteStandard.color.set(0x707a84);
    concreteStandard.needsUpdate = true;
  });
  const glass = addDisposable(
    materials,
    new THREE.MeshPhysicalMaterial({
      color: 0x2c4656,
      emissive: 0xf3d9a8,
      emissiveIntensity: 0.16,
      roughness: 0.14,
      metalness: 0.10,
      transparent: true,
      opacity: 0.46,
      clearcoat: 0.55,
      clearcoatRoughness: 0.14,
    }),
  );
  const warmInterior = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({
      color: 0x94805f,
      emissive: 0xffdca3,
      emissiveIntensity: 0.92,
      roughness: 0.55,
      metalness: 0.04,
    }),
  );
  const warmStrip = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({
      color: 0xffe9c4,
      emissive: 0xffd9a0,
      emissiveIntensity: 2.4,
      roughness: 0.4,
      metalness: 0.02,
    }),
  );
  const steel = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ color: 0x2f3840, roughness: 0.52, metalness: 0.58 }),
  );
  // P1 wet mineral plaza: tile grid with grout lines plus a roughness map
  // whose darker (smoother) patches read as standing water under the lights.
  const plazaCanvas = document.createElement("canvas");
  plazaCanvas.width = 256;
  plazaCanvas.height = 256;
  const plazaCtx = plazaCanvas.getContext("2d");
  const plazaRoughCanvas = document.createElement("canvas");
  plazaRoughCanvas.width = 256;
  plazaRoughCanvas.height = 256;
  const plazaRoughCtx = plazaRoughCanvas.getContext("2d");
  if (plazaCtx && plazaRoughCtx) {
    let plazaSeed = 7717;
    const nextPlaza = () => {
      plazaSeed = (plazaSeed * 16807) % 2147483647;
      return plazaSeed / 2147483647;
    };
    plazaCtx.fillStyle = "#232f38";
    plazaCtx.fillRect(0, 0, 256, 256);
    plazaRoughCtx.fillStyle = "#6a6a6a";
    plazaRoughCtx.fillRect(0, 0, 256, 256);
    const tile = 32;
    for (let ty = 0; ty < 256; ty += tile) {
      for (let tx = 0; tx < 256; tx += tile) {
        const tone = 26 + Math.floor(nextPlaza() * 16);
        plazaCtx.fillStyle = `rgb(${tone}, ${tone + 9}, ${tone + 16})`;
        plazaCtx.fillRect(tx + 1, ty + 1, tile - 2, tile - 2);
        // Wet patches: lower roughness on scattered tiles.
        const wet = nextPlaza();
        const rough = wet < 0.34 ? 28 + Math.floor(nextPlaza() * 30) : 96 + Math.floor(nextPlaza() * 50);
        plazaRoughCtx.fillStyle = `rgb(${rough}, ${rough}, ${rough})`;
        plazaRoughCtx.fillRect(tx + 1, ty + 1, tile - 2, tile - 2);
      }
    }
    plazaCtx.strokeStyle = "rgba(10, 15, 20, 0.85)";
    plazaCtx.lineWidth = 2;
    for (let line = 0; line <= 256; line += tile) {
      plazaCtx.beginPath();
      plazaCtx.moveTo(line, 0);
      plazaCtx.lineTo(line, 256);
      plazaCtx.stroke();
      plazaCtx.beginPath();
      plazaCtx.moveTo(0, line);
      plazaCtx.lineTo(256, line);
      plazaCtx.stroke();
    }
  }
  const plazaTexture = addDisposable(textures, new THREE.CanvasTexture(plazaCanvas));
  plazaTexture.wrapS = THREE.RepeatWrapping;
  plazaTexture.wrapT = THREE.RepeatWrapping;
  plazaTexture.repeat.set(12, 15);
  plazaTexture.colorSpace = THREE.SRGBColorSpace;
  const plazaRoughTexture = addDisposable(textures, new THREE.CanvasTexture(plazaRoughCanvas));
  plazaRoughTexture.wrapS = THREE.RepeatWrapping;
  plazaRoughTexture.wrapT = THREE.RepeatWrapping;
  plazaRoughTexture.repeat.set(12, 15);
  // Semi-transparent tile layer over a real mirror: the Reflector below shows
  // the lit stadium in the wet ground, and the tiles temper it into wet stone.
  const plazaMaterial = addDisposable(
    materials,
    new THREE.MeshPhysicalMaterial({
      color: 0xb9c4cc,
      map: plazaTexture,
      roughness: 0.62,
      roughnessMap: plazaRoughTexture,
      metalness: 0.10,
      clearcoat: 0.92,
      clearcoatRoughness: 0.09,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    }),
  );
  const seamMaterial = addDisposable(
    materials,
    new THREE.MeshBasicMaterial({ color: 0x41505a, transparent: true, opacity: 0.22 }),
  );

  const plazaGeometry = addDisposable(
    geometries,
    new THREE.PlaneGeometry(architecture.plaza.width, architecture.plaza.depth),
  );

  // P1 real planar reflection (FULL only): the poster's wet plaza mirrors the
  // glowing stadium. On-demand rendering keeps the extra pass affordable.
  if (mode === "FULL") {
    const reflectorGeometry = addDisposable(
      geometries,
      new THREE.PlaneGeometry(architecture.plaza.width, architecture.plaza.depth),
    );
    // Low-res render target on purpose: upsampling softens the mirror into a
    // wet-ground blur (and costs less than a sharp full-res reflection).
    const reflector = new Reflector(reflectorGeometry, {
      clipBias: 0.003,
      textureWidth: 384,
      textureHeight: 384,
      color: 0x4b565e,
    });
    reflector.rotation.x = -Math.PI / 2;
    reflector.position.set(0, -0.26, 45);
    group.add(reflector);
    disposers.push(() => reflector.dispose());
  }

  const plaza = new THREE.Mesh(plazaGeometry, plazaMaterial);
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(0, -0.20, 45);
  plaza.receiveShadow = true;
  group.add(plaza);

  const entranceGeometry = addDisposable(
    geometries,
    new THREE.BoxGeometry(architecture.entrance.width, architecture.entrance.height, architecture.entrance.depth),
  );
  const entrance = new THREE.Mesh(entranceGeometry, glass);
  entrance.position.set(0, architecture.entrance.height / 2, architecture.entrance.z);
  entrance.castShadow = true;
  group.add(entrance);

  const slabWidth = architecture.entrance.width - 2;
  const slabGeometry = addDisposable(geometries, new THREE.BoxGeometry(slabWidth, 0.34, 7.2));
  const stripGeometry = addDisposable(geometries, new THREE.BoxGeometry(slabWidth - 1.6, 0.14, 0.22));
  architecture.interiorSlabHeights.forEach((height) => {
    const slab = new THREE.Mesh(slabGeometry, warmInterior);
    slab.position.set(0, height, architecture.entrance.z - 0.8);
    group.add(slab);
    // Lit ceiling strip under each slab so every level reads as an occupied,
    // warm concourse floor instead of a flat emissive box.
    const strip = new THREE.Mesh(stripGeometry, warmStrip);
    strip.position.set(0, height - 0.42, architecture.entrance.z + 1.1);
    group.add(strip);
  });

  const mullionHeight = architecture.entrance.height - 1.6;
  const mullionGeometry = addDisposable(geometries, new THREE.BoxGeometry(0.09, mullionHeight, 0.2));
  const mullions = new THREE.InstancedMesh(mullionGeometry, steel, architecture.mullionCount);
  const mullionDummy = new THREE.Object3D();
  const mullionSpan = architecture.entrance.width - 1.6;
  for (let index = 0; index < architecture.mullionCount; index += 1) {
    const progress = architecture.mullionCount === 1 ? 0.5 : index / (architecture.mullionCount - 1);
    mullionDummy.position.set(-mullionSpan / 2 + progress * mullionSpan, mullionHeight / 2 + 0.4, architecture.entrance.z + 2.6);
    mullionDummy.updateMatrix();
    mullions.setMatrixAt(index, mullionDummy.matrix);
  }
  mullions.instanceMatrix.needsUpdate = true;
  group.add(mullions);

  // Angular blade buttresses: wide at the base, narrow at the crown, shallow
  // in depth, crown leaning toward the bowl — board-formed concrete piers,
  // not traffic cones.
  const buttressGeometry = addDisposable(geometries, new THREE.CylinderGeometry(2.6, 6.2, 32, 4));
  architecture.buttresses.forEach((spec) => {
    const buttress = new THREE.Mesh(buttressGeometry, concrete);
    buttress.position.set(spec.x, spec.height / 2, spec.z);
    buttress.scale.set(1.25, spec.height / 32, 0.55);
    buttress.rotation.y = Math.PI / 4;
    buttress.rotation.z = spec.lean;
    buttress.rotation.x = -0.055;
    buttress.castShadow = true;
    buttress.receiveShadow = true;
    group.add(buttress);
  });

  // Warm interior spill: soft point lights inside the atrium tint the stairs
  // and nearby buttress faces without blowing out the plaza.
  for (const x of [-11, 11]) {
    const spill = new THREE.PointLight(0xffd9a0, 78, 78, 2.0);
    spill.position.set(x, 13, architecture.entrance.z - 3);
    group.add(spill);
  }

  // Glowing lobby backdrop: a warm gradient plane behind the glass gives the
  // atrium the poster's lit-from-within depth.
  const lobbyCanvas = document.createElement("canvas");
  lobbyCanvas.width = 64;
  lobbyCanvas.height = 64;
  const lobbyCtx = lobbyCanvas.getContext("2d");
  if (lobbyCtx) {
    const lobbyGradient = lobbyCtx.createLinearGradient(0, 64, 0, 0);
    lobbyGradient.addColorStop(0, "#ffdca3");
    lobbyGradient.addColorStop(0.45, "#c69a5f");
    lobbyGradient.addColorStop(1, "#6b5638");
    lobbyCtx.fillStyle = lobbyGradient;
    lobbyCtx.fillRect(0, 0, 64, 64);
  }
  const lobbyTexture = addDisposable(textures, new THREE.CanvasTexture(lobbyCanvas));
  lobbyTexture.colorSpace = THREE.SRGBColorSpace;
  const lobbyMaterial = addDisposable(
    materials,
    new THREE.MeshBasicMaterial({ map: lobbyTexture, toneMapped: false, opacity: 0.9, transparent: true }),
  );
  const lobbyGeometry = addDisposable(
    geometries,
    new THREE.PlaneGeometry(architecture.entrance.width - 3, architecture.entrance.height - 3),
  );
  const lobby = new THREE.Mesh(lobbyGeometry, lobbyMaterial);
  lobby.position.set(0, architecture.entrance.height / 2 - 1, architecture.entrance.z - 2.2);
  group.add(lobby);

  // Glowing roof crown: warm ring just under the roof rim, echoing the
  // poster's lit bowl edge.
  const crownMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({
      color: 0xffe3ae,
      emissive: 0xffd58e,
      emissiveIntensity: 1.9,
      roughness: 0.5,
      metalness: 0.05,
    }),
  );
  addEllipticRing(group, geometries, crownMaterial, 117.6, 82.9, 33.6, 0.42);

  if (recipe.presentationProfile === "SERVICE_BUILDER") {
    const perimeterGeometry = addDisposable(geometries, new THREE.CylinderGeometry(2.4, 5.6, 29, 4));
    const perimeter = new THREE.InstancedMesh(perimeterGeometry, concrete, architecture.perimeterButtressCount);
    const perimeterDummy = new THREE.Object3D();
    for (let index = 0; index < architecture.perimeterButtressCount; index += 1) {
      const angle = (index / architecture.perimeterButtressCount) * TAU;
      perimeterDummy.position.set(Math.cos(angle) * 121.5, 14.3, Math.sin(angle) * 86.4);
      perimeterDummy.rotation.set(0, -angle + Math.PI / 4, Math.sin(angle) * 0.035);
      perimeterDummy.scale.set(0.88, 0.98 + Math.abs(Math.cos(angle)) * 0.08, 0.88);
      perimeterDummy.updateMatrix();
      perimeter.setMatrixAt(index, perimeterDummy.matrix);
    }
    perimeter.instanceMatrix.needsUpdate = true;
    perimeter.castShadow = true;
    perimeter.receiveShadow = true;
    group.add(perimeter);
  }

  architecture.stairRuns.forEach((spec) => {
    const geometry = addDisposable(geometries, new THREE.BoxGeometry(spec.width, 0.28, spec.depth));
    const stair = new THREE.Mesh(geometry, concrete);
    stair.position.set(0, spec.y, spec.z);
    stair.receiveShadow = true;
    group.add(stair);
  });

  const longitudinalGeometry = addDisposable(geometries, new THREE.BoxGeometry(0.085, 0.018, 244));
  const longitudinal = new THREE.InstancedMesh(longitudinalGeometry, seamMaterial, 13);
  const seamDummy = new THREE.Object3D();
  for (let index = 0; index < 13; index += 1) {
    seamDummy.position.set(-144 + index * 24, -0.08, 30);
    seamDummy.updateMatrix();
    longitudinal.setMatrixAt(index, seamDummy.matrix);
  }
  longitudinal.instanceMatrix.needsUpdate = true;
  group.add(longitudinal);

  const crossGeometry = addDisposable(geometries, new THREE.BoxGeometry(324, 0.018, 0.085));
  const cross = new THREE.InstancedMesh(crossGeometry, seamMaterial, 17);
  for (let index = 0; index < 17; index += 1) {
    seamDummy.position.set(0, -0.075, -82 + index * 14);
    seamDummy.updateMatrix();
    cross.setMatrixAt(index, seamDummy.matrix);
  }
  cross.instanceMatrix.needsUpdate = true;
  group.add(cross);

  const bollardGeometry = addDisposable(geometries, new THREE.CylinderGeometry(0.12, 0.16, 1.1, 10));
  const bollardMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({
      color: 0xdbe7ec,
      emissive: 0xf1d6a7,
      emissiveIntensity: 1.5,
      roughness: 0.48,
    }),
  );
  const bollards = new THREE.InstancedMesh(bollardGeometry, bollardMaterial, 24);
  const bollardDummy = new THREE.Object3D();
  for (let index = 0; index < 12; index += 1) {
    const z = 96 + index * 9.6;
    for (const side of [-1, 1]) {
      const instanceIndex = index * 2 + (side === -1 ? 0 : 1);
      bollardDummy.position.set(side * 30, 0.38, z);
      bollardDummy.updateMatrix();
      bollards.setMatrixAt(instanceIndex, bollardDummy.matrix);
    }
  }
  bollards.instanceMatrix.needsUpdate = true;
  group.add(bollards);

  // Wet-plaza reflection: the poster's signature. A cheap additive canvas
  // texture stretches the warm atrium light into vertical streaks on the
  // plaza, plus a short streak under each bollard. No real reflections.
  const reflectionCanvas = document.createElement("canvas");
  reflectionCanvas.width = 256;
  reflectionCanvas.height = 256;
  const reflectionCtx = reflectionCanvas.getContext("2d");
  if (reflectionCtx) {
    reflectionCtx.clearRect(0, 0, 256, 256);
    let streakSeed = 9377;
    const nextSeed = () => {
      streakSeed = (streakSeed * 16807) % 2147483647;
      return streakSeed / 2147483647;
    };
    for (let index = 0; index < 46; index += 1) {
      const x = nextSeed() * 256;
      const width = 1.5 + nextSeed() * 6;
      // Fade streaks toward the sides so the additive plane has no visible
      // rectangular boundary on the plaza.
      const edgeFade = Math.sin((Math.min(255, x) / 256) * Math.PI) ** 1.4;
      const alpha = (0.05 + nextSeed() * 0.30) * edgeFade;
      const gradient = reflectionCtx.createLinearGradient(0, 0, 0, 256);
      gradient.addColorStop(0, `rgba(255, 216, 156, ${alpha})`);
      gradient.addColorStop(0.55, `rgba(255, 205, 138, ${alpha * 0.42})`);
      gradient.addColorStop(1, "rgba(255, 200, 130, 0)");
      reflectionCtx.fillStyle = gradient;
      reflectionCtx.fillRect(x, 0, width, 256);
    }
    const pool = reflectionCtx.createRadialGradient(128, 12, 4, 128, 12, 130);
    pool.addColorStop(0, "rgba(255, 224, 172, 0.5)");
    pool.addColorStop(1, "rgba(255, 210, 150, 0)");
    reflectionCtx.fillStyle = pool;
    reflectionCtx.fillRect(0, 0, 256, 256);
  }
  const reflectionTexture = addDisposable(textures, new THREE.CanvasTexture(reflectionCanvas));
  reflectionTexture.colorSpace = THREE.SRGBColorSpace;
  const reflectionMaterial = addDisposable(
    materials,
    new THREE.MeshBasicMaterial({
      map: reflectionTexture,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  const reflectionGeometry = addDisposable(geometries, new THREE.PlaneGeometry(architecture.entrance.width + 44, 110));
  const reflection = new THREE.Mesh(reflectionGeometry, reflectionMaterial);
  reflection.rotation.x = -Math.PI / 2;
  reflection.position.set(0, -0.12, architecture.entrance.z + 58);
  group.add(reflection);

  const bollardStreakGeometry = addDisposable(geometries, new THREE.PlaneGeometry(0.5, 5.2));
  const bollardStreakMaterial = addDisposable(
    materials,
    new THREE.MeshBasicMaterial({
      color: 0xffd9a0,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  const bollardStreaks = new THREE.InstancedMesh(bollardStreakGeometry, bollardStreakMaterial, 24);
  const streakDummy = new THREE.Object3D();
  for (let index = 0; index < 12; index += 1) {
    const z = 96 + index * 9.6;
    for (const side of [-1, 1]) {
      const instanceIndex = index * 2 + (side === -1 ? 0 : 1);
      streakDummy.position.set(side * 30, -0.1, z + 3.3);
      streakDummy.rotation.set(-Math.PI / 2, 0, 0);
      streakDummy.updateMatrix();
      bollardStreaks.setMatrixAt(instanceIndex, streakDummy.matrix);
    }
  }
  bollardStreaks.instanceMatrix.needsUpdate = true;
  group.add(bollardStreaks);
}

function buildStadium(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  mode: Exclude<CoreVisualMode, "STATIC">,
  recipe: StadiumRecipe,
  profile: StadiumVisualProfile,
  geometries: Set<THREE.BufferGeometry>,
  materials: Set<THREE.Material>,
  textures: Set<THREE.Texture>,
  disposers: Array<() => void>,
): THREE.Group {
  const group = new THREE.Group();
  scene.add(group);

  const grassTexture = makePitchTexture(textures);
  grassTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const grassBumpTexture = makeGrassBumpTexture(textures);
  grassBumpTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const pitchMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ map: grassTexture, bumpMap: grassBumpTexture, bumpScale: 0.045, roughness: 0.93, metalness: 0.0 }),
  );
  const servicePresentation = Boolean(recipe.presentationProfile?.startsWith("SERVICE_"));
  const concreteMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ color: servicePresentation ? 0x78838a : 0x5b6268, roughness: 0.90, metalness: 0.02 }),
  );
  const darkConcreteMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ color: servicePresentation ? 0x343d43 : 0x222831, roughness: 0.89, metalness: 0.04 }),
  );
  const seatMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ color: recipe.seatColor, roughness: 0.76, metalness: 0.04, side: THREE.DoubleSide }),
  );
  const roofMaterial = addDisposable(
    materials,
    new THREE.MeshPhysicalMaterial({
      color: servicePresentation ? 0x7b8891 : recipe.lightingProfile === "DAYLIGHT" ? 0x7d898f : recipe.lightingProfile === "EVENT" ? 0x33404d : 0x596671,
      emissive: recipe.lightingProfile === "EVENT" ? recipe.accentColor : 0x000000,
      emissiveIntensity: recipe.lightingProfile === "EVENT" ? 0.045 : 0,
      roughness: 0.38,
      metalness: 0.68,
      clearcoat: 0.10,
      clearcoatRoughness: 0.54,
      side: THREE.DoubleSide,
    }),
  );
  const steelMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ color: servicePresentation ? 0xaeb9bf : 0xa6afb7, roughness: 0.36, metalness: 0.72 }),
  );
  const blackMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ color: 0x05090d, roughness: 0.78, metalness: 0.1 }),
  );
  const whiteMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ color: 0xf3f4ef, roughness: 0.48, metalness: 0.05 }),
  );
  const netMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ color: 0xb9c2c8, roughness: 0.72, metalness: 0.08 }),
  );
  const ledMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({
      color: recipe.accentColor,
      emissive: recipe.accentColor,
      emissiveIntensity: 2.6,
      roughness: 0.30,
      metalness: 0.15,
    }),
  );

  const scoreboardTexture = makeScoreboardTexture(textures);
  scoreboardTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  group.userData.scoreboardTexture = scoreboardTexture;
  const scoreboardMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({
      map: scoreboardTexture,
      emissiveMap: scoreboardTexture,
      emissive: 0xffffff,
      emissiveIntensity: 1.25,
      roughness: 0.32,
      metalness: 0.05,
    }),
  );
  const adBoardTexture = makeAdBoardTexture(textures);
  adBoardTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const adBoardMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({
      map: adBoardTexture,
      emissiveMap: adBoardTexture,
      emissive: 0x9adfff,
      emissiveIntensity: 0.78,
      roughness: 0.40,
      metalness: 0.05,
      side: THREE.DoubleSide,
    }),
  );
  const pitchGeometry = addDisposable(geometries, new THREE.PlaneGeometry(105, 68, 20, 12));
  const pitch = new THREE.Mesh(pitchGeometry, pitchMaterial);
  pitch.rotation.x = -Math.PI / 2;
  pitch.position.y = 0.02;
  pitch.receiveShadow = true;
  group.add(pitch);
  addGoal(group, geometries, whiteMaterial, netMaterial, -1);
  addGoal(group, geometries, whiteMaterial, netMaterial, 1);

  const surroundGeometry = addDisposable(geometries, new THREE.PlaneGeometry(132, 94));
  const surround = new THREE.Mesh(surroundGeometry, darkConcreteMaterial);
  surround.rotation.x = -Math.PI / 2;
  surround.position.y = -0.06;
  surround.receiveShadow = true;
  group.add(surround);
  group.remove(surround);
  group.add(surround);
  group.remove(pitch);
  group.add(pitch);

  for (const z of [-38.7, 38.7]) {
    const benchGeometry = addDisposable(geometries, new THREE.BoxGeometry(20, 0.75, 1.25));
    const bench = new THREE.Mesh(benchGeometry, blackMaterial);
    bench.position.set(0, 0.38, z);
    group.add(bench);
  }

  const adPanelGeometry = addDisposable(geometries, new THREE.PlaneGeometry(24, 1.35));
  for (const z of [-35.35, 35.35]) {
    for (const x of [-38, -12.7, 12.7, 38]) {
      const panel = new THREE.Mesh(adPanelGeometry, adBoardMaterial);
      panel.position.set(x, 0.92, z);
      panel.rotation.y = z > 0 ? Math.PI : 0;
      group.add(panel);
    }
  }
  const endPanelGeometry = addDisposable(geometries, new THREE.PlaneGeometry(20, 1.35));
  for (const x of [-54.2, 54.2]) {
    for (const z of [-22, 0, 22]) {
      const panel = new THREE.Mesh(endPanelGeometry, adBoardMaterial);
      panel.position.set(x, 0.92, z);
      panel.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2;
      group.add(panel);
    }
  }
  addBuilderEnvironment(group, geometries, materials, recipe, profile);
  addExteriorFacade(group, geometries, materials, recipe, profile);
  addServiceExteriorArchitecture(group, geometries, materials, textures, recipe, mode, disposers);

  const baseTiers: TierSpec[] = [
    { innerX: 58.0, innerZ: 40.6, outerX: 76.2, outerZ: 53.5, y0: 0.72, y1: 10.0, rows: 17, peoplePerRow: 420 },
    { innerX: 79.0, innerZ: 55.8, outerX: 95.5, outerZ: 67.5, y0: 11.5, y1: 21.6, rows: 16, peoplePerRow: 470 },
    { innerX: 98.0, innerZ: 69.5, outerX: 113.0, outerZ: 80.2, y0: 23.2, y1: 33.0, rows: 15, peoplePerRow: 520 },
  ];
  const tiers = baseTiers.map((tier) => ({
    ...tier,
    innerX: tier.innerX * profile.bowlRadiusScale,
    innerZ: tier.innerZ * profile.bowlRadiusScale,
    outerX: tier.outerX * profile.bowlRadiusScale,
    outerZ: tier.outerZ * profile.bowlRadiusScale,
    y0: tier.y0 * profile.tierRiseScale,
    y1: tier.y1 * profile.tierRiseScale,
  }));
  for (let i = 0; i < Math.min(recipe.tierCount, tiers.length); i += 1) {
    addTier(group, geometries, materials, tiers[i], recipe, seatMaterial, concreteMaterial);
  }
  addStadiumOpenings(group, geometries, materials);

  addEllipticRing(group, geometries, ledMaterial, 77.2, 54.3, 10.15, 0.18);
  if (recipe.tierCount >= 2) addEllipticRing(group, geometries, ledMaterial, 96.4, 68.0, 21.78, 0.18);
  addEllipticRing(group, geometries, steelMaterial, 114.0, 81.0, 33.3, 0.12);

  const fascia = new THREE.Mesh(
    ellipseWallGeometry(geometries, 77.0, 54.2, 9.75, 11.3, 192),
    blackMaterial,
  );
  group.add(fascia);
  const fascia2 = new THREE.Mesh(
    ellipseWallGeometry(geometries, 96.2, 67.9, 21.45, 23.0, 192),
    blackMaterial,
  );
  group.add(fascia2);

  const scoreboardGeometry = addDisposable(geometries, new THREE.BoxGeometry(31, 9.2, 1.0));
  const scoreboard = new THREE.Mesh(scoreboardGeometry, blackMaterial);
  scoreboard.position.set(0, 28.8, -78.4);
  group.add(scoreboard);
  const screenGeometry = addDisposable(geometries, new THREE.PlaneGeometry(27.0, 6.2));
  const screen = new THREE.Mesh(screenGeometry, scoreboardMaterial);
  screen.position.set(0, 28.8, -77.86);
  group.add(screen);

  addColumns(group, geometries, steelMaterial, recipe);
  addRoof(group, geometries, materials, recipe, profile, roofMaterial, steelMaterial);
  addLightGlows(group, textures, materials);
  addLighting(scene, mode === "FULL", profile);
  return group;
}

function countTriangles(root: THREE.Object3D): number {
  let triangles = 0;
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const geometry = object.geometry;
    const base = geometry.index ? geometry.index.count / 3 : geometry.getAttribute("position").count / 3;
    triangles += base * (object instanceof THREE.InstancedMesh ? object.count : 1);
  });
  return Math.round(triangles);
}

export function createStadiumWebglRenderer(
  canvas: HTMLCanvasElement,
  mode: Exclude<CoreVisualMode, "STATIC">,
  recipe: StadiumRecipe = BASE_STADIUM_RECIPE,
): StadiumWebglRenderer | null {
  if (typeof window.WebGLRenderingContext === "undefined") return null;
  const visualProfile = resolveStadiumVisualProfile(recipe);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    depth: true,
    powerPreference: mode === "FULL" ? "high-performance" : "default",
  });
  renderer.setClearColor(visualProfile.skyTop, visualProfile.clearAlpha);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const lightingProfile = recipe.lightingProfile ?? "BALANCED";
  renderer.toneMappingExposure = recipe.presentationProfile === "SERVICE_BUILDER"
    ? Math.max(1.36, visualProfile.exposure + 0.16)
    : visualProfile.exposure;
  renderer.shadowMap.enabled = mode === "FULL";
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const environmentProfile = recipe.environmentProfile ?? "CIVIC";
  const fogColor = environmentProfile === "PARK"
    ? 0x0d1a13
    : environmentProfile === "COASTAL"
      ? 0x0b1b25
      : environmentProfile === "NIGHT_EVENT"
        ? 0x050911
        : environmentProfile === "URBAN"
          ? 0x11161b
          : 0x0c141c;
  const fogNear = visualProfile.builderVisuals
    ? environmentProfile === "NIGHT_EVENT" ? 150 : 180
    : environmentProfile === "NIGHT_EVENT" ? 92 : environmentProfile === "COASTAL" ? 124 : 112;
  const fogFar = visualProfile.builderVisuals
    ? environmentProfile === "NIGHT_EVENT" ? 470 : 540
    : environmentProfile === "PARK" ? 245 : environmentProfile === "NIGHT_EVENT" ? 230 : 275;
  scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  if (visualProfile.builderVisuals) {
    scene.background = makeBuilderSkyTexture(textures, visualProfile, environmentProfile);
  }
  const environmentTexture = makeEnvironmentTexture(textures);
  scene.environment = environmentTexture;
  scene.environmentIntensity = recipe.presentationProfile === "SERVICE_BUILDER"
    ? 0.92
    : lightingProfile === "DAYLIGHT" ? 0.78 : environmentProfile === "NIGHT_EVENT" ? 0.58 : environmentProfile === "COASTAL" ? 0.82 : 0.72;
  const disposers: Array<() => void> = [];
  const stadium = buildStadium(scene, renderer, mode, recipe, visualProfile, geometries, materials, textures, disposers);
  const liveScoreboardTexture = stadium.userData.scoreboardTexture as THREE.Texture | undefined;

  const positionMarker = new THREE.Group();
  positionMarker.visible = false;
  stadium.add(positionMarker);

  const markerRingMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({
      color: recipe.accentColor,
      emissive: recipe.accentColor,
      emissiveIntensity: 3.2,
      roughness: 0.25,
      metalness: 0.18,
      transparent: true,
      opacity: 0.92,
    }),
  );
  const markerBeaconMaterial = addDisposable(
    materials,
    new THREE.MeshBasicMaterial({
      color: 0x8cddff,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  const markerBodyMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({
      color: 0xdcebf1,
      emissive: recipe.accentColor,
      emissiveIntensity: 0.52,
      roughness: 0.58,
      metalness: 0.08,
    }),
  );
  const markerRingGeometry = addDisposable(geometries, new THREE.TorusGeometry(1.7, 0.085, 8, 48));
  const markerRingOuterGeometry = addDisposable(geometries, new THREE.TorusGeometry(2.35, 0.045, 6, 48));
  const markerBeaconGeometry = addDisposable(geometries, new THREE.CylinderGeometry(0.34, 1.65, 5.4, 24, 1, true));
  const markerBodyGeometry = addDisposable(geometries, new THREE.CylinderGeometry(0.25, 0.20, 1.05, 8));
  const markerHeadGeometry = addDisposable(geometries, new THREE.SphereGeometry(0.20, 10, 7));

  const markerRing = new THREE.Mesh(markerRingGeometry, markerRingMaterial);
  markerRing.rotation.x = Math.PI / 2;
  markerRing.position.y = 0.10;
  positionMarker.add(markerRing);
  const markerRingOuter = new THREE.Mesh(markerRingOuterGeometry, markerRingMaterial);
  markerRingOuter.rotation.x = Math.PI / 2;
  markerRingOuter.position.y = 0.08;
  positionMarker.add(markerRingOuter);
  const markerBeacon = new THREE.Mesh(markerBeaconGeometry, markerBeaconMaterial);
  markerBeacon.position.y = 2.72;
  positionMarker.add(markerBeacon);
  const markerBody = new THREE.Mesh(markerBodyGeometry, markerBodyMaterial);
  markerBody.position.y = 0.78;
  positionMarker.add(markerBody);
  const markerHead = new THREE.Mesh(markerHeadGeometry, markerBodyMaterial);
  markerHead.position.y = 1.47;
  positionMarker.add(markerHead);

  const teamFormationRoot = new THREE.Group();
  teamFormationRoot.visible = false;
  stadium.add(teamFormationRoot);
  const teammateRingMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({
      color: 0x8ea8b6,
      emissive: 0x31586d,
      emissiveIntensity: 1.15,
      roughness: 0.52,
      metalness: 0.16,
      transparent: true,
      opacity: 0.82,
    }),
  );
  const teammateBodyMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({
      color: 0xaebbc2,
      emissive: 0x1a3948,
      emissiveIntensity: 0.38,
      roughness: 0.66,
      metalness: 0.05,
    }),
  );
  const teammateRingGeometry = addDisposable(geometries, new THREE.TorusGeometry(1.08, 0.055, 6, 36));
  const teammateBodyGeometry = addDisposable(geometries, new THREE.CylinderGeometry(0.20, 0.17, 0.88, 7));
  const teammateHeadGeometry = addDisposable(geometries, new THREE.SphereGeometry(0.16, 8, 6));
  let teamMarkerSignature = "";

  const makeTeamLabelTexture = (shirtNumber: string, position: string): THREE.Texture => {
    const labelCanvas = document.createElement("canvas");
    labelCanvas.width = 256;
    labelCanvas.height = 96;
    const ctx = labelCanvas.getContext("2d");
    if (!ctx) throw new Error("stadium team marker canvas unavailable");
    ctx.clearRect(0, 0, 256, 96);
    ctx.fillStyle = "rgba(4,12,16,.78)";
    ctx.beginPath();
    ctx.roundRect(14, 13, 228, 70, 20);
    ctx.fill();
    ctx.strokeStyle = "rgba(185,226,244,.35)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#e9f7fc";
    ctx.font = "700 30px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`#${shirtNumber} · ${position}`, 128, 57);
    const texture = addDisposable(textures, new THREE.CanvasTexture(labelCanvas));
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  const rebuildTeamMarkers = (markers: readonly StadiumTeamMarker[]) => {
    while (teamFormationRoot.children.length > 0) teamFormationRoot.remove(teamFormationRoot.children[0]);
    markers.forEach((marker, index) => {
      const root = new THREE.Group();
      root.position.set(marker.x, 0.03, marker.z);
      root.userData.revealIndex = index;

      const ring = new THREE.Mesh(teammateRingGeometry, teammateRingMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.075;
      root.add(ring);

      const body = new THREE.Mesh(teammateBodyGeometry, teammateBodyMaterial);
      body.position.y = 0.68;
      root.add(body);
      const head = new THREE.Mesh(teammateHeadGeometry, teammateBodyMaterial);
      head.position.y = 1.25;
      root.add(head);

      const labelTexture = makeTeamLabelTexture(marker.shirtNumber, marker.position);
      const labelMaterial = addDisposable(
        materials,
        new THREE.SpriteMaterial({ map: labelTexture, transparent: true, depthWrite: false }),
      );
      const label = new THREE.Sprite(labelMaterial as THREE.SpriteMaterial);
      label.position.y = 2.25;
      label.scale.set(4.8, 1.8, 1);
      root.add(label);
      root.scale.setScalar(0.001);
      teamFormationRoot.add(root);
    });
  };

  const projectionRoot = new THREE.Group();
  projectionRoot.visible = false;
  stadium.add(projectionRoot);
  const projectionRingMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({
      color: 0x75dcff,
      emissive: 0x27bfff,
      emissiveIntensity: 2.4,
      roughness: 0.30,
      metalness: 0.12,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    }),
  );
  const projectionBeamMaterial = addDisposable(
    materials,
    new THREE.MeshBasicMaterial({
      color: 0x8ee7ff,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    }),
  );
  const projectionDiscMaterial = addDisposable(
    materials,
    new THREE.MeshBasicMaterial({
      color: 0x159bd2,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    }),
  );
  for (const radius of [4.5, 8.0, 12.5]) {
    const ringGeometry = addDisposable(geometries, new THREE.TorusGeometry(radius, 0.065, 6, 72));
    const ring = new THREE.Mesh(ringGeometry, projectionRingMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.14 + radius * 0.006;
    projectionRoot.add(ring);
  }
  const projectionDiscGeometry = addDisposable(geometries, new THREE.CircleGeometry(10.8, 72));
  const projectionDisc = new THREE.Mesh(projectionDiscGeometry, projectionDiscMaterial);
  projectionDisc.rotation.x = -Math.PI / 2;
  projectionDisc.position.y = 0.10;
  projectionRoot.add(projectionDisc);
  const projectionBeamGeometry = addDisposable(geometries, new THREE.CylinderGeometry(0.06, 0.28, 8.5, 10, 1, true));
  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * TAU;
    const beam = new THREE.Mesh(projectionBeamGeometry, projectionBeamMaterial);
    beam.position.set(Math.cos(angle) * 8.2, 4.3, Math.sin(angle) * 8.2);
    projectionRoot.add(beam);
  }
  const projectionCoreGeometry = addDisposable(geometries, new THREE.CylinderGeometry(0.3, 2.4, 10.5, 28, 1, true));
  const projectionCore = new THREE.Mesh(projectionCoreGeometry, projectionBeamMaterial);
  projectionCore.position.y = 5.3;
  projectionRoot.add(projectionCore);
  projectionRoot.scale.setScalar(0.001);

  const camera = new THREE.PerspectiveCamera(54, 1, 0.18, visualProfile.builderVisuals ? 720 : 380);
  let cssWidth = 1;
  let cssHeight = 1;
  let pixelRatio = 1;

  // P1 night-scene bloom: FULL mode only, so FAST/LIGHT keep their budget.
  let composer: EffectComposer | null = null;
  if (mode === "FULL") {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.42, 0.5, 0.82));
  }

  // The bloom composer outputs an opaque frame, so the storm sky must live in
  // the scene itself instead of the CSS layer behind a transparent canvas.
  let serviceSkyTexture: THREE.Texture | null = null;
  const coverFitServiceSky = () => {
    const image = serviceSkyTexture?.image as { width?: number; height?: number } | undefined;
    if (!serviceSkyTexture || !image?.width || !image.height) return;
    // Cover-fit the landscape sky photo so portrait viewports crop instead of
    // stretching the clouds into vertical smears.
    const imageAspect = image.width / image.height;
    const viewAspect = cssWidth / Math.max(1, cssHeight);
    if (viewAspect < imageAspect) {
      serviceSkyTexture.repeat.set(viewAspect / imageAspect, 1);
      serviceSkyTexture.offset.set((1 - viewAspect / imageAspect) / 2, 0);
    } else {
      serviceSkyTexture.repeat.set(1, imageAspect / viewAspect);
      serviceSkyTexture.offset.set(0, (1 - imageAspect / viewAspect) / 2);
    }
  };
  if (recipe.presentationProfile === "SERVICE_HOME") {
    new THREE.TextureLoader().load(stadiumServiceSkyUrl, (skyTexture) => {
      skyTexture.colorSpace = THREE.SRGBColorSpace;
      textures.add(skyTexture);
      serviceSkyTexture = skyTexture;
      coverFitServiceSky();
      scene.background = skyTexture;

      // P1 IBL: PMREM the storm sky so every PBR material picks up believable
      // blue-hour ambient and reflections instead of a flat gradient env.
      const environmentSource = skyTexture.clone();
      environmentSource.mapping = THREE.EquirectangularReflectionMapping;
      const pmrem = new THREE.PMREMGenerator(renderer);
      const environmentTarget = pmrem.fromEquirectangular(environmentSource);
      textures.add(environmentTarget.texture);
      scene.environment = environmentTarget.texture;
      scene.environmentIntensity = 0.55;
      environmentSource.dispose();
      pmrem.dispose();
      present();
    });
  }
  const present = () => {
    if (composer) {
      composer.render();
    } else {
      present();
    }
  };

  // Aerial bowl wash: faded in with the camera rise so the pitch and stands
  // read clearly from above without changing the approach lighting.
  // Kept below the roof line so the roof deck never catches a flare from it.
  const aerialWash = new THREE.PointLight(0xd8ead9, 0, 260, 1.4);
  aerialWash.position.set(0, 30, 0);
  scene.add(aerialWash);

  const resize = (width: number, height: number, dpr: number) => {
    cssWidth = Math.max(1, width);
    cssHeight = Math.max(1, height);
    pixelRatio = Math.min(Math.max(dpr, 1), 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(cssWidth, cssHeight, false);
    composer?.setPixelRatio(pixelRatio);
    composer?.setSize(cssWidth, cssHeight);
    coverFitServiceSky();
    camera.aspect = cssWidth / cssHeight;
    camera.updateProjectionMatrix();
  };

  const render = (orbit: number, zoom0: number, rise0 = 0) => {
  const portrait = cssWidth / cssHeight < 0.82;
  camera.aspect = cssWidth / cssHeight;

  if (recipe.presentationProfile === "SERVICE_HOME") {
    const pose = resolveServiceCamera(portrait ? "MOBILE" : "DESKTOP", orbit, zoom0, rise0);
    camera.fov = pose.fov;
    camera.zoom = 1;
    camera.position.set(...pose.position);
    camera.lookAt(new THREE.Vector3(...pose.target));
    camera.updateProjectionMatrix();
    stadium.rotation.y = 0;
    aerialWash.intensity = THREE.MathUtils.clamp(rise0, 0, 1) * 2400;
    present();
    return;
  }

  if (recipe.presentationProfile === "SERVICE_BUILDER") {
    const zoom = Math.min(1.65, Math.max(0.92, zoom0));
    const angle = (28 + orbit * 0.22) * Math.PI / 180;
    const radius = 270 / zoom;
    const height = 108 / zoom;
    camera.fov = 41;
    camera.zoom = 1;
    camera.position.set(Math.sin(angle) * radius, height, Math.cos(angle) * radius);
    camera.lookAt(new THREE.Vector3(0, 18, 2));
    camera.updateProjectionMatrix();
    stadium.rotation.y = 0;
    present();
    return;
  }

  if (visualProfile.builderVisuals) {
    const zoom = Math.min(1.8, Math.max(0.92, zoom0));
    const angle = (34 + orbit * 0.24) * Math.PI / 180;
    const radius = (portrait ? 370 : 330) / zoom;
    const height = (portrait ? 155 : 125) / zoom;
    camera.fov = portrait ? 48 : 44;
    camera.zoom = 1;
    camera.position.set(Math.sin(angle) * radius, height, Math.cos(angle) * radius);
    camera.lookAt(new THREE.Vector3(0, 18, 0));
    camera.updateProjectionMatrix();
    stadium.rotation.y = 0;
    present();
    return;
  }

  if (portrait) {
    // Mobile acceptance camera: inside the pitch, just ahead of the goal line,
    // looking lengthwise through the stadium. This avoids seating/column intrusion
    // and uses a wide optical field instead of a 2D canvas crop.
    const angle = (68 + orbit * 0.04) * Math.PI / 180;
    const radius = 72;
    camera.fov = 66;
    camera.zoom = 0.88;
    camera.position.set(Math.sin(angle) * radius, 39.0, Math.cos(angle) * radius);
    camera.lookAt(new THREE.Vector3(-2, 11.0, -8));
    camera.updateProjectionMatrix();
    stadium.rotation.y = 0;
    present();
    return;
  }

  const zoom = Math.min(1.10, Math.max(0.86, zoom0));
  const angle = (18 + orbit * 0.18) * Math.PI / 180;
  const radius = 38 / zoom;
  const height = 25 / zoom;
  camera.fov = 58;
  camera.zoom = 1;
  camera.position.set(Math.sin(angle) * radius, height, Math.cos(angle) * radius);
  camera.lookAt(new THREE.Vector3(0, 13.4, -5.4));
  camera.updateProjectionMatrix();
  stadium.rotation.y = -0.015;
  present();
};

  const renderApproach = (progress0: number) => {
    const progress = THREE.MathUtils.clamp(progress0, 0, 1);
    const eased = progress * progress * (3 - 2 * progress);
    const portrait = cssWidth / cssHeight < 0.82;
    camera.aspect = cssWidth / cssHeight;
    camera.zoom = 1;

    const outside = portrait
      ? new THREE.Vector3(78, 76, 178)
      : new THREE.Vector3(136, 67, 158);
    const rim = portrait
      ? new THREE.Vector3(58, 49, 101)
      : new THREE.Vector3(76, 47, 96);
    const inside = portrait
      ? new THREE.Vector3(49, 32, 59)
      : new THREE.Vector3(43, 27, 49);

    const outsideTarget = new THREE.Vector3(0, 18, -4);
    const rimTarget = new THREE.Vector3(0, 15, -8);
    const insideTarget = new THREE.Vector3(-2, 9, -18);
    const cameraPosition = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();

    if (eased < 0.46) {
      const t = eased / 0.46;
      const local = t * t * (3 - 2 * t);
      cameraPosition.lerpVectors(outside, rim, local);
      lookTarget.lerpVectors(outsideTarget, rimTarget, local);
    } else {
      const t = (eased - 0.46) / 0.54;
      const local = t * t * (3 - 2 * t);
      cameraPosition.lerpVectors(rim, inside, local);
      lookTarget.lerpVectors(rimTarget, insideTarget, local);
    }

    camera.fov = portrait
      ? THREE.MathUtils.lerp(53, 63, eased)
      : THREE.MathUtils.lerp(46, 58, eased);
    camera.position.copy(cameraPosition);
    camera.lookAt(lookTarget);
    camera.updateProjectionMatrix();
    stadium.rotation.y = THREE.MathUtils.lerp(-0.055, -0.015, eased);
    present();
  };

  const renderPitchEntry = (progress0: number) => {
    const progress = THREE.MathUtils.clamp(progress0, 0, 1);
    const eased = progress * progress * (3 - 2 * progress);
    const portrait = cssWidth / cssHeight < 0.82;
    camera.aspect = cssWidth / cssHeight;
    camera.zoom = 1;

    const bowl = portrait
      ? new THREE.Vector3(49, 32, 59)
      : new THREE.Vector3(43, 27, 49);
    const touchline = portrait
      ? new THREE.Vector3(19, 10.5, 39)
      : new THREE.Vector3(22, 9.5, 36);
    const pitch = portrait
      ? new THREE.Vector3(1.8, 2.45, 30.5)
      : new THREE.Vector3(5.8, 2.25, 29.5);

    const bowlTarget = new THREE.Vector3(-2, 9, -18);
    const touchlineTarget = new THREE.Vector3(0, 3.4, -5);
    const pitchTarget = new THREE.Vector3(0, 1.1, -16);
    const cameraPosition = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();

    if (eased < 0.52) {
      const t = eased / 0.52;
      const local = t * t * (3 - 2 * t);
      cameraPosition.lerpVectors(bowl, touchline, local);
      lookTarget.lerpVectors(bowlTarget, touchlineTarget, local);
    } else {
      const t = (eased - 0.52) / 0.48;
      const local = t * t * (3 - 2 * t);
      cameraPosition.lerpVectors(touchline, pitch, local);
      lookTarget.lerpVectors(touchlineTarget, pitchTarget, local);
    }

    camera.fov = portrait
      ? THREE.MathUtils.lerp(63, 69, eased)
      : THREE.MathUtils.lerp(58, 66, eased);
    camera.position.copy(cameraPosition);
    camera.lookAt(lookTarget);
    camera.updateProjectionMatrix();
    stadium.rotation.y = -0.015;
    present();
  };

  const renderPlayerPosition = (progress0: number, x0: number, z0: number) => {
    const progress = THREE.MathUtils.clamp(progress0, 0, 1);
    const eased = progress * progress * (3 - 2 * progress);
    const portrait = cssWidth / cssHeight < 0.82;
    const x = THREE.MathUtils.clamp(x0, -47, 47);
    const z = THREE.MathUtils.clamp(z0, -29, 29);
    camera.aspect = cssWidth / cssHeight;
    camera.zoom = 1;

    const start = portrait
      ? new THREE.Vector3(1.8, 2.45, 30.5)
      : new THREE.Vector3(5.8, 2.25, 29.5);
    const end = portrait
      ? new THREE.Vector3(x + 10.5, 9.2, z + 20.5)
      : new THREE.Vector3(x + 15.5, 7.4, z + 21.0);
    const startTarget = new THREE.Vector3(0, 1.1, -16);
    const endTarget = new THREE.Vector3(x, 1.1, z);
    const local = eased * eased * (3 - 2 * eased);

    camera.position.lerpVectors(start, end, local);
    const lookTarget = new THREE.Vector3().lerpVectors(startTarget, endTarget, local);
    camera.lookAt(lookTarget);
    camera.fov = portrait
      ? THREE.MathUtils.lerp(69, 62, local)
      : THREE.MathUtils.lerp(66, 58, local);
    camera.updateProjectionMatrix();

    positionMarker.position.set(x, 0.03, z);
    positionMarker.visible = progress > 0.22;
    const reveal = THREE.MathUtils.smoothstep(progress, 0.22, 0.72);
    const pulse = 1 + Math.sin(progress * Math.PI * 4) * 0.035 * reveal;
    positionMarker.scale.setScalar(Math.max(0.001, reveal * pulse));
    markerRing.rotation.z = progress * 1.2;
    markerRingOuter.rotation.z = -progress * 0.75;
    stadium.rotation.y = -0.015;
    present();
  };

  const renderTeamFormation = (progress0: number, ownX0: number, ownZ0: number, teammates: readonly StadiumTeamMarker[]) => {
    const progress = THREE.MathUtils.clamp(progress0, 0, 1);
    const eased = progress * progress * (3 - 2 * progress);
    const portrait = cssWidth / cssHeight < 0.82;
    const ownX = THREE.MathUtils.clamp(ownX0, -47, 47);
    const ownZ = THREE.MathUtils.clamp(ownZ0, -29, 29);
    const safeMarkers = teammates.map((marker) => ({
      ...marker,
      x: THREE.MathUtils.clamp(marker.x, -47, 47),
      z: THREE.MathUtils.clamp(marker.z, -29, 29),
    }));
    const signature = safeMarkers.map((marker) => `${marker.shirtNumber}:${marker.position}:${marker.x.toFixed(2)}:${marker.z.toFixed(2)}`).join("|");
    if (signature !== teamMarkerSignature) {
      teamMarkerSignature = signature;
      rebuildTeamMarkers(safeMarkers);
    }

    let centerX = ownX;
    let centerZ = ownZ;
    if (safeMarkers.length > 0) {
      centerX = (ownX + safeMarkers.reduce((sum, marker) => sum + marker.x, 0)) / (safeMarkers.length + 1);
      centerZ = (ownZ + safeMarkers.reduce((sum, marker) => sum + marker.z, 0)) / (safeMarkers.length + 1);
    }

    camera.aspect = cssWidth / cssHeight;
    camera.zoom = 1;
    const start = portrait
      ? new THREE.Vector3(ownX + 10.5, 9.2, ownZ + 20.5)
      : new THREE.Vector3(ownX + 15.5, 7.4, ownZ + 21.0);
    const overview = portrait
      ? new THREE.Vector3(centerX + 37, 45, centerZ + 63)
      : new THREE.Vector3(centerX + 52, 39, centerZ + 54);
    const startTarget = new THREE.Vector3(ownX, 1.1, ownZ);
    const overviewTarget = new THREE.Vector3(centerX, 0.8, centerZ);
    camera.position.lerpVectors(start, overview, eased);
    const lookTarget = new THREE.Vector3().lerpVectors(startTarget, overviewTarget, eased);
    camera.lookAt(lookTarget);
    camera.fov = portrait
      ? THREE.MathUtils.lerp(62, 57, eased)
      : THREE.MathUtils.lerp(58, 52, eased);
    camera.updateProjectionMatrix();

    positionMarker.position.set(ownX, 0.03, ownZ);
    positionMarker.visible = true;
    const ownReveal = THREE.MathUtils.smoothstep(progress, 0.02, 0.26);
    positionMarker.scale.setScalar(Math.max(0.001, ownReveal));
    markerRing.rotation.z = progress * 1.0;
    markerRingOuter.rotation.z = -progress * 0.65;

    teamFormationRoot.visible = progress > 0.20 && safeMarkers.length > 0;
    const revealWindow = 0.60;
    const revealStart = 0.24;
    const perMarker = safeMarkers.length > 0 ? revealWindow / safeMarkers.length : revealWindow;
    teamFormationRoot.children.forEach((child, index) => {
      const startAt = revealStart + index * perMarker;
      const endAt = Math.min(0.96, startAt + Math.max(0.12, perMarker * 1.4));
      const reveal = THREE.MathUtils.smoothstep(progress, startAt, endAt);
      child.scale.setScalar(Math.max(0.001, reveal));
      child.rotation.y = (1 - reveal) * 0.18;
    });

    stadium.rotation.y = -0.015;
    present();
  };

  const renderDigitalProjection = (progress0: number) => {
    const progress = THREE.MathUtils.clamp(progress0, 0, 1);
    const eased = progress * progress * (3 - 2 * progress);
    const portrait = cssWidth / cssHeight < 0.82;
    camera.aspect = cssWidth / cssHeight;
    camera.zoom = 1;

    positionMarker.visible = false;
    teamFormationRoot.visible = false;
    projectionRoot.visible = progress > 0.02;
    const reveal = THREE.MathUtils.smoothstep(progress, 0.04, 0.72);
    projectionRoot.scale.setScalar(Math.max(0.001, THREE.MathUtils.lerp(0.34, 1.0, reveal)));
    projectionRoot.rotation.y = (1 - eased) * -0.16;
    projectionRingMaterial.opacity = 0.10 + reveal * 0.72;
    projectionBeamMaterial.opacity = 0.04 + reveal * 0.32;
    projectionDiscMaterial.opacity = 0.015 + reveal * 0.11;
    (projectionRingMaterial as THREE.MeshStandardMaterial).emissiveIntensity = 1.4 + reveal * 2.2;
    projectionRoot.children.forEach((child, index) => {
      if (index < 3) child.rotation.z = progress * (0.16 + index * 0.08) * (index % 2 == 0 ? 1 : -1);
    });

    const start = portrait
      ? new THREE.Vector3(1.8, 2.45, 30.5)
      : new THREE.Vector3(5.8, 2.25, 29.5);
    const focus = portrait
      ? new THREE.Vector3(24, 16.5, 33)
      : new THREE.Vector3(31, 14.5, 30);
    const startTarget = new THREE.Vector3(0, 1.1, -16);
    const focusTarget = new THREE.Vector3(0, 3.0, 0);
    camera.position.lerpVectors(start, focus, eased);
    const lookTarget = new THREE.Vector3().lerpVectors(startTarget, focusTarget, eased);
    camera.lookAt(lookTarget);
    camera.fov = portrait
      ? THREE.MathUtils.lerp(69, 61, eased)
      : THREE.MathUtils.lerp(66, 57, eased);
    camera.updateProjectionMatrix();
    stadium.rotation.y = -0.015;
    present();
  };

  const updateScoreboard = (state: StadiumScoreboardState) => {
    if (!liveScoreboardTexture) return;
    paintLiveScoreboardTexture(liveScoreboardTexture, state);
  };

  const triangleCount = countTriangles(stadium);

  const destroy = () => {
    disposers.forEach((dispose) => dispose());
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
    composer?.dispose();
    renderer.dispose();
    if (!visualProfile.builderVisuals) renderer.forceContextLoss();
  };

  return { triangleCount, resize, render, renderApproach, renderPitchEntry, renderPlayerPosition, renderTeamFormation, renderDigitalProjection, updateScoreboard, destroy };
}
