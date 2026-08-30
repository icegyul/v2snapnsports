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
  grassA: [0.020, 0.210, 0.050] as Color,
  grassB: [0.015, 0.165, 0.038] as Color,
  grassEdge: [0.006, 0.030, 0.014] as Color,
  line: [0.93, 0.95, 0.93] as Color,
  concrete: [0.145, 0.155, 0.165] as Color,
  concreteLight: [0.31, 0.32, 0.33] as Color,
  seat: [0.012, 0.027, 0.052] as Color,
  seatBlue: [0.012, 0.075, 0.190] as Color,
  crowdDark: [0.09, 0.10, 0.11] as Color,
  crowdMid: [0.29, 0.30, 0.31] as Color,
  crowdLight: [0.64, 0.60, 0.53] as Color,
  crowdBlue: [0.025, 0.18, 0.50] as Color,
  crowdWarm: [0.54, 0.22, 0.07] as Color,
  steel: [0.34, 0.36, 0.39] as Color,
  roof: [0.085, 0.095, 0.108] as Color,
  roofInner: [0.025, 0.032, 0.043] as Color,
  led: [0.015, 0.45, 1.18] as Color,
  warmLight: [1.55, 1.30, 0.86] as Color,
  screen: [0.006, 0.014, 0.035] as Color,
  black: [0.004, 0.007, 0.011] as Color,
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
  for (const point of [a, b, c, d]) {
    mesh.positions.push(...point);
    mesh.normals.push(...normal);
    mesh.colors.push(...color);
  }
  mesh.indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
}

