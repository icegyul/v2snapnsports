/* eslint-disable no-undef */
import type { CoreVisualMode } from "../api/coreProductContracts";

type Vec3 = readonly [number, number, number];
type Rgb = readonly [number, number, number];
interface Mesh { positions:number[]; normals:number[]; colors:number[]; indices:number[] }
export interface StadiumWebglRenderer { readonly triangleCount:number; resize(width:number,height:number,devicePixelRatio:number):void; render(orbitDegrees:number,zoom:number):void; destroy():void }

const C = {
  grassA:[0.018,0.26,0.055] as Rgb, grassB:[0.012,0.18,0.038] as Rgb,
  white:[0.92,0.95,0.98] as Rgb, seatDark:[0.008,0.022,0.075] as Rgb,
  seat:[0.015,0.12,0.42] as Rgb, seatBright:[0.025,0.34,0.95] as Rgb,
  concrete:[0.16,0.19,0.23] as Rgb, dark:[0.025,0.032,0.045] as Rgb,
  roof:[0.20,0.23,0.28] as Rgb, steel:[0.36,0.42,0.49] as Rgb,
  black:[0.003,0.005,0.01] as Rgb, led:[0.03,0.30,1.0] as Rgb,
  ledWhite:[0.78,0.92,1.0] as Rgb, warm:[1.0,0.88,0.58] as Rgb,
  crowd:[0.48,0.60,0.82] as Rgb, crowdWhite:[0.82,0.88,0.95] as Rgb,
} as const;

const mesh=():Mesh=>({positions:[],normals:[],colors:[],indices:[]});
const sub=(a:Vec3,b:Vec3):Vec3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const cross=(a:Vec3,b:Vec3):Vec3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=(v:Vec3):Vec3=>{const l=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/l,v[1]/l,v[2]/l]};
function face(m:Mesh,a:Vec3,b:Vec3,c:Vec3,d:Vec3,col:Rgb){const n=norm(cross(sub(b,a),sub(c,a))),i=m.positions.length/3;for(const v of[a,b,c,d]){m.positions.push(...v);m.normals.push(...n);m.colors.push(...col)}m.indices.push(i,i+1,i+2,i,i+2,i+3)}
function box(m:Mesh,[x,y,z]:Vec3,[sx,sy,sz]:Vec3,c:Rgb){const x0=x-sx/2,x1=x+sx/2,y0=y-sy/2,y1=y+sy/2,z0=z-sz/2,z1=z+sz/2;face(m,[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],c);face(m,[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],c);face(m,[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],c);face(m,[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],c);face(m,[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],c);face(m,[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],c)}
function plane(m:Mesh,x0:number,x1:number,z0:number,z1:number,y:number,c:Rgb){face(m,[x0,y,z0],[x0,y,z1],[x1,y,z1],[x1,y,z0],c)}
function band(m:Mesh,ix:number,iz:number,ox:number,oz:number,iy:number,oy:number,seg:number,c:Rgb,frontCut=9){for(let i=0;i<seg;i++){const a=i/seg*Math.PI*2,b=(i+1)/seg*Math.PI*2,mid=(a+b)/2;if(Math.sin(mid)>frontCut)continue;face(m,[Math.cos(a)*ix,iy,Math.sin(a)*iz],[Math.cos(b)*ix,iy,Math.sin(b)*iz],[Math.cos(b)*ox,oy,Math.sin(b)*oz],[Math.cos(a)*ox,oy,Math.sin(a)*oz],c)}}
function wall(m:Mesh,rx:number,rz:number,y0:number,y1:number,seg:number,c:Rgb){for(let i=0;i<seg;i++){const a=i/seg*Math.PI*2,b=(i+1)/seg*Math.PI*2;face(m,[Math.cos(a)*rx,y0,Math.sin(a)*rz],[Math.cos(a)*rx,y1,Math.sin(a)*rz],[Math.cos(b)*rx,y1,Math.sin(b)*rz],[Math.cos(b)*rx,y0,Math.sin(b)*rz],c)}}
function ring(m:Mesh,r:number,w:number,y:number,seg:number,c:Rgb){for(let i=0;i<seg;i++){const a=i/seg*Math.PI*2,b=(i+1)/seg*Math.PI*2,ri=r-w/2,ro=r+w/2;face(m,[Math.cos(a)*ri,y,Math.sin(a)*ri],[Math.cos(b)*ri,y,Math.sin(b)*ri],[Math.cos(b)*ro,y,Math.sin(b)*ro],[Math.cos(a)*ro,y,Math.sin(a)*ro],c)}}

