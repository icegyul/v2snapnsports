import type { CoreVisualMode } from "../api/coreProductContracts";

type Vec3 = readonly [number, number, number];
type Rgb = readonly [number, number, number];

interface MeshData {
  positions: number[];
  normals: number[];
  colors: number[];
  indices: number[];
}

export interface StadiumWebglRenderer {
  readonly triangleCount: number;
  resize(width: number, height: number, devicePixelRatio: number): void;
  render(orbitDegrees: number, zoom: number): void;
  destroy(): void;
}

const palette = {
  exterior: [0.115, 0.132, 0.142] as Rgb,
  concrete: [0.19, 0.215, 0.23] as Rgb,
  seatA: [0.22, 0.245, 0.255] as Rgb,
  seatB: [0.27, 0.295, 0.305] as Rgb,
  roof: [0.31, 0.335, 0.345] as Rgb,
  pitchA: [0.055, 0.29, 0.15] as Rgb,
  pitchB: [0.065, 0.34, 0.18] as Rgb,
  line: [0.88, 0.91, 0.9] as Rgb,
  metal: [0.43, 0.46, 0.47] as Rgb,
  light: [0.92, 0.95, 0.91] as Rgb,
  accent: [0.384, 0.827, 0.427] as Rgb,
} as const;

function createMesh(): MeshData {
  return { positions: [], normals: [], colors: [], indices: [] };
}

function subtract(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function normalize(v: Vec3): Vec3 {
  const length = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
}

function addFace(mesh: MeshData, a: Vec3, b: Vec3, c: Vec3, d: Vec3, color: Rgb): void {
  const normal = normalize(cross(subtract(b, a), subtract(c, a)));
  const base = mesh.positions.length / 3;
  for (const vertex of [a, b, c, d]) {
    mesh.positions.push(vertex[0], vertex[1], vertex[2]);
    mesh.normals.push(normal[0], normal[1], normal[2]);
    mesh.colors.push(color[0], color[1], color[2]);
  }
  mesh.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
}

function addBox(mesh: MeshData, center: Vec3, size: Vec3, color: Rgb): void {
  const [cx, cy, cz] = center;
  const [sx, sy, sz] = size;
  const x0 = cx - sx / 2;
  const x1 = cx + sx / 2;
  const y0 = cy - sy / 2;
  const y1 = cy + sy / 2;
  const z0 = cz - sz / 2;
  const z1 = cz + sz / 2;

  addFace(mesh, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], color);
  addFace(mesh, [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], color);
  addFace(mesh, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], color);
  addFace(mesh, [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], color);
  addFace(mesh, [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], color);
  addFace(mesh, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], color);
}

function addPlane(mesh: MeshData, x0: number, x1: number, z0: number, z1: number, y: number, color: Rgb): void {
  addFace(mesh, [x0, y, z0], [x0, y, z1], [x1, y, z1], [x1, y, z0], color);
}

function mixColor(a: Rgb, b: Rgb, amount: number): Rgb {
  return [
    a[0] + (b[0] - a[0]) * amount,
    a[1] + (b[1] - a[1]) * amount,
    a[2] + (b[2] - a[2]) * amount,
  ];
}

function addEllipticalBand(
  mesh: MeshData,
  innerX: number,
  innerZ: number,
  outerX: number,
  outerZ: number,
  innerY: number,
  outerY: number,
  segments: number,
  colorA: Rgb,
  colorB: Rgb,
): void {
  for (let index = 0; index < segments; index += 1) {
    const a0 = (index / segments) * Math.PI * 2;
    const a1 = ((index + 1) / segments) * Math.PI * 2;
    const inner0: Vec3 = [Math.cos(a0) * innerX, innerY, Math.sin(a0) * innerZ];
    const inner1: Vec3 = [Math.cos(a1) * innerX, innerY, Math.sin(a1) * innerZ];
    const outer1: Vec3 = [Math.cos(a1) * outerX, outerY, Math.sin(a1) * outerZ];
    const outer0: Vec3 = [Math.cos(a0) * outerX, outerY, Math.sin(a0) * outerZ];
    const color = mixColor(colorA, colorB, (index % 6) / 5);
    addFace(mesh, inner0, inner1, outer1, outer0, color);
  }
}

