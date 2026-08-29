import type { CoreVisualMode } from "../api/coreProductContracts";

type Vec3 = readonly [number, number, number];
type Color = readonly [number, number, number];
type Mesh = { positions: number[]; normals: number[]; colors: number[]; indices: number[] };

export interface StadiumWebglRenderer {
  readonly triangleCount: number;
  resize(width: number, height: number, dpr: number): void;
  render(orbit: number, zoom: number): void;
  destroy(): void;
}

const C = {
  grassA: [0.028, 0.24, 0.055] as Color,
  grassB: [0.018, 0.17, 0.038] as Color,
  grassEdge: [0.008, 0.035, 0.014] as Color,
  line: [0.96, 0.97, 0.98] as Color,
  seatNavy: [0.012, 0.028, 0.055] as Color,
  seatBlue: [0.012, 0.080, 0.19] as Color,
  seatSteel: [0.055, 0.070, 0.085] as Color,
  crowdDark: [0.18, 0.19, 0.20] as Color,
  crowdLight: [0.50, 0.53, 0.56] as Color,
  crowdBlue: [0.03, 0.18, 0.52] as Color,
  concrete: [0.12, 0.13, 0.145] as Color,
  steel: [0.30, 0.32, 0.35] as Color,
  roof: [0.070, 0.080, 0.092] as Color,
  roofDark: [0.020, 0.024, 0.030] as Color,
  led: [0.015, 0.38, 1.12] as Color,
  screen: [0.008, 0.018, 0.040] as Color,
  screenBlue: [0.02, 0.22, 0.75] as Color,
  flood: [1.7, 1.55, 1.10] as Color,
  black: [0.005, 0.007, 0.010] as Color,
};

const createMesh = (): Mesh => ({ positions: [], normals: [], colors: [], indices: [] });
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const normalize = (v: Vec3): Vec3 => {
  const length = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
};

function quad(mesh: Mesh, a: Vec3, b: Vec3, c: Vec3, d: Vec3, color: Color): void {
  const normal = normalize(cross(sub(b, a), sub(c, a)));
  const start = mesh.positions.length / 3;
  for (const p of [a, b, c, d]) {
    mesh.positions.push(...p);
    mesh.normals.push(...normal);
    mesh.colors.push(...color);
  }
  mesh.indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
}

function box(mesh: Mesh, center: Vec3, size: Vec3, color: Color): void {
  const [x, y, z] = center;
  const [sx, sy, sz] = size;
  const x0 = x - sx / 2;
  const x1 = x + sx / 2;
  const y0 = y - sy / 2;
  const y1 = y + sy / 2;
  const z0 = z - sz / 2;
  const z1 = z + sz / 2;
  quad(mesh, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], color);
  quad(mesh, [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], color);
  quad(mesh, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], color);
  quad(mesh, [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], color);
  quad(mesh, [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], color);
  quad(mesh, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], color);
}

function plane(mesh: Mesh, x0: number, x1: number, z0: number, z1: number, y: number, color: Color): void {
  quad(mesh, [x0, y, z0], [x0, y, z1], [x1, y, z1], [x1, y, z0], color);
}

function annulus(
  mesh: Mesh,
  innerX: number,
  innerZ: number,
  outerX: number,
  outerZ: number,
  y0: number,
  y1: number,
  segments: number,
  color: Color,
  frontCut = 0.84,
): void {
  for (let i = 0; i < segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    const b = ((i + 1) / segments) * Math.PI * 2;
    const mid = (a + b) / 2;
    if (Math.sin(mid) > frontCut) continue;
    quad(
      mesh,
      [Math.cos(a) * innerX, y0, Math.sin(a) * innerZ],
      [Math.cos(b) * innerX, y0, Math.sin(b) * innerZ],
      [Math.cos(b) * outerX, y1, Math.sin(b) * outerZ],
      [Math.cos(a) * outerX, y1, Math.sin(a) * outerZ],
      color,
    );
  }
}

function ringWall(
  mesh: Mesh,
  radiusX: number,
  radiusZ: number,
  y0: number,
  y1: number,
  segments: number,
  color: Color,
  frontCut = 0.84,
): void {
  for (let i = 0; i < segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    const b = ((i + 1) / segments) * Math.PI * 2;
    const mid = (a + b) / 2;
    if (Math.sin(mid) > frontCut) continue;
    quad(
      mesh,
      [Math.cos(a) * radiusX, y0, Math.sin(a) * radiusZ],
      [Math.cos(a) * radiusX, y1, Math.sin(a) * radiusZ],
      [Math.cos(b) * radiusX, y1, Math.sin(b) * radiusZ],
      [Math.cos(b) * radiusX, y0, Math.sin(b) * radiusZ],
      color,
    );
  }
}