function addPitch(m:Mesh,detail:number){
  plane(m,-61,61,-42,42,-.16,C.dark);
  for(let i=0;i<14;i++){const x=-52.5+i*7.5;plane(m,x,x+7.51,-34,34,.08,i%2?C.grassA:C.grassB)}
  const h=.08; const lines:[Vec3,Vec3][]=[[[0,.18,-34],[105,h,.18]],[[0,.18,34],[105,h,.18]],[[-52.5,.18,0],[.18,h,68]],[[52.5,.18,0],[.18,h,68]],[[0,.18,0],[.18,h,68]]];
  for(const [p,s] of lines)box(m,p,s,C.white); ring(m,9.15,.18,.20,Math.max(64,Math.floor(detail/2)),C.white); box(m,[0,.22,0],[.28,.08,.28],C.white);
  for(const side of[-1,1]as const){const gx=side*52.5,px=gx-side*16.5,ax=gx-side*5.5;box(m,[px,.18,0],[.18,h,40.32],C.white);box(m,[(gx+px)/2,.18,-20.16],[16.5,h,.18],C.white);box(m,[(gx+px)/2,.18,20.16],[16.5,h,.18],C.white);box(m,[ax,.18,0],[.18,h,18.32],C.white);box(m,[(gx+ax)/2,.18,-9.16],[5.5,h,.18],C.white);box(m,[(gx+ax)/2,.18,9.16],[5.5,h,.18],C.white);const post=gx+side*.20;box(m,[post,1.25,-3.66],[.13,2.5,.13],C.white);box(m,[post,1.25,3.66],[.13,2.5,.13],C.white);box(m,[post,2.5,0],[.13,.13,7.45],C.white);for(let j=-5;j<=5;j++)box(m,[gx+side*1.3,1.1,j*.7],[.025,2.15,.025],C.crowdWhite);for(let j=0;j<7;j++){box(m,[gx+side*(.22+j*.18),1.1,-3.66],[.025,2.15,.025],C.crowdWhite);box(m,[gx+side*(.22+j*.18),1.1,3.66],[.025,2.15,.025],C.crowdWhite)}}
  // Technical areas and benches.
  for(const z of[-38.5,38.5]){box(m,[0,.65,z],[22,1.2,2.2],C.dark);box(m,[0,1.65,z],[22,.16,2.8],C.steel);for(let x=-8;x<=8;x+=2)box(m,[x,.48,z+(z>0?-1:1)*.35],[1.1,.42,.75],C.seatBright)}
}

