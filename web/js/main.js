// Webcam: Ocean of Storms. The picture is a function of the time: give it a date, it draws that date.
// Code written with an AI assistant (Claude Code, Anthropic) during NASA Space Apps 2026, 14-15 Nov.
import * as THREE from 'three';
import { skyState, sunCovered, eqjFromRaDec, SITE } from './sky.js';
import { loadTerrain, heightTexture, buildTerrainMesh, buildWideMesh, terrainMaterial, heightAt, lineOfSight } from './terrain.js';
import { loadLM, buildSurveyor, buildFlag, buildDish, buildSWC, buildALSEP, buildBackpacks, buildWebcam, buildRocks, w } from './models.js';
import { createPost } from './post.js';
import { DATES, POS, CAMERAS, OBJECTS, JUMPS, TICKER, TOUR, PU238_HALF_LIFE_Y, RTG_HEAT0_W } from './data.js';

const D2R = Math.PI / 180;
const $ = (id) => document.getElementById(id);
const qs = new URLSearchParams(location.search);
const DEBUG = qs.has('debug');
if (qs.has('embed')) document.body.classList.add('embed');

// ------------------------------------------------------------------ state (the only state)
const LAYERS = [
  ['filter', 'Webcam filter', 'Noise and blockiness of a cheap 1997 camera. Gets worse at night, when the camera turns its gain up.'],
  ['dof', 'Autofocus', 'Blurs what is out of focus. Also hides that the ground near the camera is guessed: the height data has 2 m pixels.'],
  ['shadows', 'Shadows', 'Shadows from the terrain and the hardware, cast by the real Sun direction for this date.'],
  ['sun', 'Sunlight', 'The Sun is the only strong light here. A lunar day lasts about two weeks.'],
  ['earthlight', 'Earthlight', 'Sunlight bounced off Earth. It is the only light at lunar night, strongest when Earth is full.'],
  ['exposure', 'Auto exposure', 'Off: the camera keeps a daylight setting, and lunar night is black.'],
  ['stars', 'Stars', 'Real stars from the Yale Bright Star Catalogue. In daylight they are far too faint for the camera.'],
  ['earth', 'Earth', 'Earth at its real position, phase and rotation. From here it hardly moves in the sky.'],
  ['labels', 'Labels', 'Names of the hardware. Click one for its story.'],
  ['markers', 'Camera markers', 'Where the other webcam should be. If the model is not under the marker, a position is wrong.'],
  ['rocks', 'Rocks', 'Generated rocks, as many per square metre as Surveyor 3 counted in this crater.'],
  ['detail', 'Ground detail', 'Generated bumps smaller than the 2 m height data.'],
];
const state = {
  t: Date.now(), live: true, speed: 0, cam: 1,
  yaw: CAMERAS[1].yaw, pitch: CAMERAS[1].pitch, fov: CAMERAS[1].fov,
  layers: Object.fromEntries(LAYERS.map(([k]) => [k, true])),
  fullscreen: false,
};
state.layers.labels = false;
state.layers.markers = false;

function readURL() {
  if (qs.get('t')) { const t = Date.parse(qs.get('t')); if (!isNaN(t)) { state.t = t; state.live = false; } }
  if (qs.get('cam')) setCam(+qs.get('cam') === 2 ? 2 : 1, true);
  for (const k of ['yaw', 'pitch', 'fov']) if (qs.get(k)) state[k] = +qs.get(k);
  if (qs.get('layers')) for (const p of qs.get('layers').split(',')) { const on = !p.startsWith('-'); state.layers[p.replace(/^[-+]/, '')] = on; }
  if (qs.has('story')) setTimeout(startTour, 300);
  if (qs.get('jump')) { const j = JUMPS.find((x) => x.id === qs.get('jump')); if (j) jump(j); }
}
function shareURL() {
  const p = new URLSearchParams();
  if (!state.live) p.set('t', new Date(state.t).toISOString().slice(0, 19) + 'Z');
  p.set('cam', state.cam); p.set('yaw', state.yaw.toFixed(1)); p.set('pitch', state.pitch.toFixed(1)); p.set('fov', state.fov.toFixed(1));
  return location.origin + location.pathname + '?' + p.toString();
}

// ------------------------------------------------------------------ renderer
const view = $('view');
const canvas = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0, 0, 0);
const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 30000);
const post = createPost(renderer);

function resize() {
  const r = view.getBoundingClientRect();
  const wpx = Math.max(200, r.width), hpx = Math.max(120, r.height);
  renderer.setSize(wpx, hpx, false);
  camera.aspect = wpx / hpx; camera.updateProjectionMatrix();
  const s = new THREE.Vector2(); renderer.getDrawingBufferSize(s); post.setSize(s.x, s.y);
}
window.addEventListener('resize', resize);