function circleLine(mesh: Mesh, radius: number, width: number, y: number, segments: number, color: Color): void {
  for (let i = 0; i < segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    const b = ((i + 1) / segments) * Math.PI * 2;
    const r0 = radius - width / 2;
    const r1 = radius + width / 2;
    quad(
      mesh,
      [Math.cos(a) * r0, y, Math.sin(a) * r0],
      [Math.cos(b) * r0, y, Math.sin(b) * r0],
      [Math.cos(b) * r1, y, Math.sin(b) * r1],
      [Math.cos(a) * r1, y, Math.sin(a) * r1],
      color,
    );
  }
}

function buildPitch(mesh: Mesh): void {
  plane(mesh, -60, 60, -41, 41, -0.20, C.grassEdge);
  const stripeWidth = 105 / 18;
  for (let i = 0; i < 18; i += 1) {
    const x = -52.5 + i * stripeWidth;
    plane(mesh, x, x + stripeWidth + 0.015, -34, 34, 0.02, i % 2 ? C.grassA : C.grassB);
  }
  const h = 0.06;
  const lineBoxes: readonly [Vec3, Vec3][] = [
    [[0, 0.11, -34], [105, h, 0.18]],
    [[0, 0.11, 34], [105, h, 0.18]],
    [[-52.5, 0.11, 0], [0.18, h, 68]],
    [[52.5, 0.11, 0], [0.18, h, 68]],
    [[0, 0.11, 0], [0.18, h, 68]],
  ];
  for (const [position, size] of lineBoxes) box(mesh, position, size, C.line);
  circleLine(mesh, 9.15, 0.18, 0.13, 84, C.line);
  circleLine(mesh, 0.28, 0.28, 0.14, 24, C.line);

  for (const side of [-1, 1] as const) {
    const gx = side * 52.5;
    const px = gx - side * 16.5;
    const six = gx - side * 5.5;
    box(mesh, [px, 0.11, 0], [0.18, h, 40.32], C.line);
    box(mesh, [(gx + px) / 2, 0.11, -20.16], [16.5, h, 0.18], C.line);
    box(mesh, [(gx + px) / 2, 0.11, 20.16], [16.5, h, 0.18], C.line);
    box(mesh, [six, 0.11, 0], [0.18, h, 18.32], C.line);
    box(mesh, [(gx + six) / 2, 0.11, -9.16], [5.5, h, 0.18], C.line);
    box(mesh, [(gx + six) / 2, 0.11, 9.16], [5.5, h, 0.18], C.line);

    const goalX = gx + side * 0.20;
    box(mesh, [goalX, 1.22, -3.66], [0.13, 2.44, 0.13], C.line);
    box(mesh, [goalX, 1.22, 3.66], [0.13, 2.44, 0.13], C.line);
    box(mesh, [goalX, 2.44, 0], [0.13, 0.13, 7.44], C.line);
    for (let z = -3.6; z <= 3.6; z += 0.60) {
      box(mesh, [goalX + side * 0.72, 1.15, z], [0.028, 2.30, 0.028], [0.62, 0.66, 0.70]);
    }
  }
}

function crowdColor(seed: number): Color {
  if (seed > 95) return C.crowdLight;
  if (seed > 79) return C.crowdBlue;
  if (seed > 42) return C.crowdDark;
  return C.seatNavy;
}

function buildTier(
  mesh: Mesh,
  baseX: number,
  baseZ: number,
  rows: number,
  rowDepth: number,
  rise: number,
  yStart: number,
  spectators: number,
  segments: number,
  frontCut: number,
  seatColor: Color,
): void {
  for (let row = 0; row < rows; row += 1) {
    const innerX = baseX + row * rowDepth;
    const innerZ = baseZ + row * rowDepth * 0.73;
    const outerX = innerX + rowDepth * 0.98;
    const outerZ = innerZ + rowDepth * 0.70;
    const y = yStart + row * rise;
    annulus(mesh, innerX, innerZ, outerX, outerZ, y, y + 0.10, segments, row % 4 === 0 ? C.seatBlue : seatColor, frontCut);
    if (row % 4 === 3) ringWall(mesh, outerX, outerZ, y - 0.30, y + 0.15, segments, C.black, frontCut);

    for (let s = 0; s < spectators; s += 1) {
      const a = ((s + 0.5) / spectators) * Math.PI * 2;
      if (Math.sin(a) > frontCut - 0.008) continue;
      const hash = (s * 43 + row * 71 + (row + 1) * (s + 3)) % 101;
      if (hash < 14) continue;
      const rx = innerX + rowDepth * 0.55;
      const rz = innerZ + rowDepth * 0.40;
      const x = Math.cos(a) * rx;
      const z = Math.sin(a) * rz;
      const body = crowdColor(hash);
      box(mesh, [x, y + 0.39, z], [0.20, 0.48 + (hash % 3) * 0.035, 0.19], body);
      if (hash > 34) box(mesh, [x, y + 0.73, z], [0.16, 0.17, 0.16], hash > 92 ? C.crowdLight : C.crowdDark);
    }
  }
}