interface Tier{ix:number;iz:number;rows:number;depth:number;rise:number;y:number;seats:number;c0:Rgb;c1:Rgb}
function addTier(m:Mesh,t:Tier,seg:number,lightMode:boolean){
  const seats=lightMode?Math.floor(t.seats*.55):t.seats;
  for(let r=0;r<t.rows;r++){
    const u=r/Math.max(1,t.rows-1),ix=t.ix+r*t.depth,iz=t.iz+r*t.depth*.72,ox=ix+t.depth*.96,oz=iz+t.depth*.69,y=t.y+r*t.rise;
    const c:Rgb=[t.c0[0]+(t.c1[0]-t.c0[0])*u,t.c0[1]+(t.c1[1]-t.c0[1])*u,t.c0[2]+(t.c1[2]-t.c0[2])*u];
    band(m,ix,iz,ox,oz,y,y+t.rise*.11,seg,c);
    if(r%2===0)wall(m,ox,oz,y-.20,y+.12,seg,C.dark);
    for(let i=0;i<seats;i++){if((i+r*7)%19===0)continue;const a=(i+.5)/seats*Math.PI*2,rx=ix+t.depth*.53,rz=iz+t.depth*.38;const crowd=(i+r)%9===0?C.crowdWhite:((i+r)%3===0?C.crowd:C.seatBright);box(m,[Math.cos(a)*rx,y+.38,Math.sin(a)*rz],[.14,.44,.14],crowd)}
  }
}
function addAisles(m:Mesh,ix:number,iz:number,ox:number,oz:number,y0:number,y1:number,count:number){for(let i=0;i<count;i++){const a=i/count*Math.PI*2,w=.006;face(m,[Math.cos(a-w)*ix,y0,Math.sin(a-w)*iz],[Math.cos(a+w)*ix,y0,Math.sin(a+w)*iz],[Math.cos(a+w)*ox,y1,Math.sin(a+w)*oz],[Math.cos(a-w)*ox,y1,Math.sin(a-w)*oz],C.concrete)}}
function addRibbon(m:Mesh,rx:number,rz:number,y:number,seg:number){for(let i=0;i<seg;i++){const a=i/seg*Math.PI*2,b=(i+1)/seg*Math.PI*2,c=i%11===0?C.ledWhite:C.led;face(m,[Math.cos(a)*rx,y,Math.sin(a)*rz],[Math.cos(a)*rx,y+.58,Math.sin(a)*rz],[Math.cos(b)*rx,y+.58,Math.sin(b)*rz],[Math.cos(b)*rx,y,Math.sin(b)*rz],c)}}
function addFacade(m:Mesh,seg:number){wall(m,113,83,-1.4,5.6,seg,C.dark);band(m,109,79,115,85,5.2,7.0,seg,C.concrete);for(let i=0;i<56;i++){const a=i/56*Math.PI*2;box(m,[Math.cos(a)*111.8,2.5,Math.sin(a)*82],[1.2,3.2,.24],i%5===0?C.warm:C.black)}box(m,[0,1.6,82],[22,3.2,2],C.black);box(m,[0,4.4,81.4],[24,.34,1],C.led)}
function addRoof(m:Mesh,seg:number){band(m,94,68,117,86,38.2,43.2,seg,C.roof,.76);band(m,91,65,94,68,37.7,38.5,seg,C.black,.76);for(let i=0;i<52;i++){const a=i/52*Math.PI*2;if(Math.sin(a)>.78)continue;const x=Math.cos(a),z=Math.sin(a);box(m,[x*106,40.9,z*78],[.34,5.5,.34],C.steel);box(m,[x*97,38.4,z*70],[.26,2.1,.26],C.steel)}}
function addScreens(m:Mesh){box(m,[0,31.5,-80],[32,12,1.0],C.black);box(m,[0,31.5,-79.35],[28,8.4,.08],[.012,.055,.17]);box(m,[0,27.4,-79.2],[22,.48,.08],C.led);for(const x of[-58,58]){box(m,[x,26,-67],[14,7,.8],C.black);box(m,[x,26,-66.5],[12,5,.06],[.01,.05,.16])}}
function addLights(m:Mesh){for(const x of[-104,104])for(const z of[-75,75]){box(m,[x,22,z],[.6,44,.6],C.steel);box(m,[x+(x>0?-2.4:2.4),44,z+(z>0?-1.6:1.6)],[11.5,3.9,1.1],C.dark);for(let c=0;c<8;c++)for(let r=0;r<3;r++)box(m,[x+(x>0?-1:1)*(1+c*1.25),45.2-r,z+(z>0?-1:1)*1.8],[.9,.62,.22],C.warm)}}
function build(mode:Exclude<CoreVisualMode,"STATIC">){const m=mesh(),seg=mode==="FULL"?160:mode==="FAST"?120:80,light=mode==="LIGHT";addPitch(m,seg);addFacade(m,seg);addTier(m,{ix:61,iz:43,rows:13,depth:1.22,rise:.70,y:1,seats:96,c0:C.seatDark,c1:C.seat},seg,light);addAisles(m,61,43,77,55,1,9.5,32);addRibbon(m,77.5,55.5,10.0,seg);addTier(m,{ix:79,iz:57,rows:13,depth:1.10,rise:.74,y:11,seats:108,c0:C.seat,c1:C.seatBright},seg,light);addAisles(m,79,57,93,67,11,20.5,36);addRibbon(m,93.5,67.5,21.0,seg);addTier(m,{ix:95,iz:69,rows:12,depth:1.08,rise:.76,y:22,seats:116,c0:C.seatDark,c1:C.seat},seg,light);addAisles(m,95,69,108,78,22,31,40);addScreens(m);addRoof(m,seg);addLights(m);return m}