function box(mesh: Mesh, [x, y, z]: Vec3, [sx, sy, sz]: Vec3, color: Color): void {
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
): void {
  for (let i = 0; i < segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    const b = ((i + 1) / segments) * Math.PI * 2;
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
): void {
  for (let i = 0; i < segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    const b = ((i + 1) / segments) * Math.PI * 2;
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

function buildGoal(mesh: Mesh, side: -1 | 1): void {
  const goalX = side * 52.5;
  const frontX = goalX + side * 0.16;
  const backX = goalX + side * 2.1;
  box(mesh, [frontX, 1.22, -3.66], [0.11, 2.44, 0.11], C.line);
  box(mesh, [frontX, 1.22, 3.66], [0.11, 2.44, 0.11], C.line);
  box(mesh, [frontX, 2.44, 0], [0.11, 0.11, 7.44], C.line);
  for (let i = -3; i <= 3; i += 1) {
    box(mesh, [(frontX + backX) / 2, 1.15, i * 1.06], [1.95, 0.026, 0.026], C.concreteLight);
  }
  for (let row = 0; row <= 4; row += 1) {
    box(mesh, [(frontX + backX) / 2, row * 0.54, -3.66], [1.95, 0.026, 0.026], C.concreteLight);
    box(mesh, [(frontX + backX) / 2, row * 0.54, 3.66], [1.95, 0.026, 0.026], C.concreteLight);
  }
}

function buildPitch(mesh: Mesh): void {
  plane(mesh, -61.5, 61.5, -42.5, 42.5, -0.16, C.grassEdge);
  const stripeWidth = 105 / 20;
  for (let i = 0; i < 20; i += 1) {
    const x = -52.5 + i * stripeWidth;
    plane(mesh, x, x + stripeWidth + 0.02, -34, 34, 0.02, i % 2 ? C.grassA : C.grassB);
  }

  const h = 0.055;
  for (const [center, size] of [
    [[0, 0.11, -34], [105, h, 0.14]],
    [[0, 0.11, 34], [105, h, 0.14]],
    [[-52.5, 0.11, 0], [0.14, h, 68]],
    [[52.5, 0.11, 0], [0.14, h, 68]],
    [[0, 0.11, 0], [0.14, h, 68]],
  ] as const) {
    box(mesh, center, size, C.line);
  }
  circleLine(mesh, 9.15, 0.14, 0.12, 96, C.line);
  circleLine(mesh, 0.23, 0.23, 0.13, 24, C.line);

  for (const side of [-1, 1] as const) {
    const goalX = side * 52.5;
    const penaltyX = goalX - side * 16.5;
    box(mesh, [penaltyX, 0.11, 0], [0.14, h, 40.32], C.line);
    box(mesh, [(goalX + penaltyX) / 2, 0.11, -20.16], [16.5, h, 0.14], C.line);
    box(mesh, [(goalX + penaltyX) / 2, 0.11, 20.16], [16.5, h, 0.14], C.line);
    buildGoal(mesh, side);
  }

  for (const z of [-38.6, 38.6]) {
    box(mesh, [0, 0.52, z], [22, 0.88, 1.25], C.black);
    box(mesh, [0, 1.02, z], [22, 0.09, 1.45], C.steel);
    for (let x = -8; x <= 8; x += 2) {
      box(mesh, [x, 0.40, z + (z > 0 ? -0.50 : 0.50)], [0.95, 0.40, 0.54], C.seatBlue);
    }
  }

  for (const z of [-36.0, 36.0]) {
    for (let x = -48; x <= 48; x += 8) {
      box(mesh, [x, 0.48, z], [5.8, 0.72, 0.18], (x / 8) % 2 === 0 ? C.led : C.screen);
    }
  }
}

function crowdColor(seed: number): Color {
  if (seed > 97) return C.crowdLight;
  if (seed > 90) return C.crowdWarm;
  if (seed > 79) return C.crowdBlue;
  if (seed > 42) return C.crowdMid;
  return C.crowdDark;
}

function spectator(
  mesh: Mesh,
  x: number,
  y: number,
  z: number,
  scale: number,
  color: Color,
  angle: number,
): void {
  const halfWidth = 0.11 * scale;
  const height = 0.48 * scale;
  const dx = Math.cos(angle) * halfWidth;
  const dz = Math.sin(angle) * halfWidth;
  const tx = -Math.sin(angle) * halfWidth;
  const tz = Math.cos(angle) * halfWidth;
  quad(
    mesh,
    [x - dx, y, z - dz],
    [x + dx, y, z + dz],
    [x + dx, y + height, z + dz],
    [x - dx, y + height, z - dz],
    color,
  );
  quad(
    mesh,
    [x - tx, y, z - tz],
    [x + tx, y, z + tz],
    [x + tx, y + height, z + tz],
    [x - tx, y + height, z - tz],
    color,
  );
}

function buildTier(
  mesh: Mesh,
  baseX: number,
  baseZ: number,
  rows: number,
  rowDepth: number,
  rise: number,
  yStart: number,
  peoplePerRow: number,
  segments: number,
): void {
  for (let row = 0; row < rows; row += 1) {
    const innerX = baseX + row * rowDepth;
    const innerZ = baseZ + row * rowDepth * 0.72;
    const outerX = innerX + rowDepth * 0.97;
    const outerZ = innerZ + rowDepth * 0.70;
    const y = yStart + row * rise;
    annulus(
      mesh,
      innerX,
      innerZ,
      outerX,
      outerZ,
      y,
      y + 0.075,
      segments,
      row % 6 === 0 ? C.seatBlue : C.seat,
    );

    for (let person = 0; person < peoplePerRow; person += 1) {
      const angle = ((person + 0.5) / peoplePerRow) * Math.PI * 2;
      const hash = (person * 53 + row * 79 + person * row * 7) % 101;
      if (hash < 10) continue;
      const radiusX = innerX + rowDepth * 0.53;
      const radiusZ = innerZ + rowDepth * 0.39;
      const x = Math.cos(angle) * radiusX;
      const z = Math.sin(angle) * radiusZ;
      const scale = 0.84 + (hash % 17) / 45;
      spectator(mesh, x, y + 0.09, z, scale, crowdColor(hash), angle + Math.PI / 2);
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
): void {
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const width = 0.010;
    quad(
      mesh,
      [Math.cos(angle - width) * innerX, y0, Math.sin(angle - width) * innerZ],
      [Math.cos(angle + width) * innerX, y0, Math.sin(angle + width) * innerZ],
      [Math.cos(angle + width) * outerX, y1, Math.sin(angle + width) * outerZ],
      [Math.cos(angle - width) * outerX, y1, Math.sin(angle - width) * outerZ],
      C.concreteLight,
    );
  }
}

function buildRoof(mesh: Mesh, segments: number): void {
  annulus(mesh, 99.0, 70.2, 120.0, 87.0, 38.8, 43.0, segments, C.roof);
  annulus(mesh, 95.5, 67.4, 99.2, 70.3, 37.7, 38.9, segments, C.roofInner);
  ringWall(mesh, 120.0, 87.0, 39.0, 43.1, segments, C.roofInner);

  for (let i = 0; i < 52; i += 1) {
    const angle = (i / 52) * Math.PI * 2;
    const outer: Vec3 = [Math.cos(angle) * 113.0, 41.7, Math.sin(angle) * 81.8];
    const inner: Vec3 = [Math.cos(angle) * 97.0, 37.9, Math.sin(angle) * 68.8];
    box(mesh, outer, [0.24, 4.8, 0.24], C.steel);
    box(
      mesh,
      [(outer[0] + inner[0]) / 2, 39.8, (outer[2] + inner[2]) / 2],
      [0.18, 2.5, 0.18],
      C.steel,
    );
  }

  for (let i = 0; i < 88; i += 1) {
    const angle = (i / 88) * Math.PI * 2;
    box(mesh, [Math.cos(angle) * 96.7, 37.1, Math.sin(angle) * 68.2], [0.82, 0.30, 0.40], C.warmLight);
  }
}

function buildArchitecture(mesh: Mesh, segments: number): void {
  buildTier(mesh, 58.2, 40.6, 16, 1.07, 0.58, 0.70, 126, segments);
  buildAisles(mesh, 58.2, 40.6, 75.3, 52.8, 0.70, 9.4, 18);
  annulus(mesh, 75.2, 52.9, 78.0, 54.9, 9.35, 9.72, segments, C.led);
  ringWall(mesh, 78.0, 54.9, 9.70, 11.15, segments, C.black);

  buildTier(mesh, 79.0, 55.7, 15, 1.03, 0.66, 11.45, 142, segments);
  buildAisles(mesh, 79.0, 55.7, 94.5, 66.7, 11.45, 21.0, 20);
  annulus(mesh, 94.4, 66.7, 97.0, 68.6, 20.95, 21.35, segments, C.led);
  ringWall(mesh, 97.0, 68.6, 21.30, 22.8, segments, C.black);

  buildTier(mesh, 98.0, 69.4, 14, 1.01, 0.70, 23.10, 154, segments);
  buildAisles(mesh, 98.0, 69.4, 112.0, 79.2, 23.10, 32.4, 22);

  ringWall(mesh, 114.0, 81.0, 0, 5.5, segments, C.black);
  annulus(mesh, 111.8, 79.3, 117.5, 84.0, 5.45, 6.55, segments, C.concrete);
  buildRoof(mesh, segments);

  box(mesh, [0, 28.8, -77.2], [28, 8.8, 1.0], C.black);
  box(mesh, [0, 28.9, -76.6], [24, 5.4, 0.08], C.screen);
  box(mesh, [0, 31.2, -76.5], [10, 0.22, 0.09], C.led);
  box(mesh, [0, 26.7, -76.5], [18, 0.24, 0.09], C.crowdBlue);

  box(mesh, [0, 1.6, -40.2], [7.4, 3.0, 2.2], C.black);
  box(mesh, [0, 2.0, -39.0], [3.8, 2.0, 0.12], C.led);
}

function buildScene(mode: Exclude<CoreVisualMode, "STATIC">): Mesh {
  const mesh = createMesh();
  const segments = mode === "FULL" ? 168 : mode === "FAST" ? 128 : 92;
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
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      out[column * 4 + row] =
        a[row] * b[column * 4] +
        a[4 + row] * b[column * 4 + 1] +
        a[8 + row] * b[column * 4 + 2] +
        a[12 + row] * b[column * 4 + 3];
    }
  }
  return out;
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
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
  const vertex = compileShader(
    gl,
    gl.VERTEX_SHADER,
    `attribute vec3 aPosition;attribute vec3 aNormal;attribute vec3 aColor;uniform mat4 uMvp;varying vec3 p,n,c;void main(){p=aPosition;n=normalize(aNormal);c=aColor;gl_Position=uMvp*vec4(aPosition,1.0);}`,
  );
  const fragment = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    `precision mediump float;varying vec3 p,n,c;uniform vec3 uCamera;vec3 lamp(vec3 lp,float power,vec3 tint){vec3 d=lp-p;float dist=max(length(d),1.0);vec3 l=normalize(d),v=normalize(uCamera-p),h=normalize(l+v);float diff=max(dot(n,l),0.0);float spec=pow(max(dot(n,h),0.0),32.0)*0.15;float att=1.0/(1.0+0.00020*dist*dist);return tint*(diff+spec)*att*power;}void main(){float pitch=(1.0-step(53.3,abs(p.x)))*(1.0-step(34.4,abs(p.z)))*(1.0-step(0.8,p.y));float grain=(sin(p.x*4.4)+sin(p.z*7.1)+sin((p.x-p.z)*2.6))*0.0035*pitch;vec3 base=c*(1.0+grain),viewDir=normalize(uCamera-p);float up=max(n.y,0.0);vec3 col=base*(0.10+0.18*up);col+=base*lamp(vec3(-88.0,39.0,-62.0),5.6,vec3(1.0,0.96,0.86));col+=base*lamp(vec3(88.0,39.0,-62.0),5.6,vec3(1.0,0.96,0.86));col+=base*lamp(vec3(-88.0,39.0,62.0),5.0,vec3(0.93,0.97,1.0));col+=base*lamp(vec3(88.0,39.0,62.0),5.0,vec3(0.93,0.97,1.0));col+=base*vec3(0.18,0.22,0.15)*pitch;float sheen=pow(max(dot(viewDir,normalize(vec3(-0.04,1.0,-0.06))),0.0),11.0)*pitch;col+=vec3(0.020,0.075,0.030)*sheen;float lum=max(max(base.r,base.g),base.b);col+=base*smoothstep(0.68,1.04,lum)*0.66;float rim=pow(1.0-max(dot(viewDir,n),0.0),3.0);col+=vec3(0.065,0.070,0.082)*rim*0.14;float fog=smoothstep(145.0,320.0,length(uCamera-p));col=mix(col,vec3(0.008,0.013,0.020),fog*0.09);col=col/(col+vec3(0.78));col=pow(col,vec3(0.92));gl_FragColor=vec4(col,1.0);}`,
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
  const raw = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    depth: true,
    premultipliedAlpha: false,
    powerPreference: mode === "FULL" ? "high-performance" : "default",
  }) as WebGLRenderingContext | null;
  if (!raw) return null;
  const gl: WebGLRenderingContext = raw;

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
    const portrait = aspect < 0.82;
    const zoom = Math.min(1.15, Math.max(0.92, zoom0));
    const baseAngle = portrait ? 78 : 20;
    const angle = (baseAngle + orbit * 0.22) * Math.PI / 180;
    const radius = (portrait ? 55.0 : 42.0) / zoom;
    const cameraHeight = (portrait ? 14.0 : 15.5) / zoom;
    const eye: Vec3 = [Math.sin(angle) * radius, cameraHeight, Math.cos(angle) * radius];
    const target: Vec3 = portrait ? [-7.0, 2.4, 0] : [0, 3.0, -7.5];
    const view = lookAt(eye, target, [0, 1, 0]);
    const projection = perspective((portrait ? 72 : 58) * Math.PI / 180, aspect, 0.28, 360);
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
