import * as THREE from "three";
import type { CoreVisualMode } from "../api/coreProductContracts";

export interface StadiumWebglRenderer {
  readonly triangleCount: number;
  resize(width: number, height: number, dpr: number): void;
  render(orbit: number, zoom: number): void;
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

function makePitchTexture(textures: Set<THREE.Texture>): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1050;
  canvas.height = 680;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("stadium pitch canvas unavailable");

  const stripe = canvas.width / 20;
  for (let i = 0; i < 20; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? "#17642f" : "#1b7337";
    ctx.fillRect(i * stripe, 0, stripe + 1, canvas.height);
  }

  const vignette = ctx.createRadialGradient(525, 340, 40, 525, 340, 660);
  vignette.addColorStop(0, "rgba(255,255,225,0.07)");
  vignette.addColorStop(0.56, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,20,6,0.18)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 0.075;
  for (let i = 0; i < 5200; i += 1) {
    const x = (i * 131) % canvas.width;
    const y = (i * 71 + (i % 17) * 19) % canvas.height;
    ctx.fillStyle = i % 3 === 0 ? "#b7d39c" : "#071b0c";
    ctx.fillRect(x, y, 1, 1);
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
  ring.scale.z = radiusZ / radiusX;
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
  if (value > 0.93) return accent.clone().multiplyScalar(0.82 + hash(seed, 7) * 0.24);
  if (value > 0.88) return new THREE.Color(0x763829);
  if (value > 0.83) return new THREE.Color(0x5c594e);
  if (value > 0.62) return new THREE.Color(0x85827b);
  if (value > 0.34) return new THREE.Color(0x4f5358);
  return new THREE.Color(0x24282d);
}

function crowdSkin(seed: number): THREE.Color {
  const value = hash(seed, 8);
  if (value > 0.72) return new THREE.Color(0xc99570);
  if (value > 0.40) return new THREE.Color(0xa76f4e);
  return new THREE.Color(0x7c503a);
}

function crowdPlacements(spec: TierSpec, recipe: StadiumRecipe): CrowdPlacement[] {
  const result: CrowdPlacement[] = [];
  const rowDepthX = (spec.outerX - spec.innerX) / spec.rows;
  const rowDepthZ = (spec.outerZ - spec.innerZ) / spec.rows;
  const rise = (spec.y1 - spec.y0) / spec.rows;
  const accent = new THREE.Color(recipe.accentColor);
  for (let row = 0; row < spec.rows; row += 1) {
    const rx = spec.innerX + rowDepthX * (row + 0.55);
    const rz = spec.innerZ + rowDepthZ * (row + 0.55);
    const y = spec.y0 + rise * row + 0.43;
    for (let slot = 0; slot < spec.peoplePerRow; slot += 1) {
      const seed = row * 10000 + slot;
      if (hash(seed, 1) > recipe.crowdDensity) continue;
      const angle = ((slot + 0.5) / spec.peoplePerRow) * TAU + (hash(seed, 2) - 0.5) * 0.006;
      const scale = 0.83 + hash(seed, 3) * 0.40;
      result.push({
        x: Math.cos(angle) * rx,
        y,
        z: Math.sin(angle) * rz,
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
  const bodyGeometry = addDisposable(geometries, new THREE.BoxGeometry(0.42, 0.62, 0.27));
  const headGeometry = addDisposable(geometries, new THREE.IcosahedronGeometry(0.16, 1));
  const bodyMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.88, metalness: 0.0 }),
  );
  const headMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0.0 }),
  );
  const bodies = new THREE.InstancedMesh(bodyGeometry, bodyMaterial, placements.length);
  const heads = new THREE.InstancedMesh(headGeometry, headMaterial, placements.length);
  const dummy = new THREE.Object3D();

  placements.forEach((placement, index) => {
    dummy.position.set(placement.x, placement.y, placement.z);
    dummy.rotation.set(0, -placement.angle + Math.PI / 2, 0);
    dummy.scale.set(placement.scale, placement.scale, placement.scale);
    dummy.updateMatrix();
    bodies.setMatrixAt(index, dummy.matrix);
    bodies.setColorAt(index, placement.shirt);

    dummy.position.set(placement.x, placement.y + 0.45 * placement.scale, placement.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(placement.scale);
    dummy.updateMatrix();
    heads.setMatrixAt(index, dummy.matrix);
    heads.setColorAt(index, placement.skin);
  });
  bodies.instanceMatrix.needsUpdate = true;
  heads.instanceMatrix.needsUpdate = true;
  if (bodies.instanceColor) bodies.instanceColor.needsUpdate = true;
  if (heads.instanceColor) heads.instanceColor.needsUpdate = true;
  group.add(bodies, heads);
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
  const surface = new THREE.Mesh(
    ellipseSurfaceGeometry(
      geometries,
      spec.innerX,
      spec.innerZ,
      spec.outerX,
      spec.outerZ,
      spec.y0,
      spec.y1,
      192,
    ),
    seatMaterial,
  );
  surface.receiveShadow = true;
  group.add(surface);

  const riser = new THREE.Mesh(
    ellipseWallGeometry(geometries, spec.innerX, spec.innerZ, spec.y0 - 1.1, spec.y0 + 0.05, 192),
    concreteMaterial,
  );
  group.add(riser);

  const aisles = new THREE.Mesh(aisleGeometry(geometries, spec, spec.rows > 15 ? 22 : 20), concreteMaterial);
  aisles.position.y = 0.03;
  group.add(aisles);
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
  roofMaterial: THREE.Material,
  steelMaterial: THREE.Material,
): void {
  const outerX = 120;
  const outerZ = 87;
  const innerX = 96.5 + (1 - recipe.roofCoverage) * 10;
  const innerZ = 68.5 + (1 - recipe.roofCoverage) * 7;
  const roof = new THREE.Mesh(
    ellipseSurfaceGeometry(geometries, innerX, innerZ, outerX, outerZ, 37.9, 43.0, 192),
    roofMaterial,
  );
  roof.castShadow = true;
  roof.receiveShadow = true;
  group.add(roof);

  for (let i = 0; i < 40; i += 1) {
    const angle = (i / 40) * TAU;
    const start = new THREE.Vector3(Math.cos(angle) * 116, 41.9, Math.sin(angle) * 84.0);
    const end = new THREE.Vector3(Math.cos(angle) * innerX, 37.7, Math.sin(angle) * innerZ);
    beamBetween(group, geometries, steelMaterial, start, end, 0.18, 6);
  }

  const floodMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({
      color: 0xfff4cf,
      emissive: 0xffe0a0,
      emissiveIntensity: 3.2,
      roughness: 0.24,
      metalness: 0.1,
    }),
  );
  const floodGeometry = addDisposable(geometries, new THREE.BoxGeometry(1.2, 0.25, 0.42));
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

