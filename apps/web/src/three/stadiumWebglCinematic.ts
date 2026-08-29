import type { CoreVisualMode } from "../api/coreProductContracts";

type Vec3 = readonly [number, number, number];
type Rgb = readonly [number, number, number];
interface Mesh { positions: number[]; normals: number[]; colors: number[]; indices: number[]; }

export interface StadiumWebglRenderer {
  readonly triangleCount: number;
  resize(width: number, height: number, devicePixelRatio: number): void;
  render(orbitDegrees: number, zoom: number): void;
  destroy(): void;
}

const C = {
  grassA: [0.035, 0.34, 0.11] as Rgb,
  grassB: [0.025, 0.25, 0.08] as Rgb,
  white: [0.96, 0.98, 0.97] as Rgb,
  seatBlue: [0.025, 0.10, 0.34] as Rgb,
  seatMid: [0.035, 0.17, 0.52] as Rgb,
  seatBright: [0.055, 0.27, 0.72] as Rgb,
  concrete: [0.28, 0.31, 0.34] as Rgb,
  concreteDark: [0.08, 0.10, 0.12] as Rgb,
  roof: [0.43, 0.47, 0.51] as Rgb,
  roofLight: [0.60, 0.64, 0.68] as Rgb,
  steel: [0.34, 0.38, 0.42] as Rgb,
  black: [0.012, 0.018, 0.028] as Rgb,
  ledBlue: [0.06, 0.34, 1.0] as Rgb,
  ledWhite: [0.72, 0.88, 1.0] as Rgb,
  warm: [1.0, 0.92, 0.70] as Rgb,
  crowdLight: [0.62, 0.72, 0.90] as Rgb,
  crowdBlue: [0.08, 0.25, 0.78] as Rgb,
} as const;

function makeMesh(): Mesh { return { positions: [], normals: [], colors: [], indices: [] }; }
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const normalize = (v: Vec3): Vec3 => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };

function face(m: Mesh, a: Vec3, b: Vec3, c: Vec3, d: Vec3, color: Rgb) {
  const n = normalize(cross(sub(b, a), sub(c, a)));
  const base = m.positions.length / 3;
  for (const v of [a, b, c, d]) {
    m.positions.push(v[0], v[1], v[2]);
    m.normals.push(n[0], n[1], n[2]);
    m.colors.push(color[0], color[1], color[2]);
  }
  m.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
}

function box(m: Mesh, center: Vec3, size: Vec3, color: Rgb) {
  const [x, y, z] = center; const [sx, sy, sz] = size;
  const x0 = x - sx / 2, x1 = x + sx / 2, y0 = y - sy / 2, y1 = y + sy / 2, z0 = z - sz / 2, z1 = z + sz / 2;
  face(m, [x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],color);
  face(m, [x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],color);
  face(m, [x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],color);
  face(m, [x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],color);
  face(m, [x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],color);
  face(m, [x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],color);
}

function plane(m: Mesh, x0: number, x1: number, z0: number, z1: number, y: number, color: Rgb) {
  face(m, [x0,y,z0],[x0,y,z1],[x1,y,z1],[x1,y,z0],color);
}

function ellipseBand(m: Mesh, ix: number, iz: number, ox: number, oz: number, iy: number, oy: number, seg: number, color: Rgb) {
  for (let i = 0; i < seg; i += 1) {
    const a = i / seg * Math.PI * 2, b = (i + 1) / seg * Math.PI * 2;
    face(m,
      [Math.cos(a)*ix, iy, Math.sin(a)*iz],
      [Math.cos(b)*ix, iy, Math.sin(b)*iz],
      [Math.cos(b)*ox, oy, Math.sin(b)*oz],
      [Math.cos(a)*ox, oy, Math.sin(a)*oz], color);
  }
}