function addEllipticalWall(
  mesh: MeshData,
  radiusX: number,
  radiusZ: number,
  yBottom: number,
  yTop: number,
  segments: number,
  color: Rgb,
): void {
  for (let index = 0; index < segments; index += 1) {
    const a0 = (index / segments) * Math.PI * 2;
    const a1 = ((index + 1) / segments) * Math.PI * 2;
    const bottom0: Vec3 = [Math.cos(a0) * radiusX, yBottom, Math.sin(a0) * radiusZ];
    const top0: Vec3 = [Math.cos(a0) * radiusX, yTop, Math.sin(a0) * radiusZ];
    const top1: Vec3 = [Math.cos(a1) * radiusX, yTop, Math.sin(a1) * radiusZ];
    const bottom1: Vec3 = [Math.cos(a1) * radiusX, yBottom, Math.sin(a1) * radiusZ];
    addFace(mesh, bottom0, top0, top1, bottom1, color);
  }
}

function addCircleLine(mesh: MeshData, radius: number, width: number, y: number, segments: number, color: Rgb): void {
  for (let index = 0; index < segments; index += 1) {
    const a0 = (index / segments) * Math.PI * 2;
    const a1 = ((index + 1) / segments) * Math.PI * 2;
    const inner = radius - width / 2;
    const outer = radius + width / 2;
    addFace(
      mesh,
      [Math.cos(a0) * inner, y, Math.sin(a0) * inner],
      [Math.cos(a1) * inner, y, Math.sin(a1) * inner],
      [Math.cos(a1) * outer, y, Math.sin(a1) * outer],
      [Math.cos(a0) * outer, y, Math.sin(a0) * outer],
      color,
    );
  }
}

function addPitch(mesh: MeshData, detail: number): void {
  addPlane(mesh, -60, 60, -42, 42, 0, [0.045, 0.08, 0.06]);
  const fieldLength = 105;
  const fieldWidth = 68;
  const stripeCount = detail >= 70 ? 10 : 8;
  const stripeWidth = fieldLength / stripeCount;
  for (let index = 0; index < stripeCount; index += 1) {
    const x0 = -fieldLength / 2 + index * stripeWidth;
    const x1 = x0 + stripeWidth + 0.01;
    addPlane(mesh, x0, x1, -fieldWidth / 2, fieldWidth / 2, 0.17, index % 2 === 0 ? palette.pitchA : palette.pitchB);
  }

  const lineHeight = 0.28;
  addBox(mesh, [0, 0.26, -fieldWidth / 2], [fieldLength, lineHeight, 0.34], palette.line);
  addBox(mesh, [0, 0.26, fieldWidth / 2], [fieldLength, lineHeight, 0.34], palette.line);
  addBox(mesh, [-fieldLength / 2, 0.26, 0], [0.34, lineHeight, fieldWidth], palette.line);
  addBox(mesh, [fieldLength / 2, 0.26, 0], [0.34, lineHeight, fieldWidth], palette.line);
  addBox(mesh, [0, 0.26, 0], [0.34, lineHeight, fieldWidth], palette.line);
  addCircleLine(mesh, 9.15, 0.34, 0.28, Math.max(28, Math.floor(detail / 2)), palette.line);
  addBox(mesh, [0, 0.31, 0], [0.62, 0.2, 0.62], palette.line);

  const penaltyDepth = 16.5;
  const penaltyWidth = 40.32;
  const goalAreaDepth = 5.5;
  const goalAreaWidth = 18.32;
  for (const side of [-1, 1] as const) {
    const goalX = side * fieldLength / 2;
    const penaltyInnerX = goalX - side * penaltyDepth;
    const goalAreaInnerX = goalX - side * goalAreaDepth;
    addBox(mesh, [penaltyInnerX, 0.26, 0], [0.34, lineHeight, penaltyWidth], palette.line);
    addBox(mesh, [(goalX + penaltyInnerX) / 2, 0.26, -penaltyWidth / 2], [penaltyDepth, lineHeight, 0.34], palette.line);
    addBox(mesh, [(goalX + penaltyInnerX) / 2, 0.26, penaltyWidth / 2], [penaltyDepth, lineHeight, 0.34], palette.line);
    addBox(mesh, [goalAreaInnerX, 0.26, 0], [0.34, lineHeight, goalAreaWidth], palette.line);
    addBox(mesh, [(goalX + goalAreaInnerX) / 2, 0.26, -goalAreaWidth / 2], [goalAreaDepth, lineHeight, 0.34], palette.line);
    addBox(mesh, [(goalX + goalAreaInnerX) / 2, 0.26, goalAreaWidth / 2], [goalAreaDepth, lineHeight, 0.34], palette.line);

    const postX = goalX + side * 0.2;
    addBox(mesh, [postX, 1.4, -3.66], [0.22, 2.8, 0.22], palette.line);
    addBox(mesh, [postX, 1.4, 3.66], [0.22, 2.8, 0.22], palette.line);
    addBox(mesh, [postX, 2.72, 0], [0.22, 0.22, 7.54], palette.line);
    addBox(mesh, [goalX + side * 1.6, 0.85, -3.66], [0.16, 1.7, 0.16], palette.metal);
    addBox(mesh, [goalX + side * 1.6, 0.85, 3.66], [0.16, 1.7, 0.16], palette.metal);
  }
}