function buildAisles(
  mesh: Mesh,
  innerX: number,
  innerZ: number,
  outerX: number,
  outerZ: number,
  y0: number,
  y1: number,
  count: number,
  frontCut: number,
): void {
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * Math.PI * 2;
    if (Math.sin(a) > frontCut) continue;
    const w = 0.009;
    quad(
      mesh,
      [Math.cos(a - w) * innerX, y0, Math.sin(a - w) * innerZ],
      [Math.cos(a + w) * innerX, y0, Math.sin(a + w) * innerZ],
      [Math.cos(a + w) * outerX, y1, Math.sin(a + w) * outerZ],
      [Math.cos(a - w) * outerX, y1, Math.sin(a - w) * outerZ],
      C.concrete,
    );
  }
}

function buildRoof(mesh: Mesh, segments: number): void {
  const cut = 0.74;
  annulus(mesh, 95, 67, 118, 86, 38.0, 43.8, segments, C.roof, cut);
  annulus(mesh, 90.5, 63.5, 95, 67, 37.0, 38.2, segments, C.roofDark, cut);
  ringWall(mesh, 118, 86, 38.3, 43.9, segments, C.roofDark, cut);

  for (let i = 0; i < 52; i += 1) {
    const a = (i / 52) * Math.PI * 2;
    if (Math.sin(a) > 0.72) continue;
    const outer: Vec3 = [Math.cos(a) * 112, 42.0, Math.sin(a) * 81];
    const inner: Vec3 = [Math.cos(a) * 95, 37.5, Math.sin(a) * 67];
    const mid: Vec3 = [(outer[0] + inner[0]) / 2, 40.4, (outer[2] + inner[2]) / 2];
    box(mesh, outer, [0.34, 5.0, 0.34], C.steel);
    box(mesh, mid, [0.26, 3.0, 0.26], C.steel);
  }

  for (let i = 0; i < 64; i += 1) {
    const a = (i / 64) * Math.PI * 2;
    if (Math.sin(a) > 0.70) continue;
    const x = Math.cos(a) * 91.5;
    const z = Math.sin(a) * 64.3;
    box(mesh, [x, 36.7, z], [1.35, 0.34, 0.52], C.flood);
  }
}

function buildArchitecture(mesh: Mesh, segments: number): void {
  const cut = 0.82;
  buildTier(mesh, 59, 41.5, 14, 1.16, 0.67, 0.65, 168, segments, cut, C.seatNavy);
  buildAisles(mesh, 59, 41.5, 75.4, 53.6, 0.65, 9.6, 28, cut);
  annulus(mesh, 75.4, 53.4, 78.0, 55.3, 9.30, 9.95, segments, C.led, cut);
  ringWall(mesh, 77.8, 55.1, 9.90, 12.0, segments, C.black, cut);

  buildTier(mesh, 79.3, 56.3, 13, 1.10, 0.75, 12.1, 182, segments, cut, C.seatBlue);
  buildAisles(mesh, 79.3, 56.3, 93.5, 66.8, 12.1, 21.5, 32, cut);
  annulus(mesh, 93.4, 66.6, 96.0, 68.6, 21.45, 22.10, segments, C.led, cut);
  ringWall(mesh, 95.8, 68.3, 22.05, 24.3, segments, C.black, cut);

  buildTier(mesh, 97.0, 69.7, 12, 1.08, 0.79, 24.4, 196, segments, cut, C.seatNavy);
  buildAisles(mesh, 97.0, 69.7, 110.0, 79.0, 24.4, 33.2, 36, cut);

  ringWall(mesh, 113.0, 81.0, 0.0, 6.6, segments, C.black, cut);
  annulus(mesh, 111.0, 79.0, 116.2, 84.0, 6.5, 7.9, segments, C.concrete, cut);

  buildRoof(mesh, segments);

  box(mesh, [0, 30.0, -78.8], [35, 12.5, 1.4], C.black);
  box(mesh, [0, 30.2, -78.0], [30.5, 8.2, 0.09], C.screen);
  box(mesh, [0, 27.0, -77.95], [23.0, 0.52, 0.10], C.screenBlue);
  box(mesh, [0, 33.1, -77.94], [12.0, 0.28, 0.10], C.led);

  for (const z of [-38.7, 38.7]) {
    box(mesh, [0, 0.60, z], [23, 1.15, 2.1], C.black);
    box(mesh, [0, 1.47, z], [23, 0.13, 2.65], C.steel);
    for (let x = -9.5; x <= 9.5; x += 1.9) {
      box(mesh, [x, 0.47, z + (z > 0 ? -0.38 : 0.38)], [1.05, 0.40, 0.76], C.seatBlue);
    }
  }

  box(mesh, [0, 2.1, 41.1], [10.5, 4.2, 1.0], C.black);
  box(mesh, [0, 4.1, 40.5], [8.0, 0.18, 1.2], C.led);
}