function ellipseWall(m: Mesh, rx: number, rz: number, y0: number, y1: number, seg: number, color: Rgb) {
  for (let i = 0; i < seg; i += 1) {
    const a = i / seg * Math.PI * 2, b = (i + 1) / seg * Math.PI * 2;
    face(m,
      [Math.cos(a)*rx,y0,Math.sin(a)*rz],
      [Math.cos(a)*rx,y1,Math.sin(a)*rz],
      [Math.cos(b)*rx,y1,Math.sin(b)*rz],
      [Math.cos(b)*rx,y0,Math.sin(b)*rz], color);
  }
}

function circleLine(m: Mesh, r: number, width: number, y: number, seg: number, color: Rgb) {
  for (let i=0;i<seg;i+=1) {
    const a=i/seg*Math.PI*2,b=(i+1)/seg*Math.PI*2,ri=r-width/2,ro=r+width/2;
    face(m,[Math.cos(a)*ri,y,Math.sin(a)*ri],[Math.cos(b)*ri,y,Math.sin(b)*ri],[Math.cos(b)*ro,y,Math.sin(b)*ro],[Math.cos(a)*ro,y,Math.sin(a)*ro],color);
  }
}

function pitch(m: Mesh, detail: number) {
  plane(m,-61,61,-42,42,-0.15,C.concreteDark);
  for (let i=0;i<12;i+=1) {
    const x0=-52.5+i*8.75;
    plane(m,x0,x0+8.76,-34,34,0.08,i%2===0?C.grassA:C.grassB);
  }
  const h=0.12;
  box(m,[0,.18,-34],[105,h,.22],C.white); box(m,[0,.18,34],[105,h,.22],C.white);
  box(m,[-52.5,.18,0],[.22,h,68],C.white); box(m,[52.5,.18,0],[.22,h,68],C.white); box(m,[0,.18,0],[.22,h,68],C.white);
  circleLine(m,9.15,.22,.20,Math.max(48,Math.floor(detail/2)),C.white);
  box(m,[0,.22,0],[.34,.10,.34],C.white);
  for (const s of [-1,1] as const) {
    const gx=s*52.5, px=gx-s*16.5, ax=gx-s*5.5;
    box(m,[px,.18,0],[.22,h,40.32],C.white); box(m,[(gx+px)/2,.18,-20.16],[16.5,h,.22],C.white); box(m,[(gx+px)/2,.18,20.16],[16.5,h,.22],C.white);
    box(m,[ax,.18,0],[.22,h,18.32],C.white); box(m,[(gx+ax)/2,.18,-9.16],[5.5,h,.22],C.white); box(m,[(gx+ax)/2,.18,9.16],[5.5,h,.22],C.white);
    const post=gx+s*.22;
    box(m,[post,1.25,-3.66],[.16,2.5,.16],C.white); box(m,[post,1.25,3.66],[.16,2.5,.16],C.white); box(m,[post,2.5,0],[.16,.16,7.5],C.white);
    for (let j=-3;j<=3;j+=1) box(m,[gx+s*1.45,1.08,j*1.05],[.045,2.16,.045],C.crowdLight);
    for (let j=0;j<5;j+=1) { box(m,[gx+s*(.25+j*.30),1.08,-3.66],[.045,2.16,.045],C.crowdLight); box(m,[gx+s*(.25+j*.30),1.08,3.66],[.045,2.16,.045],C.crowdLight); }
  }
}

interface TierSpec { innerX:number; innerZ:number; rows:number; rowDepth:number; rise:number; baseY:number; colorA:Rgb; colorB:Rgb; }
function steppedTier(m: Mesh, spec: TierSpec, seg: number, crowdStride: number) {
  const {innerX,innerZ,rows,rowDepth,rise,baseY,colorA,colorB}=spec;
  for (let row=0;row<rows;row+=1) {
    const t=row/(Math.max(rows-1,1));
    const ix=innerX+row*rowDepth, iz=innerZ+row*rowDepth*.73;
    const ox=ix+rowDepth*.92, oz=iz+rowDepth*.67;
    const y=baseY+row*rise;
    const color:Rgb=[colorA[0]+(colorB[0]-colorA[0])*t,colorA[1]+(colorB[1]-colorA[1])*t,colorA[2]+(colorB[2]-colorA[2])*t];
    ellipseBand(m,ix,iz,ox,oz,y,y+rise*.18,seg,color);
    if (row%2===0) ellipseWall(m,ox,oz,y-.30,y+.18,seg,C.concreteDark);
    const seats=Math.max(24,Math.floor(seg/crowdStride));
    for (let i=0;i<seats;i+=1) {
      if ((i+row*3)%13===0) continue;
      const a=(i+.5)/seats*Math.PI*2;
      const rX=ix+rowDepth*.53, rZ=iz+rowDepth*.39;
      const c=(i+row)%7===0?C.crowdLight:((i+row)%3===0?C.crowdBlue:C.seatBright);
      box(m,[Math.cos(a)*rX,y+.50,Math.sin(a)*rZ],[.26,.70,.26],c);
    }
  }
}