function persp(f:number,a:number,n:number,far:number){const q=1/Math.tan(f/2),nf=1/(n-far);return new Float32Array([q/a,0,0,0,0,q,0,0,0,0,(far+n)*nf,-1,0,0,2*far*n*nf,0])}
const dot=(a:Vec3,b:Vec3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
function look(e:Vec3,t:Vec3,u:Vec3){const z=norm(sub(e,t)),x=norm(cross(u,z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,e),-dot(y,e),-dot(z,e),1])}
function mul(a:Float32Array,b:Float32Array){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o}
function shader(gl:WebGLRenderingContext,type:number,src:string){const s=gl.createShader(type);if(!s)throw Error("STADIUM_SHADER_CREATE_FAILED");gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s)||"shader");return s}
function createProgram(gl:WebGLRenderingContext){
  const vs=shader(gl,gl.VERTEX_SHADER,`attribute vec3 aPosition;attribute vec3 aNormal;attribute vec3 aColor;uniform mat4 uMvp;varying vec3 vPos;varying vec3 vNormal;varying vec3 vColor;void main(){vPos=aPosition;vNormal=normalize(aNormal);vColor=aColor;gl_Position=uMvp*vec4(aPosition,1.0);}`);
  const fs=shader(gl,gl.FRAGMENT_SHADER,`precision mediump float;varying vec3 vPos;varying vec3 vNormal;varying vec3 vColor;uniform vec3 uCamera;uniform vec3 uSunDir;vec3 lightOne(vec3 lp,vec3 tint,float power){vec3 L=lp-vPos;float dist=max(length(L),1.0);vec3 l=normalize(L);float nd=max(dot(vNormal,l),0.0);float att=1.0/(1.0+0.00028*dist*dist);vec3 V=normalize(uCamera-vPos);vec3 H=normalize(l+V);float spec=pow(max(dot(vNormal,H),0.0),26.0)*0.42;return tint*(nd+spec)*att*power;}void main(){float up=max(vNormal.y,0.0);float sun=max(dot(vNormal,normalize(uSunDir)),0.0);float pitch=1.0-smoothstep(28.0,78.0,length(vPos.xz));float lower=1.0-smoothstep(10.0,38.0,vPos.y);vec3 ambient=vec3(.055,.075,.11)*(0.72+up*.30);vec3 lit=vColor*(ambient+sun*.28);lit+=vColor*lightOne(vec3(-104.0,45.0,-75.0),vec3(.78,.88,1.0),2.35);lit+=vColor*lightOne(vec3(104.0,45.0,-75.0),vec3(.78,.88,1.0),2.35);lit+=vColor*lightOne(vec3(-104.0,45.0,75.0),vec3(.78,.88,1.0),2.15);lit+=vColor*lightOne(vec3(104.0,45.0,75.0),vec3(.78,.88,1.0),2.15);lit+=vColor*vec3(.16,.20,.26)*pitch*lower;float mx=max(max(vColor.r,vColor.g),vColor.b);float emiss=smoothstep(.72,.96,mx);lit+=vColor*emiss*1.35;float rim=pow(1.0-max(dot(normalize(uCamera-vPos),vNormal),0.0),3.0);lit+=vec3(.08,.16,.30)*rim*.20;float dist=length(uCamera-vPos);float fog=smoothstep(215.0,420.0,dist);vec3 fogC=vec3(.015,.027,.045);vec3 c=mix(lit,fogC,fog*.34);c=pow(c,vec3(.90));gl_FragColor=vec4(c,1.0);}`);
  const p=gl.createProgram(); if(!p)throw Error("STADIUM_PROGRAM_CREATE_FAILED");gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p)||"link");return p;
}
function arr(gl:WebGLRenderingContext,d:number[]){const b=gl.createBuffer();if(!b)throw Error("STADIUM_BUFFER_CREATE_FAILED");gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(d),gl.STATIC_DRAW);return b}