function addLighting(scene: THREE.Scene, highQuality: boolean): void {
  scene.add(new THREE.HemisphereLight(0xcadfff, 0x122016, 1.35));
  scene.add(new THREE.AmbientLight(0xffffff, 0.34));

  const key = new THREE.DirectionalLight(0xeaf3ff, 2.1);
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

  const fill = new THREE.DirectionalLight(0xffe1ad, 0.75);
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
    const light = new THREE.SpotLight(0xfff2d4, highQuality ? 520 : 360, 230, 0.62, 0.62, 1.45);
    light.position.set(x, 42, z);
    light.target = target;
    scene.add(light);
  }
}

function buildStadium(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  mode: Exclude<CoreVisualMode, "STATIC">,
  recipe: StadiumRecipe,
  geometries: Set<THREE.BufferGeometry>,
  materials: Set<THREE.Material>,
  textures: Set<THREE.Texture>,
): THREE.Group {
  const group = new THREE.Group();
  scene.add(group);

  const grassTexture = makePitchTexture(textures);
  grassTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const pitchMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ map: grassTexture, roughness: 0.94, metalness: 0.0 }),
  );
  const concreteMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ color: 0x7b8187, roughness: 0.90, metalness: 0.03 }),
  );
  const darkConcreteMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ color: 0x222831, roughness: 0.91, metalness: 0.04 }),
  );
  const seatMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ color: recipe.seatColor, roughness: 0.76, metalness: 0.04, side: THREE.DoubleSide }),
  );
  const roofMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ color: 0x343f4b, roughness: 0.34, metalness: 0.74, side: THREE.DoubleSide }),
  );
  const steelMaterial = addDisposable(
    materials,
    new THREE.MeshStandardMaterial({ color: 0x7d8995, roughness: 0.30, metalness: 0.84 }),
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

  const tiers: TierSpec[] = [
    { innerX: 58.0, innerZ: 40.6, outerX: 76.2, outerZ: 53.5, y0: 0.72, y1: 10.0, rows: 17, peoplePerRow: 300 },
    { innerX: 79.0, innerZ: 55.8, outerX: 95.5, outerZ: 67.5, y0: 11.5, y1: 21.6, rows: 16, peoplePerRow: 340 },
    { innerX: 98.0, innerZ: 69.5, outerX: 113.0, outerZ: 80.2, y0: 23.2, y1: 33.0, rows: 15, peoplePerRow: 370 },
  ];
  for (let i = 0; i < Math.min(recipe.tierCount, tiers.length); i += 1) {
    addTier(group, geometries, materials, tiers[i], recipe, seatMaterial, concreteMaterial);
  }

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

  const scoreboardGeometry = addDisposable(geometries, new THREE.BoxGeometry(25, 7.2, 1.0));
  const scoreboard = new THREE.Mesh(scoreboardGeometry, blackMaterial);
  scoreboard.position.set(0, 28.8, -78.4);
  group.add(scoreboard);
  const screenGeometry = addDisposable(geometries, new THREE.PlaneGeometry(21.8, 4.7));
  const screen = new THREE.Mesh(screenGeometry, ledMaterial);
  screen.position.set(0, 28.8, -77.86);
  group.add(screen);

  addColumns(group, geometries, steelMaterial, recipe);
  addRoof(group, geometries, materials, recipe, roofMaterial, steelMaterial);
  addLighting(scene, mode === "FULL");
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

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    depth: true,
    powerPreference: mode === "FULL" ? "high-performance" : "default",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = mode === "FULL";
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b121a, 155, 340);
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const stadium = buildStadium(scene, renderer, mode, recipe, geometries, materials, textures);

  const camera = new THREE.PerspectiveCamera(54, 1, 0.18, 380);
  let cssWidth = 1;
  let cssHeight = 1;
  let pixelRatio = 1;

  const resize = (width: number, height: number, dpr: number) => {
    cssWidth = Math.max(1, width);
    cssHeight = Math.max(1, height);
    pixelRatio = Math.min(Math.max(dpr, 1), 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(cssWidth, cssHeight, false);
    camera.aspect = cssWidth / cssHeight;
    camera.updateProjectionMatrix();
  };

  const render = (orbit: number, zoom0: number) => {
    const portrait = cssWidth / cssHeight < 0.82;
    const zoom = Math.min(1.16, Math.max(0.90, zoom0));
    const angle = ((portrait ? 74 : 18) + orbit * (portrait ? 0.14 : 0.20)) * Math.PI / 180;
    const radius = (portrait ? 78 : 56) / zoom;
    const height = (portrait ? 24 : 19) / zoom;
    camera.fov = portrait ? 57 : 53;
    camera.aspect = cssWidth / cssHeight;
    camera.position.set(Math.sin(angle) * radius, height, Math.cos(angle) * radius);
    const target = portrait ? new THREE.Vector3(-4, 9.0, 0) : new THREE.Vector3(0, 6.5, -7.0);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    stadium.rotation.y = portrait ? 0 : -0.015;
    renderer.render(scene, camera);
  };

  const triangleCount = countTriangles(stadium);

  const destroy = () => {
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
  };

  return { triangleCount, resize, render, destroy };
}