function aisles(m: Mesh, innerX:number, innerZ:number, outerX:number, outerZ:number, y0:number, y1:number, count:number) {
  for (let i=0;i<count;i+=1) {
    const a=i/count*Math.PI*2,w=.010;
    face(m,
      [Math.cos(a-w)*innerX,y0,Math.sin(a-w)*innerZ],
      [Math.cos(a+w)*innerX,y0,Math.sin(a+w)*innerZ],
      [Math.cos(a+w)*outerX,y1,Math.sin(a+w)*outerZ],
      [Math.cos(a-w)*outerX,y1,Math.sin(a-w)*outerZ],C.concrete);
  }
}

function ledRibbon(m: Mesh, rx:number, rz:number, y:number, seg:number) {
  for (let i=0;i<seg;i+=1) {
    const a=i/seg*Math.PI*2,b=(i+1)/seg*Math.PI*2;
    const color=i%11===0?C.ledWhite:C.ledBlue;
    face(m,[Math.cos(a)*rx,y,Math.sin(a)*rz],[Math.cos(a)*rx,y+.75,Math.sin(a)*rz],[Math.cos(b)*rx,y+.75,Math.sin(b)*rz],[Math.cos(b)*rx,y,Math.sin(b)*rz],color);
  }
}

function roof(m: Mesh, seg:number) {
  ellipseBand(m,90,64,116,85,35.5,41.5,seg,C.roof);
  ellipseBand(m,88,62,92,66,35.0,35.6,seg,C.black);
  for (let i=0;i<40;i+=1) {
    const a=i/40*Math.PI*2;
    const x=Math.cos(a), z=Math.sin(a);
    box(m,[x*104,38.1,z*76],[.50,6.6,.50],C.roofLight);
    box(m,[x*94,35.4,z*67],[.36,2.4,.36],C.steel);
  }
}

function facadeAndTunnel(m: Mesh, seg:number) {
  ellipseWall(m,112,82,-1.3,5.2,seg,C.concreteDark);
  ellipseBand(m,109,79,114,84,5.0,7.3,seg,C.concreteDark);
  for (let i=0;i<36;i+=1) {
    const a=i/36*Math.PI*2;
    const color=i%4===0?C.warm:C.black;
    box(m,[Math.cos(a)*111,2.4,Math.sin(a)*81],[1.65,3.4,.36],color);
  }
  box(m,[0,2.0,82.0],[18,4.0,2.0],C.black);
  box(m,[0,5.0,81.6],[20,.45,1.0],C.ledBlue);
  box(m,[0,1.4,44.0],[10,2.8,1.8],C.black);
  box(m,[0,3.1,44.0],[12,.34,1.8],C.ledBlue);
}

function benches(m: Mesh) {
  for (const z of [-39.0,39.0]) {
    box(m,[0,.90,z],[18,1.5,2.0],C.concreteDark);
    box(m,[0,1.95,z],[18,.16,2.8],C.roofLight);
    for (let i=-7;i<=7;i+=2) box(m,[i,.65,z+(z>0?-1:1)*.35],[1.0,.45,.75],C.seatBright);
  }
}

