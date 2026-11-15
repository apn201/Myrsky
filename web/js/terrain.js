// Ground: LROC NAC height model (2 m) near the site, SLDEM2015 (59 m) out to the horizon.
// World axes: x = east, y = up, z = -north. Metres. Origin = Apollo 12 lander (Intrepid).
// Code written with an AI assistant (Claude Code, Anthropic), Nov 2026.
import * as THREE from 'three';

export const MOON_R = 1737400;
export const G = { e: 60, n: -45, half: 1024, N: 1024, cell: 2 }; // must match tools/prepare.py
const W = { half: 12000, N: 256 };

let H = null, WH = null;
export function curvatureDrop(e, n) { return (e * e + n * n) / (2 * MOON_R); }

function sampleGrid(arr, N, x, y, scale) {
  const c = Math.min(N - 1.001, Math.max(0, x)), r = Math.min(N - 1.001, Math.max(0, y));
  const c0 = Math.floor(c), r0 = Math.floor(r), fc = c - c0, fr = r - r0;
  const i = r0 * N + c0;
  return ((arr[i] * (1 - fc) + arr[i + 1] * fc) * (1 - fr) + (arr[i + N] * (1 - fc) + arr[i + N + 1] * fc) * fr) * scale;
}
export function insideDTM(e, n) { return Math.abs(e - G.e) < G.half - 2 && Math.abs(n - G.n) < G.half - 2; }
// height relative to the lander's ground, without curvature
export function rawHeight(e, n) {
  if (insideDTM(e, n)) return sampleGrid(H, G.N, (e - (G.e - G.half)) / G.cell - 0.5, ((G.n + G.half) - n) / G.cell - 0.5, 0.01);
  return sampleGrid(WH, W.N, (e + W.half) / (2 * W.half) * W.N - 0.5, (W.half - n) / (2 * W.half) * W.N - 0.5, 0.1);
}
export function heightAt(e, n) { return rawHeight(e, n) - curvatureDrop(e, n); }

// line of sight between two points (east, north, up) over the terrain
export function lineOfSight(a, b, clearance = 0.2) {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const steps = Math.ceil(d / 1);
  let minClear = Infinity, where = null;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const e = a[0] + (b[0] - a[0]) * t, n = a[1] + (b[1] - a[1]) * t, u = a[2] + (b[2] - a[2]) * t;
    const c = u - heightAt(e, n);
    if (c < minClear) { minClear = c; where = [e, n]; }
  }
  return { clear: minClear > clearance, minClear, where };
}

export async function loadTerrain() {
  const [a, b] = await Promise.all([
    fetch('assets/terrain_1024.i16').then((r) => r.arrayBuffer()),
    fetch('assets/wide_256.i16').then((r) => r.arrayBuffer()),
  ]);
  H = new Int16Array(a); WH = new Int16Array(b);
  return { H, WH };
}

// height texture for the shadow ray-march (metres, half float, row 0 = north)
export function heightTexture() {
  const data = new Uint16Array(G.N * G.N);
  for (let i = 0; i < data.length; i++) data[i] = THREE.DataUtils.toHalfFloat(H[i] * 0.01);
  const tex = new THREE.DataTexture(data, G.N, G.N, THREE.RedFormat, THREE.HalfFloatType);
  tex.flipY = false; tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

// Non-uniform grid: 2 m spacing in the middle (both cameras), widening to ~18 m at the edges.
function gridLine(s) { return 400 * s + 624 * Math.pow(s, 5); } // s in [-1,1] -> metres from centre, 1024 at s=1

export function buildTerrainMesh(material) {
  const N = 401;
  const pos = new Float32Array(N * N * 3), uv = new Float32Array(N * N * 2);
  for (let j = 0; j < N; j++) {
    const n = G.n - gridLine(-1 + 2 * j / (N - 1)) * 0.998;
    for (let i = 0; i < N; i++) {
      const e = G.e + gridLine(-1 + 2 * i / (N - 1)) * 0.998;
      const k = j * N + i;
      pos[k * 3] = e; pos[k * 3 + 1] = heightAt(e, n); pos[k * 3 + 2] = -n;
      uv[k * 2] = e; uv[k * 2 + 1] = n;
    }
  }
  const idx = new Uint32Array((N - 1) * (N - 1) * 6);
  let p = 0;
  for (let j = 0; j < N - 1; j++) for (let i = 0; i < N - 1; i++) {
    const a = j * N + i, b = a + 1, c = a + N, d = c + 1;
    idx[p++] = a; idx[p++] = c; idx[p++] = b; idx[p++] = b; idx[p++] = c; idx[p++] = d;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, material);
  m.receiveShadow = true; m.castShadow = true;
  m.frustumCulled = false;
  return m;
}

export function buildWideMesh(material) {
  const N = 161;
  const pos = new Float32Array(N * N * 3), uv = new Float32Array(N * N * 2);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const s = -1 + 2 * i / (N - 1), t = -1 + 2 * j / (N - 1);
    const f = (x) => Math.sign(x) * Math.pow(Math.abs(x), 1.6) * (W.half - 200);
    const e = f(s), n = -f(t);
    let h = heightAt(e, n);
    if (insideDTM(e, n)) h -= 0.8; // the fine mesh sits on top
    const k = j * N + i;
    pos[k * 3] = e; pos[k * 3 + 1] = h; pos[k * 3 + 2] = -n;
    uv[k * 2] = e; uv[k * 2 + 1] = n;
  }
  const idx = new Uint32Array((N - 1) * (N - 1) * 6);
  let p = 0;
  for (let j = 0; j < N - 1; j++) for (let i = 0; i < N - 1; i++) {
    const a = j * N + i, b = a + 1, c = a + N, d = c + 1;
    idx[p++] = a; idx[p++] = c; idx[p++] = b; idx[p++] = b; idx[p++] = c; idx[p++] = d;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, material);
  m.receiveShadow = false; m.frustumCulled = false;
  return m;
}