function buildScene(mode: Exclude<CoreVisualMode, "STATIC">): Mesh {
  const mesh = createMesh();
  const segments = mode === "FULL" ? 176 : mode === "FAST" ? 132 : 92;
  buildPitch(mesh);
  buildArchitecture(mesh, segments);
  return mesh;
}

function perspective(fov: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1 / Math.tan(fov / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
}

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function lookAt(eye: Vec3, target: Vec3, up: Vec3): Float32Array {
  const z = normalize(sub(eye, target));
  const x = normalize(cross(up, z));
  const y = cross(z, x);
  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
  ]);
}

function multiply(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c += 1) {
    for (let r = 0; r < 4; r += 1) {
      out[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
  }
  return out;
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("stadium shader allocation failed");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || "stadium shader compilation failed");
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram {
  const vertex = compile(
    gl,
    gl.VERTEX_SHADER,
    `attribute vec3 aPosition;attribute vec3 aNormal;attribute vec3 aColor;uniform mat4 uMvp;varying vec3 vPos;varying vec3 vNormal;varying vec3 vColor;void main(){vPos=aPosition;vNormal=normalize(aNormal);vColor=aColor;gl_Position=uMvp*vec4(aPosition,1.0);}`,
  );
  const fragment = compile(
    gl,
    gl.FRAGMENT_SHADER,
    `precision mediump float;varying vec3 vPos;varying vec3 vNormal;varying vec3 vColor;uniform vec3 uCamera;vec3 lightAt(vec3 lp,float power,vec3 tint){vec3 d=lp-vPos;float dist=max(length(d),1.0);vec3 l=normalize(d);vec3 v=normalize(uCamera-vPos);vec3 h=normalize(l+v);float diff=max(dot(vNormal,l),0.0);float spec=pow(max(dot(vNormal,h),0.0),36.0)*0.16;float att=1.0/(1.0+0.00034*dist*dist);return tint*(diff+spec)*att*power;}void main(){float pitch=(1.0-step(53.2,abs(vPos.x)))*(1.0-step(34.4,abs(vPos.z)))*(1.0-step(0.8,vPos.y));float grain=(sin(vPos.x*4.6)+sin(vPos.z*7.3)+sin((vPos.x+vPos.z)*2.1))*0.008*pitch;vec3 base=vColor*(1.0+grain);float emissive=max(max(base.r,base.g),base.b);vec3 col=base*(0.045+0.12*max(vNormal.y,0.0));col+=base*lightAt(vec3(-88.0,40.0,-62.0),3.8,vec3(1.00,0.96,0.86));col+=base*lightAt(vec3(88.0,40.0,-62.0),3.8,vec3(1.00,0.96,0.86));col+=base*lightAt(vec3(-88.0,40.0,62.0),3.4,vec3(0.94,0.97,1.00));col+=base*lightAt(vec3(88.0,40.0,62.0),3.4,vec3(0.94,0.97,1.00));col+=base*vec3(0.30,0.31,0.25)*pitch;float pitchSheen=pow(max(dot(normalize(uCamera-vPos),normalize(vec3(-0.1,1.0,-0.05))),0.0),8.0)*pitch;col+=vec3(0.05,0.18,0.07)*pitchSheen;float em=smoothstep(0.72,1.02,emissive);col+=base*em*0.78;float rim=pow(1.0-max(dot(normalize(uCamera-vPos),vNormal),0.0),3.0);col+=vec3(0.045,0.055,0.07)*rim*0.14;float fog=smoothstep(175.0,360.0,length(uCamera-vPos));col=mix(col,vec3(0.006,0.010,0.015),fog*0.12);col=col/(col+vec3(0.70));col=pow(col,vec3(0.84));gl_FragColor=vec4(col,1.0);}`,
  );
  const program = gl.createProgram();
  if (!program) throw new Error("stadium program allocation failed");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "stadium program link failed");
  }
  return program;
}