function scoreboard(m: Mesh) {
  box(m,[0,29.5,-80.5],[28,10.0,1.3],C.black);
  box(m,[0,29.5,-79.75],[24,7.0,.12],[0.02,0.07,0.18]);
  box(m,[0,25.8,-79.55],[18,.42,.10],C.ledBlue);
  box(m,[-55,24,-67],[12,6,.8],C.black); box(m,[55,24,-67],[12,6,.8],C.black);
}

function floodlights(m: Mesh) {
  for (const x of [-103,103]) for (const z of [-74,74]) {
    box(m,[x,21,z],[.72,42,.72],C.steel);
    box(m,[x+(x>0?-2.2:2.2),42,z+(z>0?-1.4:1.4)],[10,3.2,1.0],C.concreteDark);
    for (let col=0;col<6;col+=1) for (let row=0;row<3;row+=1) {
      box(m,[x+(x>0?-1:1)*(1.0+col*1.35),43-row*1.0,z+(z>0?-1:1)*1.75],[.92,.62,.24],C.warm);
    }
  }
}

function build(mode: Exclude<CoreVisualMode,"STATIC">): Mesh {
  const m=makeMesh();
  const seg=mode==="FULL"?128:mode==="FAST"?96:64;
  const crowdStride=mode==="LIGHT"?8:6;
  pitch(m,seg);
  facadeAndTunnel(m,seg);
  steppedTier(m,{innerX:61,innerZ:43,rows:10,rowDepth:1.55,rise:.95,baseY:1.0,colorA:C.seatBlue,colorB:C.seatMid},seg,crowdStride);
  aisles(m,61,43,76,54,1.0,10.0,28);
  ledRibbon(m,77.4,55.0,10.7,seg);
  steppedTier(m,{innerX:78,innerZ:56,rows:10,rowDepth:1.40,rise:1.0,baseY:12.0,colorA:C.seatMid,colorB:C.seatBright},seg,crowdStride);
  aisles(m,78,56,92,66,12.0,21.5,32);
  ledRibbon(m,93.0,66.8,22.0,seg);
  steppedTier(m,{innerX:94,innerZ:68,rows:9,rowDepth:1.45,rise:1.05,baseY:23.3,colorA:C.seatBlue,colorB:C.seatMid},seg,crowdStride);
  aisles(m,94,68,107,77,23.3,32.0,36);
  benches(m); scoreboard(m); roof(m,seg); floodlights(m);
  return m;
}

function perspective(fov:number,aspect:number,near:number,far:number) {
  const f=1/Math.tan(fov/2), nf=1/(near-far);
  return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0]);
}
const dot=(a:Vec3,b:Vec3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
function lookAt(eye:Vec3,target:Vec3,up:Vec3) {
  const z=normalize(sub(eye,target)),x=normalize(cross(up,z)),y=cross(z,x);
  return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);
}
function multiply(a:Float32Array,b:Float32Array) {
  const o=new Float32Array(16);
  for(let c=0;c<4;c+=1) for(let r=0;r<4;r+=1) o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];
  return o;
}
function compile(gl:WebGLRenderingContext,type:number,source:string) {
  const s=gl.createShader(type); if(!s) throw new Error("STADIUM_SHADER_CREATE_FAILED");
  gl.shaderSource(s,source); gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)??"shader");
  return s;
}
function createProgram(gl:WebGLRenderingContext) {
  const vs=compile(gl,gl.VERTEX_SHADER,`attribute vec3 aPosition;attribute vec3 aNormal;attribute vec3 aColor;uniform mat4 uMvp;uniform vec3 uLightDirection;varying vec3 vColor;varying float vDiffuse;varying float vHeight;void main(){vec3 n=normalize(aNormal);float d=max(dot(n,normalize(uLightDirection)),0.0);vDiffuse=.46+d*.54;vColor=aColor;vHeight=aPosition.y;gl_Position=uMvp*vec4(aPosition,1.0);}`);
  const fs=compile(gl,gl.FRAGMENT_SHADER,`precision mediump float;varying vec3 vColor;varying float vDiffuse;varying float vHeight;void main(){float bright=max(max(vColor.r,vColor.g),vColor.b);float emission=smoothstep(.72,.98,bright)*.42;float heightGlow=clamp(vHeight/50.0,0.0,1.0)*.04;vec3 color=vColor*(vDiffuse+emission)+vec3(.012,.018,.032)+heightGlow*vec3(.06,.08,.12);gl_FragColor=vec4(color,1.0);}`);
  const p=gl.createProgram(); if(!p) throw new Error("STADIUM_PROGRAM_CREATE_FAILED");
  gl.attachShader(p,vs); gl.attachShader(p,fs); gl.linkProgram(p); gl.deleteShader(vs); gl.deleteShader(fs);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)??"link");
  return p;
}
function arrayBuffer(gl:WebGLRenderingContext,data:number[]) { const b=gl.createBuffer(); if(!b) throw new Error("STADIUM_BUFFER_CREATE_FAILED"); gl.bindBuffer(gl.ARRAY_BUFFER,b); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW); return b; }

