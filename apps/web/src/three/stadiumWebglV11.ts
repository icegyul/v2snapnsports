import type { CoreVisualMode } from "../api/coreProductContracts";

type Vec3 = readonly [number, number, number];
type Color = readonly [number, number, number];
type Mesh = {
  positions: number[];
  normals: number[];
  colors: number[];
  indices: number[];
};

export interface StadiumWebglRenderer {
  readonly triangleCount: number;
  resize(width: number, height: number, dpr: number): void;
  render(orbit: number, zoom: number): void;
  destroy(): void;
}

const C = {
  grassA: [0.018, 0.205, 0.043] as Color,
  grassB: [0.012, 0.165, 0.034] as Color,
  grassEdge: [0.006, 0.030, 0.014] as Color,
  line: [0.94, 0.95, 0.93] as Color,
  concrete: [0.18, 0.19, 0.20] as Color,
  concreteLight: [0.27, 0.28, 0.29] as Color,
  seat: [0.018, 0.038, 0.070] as Color,
  seatBlue: [0.018, 0.085, 0.220] as Color,
  crowdDark: [0.11, 0.115, 0.12] as Color,
  crowdMid: [0.29, 0.30, 0.31] as Color,
  crowdLight: [0.58, 0.55, 0.50] as Color,
  crowdBlue: [0.035, 0.18, 0.46] as Color,
  crowdWarm: [0.46, 0.24, 0.10] as Color,
  steel: [0.34, 0.36, 0.38] as Color,
  roof: [0.12, 0.13, 0.14] as Color,
  roofInner: [0.045, 0.052, 0.062] as Color,
  led: [0.025, 0.42, 1.05] as Color,
  screen: [0.010, 0.020, 0.045] as Color,
  flood: [1.42, 1.26, 0.91] as Color,
  black: [0.008, 0.011, 0.015] as Color,
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

function plane(
  mesh: Mesh,
  x0: number,
  x1: number,
  z0: number,
  z1: number,
  y: number,
  color: Color,
): void {
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

function circleLine(
  mesh: Mesh,
  radius: number,
  width: number,
  y: number,
  segments: number,
  color: Color,
): void {
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
  const postX = goalX + side * 0.18;
  const backX = goalX + side * 2.2;
  box(mesh, [postX, 1.22, -3.66], [0.12, 2.44, 0.12], C.line);
  box(mesh, [postX, 1.22, 3.66], [0.12, 2.44, 0.12], C.line);
  box(mesh, [postX, 2.44, 0], [0.12, 0.12, 7.44], C.line);
  box(mesh, [backX, 0.12, -3.66], [0.08, 0.08, 0.08], C.line);
  box(mesh, [backX, 0.12, 3.66], [0.08, 0.08, 0.08], C.line);
  for (let i = -3; i <= 3; i += 1) {
    box(mesh, [(postX + backX) / 2, 1.15, i * 1.05], [2.1, 0.035, 0.035], C.concreteLight);
  }
  for (let i = 0; i <= 4; i += 1) {
    box(mesh, [(postX + backX) / 2, i * 0.52, -3.65], [2.1, 0.035, 0.035], C.concreteLight);
    box(mesh, [(postX + backX) / 2, i * 0.52, 3.65], [2.1, 0.035, 0.035], C.concreteLight);
  }
}

function buildPitch(mesh: Mesh): void {
  plane(mesh, -61, 61, -42, 42, -0.14, C.grassEdge);
  const stripeWidth = 105 / 20;
  for (let i = 0; i < 20; i += 1) {
    const x = -52.5 + stripeWidth * i;
    plane(mesh, x, x + stripeWidth + 0.02, -34, 34, 0.02, i % 2 ? C.grassA : C.grassB);
  }

  const lineHeight = 0.055;
  const lines: readonly [Vec3, Vec3][] = [
    [[0, 0.11, -34], [105, lineHeight, 0.14]],
    [[0, 0.11, 34], [105, lineHeight, 0.14]],
    [[-52.5, 0.11, 0], [0.14, lineHeight, 68]],
    [[52.5, 0.11, 0], [0.14, lineHeight, 68]],
    [[0, 0.11, 0], [0.14, lineHeight, 68]],
  ];
  for (const [center, size] of lines) box(mesh, center, size, C.line);
  circleLine(mesh, 9.15, 0.14, 0.12, 96, C.line);
  circleLine(mesh, 0.24, 0.24, 0.13, 24, C.line);

  for (const side of [-1, 1] as const) {
    const goalX = side * 52.5;
    const penaltyX = goalX - side * 16.5;
    box(mesh, [penaltyX, 0.11, 0], [0.14, lineHeight, 40.32], C.line);
    box(mesh, [(goalX + penaltyX) / 2, 0.11, -20.16], [16.5, lineHeight, 0.14], C.line);
    box(mesh, [(goalX + penaltyX) / 2, 0.11, 20.16], [16.5, lineHeight, 0.14], C.line);
    circleLine(mesh, 0.20, 0.20, 0.13, 20, C.line);
    buildGoal(mesh, side);
  }

  for (const z of [-38.6, 38.6]) {
    box(mesh, [0, 0.52, z], [24, 0.9, 1.35], C.black);
    box(mesh, [0, 1.03, z], [24, 0.10, 1.6], C.steel);
    for (let x = -8; x <= 8; x += 2) {
      box(mesh, [x, 0.40, z + (z > 0 ? -0.55 : 0.55)], [1.05, 0.42, 0.58], C.seatBlue);
    }
  }
}

function crowdColor(hash: number): Color {
  if (hash > 97) return C.crowdLight;
  if (hash > 88) return C.crowdWarm;
  if (hash > 78) return C.crowdBlue;
  if (hash > 42) return C.crowdMid;
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
  people: number,
  segments: number,
  cut: number,
): void {
  for (let row = 0; row < rows; row += 1) {
    const innerX = baseX + row * rowDepth;
    const innerZ = baseZ + row * rowDepth * 0.72;
    const outerX = innerX + rowDepth * 0.96;
    const outerZ = innerZ + rowDepth * 0.69;
    const y = yStart + row * rise;
    annulus(
      mesh,
      innerX,
      innerZ,
      outerX,
      outerZ,
      y,
      y + 0.08,
      segments,
      row % 5 === 0 ? C.seatBlue : C.seat,
      cut,
    );

    for (let person = 0; person < people; person += 1) {
      const angle = ((person + 0.5) / people) * Math.PI * 2;
      if (Math.sin(angle) > cut - 0.012) continue;
      const hash = (person * 53 + row * 79 + person * row * 3) % 101;
      if (hash < 6) continue;
      const radiusX = innerX + rowDepth * 0.54;
      const radiusZ = innerZ + rowDepth * 0.39;
      const x = Math.cos(angle) * radiusX;
      const z = Math.sin(angle) * radiusZ;
      const scale = 0.92 + ((hash % 11) / 50);
      box(mesh, [x, y + 0.41, z], [0.22 * scale, 0.50 * scale, 0.20 * scale], crowdColor(hash));
      if (hash > 10) {
        box(mesh, [x, y + 0.74, z], [0.16 * scale, 0.17 * scale, 0.16 * scale], hash > 93 ? C.crowdLight : C.crowdDark);
      }
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
    const width = 0.007;
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
  const cut = 0.88;
  annulus(mesh, 100, 71, 117, 85, 37.8, 41.6, segments, C.roof, cut);
  annulus(mesh, 96, 68, 100, 71, 36.9, 37.9, segments, C.roofInner, cut);
  ringWall(mesh, 117, 85, 38.0, 41.7, segments, C.roofInner, cut);

  for (let i = 0; i < 44; i += 1) {
    const angle = (i / 44) * Math.PI * 2;
    if (Math.sin(angle) > 0.86) continue;
    const outer: Vec3 = [Math.cos(angle) * 111, 40.7, Math.sin(angle) * 80.5];
    const inner: Vec3 = [Math.cos(angle) * 98, 37.2, Math.sin(angle) * 69.5];
    box(mesh, outer, [0.25, 4.2, 0.25], C.steel);
    box(
      mesh,
      [(outer[0] + inner[0]) / 2, 39.0, (outer[2] + inner[2]) / 2],
      [0.18, 2.2, 0.18],
      C.steel,
    );
  }

  for (let i = 0; i < 72; i += 1) {
    const angle = (i / 72) * Math.PI * 2;
    if (Math.sin(angle) > 0.84) continue;
    box(mesh, [Math.cos(angle) * 96.5, 36.6, Math.sin(angle) * 68.2], [1.0, 0.30, 0.42], C.flood);
  }
}

function buildArchitecture(mesh: Mesh, segments: number): void {
  const cut = 0.90;

  buildTier(mesh, 58.5, 40.8, 15, 1.12, 0.63, 0.65, 244, segments, cut);
  buildAisles(mesh, 58.5, 40.8, 75.3, 53.2, 0.65, 9.5, 20, cut);
  annulus(mesh, 75.1, 53.1, 77.9, 55.0, 9.3, 9.7, segments, C.led, cut);
  ringWall(mesh, 77.8, 54.9, 9.65, 11.25, segments, C.black, cut);

  buildTier(mesh, 78.8, 55.8, 14, 1.07, 0.70, 11.6, 264, segments, cut);
  buildAisles(mesh, 78.8, 55.8, 93.7, 66.3, 11.6, 21.0, 22, cut);
  annulus(mesh, 93.5, 66.3, 96.0, 68.1, 20.95, 21.4, segments, C.led, cut);
  ringWall(mesh, 95.9, 68.0, 21.35, 22.9, segments, C.black, cut);

  buildTier(mesh, 97.0, 69.3, 13, 1.02, 0.73, 23.2, 282, segments, cut);
  buildAisles(mesh, 97.0, 69.3, 110.2, 78.6, 23.2, 32.3, 24, cut);

  ringWall(mesh, 112.2, 80.2, 0, 5.4, segments, C.black, cut);
  annulus(mesh, 110.6, 78.6, 115.6, 82.7, 5.3, 6.5, segments, C.concrete, cut);
  buildRoof(mesh, segments);

  box(mesh, [0, 28.8, -77.0], [27, 8.5, 1.1], C.black);
  box(mesh, [0, 28.9, -76.4], [23, 5.3, 0.08], C.screen);
  box(mesh, [0, 26.8, -76.3], [17, 0.26, 0.09], C.crowdBlue);
  box(mesh, [0, 31.0, -76.3], [9, 0.20, 0.09], C.led);
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
      out[c * 4 + r] =
        a[r] * b[c * 4] +
        a[4 + r] * b[c * 4 + 1] +
        a[8 + r] * b[c * 4 + 2] +
        a[12 + r] * b[c * 4 + 3];
    }
  }
  return out;
}

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
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
    `attribute vec3 aPosition;attribute vec3 aNormal;attribute vec3 aColor;uniform mat4 uMvp;varying vec3 p,n,c;void main(){p=aPosition;n=normalize(aNormal);c=aColor;gl_Position=uMvp*vec4(aPosition,1.);}`,
  );
  const fragment = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    `precision mediump float;varying vec3 p,n,c;uniform vec3 uCamera;vec3 lamp(vec3 lp,float power,vec3 tint){vec3 d=lp-p;float dist=max(length(d),1.);vec3 l=normalize(d),v=normalize(uCamera-p),h=normalize(l+v);float diff=max(dot(n,l),0.);float spec=pow(max(dot(n,h),0.),34.)*.14;float att=1./(1.+.00022*dist*dist);return tint*(diff+spec)*att*power;}void main(){float pitch=(1.-step(53.3,abs(p.x)))*(1.-step(34.4,abs(p.z)))*(1.-step(.75,p.y));float grain=(sin(p.x*3.7)+sin(p.z*5.9)+sin((p.x-p.z)*2.2))*.0035*pitch;vec3 base=c*(1.+grain),viewDir=normalize(uCamera-p);float up=max(n.y,0.);vec3 col=base*(.11+.18*up);col+=base*lamp(vec3(-92.,41.,-64.),5.1,vec3(1.,.96,.86));col+=base*lamp(vec3(92.,41.,-64.),5.1,vec3(1.,.96,.86));col+=base*lamp(vec3(-92.,41.,64.),4.6,vec3(.93,.97,1.));col+=base*lamp(vec3(92.,41.,64.),4.6,vec3(.93,.97,1.));col+=base*vec3(.18,.20,.15)*pitch;float sheen=pow(max(dot(viewDir,normalize(vec3(-.04,1.,-.06))),0.),12.)*pitch;col+=vec3(.018,.065,.025)*sheen;float lum=max(max(base.r,base.g),base.b);col+=base*smoothstep(.66,1.02,lum)*.60;float rim=pow(1.-max(dot(viewDir,n),0.),3.);col+=vec3(.065,.068,.074)*rim*.13;float fog=smoothstep(190.,360.,length(uCamera-p));col=mix(col,vec3(.010,.014,.020),fog*.07);col=col/(col+vec3(.82));col=pow(col,vec3(.94));gl_FragColor=vec4(col,1.);}`,
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
    const portrait = aspect < 1;
    const zoom = Math.min(1.20, Math.max(0.92, zoom0));
    const angle = (orbit + (portrait ? 3.0 : 7.0)) * Math.PI / 180;
    const radius = (portrait ? 126 : 104) / zoom;
    const cameraHeight = (portrait ? 30.0 : 20.5) / zoom;
    const eye: Vec3 = [Math.sin(angle) * radius, cameraHeight, Math.cos(angle) * radius];
    const target: Vec3 = [0, portrait ? 6.6 : 7.2, -8.0];
    const view = lookAt(eye, target, [0, 1, 0]);
    const projection = perspective((portrait ? 55 : 50) * Math.PI / 180, aspect, 0.35, 380);
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