export function createStadiumWebglRenderer(canvas:HTMLCanvasElement,mode:Exclude<CoreVisualMode,"STATIC">):StadiumWebglRenderer|null{
  if(typeof window.WebGLRenderingContext==="undefined")return null;
  const gl=canvas.getContext("webgl",{alpha:true,antialias:true,depth:true,premultipliedAlpha:false,powerPreference:mode==="FULL"?"high-performance":"default"}) as WebGLRenderingContext|null; if(!gl)return null;
  const m=build(mode),p=createProgram(gl),pb=arr(gl,m.positions),nb=arr(gl,m.normals),cb=arr(gl,m.colors),ib=gl.createBuffer();if(!ib)throw Error("STADIUM_INDEX_BUFFER_CREATE_FAILED");
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);const max=m.indices.reduce((a,b)=>Math.max(a,b),0),uint=max>65535;if(uint&&!gl.getExtension("OES_element_index_uint"))throw Error("STADIUM_INDEX_RANGE_UNSUPPORTED");gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,uint?new Uint32Array(m.indices):new Uint16Array(m.indices),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(p,"aPosition"),nor=gl.getAttribLocation(p,"aNormal"),col=gl.getAttribLocation(p,"aColor"),uMvp=gl.getUniformLocation(p,"uMvp"),uCamera=gl.getUniformLocation(p,"uCamera"),uSun=gl.getUniformLocation(p,"uSunDir");if(pos<0||nor<0||col<0||!uMvp||!uCamera||!uSun)throw Error("STADIUM_SHADER_LOCATION_FAILED");
  let vw=1,vh=1;gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
  const bind=(b:WebGLBuffer,loc:number)=>{gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0)};
  function resize(width:number,height:number,dpr:number){const w=Math.max(1,Math.round(width*Math.min(dpr,2))),h=Math.max(1,Math.round(height*Math.min(dpr,2)));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}vw=w;vh=h;gl.viewport(0,0,w,h)}
  function render(o:number,z0:number){const a=vw/vh,portrait=a<1,z=Math.min(1.14,Math.max(.92,z0)),oR=o*Math.PI/180,r=(portrait?215:165)/z,h=(portrait?95:68)/z,e:Vec3=[Math.sin(oR)*r,h,Math.cos(oR)*r],v=look(e,[0,9,0],[0,1,0]),pr=persp((portrait?58:49)*Math.PI/180,a,.8,520),mvp=mul(pr,v);gl.clearColor(0,0,0,0);gl.clearDepth(1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(p);bind(pb,pos);bind(nb,nor);bind(cb,col);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.uniformMatrix4fv(uMvp,false,mvp);gl.uniform3f(uCamera,e[0],e[1],e[2]);gl.uniform3f(uSun,-.30,.92,.38);gl.drawElements(gl.TRIANGLES,m.indices.length,uint?gl.UNSIGNED_INT:gl.UNSIGNED_SHORT,0)}
  function destroy(){gl.deleteBuffer(pb);gl.deleteBuffer(nb);gl.deleteBuffer(cb);gl.deleteBuffer(ib);gl.deleteProgram(p)}
  return{triangleCount:m.indices.length/3,resize,render,destroy};
}