export function createStadiumWebglRenderer(canvas:HTMLCanvasElement,mode:Exclude<CoreVisualMode,"STATIC">):StadiumWebglRenderer|null {
  if(typeof window.WebGLRenderingContext==="undefined") return null;
  const gl=canvas.getContext("webgl",{alpha:true,antialias:true,depth:true,premultipliedAlpha:false,powerPreference:mode==="FULL"?"high-performance":"default"});
  if(!gl) return null;
  const m=build(mode),p=createProgram(gl),pb=arrayBuffer(gl,m.positions),nb=arrayBuffer(gl,m.normals),cb=arrayBuffer(gl,m.colors),ib=gl.createBuffer();
  if(!ib) throw new Error("STADIUM_INDEX_BUFFER_CREATE_FAILED");
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);
  const maxIndex=m.indices.reduce((a,b)=>Math.max(a,b),0),uint=maxIndex>65535;
  if(uint&&!gl.getExtension("OES_element_index_uint")) throw new Error("STADIUM_INDEX_RANGE_UNSUPPORTED");
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,uint?new Uint32Array(m.indices):new Uint16Array(m.indices),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(p,"aPosition"),nor=gl.getAttribLocation(p,"aNormal"),col=gl.getAttribLocation(p,"aColor"),mvp=gl.getUniformLocation(p,"uMvp"),light=gl.getUniformLocation(p,"uLightDirection");
  if(pos<0||nor<0||col<0||!mvp||!light) throw new Error("STADIUM_SHADER_LOCATION_FAILED");
  let vw=1,vh=1;
  gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.disable(gl.CULL_FACE);
  const bind=(b:WebGLBuffer,loc:number)=>{gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);};
  function resize(width:number,height:number,dpr:number){const w=Math.max(1,Math.round(width*Math.min(dpr,2))),h=Math.max(1,Math.round(height*Math.min(dpr,2)));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}vw=w;vh=h;gl.viewport(0,0,w,h);}
  function render(orbitDegrees:number,zoom:number){const orbit=orbitDegrees*Math.PI/180,z=Math.min(1.14,Math.max(.92,zoom)),aspect=vw/vh,portrait=aspect<1,radius=(portrait?245:185)/z,height=(portrait?128:92)/z;const eye:Vec3=[Math.sin(orbit)*radius,height,Math.cos(orbit)*radius],target:Vec3=[0,9,0],view=lookAt(eye,target,[0,1,0]),projection=perspective((portrait?55:46)*Math.PI/180,aspect,1,520),matrix=multiply(projection,view);gl.clearColor(0,0,0,0);gl.clearDepth(1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(p);bind(pb,pos);bind(nb,nor);bind(cb,col);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.uniformMatrix4fv(mvp,false,matrix);gl.uniform3f(light,-.32,.92,.42);gl.drawElements(gl.TRIANGLES,m.indices.length,uint?gl.UNSIGNED_INT:gl.UNSIGNED_SHORT,0);}
  function destroy(){gl.deleteBuffer(pb);gl.deleteBuffer(nb);gl.deleteBuffer(cb);gl.deleteBuffer(ib);gl.deleteProgram(p);}
  return{triangleCount:m.indices.length/3,resize,render,destroy};
}