function addFloodlight(mesh: MeshData, x: number, z: number): void {
  const inwardX = x > 0 ? -1 : 1;
  const inwardZ = z > 0 ? -1 : 1;
  addBox(mesh, [x, 22, z], [0.9, 44, 0.9], palette.metal);
  addBox(mesh, [x + inwardX * 1.2, 44, z + inwardZ * 0.9], [8.5, 4.2, 1.2], palette.concrete);
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      addBox(
        mesh,
        [x + inwardX * (3.8 - col * 1.7), 44.9 - row * 1.45, z + inwardZ * 1.55],
        [1.1, 0.82, 0.26],
        palette.light,
      );
    }
  }
}

function buildStadiumMesh(mode: Exclude<CoreVisualMode, "STATIC">): MeshData {
  const mesh = createMesh();
  const segments = mode === "FULL" ? 96 : mode === "FAST" ? 72 : 40;

  addPitch(mesh, segments);
  addEllipticalWall(mesh, 111, 81, -2.4, 30, segments, palette.exterior);
  addEllipticalBand(mesh, 63, 45, 79, 58, 1.5, 11.5, segments, palette.seatA, palette.seatB);
  addEllipticalBand(mesh, 80, 59, 94, 69, 12, 22.5, segments, palette.seatB, palette.concrete);
  addEllipticalBand(mesh, 95, 70, 108, 79, 23, 31.5, segments, palette.seatA, palette.seatB);
  addEllipticalWall(mesh, 63, 45, 0, 2.2, segments, palette.concrete);
  addEllipticalWall(mesh, 80, 59, 10.8, 13, segments, palette.concrete);
  addEllipticalWall(mesh, 95, 70, 21.3, 24, segments, palette.concrete);
  addEllipticalBand(mesh, 95, 69, 113, 83, 33.2, 37.6, segments, palette.roof, palette.concrete);

  const supportCount = mode === "LIGHT" ? 8 : 16;
  for (let index = 0; index < supportCount; index += 1) {
    const angle = (index / supportCount) * Math.PI * 2;
    const x = Math.cos(angle) * 105;
    const z = Math.sin(angle) * 76;
    addBox(mesh, [x, 18.5, z], [0.75, 34, 0.75], palette.metal);
  }

  addBox(mesh, [0, 30, -82], [29, 10, 2.3], [0.065, 0.075, 0.08]);
  addBox(mesh, [0, 30, -80.7], [19, 1.15, 0.3], palette.accent);

  addFloodlight(mesh, -105, -76);
  addFloodlight(mesh, 105, -76);
  addFloodlight(mesh, -105, 76);
  addFloodlight(mesh, 105, 76);

  return mesh;
}