// MeshStandardMaterial with: LROC albedo (near 0.5 m, wide 1 m), fine procedural regolith,
// and a terrain self-shadow found by marching the height map toward the Sun.
export function terrainMaterial(texNear, texWide, heightTex, wideCut = false) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0 });
  mat.userData.uniforms = {
    tNear: { value: texNear }, tWide: { value: texWide }, tHeight: { value: heightTex },
    sunDirW: { value: new THREE.Vector3(0, 1, 0) }, camPos: { value: new THREE.Vector3() },
    hfOn: { value: 1 }, detailOn: { value: 1 }, albedoGain: { value: 0.11 }, wideCut: { value: wideCut ? 1 : 0 }, tRego: { value: null },
  };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, mat.userData.uniforms);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vEN; varying vec3 vW;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvEN = uv; vW = (modelMatrix * vec4(position,1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
varying vec2 vEN; varying vec3 vW;
uniform sampler2D tNear; uniform sampler2D tWide; uniform sampler2D tHeight;
uniform vec3 sunDirW; uniform vec3 camPos; uniform float hfOn; uniform float detailOn; uniform float albedoGain; uniform float wideCut; uniform sampler2D tRego;
float hfShadow = 1.0;
const vec2 GC = vec2(${G.e.toFixed(1)}, ${G.n.toFixed(1)});
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash12(i),hash12(i+vec2(1,0)),f.x), mix(hash12(i+vec2(0,1)),hash12(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float a=0.5, s=0.0; for(int i=0;i<4;i++){ s+=a*vnoise(p); p*=2.03; a*=0.5; } return s; }
// small craters below the 2 m height data: bowl plus raised rim, random size per cell (modelled, steady-state field)
float craters(vec2 p, float cell, float density){
  vec2 g = floor(p / cell); float h = 0.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 c = g + vec2(float(i), float(j));
    if (hash12(c + 5.3) > density) continue;
    vec2 ctr = (c + vec2(hash12(c), hash12(c + 17.1))) * cell;
    float R = cell * (0.18 + 0.32 * hash12(c + 9.7));
    float r = length(p - ctr) / R;
    float age = 0.35 + 0.65 * hash12(c + 2.2); // old craters are shallow and soft
    h += (r < 1.0 ? (r * r - 1.0) * 0.17 * R : 0.0) * age + 0.022 * R * age * exp(-pow((r - 1.0) / 0.35, 2.0));
  }
  return h;
}
// regolith grain tile with its repeat broken up: two differently rotated and shifted lookups, blended by
// slow noise in patches a few tiles wide; the blend keeps the grain contrast (variance-preserving mix)
float rego(vec2 p){
  float w = smoothstep(0.25, 0.75, vnoise(p * 0.29 + 3.1));
  float a = texture2D(tRego, p).r - 0.5025;
  float b = texture2D(tRego, mat2(0.6, 0.8, -0.8, 0.6) * p + vec2(0.43, 0.17)).r - 0.5025;
  return (mix(a, b, w) / sqrt(w * w + (1.0 - w) * (1.0 - w))) * 1.99; // -1..1 around 0
}
float microH(vec2 p){ return 0.28 * (craters(p, 4.0, 0.16) + craters(p + 41.0, 1.3, 0.14) + craters(p + 7.0, 0.4, 0.12)) + 0.03 * fbm(p * 1.3) + 0.012 * fbm(p * 5.0) + 0.004 * fbm(p * 19.0); }
vec2 hUV(vec2 en){ return vec2((en.x - (GC.x - 1024.0)) / 2048.0, ((GC.y + 1024.0) - en.y) / 2048.0); }
float hAt(vec2 en){ return texture2D(tHeight, hUV(en)).r - dot(en,en) / 3474800.0; }
float albedoAt(vec2 en){
  vec2 un = vec2((en.x - (GC.x - 512.0)) / 1024.0, 1.0 - ((en.y - (GC.y - 512.0)) / 1024.0));
  vec2 uw = vec2((en.x - (GC.x - 1024.0)) / 2048.0, 1.0 - ((en.y - (GC.y - 1024.0)) / 2048.0));
  float aw = texture2D(tWide, uw).r;
  float an = texture2D(tNear, un).r;
  float inNear = step(0.0, un.x) * step(un.x, 1.0) * step(0.0, un.y) * step(un.y, 1.0);
  float edge = smoothstep(0.0, 0.03, min(min(un.x, 1.0-un.x), min(un.y, 1.0-un.y)));
  float a = mix(aw, an, inNear * edge);
  float inW = step(0.0, uw.x) * step(uw.x, 1.0) * step(0.0, uw.y) * step(uw.y, 1.0);
  return mix(0.52, a, inW);
}`)
      .replace('#include <map_fragment>', `
  // the coarse horizon mesh steps aside where the 2 m data exists (its chords would poke through crater bowls)
  if (wideCut > 0.5 && abs(vEN.x - GC.x) < 1016.0 && abs(vEN.y - GC.y) < 1016.0) discard;
  float alb = albedoAt(vEN);
  float camD = distance(vW, camPos);
  if (detailOn > 0.5) {
    // real regolith grain from crew photo AS12-49-7284 at two scales, fading out with distance
    float near = 1.0 - smoothstep(4.0, 70.0, camD);
    float mid = 1.0 - smoothstep(30.0, 320.0, camD);
    float r1 = 1.0 + 1.35 * 0.5 * (rego(vEN / 0.7) + rego(mat2(0.36, 0.93, -0.93, 0.36) * vEN / 0.93 + 0.61));
    float r2 = 1.0 + 0.7 * rego(mat2(0.8, -0.6, 0.6, 0.8) * vEN / 3.3 + 0.37);
    // slow patchy brightness so the mid distance does not read as one even carpet
    float patchy = 1.0 + 0.10 * (fbm(vEN * 0.11 + 7.0) - 0.47);
    alb *= mix(1.0, r1, near * 0.85) * mix(1.0, r2, mid * 0.45) * mix(1.0, patchy, mid);
  }
  // texture stores albedo/1.9 with the site median at 1.0; Apollo 12 mare normal albedo ~0.11
  diffuseColor.rgb *= alb * 1.9 * albedoGain * vec3(1.0, 0.97, 0.92); // slightly warm, as in the Hasselblad colour frames
  // terrain shadow toward the Sun
  if (hfOn > 0.5 && sunDirW.y > -0.02) {
    vec3 sd = normalize(sunDirW);
    vec2 sdir = vec2(sd.x, -sd.z); float horiz = length(sdir); sdir /= max(horiz, 1e-4);
    float tanEl = sd.y / max(horiz, 1e-4);
    float h0 = vW.y + 0.05; float t = 0.6; float minK = 1.0;
    for (int i = 0; i < 56; i++) {
      vec2 p = vEN + sdir * t;
      float k = (h0 + tanEl * t - hAt(p)) / (t * 0.00931);
      minK = min(minK, k);
      t *= 1.12; if (t > 1500.0) break;
    }
    hfShadow = clamp(0.5 + 0.5 * minK, 0.0, 1.0);
    hfShadow = smoothstep(0.0, 1.0, hfShadow);
  }
`)
      .replace('getDirectionalLightInfo( directionalLight, directLight );',
        `getDirectionalLightInfo( directionalLight, directLight );
		{ // lunar photometric function (Lunar-Lambert, McEwen 1991) with a Hapke-style opposition surge,
		  // instead of plain Lambert: the Moon shows no limb darkening and brightens toward zero phase
		  float mu0 = max(dot(geometryNormal, directLight.direction), 1e-3);
		  float mu = max(dot(geometryNormal, geometryViewDir), 1e-3);
		  float g = degrees(acos(clamp(dot(directLight.direction, geometryViewDir), -1.0, 1.0)));
		  float Lp = clamp(1.0 - 0.019 * g + 2.42e-4 * g * g - 1.46e-6 * g * g * g, 0.0, 1.0);
		  float Bop = 1.0 + 0.9 / (1.0 + tan(radians(g) * 0.5) / 0.06);
		  directLight.color *= (2.0 * Lp / (mu0 + mu) + (1.0 - Lp)) * Bop;
		  if ( UNROLLED_LOOP_INDEX == 0 ) directLight.color *= hfShadow;
		}`);
    // fine normal detail near the camera (sub-2 m bumps)
    sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
  if (detailOn > 0.5) {
    float nearN = 1.0 - smoothstep(15.0, 90.0, camD);
    if (nearN > 0.0) {
      float ep = 0.03;
      float hx = microH(vEN + vec2(ep, 0.0)) - microH(vEN - vec2(ep, 0.0));
      float hy = microH(vEN + vec2(0.0, ep)) - microH(vEN - vec2(0.0, ep));
      vec3 bumpW = normalize(vec3(-hx / (2.0 * ep), 1.0, hy / (2.0 * ep)));
      vec3 nW = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
      vec3 mixed = normalize(nW + (bumpW - vec3(0.0, 1.0, 0.0)) * nearN);
      normal = normalize((viewMatrix * vec4(mixed, 0.0)).xyz);
    }
  }`);
  };
  mat.customProgramCacheKey = () => 'terrain-v9' + (wideCut ? 'w' : '');
  return mat;
}