// ------------------------------------------------------------------ lights
const sunLight = new THREE.DirectionalLight(0xfff8f0, 3);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(4096, 4096);
const SH = { e: 15, n: -5, half: 190 };
Object.assign(sunLight.shadow.camera, { left: -SH.half, right: SH.half, top: SH.half, bottom: -SH.half, near: 1, far: 3000 });
sunLight.shadow.bias = -0.0004; sunLight.shadow.normalBias = 0.06;
scene.add(sunLight, sunLight.target);
const earthLight = new THREE.DirectionalLight(0xc8d8ff, 0);
scene.add(earthLight, earthLight.target);
const ambient = new THREE.AmbientLight(0xffffff, 0); scene.add(ambient);
// light bounced off the sunlit ground onto the hardware (lunar albedo about 0.12)
const bounce = new THREE.HemisphereLight(0x000000, 0x9a948c, 0); scene.add(bounce);

// ------------------------------------------------------------------ sky objects
const SKY_R = 25000;
const starGroup = new THREE.Group(); starGroup.matrixAutoUpdate = false; scene.add(starGroup);
let starMat;
async function buildStars() {
  const list = await fetch('assets/stars.json').then((r) => r.json());
  const pos = new Float32Array(list.length * 3), mag = new Float32Array(list.length), col = new Float32Array(list.length * 3);
  list.forEach(([ra, dec, m, bv], i) => {
    const v = eqjFromRaDec(ra, dec);
    pos.set([v[0] * SKY_R, v[1] * SKY_R, v[2] * SKY_R], i * 3); mag[i] = m;
    const t = Math.max(-0.4, Math.min(2, bv)); // B-V to a rough colour
    col.set([1.0 - Math.max(0, -t) * 0.3, 0.95 - Math.max(0, t - 0.6) * 0.25, 1.0 - Math.max(0, t) * 0.45], i * 3);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('mag', new THREE.BufferAttribute(mag, 1));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  starMat = new THREE.ShaderMaterial({
    uniforms: { gain: { value: 0 }, pxScale: { value: 1 } },
    vertexShader: `attribute float mag; attribute vec3 color; varying vec3 vC; varying float vB; uniform float gain; uniform float pxScale;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv;
        float b = pow(10.0, -0.4 * mag) * gain; vB = b; vC = color; gl_PointSize = clamp(1.5 + sqrt(b) * 1.6, 1.5, 5.0) * pxScale; }`,
    fragmentShader: `varying vec3 vC; varying float vB; void main(){ vec2 d = gl_PointCoord - 0.5; float a = exp(-dot(d,d) * 14.0); gl_FragColor = vec4(vC * min(vB, 40.0) * a, 1.0); }`,
    blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
  });
  const pts = new THREE.Points(g, starMat); pts.frustumCulled = false; pts.renderOrder = -2;
  starGroup.add(pts);
}

const earthMat = new THREE.ShaderMaterial({
  uniforms: { map: { value: null }, sunDir: { value: new THREE.Vector3() }, bright: { value: 1 } },
  vertexShader: 'varying vec2 vUv; varying vec3 vN; void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D map; uniform vec3 sunDir; uniform float bright; varying vec2 vUv; varying vec3 vN;
    void main(){ vec3 c = pow(texture2D(map, vUv).rgb, vec3(2.2)); float l = smoothstep(-0.06, 0.25, dot(normalize(vN), sunDir));
      vec3 atm = vec3(0.25,0.45,1.0) * pow(1.0 - abs(dot(normalize(vN), vec3(0.0))), 2.0) * 0.0;
      gl_FragColor = vec4((c * 1.4 + atm) * l * bright, 1.0); }`,
  depthWrite: false,
});
const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), earthMat);
earthMesh.matrixAutoUpdate = false; earthMesh.renderOrder = -1; earthMesh.frustumCulled = false;
scene.add(earthMesh);
// red ring: sunlight bent through Earth's atmosphere during an eclipse seen from the Moon
const ringMat = new THREE.MeshBasicMaterial({ color: 0xff5a28, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
const ringMesh = new THREE.Mesh(new THREE.RingGeometry(0.99, 1.07, 96), ringMat);
ringMesh.renderOrder = -1; ringMesh.frustumCulled = false; scene.add(ringMesh);
const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
sunSprite.renderOrder = -1; scene.add(sunSprite);
function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.12, 'rgba(255,255,255,1)'); gr.addColorStop(0.16, 'rgba(255,250,240,0.35)'); gr.addColorStop(0.4, 'rgba(255,245,230,0.06)'); gr.addColorStop(1, 'rgba(255,240,220,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
}

// ------------------------------------------------------------------ world
let terrainMat, models = {}, webcams = {};
const enuToWorld = (v) => new THREE.Vector3(v[0], v[2], -v[1]);

async function buildWorld(progress) {
  progress('terrain');
  await loadTerrain();
  const tl = new THREE.TextureLoader();
  const [tNear, tWide, tEarth] = await Promise.all(['assets/ground_near.jpg', 'assets/ground_wide.jpg', 'assets/earth.jpg'].map((u) => tl.loadAsync(u)));
  for (const t of [tNear, tWide]) { t.anisotropy = renderer.capabilities.getMaxAnisotropy(); t.colorSpace = THREE.NoColorSpace; }
  earthMat.uniforms.map.value = tEarth;
  terrainMat = terrainMaterial(tNear, tWide, heightTexture());
  scene.add(buildTerrainMesh(terrainMat));
  scene.add(buildWideMesh(terrainMat));
  progress('hardware');
  const lm = await loadLM();
  scene.add(lm.lm); models.lm = lm;
  models.surveyor = buildSurveyor(); scene.add(models.surveyor.group);
  models.flag = buildFlag(); scene.add(models.flag);
  models.dish = buildDish(); scene.add(models.dish.group);
  models.swc = buildSWC(); scene.add(models.swc.group);
  models.alsep = buildALSEP(); scene.add(models.alsep);
  models.backpacks = buildBackpacks(); scene.add(models.backpacks);
  for (const k of [1, 2]) {
    const c = CAMERAS[k];
    const m = buildWebcam(c.yaw); m.position.copy(w(c.pos[0], c.pos[1], heightAt(...c.pos)));
    scene.add(m); webcams[k] = m;
  }
  progress('rocks');
  models.rocks = buildRocks([
    { e: CAMERAS[1].pos[0], n: CAMERAS[1].pos[1], r: 55, avoid: [[0, 0, 6], [CAMERAS[1].pos[0], CAMERAS[1].pos[1], 1.2], [-4.2, 14.6, 1], [0.2, 8.5, 2.5]] },
    { e: CAMERAS[2].pos[0], n: CAMERAS[2].pos[1], r: 45, avoid: [[118.1, -103.1, 2.8], [CAMERAS[2].pos[0], CAMERAS[2].pos[1], 1.2]] },
  ]);
  scene.add(models.rocks);
}

// ------------------------------------------------------------------ time
const between = (t, a, b) => (a == null || t >= a) && (b == null || t < b);
function applyTime(t) {
  const s = skyState(new Date(t));
  const L = state.layers;
  const sunW = enuToWorld(s.sun), earthW = enuToWorld(s.earth);
  const cover = sunCovered(s);
  const sunVis = THREE.MathUtils.smoothstep(s.sunAzEl.el, -0.27, 0.27) * (1 - cover);
  const sunUp = THREE.MathUtils.smoothstep(s.sunAzEl.el, -0.27, 0.27);
  // during an eclipse a little reddened light still arrives through Earth's atmosphere
  const physSun = L.sun ? 3.2 * sunVis + 3.2 * sunUp * cover * 4e-4 : 0;
  sunLight.color.setRGB(1, 1 - 0.55 * cover, 1 - 0.72 * cover);
  const physEarth = L.earthlight ? 3.2 * 8.4e-5 * s.earthLit * THREE.MathUtils.smoothstep(s.earthAzEl.el, -1, 2) : 0;
  // auto exposure: aim for a mid-grey Moon whatever the light
  let target = L.exposure ? 0.55 / (0.16 * (physSun + physEarth) + 2e-7) : 1.15;
  // centre-weighted metering: when Earth fills the middle of the frame, expose for Earth instead
  if (L.exposure && L.earth) {
    const cd = camera.getWorldDirection(new THREE.Vector3());
    const off = Math.acos(Math.min(1, cd.dot(earthW))) / D2R;
    const share = (s.earthAngularRadius / D2R) * 2 / state.fov;
    const wE = THREE.MathUtils.clamp((share - 0.04) * 8, 0, 1) * (1 - THREE.MathUtils.smoothstep(off, state.fov * 0.15, state.fov * 0.4));
    const earthTarget = 0.55 / (3.2 * 0.3 * 0.6 * Math.max(0.15, s.earthLit));
    target = Math.exp(Math.log(target) * (1 - wE) + Math.log(earthTarget) * wE);
  }
  const k = Math.min(1, frameDt * (Math.abs(state.speed) > 600 ? 8 : 2.5));
  gainS = gainS ? Math.exp(Math.log(gainS) + (Math.log(target) - Math.log(gainS)) * k) : target;
  const S = Math.min(gainS, 2e5);
  const camPos = camera.position;
  sunLight.intensity = physSun * S;
  sunLight.position.copy(w(SH.e, SH.n, 0)).addScaledVector(sunW, 1500);
  sunLight.target.position.copy(w(SH.e, SH.n, 0));
  sunLight.castShadow = L.shadows;
  earthLight.intensity = physEarth * S;
  bounce.intensity = (physSun * Math.max(0, s.sun[2]) + physEarth * Math.max(0, s.earth[2])) * 0.12 * S * 2.5;
  earthLight.position.copy(camPos).addScaledVector(earthW, 1000); earthLight.target.position.copy(camPos);
  terrainMat.userData.uniforms.sunDirW.value.copy(sunW);
  terrainMat.userData.uniforms.camPos.value.copy(camPos);
  terrainMat.userData.uniforms.hfOn.value = L.shadows ? 1 : 0;
  terrainMat.userData.uniforms.detailOn.value = L.detail ? 1 : 0;
  // stars
  const B = s.basis, e = B.east, n = B.north, u = B.up;
  const m = new THREE.Matrix4().set(e[0], e[1], e[2], 0, u[0], u[1], u[2], 0, -n[0], -n[1], -n[2], 0, 0, 0, 0, 1);
  starGroup.matrix.copy(new THREE.Matrix4().makeTranslation(camPos.x, camPos.y, camPos.z).multiply(m));
  starGroup.visible = L.stars && !!starMat;
  if (starMat) starMat.uniforms.gain.value = S * 6e-4 * (0.2 + 0.8 * Math.min(1, 50 / state.fov));
  // Earth: position, size, rotation, phase
  const dist = SKY_R * 0.9, r = dist * Math.tan(s.earthAngularRadius);
  const ax = s.earthAxes;
  const cx = enuToWorld(ax.x), cy = enuToWorld(ax.z), cz = enuToWorld(ax.y).multiplyScalar(-1);
  const pos = camPos.clone().addScaledVector(earthW, dist);
  earthMesh.matrix.set(cx.x * r, cy.x * r, cz.x * r, pos.x, cx.y * r, cy.y * r, cz.y * r, pos.y, cx.z * r, cy.z * r, cz.z * r, pos.z, 0, 0, 0, 1);
  earthMesh.visible = L.earth;
  earthMat.uniforms.sunDir.value.copy(sunW);
  earthMat.uniforms.bright.value = 3.2 * 0.3 * S * 0.6;
  // Sun disk
  sunSprite.position.copy(camPos).addScaledVector(sunW, dist);
  const sunR = dist * Math.tan(0.2666 * D2R);
  sunSprite.scale.setScalar(sunR * 2 / 0.12 * 0.5);
  sunSprite.material.color.setScalar(Math.min(60, 5e4 * S) * (1 - cover) * (L.sun ? 1 : 0));
  sunSprite.visible = s.sunAzEl.el > -0.6;
  ringMesh.visible = cover > 0.05 && L.earth && L.sun;
  if (ringMesh.visible) {
    ringMesh.position.copy(pos); ringMesh.scale.setScalar(r * 1.0); ringMesh.lookAt(camPos);
    ringMat.color.setRGB(1, 0.35, 0.16).multiplyScalar(Math.min(40, 3.2 * 9e-3 * S) * THREE.MathUtils.smoothstep(cover, 0.6, 1));
  }
  // exposure-driven noise
  post.uniforms.gain.value = THREE.MathUtils.clamp(Math.log10(S) / 4.3, 0, 1);
  // hardware by date
  const M = models;
  M.lm.lm.visible = t >= DATES.touchdown;
  M.lm.ascent.visible = t < DATES.liftoff;
  M.surveyor.group.visible = t >= DATES.surveyorLands;
  M.surveyor.setDusty(t >= DATES.touchdown);
  M.surveyor.camera.visible = t < Date.parse('1969-11-20T06:48:52Z');
  M.surveyor.scoop.visible = t < Date.parse('1969-11-20T06:50:43Z');
  M.flag.visible = t >= DATES.flagUp;
  M.dish.group.visible = t >= Date.parse('1969-11-19T12:23:14Z');
  M.dish.setFallen(t >= DATES.dishFalls);
  if (t < DATES.dishFalls) M.dish.aim(s.earth);
  M.swc.group.visible = between(t, Date.parse('1969-11-19T12:35:19Z'), Date.parse('1969-11-20T07:18:20Z'));
  M.swc.foil.lookAt(M.swc.foil.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(sunW.x, 0, sunW.z)));
  M.alsep.visible = t >= Date.parse('1969-11-19T13:34:29Z');
  M.backpacks.visible = t >= DATES.backpacks;
  M.rocks.visible = L.rocks;
  for (const k of [1, 2]) webcams[k].visible = state.cam !== k && (CAMERAS[k].from == null || t >= CAMERAS[k].from);
  return s;
}
let gainS = 0, frameDt = 0.016;

// ------------------------------------------------------------------ camera
function setCam(k, keepView) {
  state.cam = k;
  if (!keepView) { state.yaw = CAMERAS[k].yaw; state.pitch = CAMERAS[k].pitch; state.fov = CAMERAS[k].fov; }
  document.querySelectorAll('[data-cam]').forEach((b) => b.classList.toggle('on', +b.dataset.cam === k));
  focusPull();
}
function placeCamera() {
  const c = CAMERAS[state.cam];
  state.pitch = THREE.MathUtils.clamp(state.pitch, -20, 85);
  state.fov = THREE.MathUtils.clamp(state.fov, 2, 70);
  state.yaw = ((state.yaw % 360) + 360) % 360;
  camera.position.copy(w(c.pos[0], c.pos[1], heightAt(...c.pos) + c.h));
  const y = state.yaw * D2R, p = state.pitch * D2R;
  const dir = new THREE.Vector3(Math.sin(y) * Math.cos(p), Math.sin(p), -Math.cos(y) * Math.cos(p));
  camera.lookAt(camera.position.clone().add(dir));
  if (camera.fov !== state.fov) { camera.fov = state.fov; camera.updateProjectionMatrix(); }
}

// autofocus: hunts to the distance at the centre of the frame, with a floor of 15 m
let focusTarget = 40, focusNow = 40, focusVel = 0;
const ray = new THREE.Raycaster();
function focusPull() { focusVel += (Math.random() - 0.5) * 30; }
function updateFocus(dt) {
  ray.setFromCamera(new THREE.Vector2(0, 0), camera);
  ray.far = 3000;
  const hits = ray.intersectObjects(scene.children.filter((o) => o.isMesh || o.isGroup), true);
  let d = 400;
  for (const h of hits) { if (h.object.visible && h.object.parent?.visible !== false) { d = h.distance; break; } }
  focusTarget = Math.max(15, Math.min(d, 400));
  // spring with overshoot, like a hunting autofocus
  const err = Math.log(focusTarget) - Math.log(focusNow);
  focusVel += err * 40 * dt; focusVel *= Math.exp(-6 * dt);
  focusNow = Math.exp(Math.log(focusNow) + focusVel * dt);
  post.uniforms.focus.value = focusNow;
  post.uniforms.aperture.value = (50 / state.fov) ** 0.8;
}

// ------------------------------------------------------------------ UI
const fmt = (t) => new Date(t).toISOString().replace('T', ' ').slice(0, 19);
function speedLabel(v) {
  const a = Math.abs(v);
  if (a < 1.5) return a ? 'x1' : '';
  const units = [[31557600, 'yr'], [86400, 'day'], [3600, 'h'], [60, 'min'], [1, 's']];
  for (const [s, u] of units) if (a >= s) return (v < 0 ? '-' : '+') + (a / s).toFixed(a / s < 10 ? 1 : 0) + ' ' + u + '/s';
}
let hold = null;
function bindHold(btn, dir) {
  const start = (ev) => { ev.preventDefault(); state.live = false; hold = { dir, t0: performance.now() }; btn.classList.add('on'); };
  const end = () => { if (hold && hold.dir === dir) { hold = null; state.speed = 0; btn.classList.remove('on'); } };
  btn.addEventListener('pointerdown', start);
  btn.addEventListener('pointerup', end); btn.addEventListener('pointerleave', end); btn.addEventListener('pointercancel', end);
}
function aimAtEarth(o, t) {
  const sk = skyState(new Date(t));
  o.yaw = sk.earthAzEl.az; o.pitch = Math.min(80, sk.earthAzEl.el);
}
function jump(j) {
  if (j.aimEarth) aimAtEarth(j, j.t ?? Date.now());
  if (j.t == null) { state.live = true; state.speed = 0; setCam(j.cam || 1); return; }
  state.live = false; state.speed = 0; state.t = j.t;
  setCam(j.cam);
  if (j.yaw != null) { state.yaw = j.yaw; state.pitch = j.pitch; state.fov = j.fov; }
}
// ---- guided story
let tour = null, glide = null;
function glideTo(yaw, pitch, fov, dur = 1.6) {
  let dy = ((yaw - state.yaw + 540) % 360) - 180;
  glide = { y0: state.yaw, dy, p0: state.pitch, p1: pitch, f0: state.fov, f1: fov, t0: performance.now(), dur: dur * 1000 };
}
function runGlide(now) {
  if (!glide) return;
  const k = Math.min(1, (now - glide.t0) / glide.dur), e = k * k * (3 - 2 * k);
  state.yaw = glide.y0 + glide.dy * e; state.pitch = glide.p0 + (glide.p1 - glide.p0) * e;
  state.fov = Math.exp(Math.log(glide.f0) + (Math.log(glide.f1) - Math.log(glide.f0)) * e);
  if (k >= 1) glide = null;
}
function tourStep(i) {
  if (!tour) return;
  if (i >= TOUR.length) return stopTour();
  tour.i = i;
  const s = TOUR[i];
  const show = () => {
    if (s.aimEarth) aimAtEarth(s, s.live ? Date.now() : s.t);
    $('caption').innerHTML = (s.label ? `<small>${s.label}</small>` : '') + s.text; $('caption').hidden = false;
    if (state.cam !== s.cam) { setCam(s.cam, true); state.yaw = s.yaw; state.pitch = s.pitch; state.fov = s.fov; }
    else glideTo(s.yaw, s.pitch, s.fov, i === 0 ? 0.01 : 1.8);
    if (s.live) { state.live = true; state.speed = 0; } else { state.live = false; state.t = s.t; state.speed = s.speed || 0; }
    tour.timer = setTimeout(() => tourStep(i + 1), s.dur * 1000);
  };
  if (s.rew || s.ff) { // a visible high-speed run through the years first
    state.live = false; state.speed = s.rew ? -6e8 : 6e8;
    $('caption').innerHTML = `<small>${s.rew ? '&#9664;&#9664; REWINDING' : '&#9654;&#9654; FAST FORWARD'}</small>`;
    tour.timer = setTimeout(show, 2600);
  } else show();
}
function startTour() { stopTour(); tour = { i: 0 }; $('story').classList.add('on'); $('story').innerHTML = '&#9632; Stop the story'; tourStep(0); }
function stopTour() {
  if (tour) clearTimeout(tour.timer);
  tour = null; glide = null; $('caption').hidden = true; $('story').classList.remove('on'); $('story').innerHTML = '&#9654; Tell me the story (2 min)';
}
window.oosJump = (id) => { const j = JUMPS.find((x) => x.id === id); if (j) jump(j); };

function buildUI() {
  bindHold($('rew'), -1); bindHold($('ff'), 1);
  $('story').onclick = () => (tour ? stopTour() : startTour());
  document.querySelector('.controls').addEventListener('pointerdown', () => tour && stopTour(), true);
  $('jumps').addEventListener('click', () => tour && stopTour(), true);
  $('play').onclick = () => { state.live = false; state.speed = state.speed === 1 ? 0 : 1; };
  $('pause').onclick = () => { state.live = false; state.speed = 0; };
  $('live').onclick = () => { state.live = true; state.speed = 0; };
  document.querySelectorAll('[data-cam]').forEach((b) => (b.onclick = () => setCam(+b.dataset.cam)));
  $('left').onclick = () => (state.yaw -= state.fov / 3);
  $('right').onclick = () => (state.yaw += state.fov / 3);
  $('up').onclick = () => (state.pitch += state.fov / 4);
  $('down').onclick = () => (state.pitch -= state.fov / 4);
  $('zin').onclick = () => { state.fov /= 1.5; focusPull(); };
  $('zout').onclick = () => { state.fov *= 1.5; focusPull(); };
  $('full').onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else view.requestFullscreen?.(); };
  document.addEventListener('fullscreenchange', () => { state.fullscreen = !!document.fullscreenElement; setTimeout(resize, 50); });
  $('share').onclick = () => { const u = shareURL(); navigator.clipboard?.writeText(u); $('share').textContent = 'link copied'; setTimeout(() => ($('share').textContent = 'link to this view'), 1500); };
  $('dateGo').onclick = () => { const v = $('date').value; if (v) { const t = Date.parse(v + 'Z'); if (!isNaN(t)) { state.live = false; state.speed = 0; state.t = Math.max(DATES.rangeStart, Math.min(Date.now(), t)); } } };
  // jump links
  const jl = $('jumps');
  JUMPS.forEach((j, i) => {
    const a = document.createElement('a'); a.href = '#'; a.textContent = j.label;
    a.onclick = (e) => { e.preventDefault(); jump(j); };
    jl.appendChild(a); if (i < JUMPS.length - 1) jl.appendChild(document.createTextNode(' | '));
  });
  // layers
  const lp = $('layers');
  for (const [k, name, text] of LAYERS) {
    const row = document.createElement('label');
    row.innerHTML = `<input type="checkbox" ${state.layers[k] ? 'checked' : ''}> <b>${name}</b> - ${text}`;
    row.querySelector('input').onchange = (e) => (state.layers[k] = e.target.checked);
    lp.appendChild(row);
  }
  // drag to look
  let drag = null;
  view.addEventListener('pointerdown', (e) => { if (e.target.closest('.label') ) return; if (tour) stopTour(); drag = { x: e.clientX, y: e.clientY }; view.setPointerCapture(e.pointerId); });
  view.addEventListener('pointermove', (e) => {
    if (!drag) return; const h = view.clientHeight;
    state.yaw -= (e.clientX - drag.x) / h * state.fov; state.pitch += (e.clientY - drag.y) / h * state.fov;
    drag = { x: e.clientX, y: e.clientY };
  });
  view.addEventListener('pointerup', () => { if (drag) focusPull(); drag = null; });
  view.addEventListener('wheel', (e) => { e.preventDefault(); state.fov *= Math.exp(e.deltaY * 0.001); }, { passive: false });
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    const k = e.key;
    if (k === 'ArrowLeft') state.yaw -= 3; else if (k === 'ArrowRight') state.yaw += 3;
    else if (k === 'ArrowUp') state.pitch += 2; else if (k === 'ArrowDown') state.pitch -= 2;
    else if (k === '+' || k === '=') state.fov /= 1.2; else if (k === '-') state.fov *= 1.2;
    else if (k === '1' || k === '2') setCam(+k);
  });
  $('sheetClose').onclick = () => ($('sheet').hidden = true);
  // visitor counter (local, no backend)
  let v = 4817; try { v = (+localStorage.getItem('oos-visits') || 4817) + 1; localStorage.setItem('oos-visits', v); } catch (e) { /* private mode */ }
  $('counter').textContent = String(v).padStart(6, '0');
}

// labels over the picture
const LABEL_POS = {
  surveyor3: () => w(...POS.surveyor3, heightAt(...POS.surveyor3) + 3.4),
  lm: () => w(0, 0, heightAt(0, 0) + (state.t < DATES.liftoff ? 7.3 : 3.6)),
  flag: () => w(...POS.flag, heightAt(...POS.flag) + 2.2),
  sband: () => w(...POS.sband, heightAt(...POS.sband) + (state.t < DATES.dishFalls ? 3.3 : 1.2)),
  alsep: () => w(...POS.alsep_cs, heightAt(...POS.alsep_cs) + 1.8),
  rtg: () => w(...POS.alsep_rtg, heightAt(...POS.alsep_rtg) + 0.8),
  swc: () => w(...POS.swc, heightAt(...POS.swc) + 1.7),
  backpacks: () => w(...POS.backpacks, heightAt(...POS.backpacks) + 0.6),
  cam1: () => w(...CAMERAS[1].pos, heightAt(...CAMERAS[1].pos) + 1.9),
  cam2: () => w(...CAMERAS[2].pos, heightAt(...CAMERAS[2].pos) + 1.9),
};
const labelEls = {};
function buildLabels() {
  for (const o of OBJECTS) {
    const el = document.createElement('div'); el.className = 'label'; el.textContent = o.name;
    el.onclick = () => openSheet(o.id);
    $('labels').appendChild(el); labelEls[o.id] = el;
  }
}
function updateLabels() {
  const t = state.t, on = state.layers.labels, mk = state.layers.markers;
  const rect = view.getBoundingClientRect();
  for (const o of OBJECTS) {
    const el = labelEls[o.id];
    const isCam = o.id === 'cam1' || o.id === 'cam2';
    const camOther = isCam && o.id !== 'cam' + state.cam;
    const show = (isCam ? (mk && camOther) : on) && between(t, o.from, o.to);
    if (!show) { el.style.display = 'none'; continue; }
    const p = LABEL_POS[o.id]().project(camera);
    if (p.z > 1 || Math.abs(p.x) > 1.1 || Math.abs(p.y) > 1.1) { el.style.display = 'none'; continue; }
    el.style.display = 'block';
    el.style.left = ((p.x + 1) / 2 * rect.width) + 'px';
    el.style.top = ((1 - p.y) / 2 * rect.height) + 'px';
    if (isCam) {
      const a = CAMERAS[state.cam], b = CAMERAS[o.id === 'cam1' ? 1 : 2];
      const los = lineOfSight([a.pos[0], a.pos[1], heightAt(...a.pos) + a.h], [b.pos[0], b.pos[1], heightAt(...b.pos) + b.h]);
      const d = Math.hypot(b.pos[0] - a.pos[0], b.pos[1] - a.pos[1]);
      el.textContent = `${o.name} should be here: ${d.toFixed(0)} m, ${los.clear ? 'line of sight clear' : 'hidden by the ground'}`;
    }
  }
}
function openSheet(id) {
  const o = OBJECTS.find((x) => x.id === id); if (!o) return;
  let html = `<h3>${o.name} <small>[${o.kind}]</small></h3>`;
  html += o.lines.map((l) => `<p>${l}</p>`).join('');
  if (o.readout === 'rtg') {
    const yrs = (state.t - Date.parse('1969-11-19T13:12:05Z')) / 31557600000;
    if (yrs > 0) html += `<p><b>Heat left on ${fmt(state.t).slice(0, 10)}:</b> ${(RTG_HEAT0_W * Math.pow(0.5, yrs / PU238_HALF_LIFE_Y)).toFixed(0)} W of ${RTG_HEAT0_W} W (${yrs.toFixed(1)} years of plutonium-238 decay). No electrical figure: nobody has measured it since 1977.</p>`;
  }
  if (o.facts.length) html += '<table>' + o.facts.map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join('') + '</table>';
  html += `<p class="src">Sources: ${o.src}</p>`;
  $('sheetBody').innerHTML = html; $('sheet').hidden = false;
}
window.oosSheet = openSheet;

function tickerText(t) { const x = TICKER.find((k) => t >= k.from && t < k.to); return x ? x.text : ''; }

// ------------------------------------------------------------------ loop
let last = performance.now(), lastTick = '', glitchT = 0, frame = 0, fpsAcc = 0, fps = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.1, (now - last) / 1000); last = now; frameDt = dt;
  fpsAcc += dt; frame++; if (fpsAcc > 1) { fps = frame / fpsAcc; frame = 0; fpsAcc = 0; }
  if (hold) {
    const held = (now - hold.t0) / 1000;
    state.speed = hold.dir * Math.min(3e8, 120 * Math.exp(held * 2.4));
  }
  if (state.live) state.t = Date.now();
  else if (state.speed) state.t += state.speed * dt * 1000;
  if (state.t < DATES.rangeStart) { state.t = DATES.rangeStart; state.speed = 0; }
  if (state.t > Date.now()) { state.t = Date.now(); state.live = true; state.speed = 0; hold = null; }
  runGlide(now);
  placeCamera();
  const s = applyTime(state.t);
  updateFocus(dt);
  const L = state.layers;
  const webcamOn = L.filter && !state.fullscreen;
  post.uniforms.webcam.value = webcamOn ? 1 : 0;
  post.uniforms.dof.value = L.dof ? 1 : 0;
  post.uniforms.time.value = now / 1000;
  // rare transmission errors
  if (webcamOn && Math.random() < dt * 0.04) { glitchT = 0.12 + Math.random() * 0.2; post.uniforms.glitchY.value = Math.random(); }
  glitchT = Math.max(0, glitchT - dt); post.uniforms.glitch.value = glitchT > 0 ? 1 : 0;
  // CAM 2 has no signal before it "exists"
  const camOK = CAMERAS[state.cam].from == null || state.t >= CAMERAS[state.cam].from;
  post.uniforms.signal.value = camOK ? 1 : 0;
  $('nosignal').hidden = camOK;
  post.render(scene, camera);
  updateLabels();
  // overlay text
  const mode = state.live ? '<span class="rec">&#9679;</span> LIVE' : state.speed ? (state.speed < 0 ? '&#9664;&#9664; REW ' : '&#9654;&#9654; FF ') + speedLabel(state.speed) : 'PAUSED';
  $('osd').innerHTML = `${CAMERAS[state.cam].name} &nbsp; ${fmt(state.t)} UTC &nbsp; ${mode}`;
  const tk = tickerText(state.t);
  if (tk !== lastTick) { $('ticker').textContent = tk; lastTick = tk; }
  if (document.activeElement !== $('date') && (frame % 10 === 0)) $('date').value = new Date(state.t).toISOString().slice(0, 16);
  $('readout').textContent = `Sun ${s.sunAzEl.el.toFixed(1)}° up, azimuth ${s.sunAzEl.az.toFixed(0)}° | Earth ${s.earthAzEl.el.toFixed(1)}° up, ${(s.earthLit * 100).toFixed(0)}% lit | looking ${state.yaw.toFixed(0)}°, zoom ${(50 / state.fov).toFixed(1)}x`;
  if (DEBUG) {
    const a = CAMERAS[1], b = CAMERAS[2];
    const los = lineOfSight([a.pos[0], a.pos[1], heightAt(...a.pos) + a.h], [b.pos[0], b.pos[1], heightAt(...b.pos) + b.h]);
    const brg = (Math.atan2(b.pos[0] - a.pos[0], b.pos[1] - a.pos[1]) / D2R + 360) % 360;
    $('debug').textContent = `sun az ${s.sunAzEl.az.toFixed(2)} el ${s.sunAzEl.el.toFixed(2)} | earth az ${s.earthAzEl.az.toFixed(2)} el ${s.earthAzEl.el.toFixed(2)} r ${(s.earthAngularRadius / D2R).toFixed(3)} | CAM1->CAM2 bearing ${brg.toFixed(1)} back ${((brg + 180) % 360).toFixed(1)} LOS ${los.clear ? 'clear' : 'BLOCKED'} min ${los.minClear.toFixed(2)} m | focus ${focusNow.toFixed(0)} m | gain ${gainS.toExponential(1)} | ${fps.toFixed(0)} fps | calls ${renderer.info.render.calls}`;
  }
}

// ------------------------------------------------------------------ start
(async function start() {
  const prog = (w) => ($('loading').textContent = 'connecting to camera... ' + w);
  buildUI(); buildLabels(); resize();
  try {
    await Promise.all([buildWorld(prog), buildStars()]);
  } catch (e) {
    $('loading').textContent = 'NO SIGNAL (' + e.message + ')'; console.error(e); return;
  }
  readURL();
  setCam(state.cam, true);
  $('loading').hidden = true;
  if (DEBUG) $('debug').hidden = false;
  requestAnimationFrame(loop);
})();