function createBuffer(gl: WebGLRenderingContext, data: number[]): WebGLBuffer {
  const buffer = gl.createBuffer();
  if (!buffer) throw new Error("stadium buffer allocation failed");
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  return buffer;
}

export function createStadiumWebglRenderer(
  canvas: HTMLCanvasElement,
  mode: Exclude<CoreVisualMode, "STATIC">,
): StadiumWebglRenderer | null {
  if (typeof window.WebGLRenderingContext === "undefined") return null;
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    depth: true,
    premultipliedAlpha: false,
    powerPreference: mode === "FULL" ? "high-performance" : "default",
  }) as WebGLRenderingContext | null;
  if (!gl) return null;

  const mesh = buildScene(mode);
  const program = createProgram(gl);
  const positionBuffer = createBuffer(gl, mesh.positions);
  const normalBuffer = createBuffer(gl, mesh.normals);
  const colorBuffer = createBuffer(gl, mesh.colors);
  const indexBuffer = gl.createBuffer();
  if (!indexBuffer) throw new Error("stadium index allocation failed");

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  const maxIndex = mesh.indices.reduce((max, value) => Math.max(max, value), 0);
  const usesUint32 = maxIndex > 65535;
  if (usesUint32 && !gl.getExtension("OES_element_index_uint")) {
    throw new Error("stadium renderer requires uint index extension");
  }
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    usesUint32 ? new Uint32Array(mesh.indices) : new Uint16Array(mesh.indices),
    gl.STATIC_DRAW,
  );

  const positionLocation = gl.getAttribLocation(program, "aPosition");
  const normalLocation = gl.getAttribLocation(program, "aNormal");
  const colorLocation = gl.getAttribLocation(program, "aColor");
  const mvpLocation = gl.getUniformLocation(program, "uMvp");
  const cameraLocation = gl.getUniformLocation(program, "uCamera");
  if (positionLocation < 0 || normalLocation < 0 || colorLocation < 0 || !mvpLocation || !cameraLocation) {
    throw new Error("stadium shader locations unavailable");
  }

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.disable(gl.CULL_FACE);

  let viewportWidth = 1;
  let viewportHeight = 1;

  const bindAttribute = (buffer: WebGLBuffer, location: number) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
  };

  const resize = (width: number, height: number, dpr: number) => {
    viewportWidth = Math.max(1, Math.round(width * Math.min(dpr, 2)));
    viewportHeight = Math.max(1, Math.round(height * Math.min(dpr, 2)));
    canvas.width = viewportWidth;
    canvas.height = viewportHeight;
    gl.viewport(0, 0, viewportWidth, viewportHeight);
  };

  const render = (orbit: number, zoom0: number) => {
    const aspect = viewportWidth / viewportHeight;
    const portrait = aspect < 1;
    const zoom = Math.min(1.16, Math.max(0.94, zoom0));
    const angle = (orbit + (portrait ? 2.5 : 7.0)) * Math.PI / 180;
    const radius = (portrait ? 151 : 118) / zoom;
    const height = (portrait ? 41 : 27) / zoom;
    const eye: Vec3 = [Math.sin(angle) * radius, height, Math.cos(angle) * radius];
    const target: Vec3 = [0, portrait ? 8.5 : 9.5, -5.5];
    const view = lookAt(eye, target, [0, 1, 0]);
    const projection = perspective((portrait ? 61 : 49) * Math.PI / 180, aspect, 0.45, 420);
    const mvp = multiply(projection, view);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    bindAttribute(positionBuffer, positionLocation);
    bindAttribute(normalBuffer, normalLocation);
    bindAttribute(colorBuffer, colorLocation);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.uniformMatrix4fv(mvpLocation, false, mvp);
    gl.uniform3f(cameraLocation, eye[0], eye[1], eye[2]);
    gl.drawElements(
      gl.TRIANGLES,
      mesh.indices.length,
      usesUint32 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT,
      0,
    );
  };

  const destroy = () => {
    gl.deleteBuffer(positionBuffer);
    gl.deleteBuffer(normalBuffer);
    gl.deleteBuffer(colorBuffer);
    gl.deleteBuffer(indexBuffer);
    gl.deleteProgram(program);
  };

  return {
    triangleCount: mesh.indices.length / 3,
    resize,
    render,
    destroy,
  };
}
