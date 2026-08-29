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
  grassA: [0.018, 0.255, 0.050] as Color,
  grassB: [0.012, 0.195, 0.038] as Color,
  grassEdge: [0.004, 0.025, 0.010] as Color,
  line: [0.95, 0.97, 0.98] as Color,
  concrete: [0.105, 0.115, 0.125] as Color,
  concreteLight: [0.17, 0.18, 0.19] as Color,
  seat: [0.012, 0.033, 0.072] as Color,
  seatBlue: [0.010, 0.070, 0.18] as Color,
  crowdDark: [0.075, 0.082, 0.088] as Color,
  crowdMid: [0.19, 0.20, 0.21] as Color,
  crowdLight: [0.46, 0.47, 0.47] as Color,
  crowdBlue: [0.025, 0.12, 0.34] as Color,
  steel: [0.30, 0.32, 0.35] as Color,
  roof: [0.075, 0.083, 0.092] as Color,
  roofInner: [0.025, 0.030, 0.036] as Color,
  led: [0.015, 0.38, 0.95] as Color,
  screen: [0.006, 0.012, 0.025] as Color,
  screenBlue: [0.015, 0.14, 0.58] as Color,
  flood: [1.55, 1.42, 1.03] as Color,
  black: [0.004, 0.006, 0.008] as Color,
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
  cut: number,
): void {
  for (let i = 0; i < segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    const b = ((i + 1) / segments) * Math.PI * 2;
    if (Math.sin((a + b) / 2) > cut) continue;
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
  cut: number,
): void {
  for (let i = 0; i < segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    const b = ((i + 1) / segments) * Math.PI * 2;
    if (Math.sin((a + b) / 2) > cut) continue;
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
    quad(
      mesh,
      [Math.cos(a) * (radius - width / 2), y, Math.sin(a) * (radius - width / 2)],
      [Math.cos(b) * (radius - width / 2), y, Math.sin(b) * (radius - width / 2)],
      [Math.cos(b) * (radius + width / 2), y, Math.sin(b) * (radius + width / 2)],
      [Math.cos(a) * (radius + width / 2), y, Math.sin(a) * (radius + width / 2)],
      color,
    );
  }
}

function buildPitch(mesh: Mesh): void {
  plane(mesh, -62, 62, -43, 43, -0.18, C.grassEdge);
  const stripeWidth = 105 / 20;
  for (let i = 0; i < 20; i += 1) {
    const x = -52.5 + stripeWidth * i;
    plane(mesh, x, x + stripeWidth + 0.02, -34, 34, 0.02, i % 2 ? C.grassA : C.grassB);
  }
  const lineHeight = 0.055;
  const lines: readonly [Vec3, Vec3][] = [
    [[0, 0.10, -34], [105, lineHeight, 0.16]],
    [[0, 0.10, 34], [105, lineHeight, 0.16]],
    [[-52.5, 0.10, 0], [0.16, lineHeight, 68]],
    [[52.5, 0.10, 0], [0.16, lineHeight, 68]],
    [[0, 0.10, 0], [0.16, lineHeight, 68]],
  ];
  for (const [center, size] of lines) box(mesh, center, size, C.line);
  circleLine(mesh, 9.15, 0.16, 0.12, 96, C.line);
  circleLine(mesh, 0.24, 0.24, 0.13, 24, C.line);

  for (const side of [-1, 1] as const) {
    const goalX = side * 52.5;
    const penaltyX = goalX - side * 16.5;
    box(mesh, [penaltyX, 0.10, 0], [0.16, lineHeight, 40.32], C.line);
    box(mesh, [(goalX + penaltyX) / 2, 0.10, -20.16], [16.5, lineHeight, 0.16], C.line);
    box(mesh, [(goalX + penaltyX) / 2, 0.10, 20.16], [16.5, lineHeight, 0.16], C.line);
    const postX = goalX + side * 0.18;
    box(mesh, [postX, 1.22, -3.66], [0.12, 2.44, 0.12], C.line);
    box(mesh, [postX, 1.22, 3.66], [0.12, 2.44, 0.12], C.line);
    box(mesh, [postX, 2.44, 0], [0.12, 0.12, 7.44], C.line);
  }

  for (const z of [-38.6, 38.6]) {
    box(mesh, [0, 0.55, z], [26, 1.0, 1.5], C.black);
    box(mesh, [0, 1.10, z], [26, 0.10, 1.8], C.steel);
  }
}

function spectatorColor(seed: number): Color {
  if (seed > 96) return C.crowdLight;
  if (seed > 82) return C.crowdBlue;
  if (seed > 44) return C.crowdMid;
  return C.crowdDark;
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
  cut: number,
): void {
  for (let row = 0; row < rows; row += 1) {
    const innerX = baseX + row * rowDepth;
    const innerZ = baseZ + row * rowDepth * 0.72;
    const outerX = innerX + rowDepth * 0.97;
    const outerZ = innerZ + rowDepth * 0.69;
    const y = yStart + row * rise;
    annulus(mesh, innerX, innerZ, outerX, outerZ, y, y + 0.075, segments, row % 6 === 0 ? C.seatBlue : C.seat, cut);

    for (let s = 0; s < spectators; s += 1) {
      const angle = ((s + 0.5) / spectators) * Math.PI * 2;
      if (Math.sin(angle) > cut - 0.01) continue;
      const hash = (s * 53 + row * 79 + s * row * 3) % 101;
      if (hash < 11) continue;
      const radiusX = innerX + rowDepth * 0.54;
      const radiusZ = innerZ + rowDepth * 0.39;
      const x = Math.cos(angle) * radiusX;
      const z = Math.sin(angle) * radiusZ;
      const bodyColor = spectatorColor(hash);
      box(mesh, [x, y + 0.38, z], [0.17, 0.44, 0.16], bodyColor);
      if (hash > 26) box(mesh, [x, y + 0.69, z], [0.14, 0.15, 0.14], hash > 92 ? C.crowdLight : C.crowdDark);
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
  cut: number,
): void {
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    if (Math.sin(angle) > cut) continue;
    const w = 0.010;
    quad(
      mesh,
      [Math.cos(angle - w) * innerX, y0, Math.sin(angle - w) * innerZ],
      [Math.cos(angle + w) * innerX, y0, Math.sin(angle + w) * innerZ],
      [Math.cos(angle + w) * outerX, y1, Math.sin(angle + w) * outerZ],
      [Math.cos(angle - w) * outerX, y1, Math.sin(angle - w) * outerZ],
      C.concreteLight,
    );
  }
}

function buildRoof(mesh: Mesh, segments: number): void {
  const cut = 0.76;
  annulus(mesh, 96, 68, 120, 88, 38.5, 43.6, segments, C.roof, cut);
  annulus(mesh, 91.5, 64.5, 96, 68, 37.4, 38.6, segments, C.roofInner, cut);
  ringWall(mesh, 120, 88, 39.0, 43.8, segments, C.roofInner, cut);

  for (let i = 0; i < 56; i += 1) {
    const angle = (i / 56) * Math.PI * 2;
    if (Math.sin(angle) > 0.74) continue;
    const outer: Vec3 = [Math.cos(angle) * 113.5, 42.2, Math.sin(angle) * 82.5];
    const inner: Vec3 = [Math.cos(angle) * 95.0, 37.8, Math.sin(angle) * 67.0];
    box(mesh, outer, [0.28, 5.0, 0.28], C.steel);
    box(mesh, [(outer[0] + inner[0]) / 2, 40.1, (outer[2] + inner[2]) / 2], [0.20, 2.8, 0.20], C.steel);
  }

  for (let i = 0; i < 72; i += 1) {
    const angle = (i / 72) * Math.PI * 2;
    if (Math.sin(angle) > 0.72) continue;
    box(mesh, [Math.cos(angle) * 92.0, 36.9, Math.sin(angle) * 64.8], [1.10, 0.28, 0.42], C.flood);
  }
}

function buildArchitecture(mesh: Mesh, segments: number): void {
  const cut = 0.86;
  buildTier(mesh, 59.0, 41.2, 15, 1.10, 0.62, 0.65, 188, segments, cut);
  buildAisles(mesh, 59.0, 41.2, 75.4, 53.4, 0.65, 9.4, 28, cut);
  annulus(mesh, 75.2, 53.2, 78.0, 55.1, 9.25, 9.65, segments, C.led, cut);
  ringWall(mesh, 77.9, 55.0, 9.60, 11.4, segments, C.black, cut);

  buildTier(mesh, 79.0, 56.0, 14, 1.06, 0.70, 11.7, 204, segments, cut);
  buildAisles(mesh, 79.0, 56.0, 93.8, 66.5, 11.7, 21.0, 32, cut);
  annulus(mesh, 93.6, 66.4, 96.1, 68.3, 20.95, 21.40, segments, C.led, cut);
  ringWall(mesh, 96.0, 68.2, 21.35, 23.0, segments, C.black, cut);

  buildTier(mesh, 97.2, 69.5, 13, 1.02, 0.73, 23.3, 218, segments, cut);
  buildAisles(mesh, 97.2, 69.5, 110.4, 78.9, 23.3, 32.4, 36, cut);

  ringWall(mesh, 112.5, 80.5, 0.0, 5.8, segments, C.black, cut);
  annulus(mesh, 110.8, 78.8, 116.0, 83.0, 5.7, 6.9, segments, C.concrete, cut);
  buildRoof(mesh, segments);

  box(mesh, [0, 29.3, -78.0], [28.0, 9.2, 1.2], C.black);
  box(mesh, [0, 29.4, -77.4], [24.0, 5.8, 0.08], C.screen);
  box(mesh, [0, 27.1, -77.32], [18.0, 0.30, 0.09], C.screenBlue);
  box(mesh, [0, 31.5, -77.31], [10.0, 0.22, 0.09], C.led);
}

function buildScene(mode: Exclude<CoreVisualMode, "STATIC">): Mesh {
  const mesh = createMesh();
  const segments = mode === "FULL" ? 184 : mode === "FAST" ? 136 : 96;
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
    `precision mediump float;varying vec3 vPos;varying vec3 vNormal;varying vec3 vColor;uniform vec3 uCamera;vec3 lamp(vec3 lp,float power,vec3 tint){vec3 d=lp-vPos;float dist=max(length(d),1.0);vec3 l=normalize(d);vec3 v=normalize(uCamera-vPos);vec3 h=normalize(l+v);float ndl=max(dot(vNormal,l),0.0);float spec=pow(max(dot(vNormal,h),0.0),42.0)*0.18;float att=1.0/(1.0+0.00026*dist*dist);return tint*(ndl+spec)*att*power;}void main(){float pitch=(1.0-step(53.3,abs(vPos.x)))*(1.0-step(34.4,abs(vPos.z)))*(1.0-step(0.75,vPos.y));float micro=(sin(vPos.x*5.7)+sin(vPos.z*8.1)+sin((vPos.x-vPos.z)*2.9))*0.006*pitch;vec3 base=vColor*(1.0+micro);float up=max(vNormal.y,0.0);vec3 col=base*(0.055+0.13*up);col+=base*lamp(vec3(-92.0,41.0,-64.0),4.1,vec3(1.00,0.96,0.86));col+=base*lamp(vec3(92.0,41.0,-64.0),4.1,vec3(1.00,0.96,0.86));col+=base*lamp(vec3(-92.0,41.0,64.0),3.7,vec3(0.93,0.97,1.00));col+=base*lamp(vec3(92.0,41.0,64.0),3.7,vec3(0.93,0.97,1.00));col+=base*vec3(0.25,0.28,0.22)*pitch;vec3 viewDir=normalize(uCamera-vPos);float sheen=pow(max(dot(viewDir,normalize(vec3(-0.05,1.0,-0.08))),0.0),10.0)*pitch;col+=vec3(0.035,0.15,0.055)*sheen;float lum=max(max(base.r,base.g),base.b);float emissive=smoothstep(0.72,1.1,lum);col+=base*emissive*0.72;float rim=pow(1.0-max(dot(viewDir,vNormal),0.0),3.0);col+=vec3(0.045,0.055,0.07)*rim*0.12;float fog=smoothstep(185.0,370.0,length(uCamera-vPos));col=mix(col,vec3(0.007,0.011,0.016),fog*0.10);col=col/(col+vec3(0.72));col=pow(col,vec3(0.88));gl_FragColor=vec4(col,1.0);}`,
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
    const zoom = Math.min(1.18, Math.max(0.94, zoom0));
    const angle = (orbit + (portrait ? 2.0 : 6.5)) * Math.PI / 180;
    const radius = (portrait ? 145 : 114) / zoom;
    const height = (portrait ? 38 : 25.5) / zoom;
    const eye: Vec3 = [Math.sin(angle) * radius, height, Math.cos(angle) * radius];
    const target: Vec3 = [0, portrait ? 8.0 : 8.8, -6.0];
    const view = lookAt(eye, target, [0, 1, 0]);
    const projection = perspective((portrait ? 59 : 48) * Math.PI / 180, aspect, 0.45, 420);
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