function perspective(fovRadians: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1 / Math.tan(fovRadians / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function lookAt(eye: Vec3, target: Vec3, up: Vec3): Float32Array {
  const z = normalize(subtract(eye, target));
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
  if (!shader) throw new Error("STADIUM_SHADER_CREATE_FAILED");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "unknown shader error";
    gl.deleteShader(shader);
    throw new Error(`STADIUM_SHADER_COMPILE_FAILED: ${message}`);
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec3 aColor;
    uniform mat4 uMvp;
    uniform vec3 uLightDirection;
    varying vec3 vColor;
    varying float vLight;
    void main() {
      vec3 normal = normalize(aNormal);
      float diffuse = max(dot(normal, normalize(uLightDirection)), 0.0);
      vLight = 0.50 + diffuse * 0.50;
      vColor = aColor;
      gl_Position = uMvp * vec4(aPosition, 1.0);
    }
  `);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, `
    precision mediump float;
    varying vec3 vColor;
    varying float vLight;
    void main() {
      gl_FragColor = vec4(vColor * vLight, 1.0);
    }
  `);
  const program = gl.createProgram();
  if (!program) throw new Error("STADIUM_PROGRAM_CREATE_FAILED");
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? "unknown link error";
    gl.deleteProgram(program);
    throw new Error(`STADIUM_PROGRAM_LINK_FAILED: ${message}`);
  }
  return program;
}

function createArrayBuffer(gl: WebGLRenderingContext, data: number[]): WebGLBuffer {
  const buffer = gl.createBuffer();
  if (!buffer) throw new Error("STADIUM_BUFFER_CREATE_FAILED");
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  return buffer;
}

export function createStadiumWebglRenderer(
  canvas: HTMLCanvasElement,
  mode: Exclude<CoreVisualMode, "STATIC">,
): StadiumWebglRenderer | null {
  if (typeof window.WebGLRenderingContext === "undefined") return null;
  const context = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    depth: true,
    premultipliedAlpha: false,
    powerPreference: mode === "FULL" ? "high-performance" : "default",
  });
  if (!context) return null;
  const gl: WebGLRenderingContext = context;

  const mesh = buildStadiumMesh(mode);
  const program = createProgram(gl);
  const positionBuffer = createArrayBuffer(gl, mesh.positions);
  const normalBuffer = createArrayBuffer(gl, mesh.normals);
  const colorBuffer = createArrayBuffer(gl, mesh.colors);
  const indexBuffer = gl.createBuffer();
  if (!indexBuffer) throw new Error("STADIUM_INDEX_BUFFER_CREATE_FAILED");
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  const maxIndex = mesh.indices.reduce((maximum, index) => Math.max(maximum, index), 0);
  const supportsUint = Boolean(gl.getExtension("OES_element_index_uint"));
  const useUint32 = maxIndex > 65535;
  if (useUint32 && !supportsUint) {
    throw new Error("STADIUM_INDEX_RANGE_UNSUPPORTED");
  }
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    useUint32 ? new Uint32Array(mesh.indices) : new Uint16Array(mesh.indices),
    gl.STATIC_DRAW,
  );

  const positionLocation = gl.getAttribLocation(program, "aPosition");
  const normalLocation = gl.getAttribLocation(program, "aNormal");
  const colorLocation = gl.getAttribLocation(program, "aColor");
  const mvpLocation = gl.getUniformLocation(program, "uMvp");
  const lightLocation = gl.getUniformLocation(program, "uLightDirection");
  if (positionLocation < 0 || normalLocation < 0 || colorLocation < 0 || !mvpLocation || !lightLocation) {
    throw new Error("STADIUM_SHADER_LOCATION_FAILED");
  }

  let viewportWidth = 1;
  let viewportHeight = 1;

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.disable(gl.CULL_FACE);

  function bindAttribute(buffer: WebGLBuffer, location: number): void {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
  }

  function resize(width: number, height: number, devicePixelRatio: number): void {
    const safeWidth = Math.max(1, Math.round(width * Math.min(devicePixelRatio, 2)));
    const safeHeight = Math.max(1, Math.round(height * Math.min(devicePixelRatio, 2)));
    if (canvas.width !== safeWidth || canvas.height !== safeHeight) {
      canvas.width = safeWidth;
      canvas.height = safeHeight;
    }
    viewportWidth = safeWidth;
    viewportHeight = safeHeight;
    gl.viewport(0, 0, safeWidth, safeHeight);
  }

  function render(orbitDegrees: number, zoom: number): void {
    const orbitRadians = (orbitDegrees * Math.PI) / 180;
    const clampedZoom = Math.min(1.14, Math.max(0.92, zoom));
    const aspect = viewportWidth / viewportHeight;
    const portrait = aspect < 1;
    const radius = (portrait ? 305 : 220) / clampedZoom;
    const eyeHeight = (portrait ? 158 : 118) / clampedZoom;
    const eye: Vec3 = [Math.sin(orbitRadians) * radius, eyeHeight, Math.cos(orbitRadians) * radius];
    const target: Vec3 = [0, 10, 0];
    const view = lookAt(eye, target, [0, 1, 0]);
    const verticalFov = portrait ? 58 : 43;
    const projection = perspective((verticalFov * Math.PI) / 180, aspect, 1, 620);
    const mvp = multiply(projection, view);

    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    bindAttribute(positionBuffer, positionLocation);
    bindAttribute(normalBuffer, normalLocation);
    bindAttribute(colorBuffer, colorLocation);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.uniformMatrix4fv(mvpLocation, false, mvp);
    gl.uniform3f(lightLocation, -0.35, 0.9, 0.45);
    gl.drawElements(gl.TRIANGLES, mesh.indices.length, useUint32 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0);
  }

  function destroy(): void {
    gl.deleteBuffer(positionBuffer);
    gl.deleteBuffer(normalBuffer);
    gl.deleteBuffer(colorBuffer);
    gl.deleteBuffer(indexBuffer);
    gl.deleteProgram(program);
  }

  return { triangleCount: mesh.indices.length / 3, resize, render, destroy };
}
