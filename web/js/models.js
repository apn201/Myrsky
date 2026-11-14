// Hardware models. The lunar module is NASA 3D Resources' "Apollo Lunar Module".
// Everything else is built from simple shapes at the documented sizes (data/dimensions.csv).
// Code written with an AI assistant (Claude Code, Anthropic), Nov 2026.
import * as THREE from 'three';
import { GLTFLoader } from '../vendor/GLTFLoader.js';
import { DRACOLoader } from '../vendor/DRACOLoader.js';
import { heightAt } from './terrain.js';
import { POS, DATES, T } from './data.js';

const D2R = Math.PI / 180;
export const w = (e, n, u) => new THREE.Vector3(e, u, -n);
export const ground = (id, du = 0) => { const [e, n] = POS[id]; return w(e, n, heightAt(e, n) + du); };

function at(m, x, y, z, rx = 0, ry = 0, rz = 0) { m.position.set(x, y, z); m.rotation.set(rx, ry, rz); return m; }
function std(color, rough = 0.7, metal = 0) { return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal }); }
function shadowAll(o) { o.traverse((c) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } }); return o; }
function cyl(r1, r2, h, mat, seg = 16) { return new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat); }
function box(x, y, z, mat) { return new THREE.Mesh(new THREE.BoxGeometry(x, y, z), mat); }
function rod(a, b, r, mat) {
  const d = new THREE.Vector3().subVectors(b, a); const m = cyl(r, r, d.length(), mat, 6);
  m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m;
}

// crinkled foil: a procedural normal map
function foilNormalMap() {
  const s = 256, c = document.createElement('canvas'); c.width = c.height = s;
  const g = c.getContext('2d'); const img = g.createImageData(s, s);
  const hgt = new Float32Array(s * s);
  for (let k = 0; k < 90; k++) { // random creases
    const x0 = Math.random() * s, y0 = Math.random() * s, a = Math.random() * Math.PI, len = 20 + Math.random() * 90, amp = (Math.random() - 0.5) * 2;
    for (let t = -len; t < len; t++) {
      const x = Math.round(x0 + Math.cos(a) * t), y = Math.round(y0 + Math.sin(a) * t);
      for (let o = -3; o <= 3; o++) { const xx = (x + Math.round(-Math.sin(a) * o) + s) % s, yy = (y + Math.round(Math.cos(a) * o) + s) % s; hgt[yy * s + xx] += amp * (1 - Math.abs(o) / 4); }
    }
  }
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const hx = hgt[y * s + (x + 1) % s] - hgt[y * s + (x + s - 1) % s];
    const hy = hgt[((y + 1) % s) * s + x] - hgt[((y + s - 1) % s) * s + x];
    const n = new THREE.Vector3(-hx * 0.5, -hy * 0.5, 1).normalize();
    const i = (y * s + x) * 4; img.data[i] = (n.x * 0.5 + 0.5) * 255; img.data[i + 1] = (n.y * 0.5 + 0.5) * 255; img.data[i + 2] = (n.z * 0.5 + 0.5) * 255; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t;
}

export async function loadLM() {
  const draco = new DRACOLoader().setDecoderPath('vendor/draco/');
  const gltf = await new GLTFLoader().setDRACOLoader(draco).loadAsync('assets/lm_nasa.glb');
  const root = gltf.scene;
  const foilN = foilNormalMap();
  const ascent = new THREE.Group(), descent = new THREE.Group();
  const meshes = [];
  root.updateMatrixWorld(true);
  root.traverse((c) => { if (c.isMesh) meshes.push(c); });
  for (const m of meshes) {
    m.geometry.computeBoundingBox();
    const bb = m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);
    const isAscent = bb.min.y > 2.18 && bb.max.y > 2.55 || bb.min.y > 2.43;
    const mat = m.material.clone();
    mat.transparent = false; mat.opacity = 1; mat.side = THREE.DoubleSide; mat.alphaTest = 0;
    const col = mat.color;
    if (col && col.r > 0.6 && col.g < 0.6 && col.b < 0.2) { // gold-yellow foil
      mat.color = new THREE.Color(0xc89632); mat.metalness = 0.45; mat.roughness = 0.45; mat.normalMap = foilN; mat.normalScale = new THREE.Vector2(0.6, 0.6);
    } else if (col && col.r > 0.55 && Math.abs(col.r - col.b) < 0.05) { // grey/silver
      mat.metalness = 0.5; mat.roughness = 0.55;
    } else { mat.roughness = Math.max(mat.roughness ?? 0.6, 0.5); }
    m.material = mat;
    const clone = new THREE.Mesh(m.geometry, mat);
    clone.applyMatrix4(m.matrixWorld);
    (isAscent ? ascent : descent).add(clone);
  }
  const lm = new THREE.Group();
  lm.add(descent, ascent);
  lm.scale.setScalar(1.42); // model units -> metres (real diagonal 9.45 m)
  lm.rotation.y = -90 * D2R; // model +z (ladder) faces west
  lm.position.copy(ground('lm', -0.15));
  shadowAll(lm);
  return { lm, ascent, descent };
}

export function buildSurveyor() {
  const white = std(0xeeeeea, 0.6, 0.1);
  const tan = std(0xb8a888, 0.85, 0.05);
  const metal = std(0xb0b0b0, 0.4, 0.8);
  const dark = std(0x222222, 0.6, 0.2);
  const g = new THREE.Group();
  const frame = new THREE.Group(); g.add(frame);
  const legR = 2.15, hub = 0.62;
  const feet = [];
  for (let i = 0; i < 3; i++) {
    const a = (i * 120 + 30) * D2R;
    const top = new THREE.Vector3(Math.cos(a) * 0.55, 0.95, Math.sin(a) * 0.55);
    const foot = new THREE.Vector3(Math.cos(a) * legR, 0.12, Math.sin(a) * legR);
    frame.add(rod(top, foot, 0.04, white));
    frame.add(rod(new THREE.Vector3(Math.cos(a + 0.6) * hub, 0.45, Math.sin(a + 0.6) * hub), foot, 0.025, white));
    const pad = cyl(0.15, 0.13, 0.23, white, 14); pad.position.copy(foot).setY(0.08); frame.add(pad); feet.push(foot);
    // triangular base frame
    const b = (i * 120 + 90) * D2R;
    frame.add(rod(new THREE.Vector3(Math.cos(a) * 0.6, 0.6, Math.sin(a) * 0.6), new THREE.Vector3(Math.cos(a + 2.094) * 0.6, 0.6, Math.sin(a + 2.094) * 0.6), 0.03, white));
    // vernier engine / tanks
    const tank = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), metal); tank.position.set(Math.cos(b) * 0.42, 0.75, Math.sin(b) * 0.42); frame.add(tank);
  }
  const body = cyl(0.42, 0.55, 0.35, white, 3); body.position.y = 0.7; frame.add(body);
  // thermal compartments (white boxes)
  const compA = box(0.55, 0.32, 0.4, white); compA.position.set(0.25, 1.15, 0.35); frame.add(compA);
  const compB = box(0.5, 0.3, 0.38, white); compB.position.set(-0.35, 1.1, -0.2); frame.add(compB);
  // mast with planar antenna and solar panel
  const mast = cyl(0.03, 0.03, 2.0, metal, 8); mast.position.y = 1.95; frame.add(mast);
  const solar = box(0.86, 0.02, 0.86, dark); solar.position.set(0, 2.85, 0.15); solar.rotation.x = -0.6; frame.add(solar);
  const ant = box(0.95, 0.02, 0.6, std(0x999999, 0.5, 0.6)); ant.position.set(0, 2.7, -0.4); ant.rotation.x = 0.7; frame.add(ant);
  // TV camera (removed 20 Nov 1969 06:48:52)
  const camera = new THREE.Group();
  const cbody = cyl(0.1, 0.1, 0.62, white, 12); cbody.position.y = 0.31; camera.add(cbody);
  const mirror = box(0.2, 0.18, 0.2, metal); mirror.position.y = 0.66; camera.add(mirror);
  camera.position.set(0.55, 0.85, -0.45); camera.rotation.z = 0.15; frame.add(camera);
  // surface sampler scoop arm (removed 06:50:43)
  const scoop = new THREE.Group();
  scoop.add(rod(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1.2, -0.55, 0), 0.025, metal));
  const sc = box(0.12, 0.08, 0.06, metal); sc.position.set(1.22, -0.58, 0); scoop.add(sc);
  scoop.position.set(-0.5, 0.75, 0.5); scoop.rotation.y = 2.4; frame.add(scoop);
  // footpad 2 dug in: sink slightly and tilt
  const [e, n] = POS.surveyor3;
  g.position.copy(w(e, n, heightAt(e, n) - 0.1));
  g.rotation.y = 40 * D2R;
  // align to the slope (14 degrees toward the crater centre, roughly SE->NW down)
  const dz = heightAt(e, n + 1) - heightAt(e, n - 1), dx = heightAt(e + 1, n) - heightAt(e - 1, n);
  const nrm = new THREE.Vector3(-dx / 2, 1, dz / 2).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), nrm);
  g.quaternion.premultiply(q);
  shadowAll(g);
  const parts = [];
  frame.traverse((c) => { if (c.isMesh && c.material === white) parts.push(c); });
  return {
    group: g, camera, scoop,
    setDusty(d) { for (const p of parts) p.material = d ? tan : white; },
  };
}

function flagTexture() {
  const c = document.createElement('canvas'); c.width = 380; c.height = 200; const g = c.getContext('2d');
  for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#f4f1ea' : '#b5232e'; g.fillRect(0, i * 200 / 13, 380, 200 / 13 + 1); }
  g.fillStyle = '#2d3a6b'; g.fillRect(0, 0, 152, 200 * 7 / 13);
  g.fillStyle = '#f4f1ea';
  for (let r = 0; r < 9; r++) for (let k = 0; k < (r % 2 ? 5 : 6); k++) {
    const x = (r % 2 ? 25.3 : 12.7) + k * 25.3, y = 6 + r * 11.7; g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function buildFlag() {
  const g = new THREE.Group();
  const metal = std(0xdddddd, 0.35, 0.8);
  const poleH = 2.05;
  const pole = cyl(0.0125, 0.0125, poleH, metal, 8); pole.position.y = poleH / 2; g.add(pole);
  const bar = cyl(0.0125, 0.0125, 1.55, metal, 6); bar.rotation.z = Math.PI / 2; bar.position.set(0.78, poleH - 0.03, 0); g.add(bar);
  const geo = new THREE.PlaneGeometry(1.52, 0.91, 40, 24);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + 0.76, y = p.getY(i); // x 0..1.52 from pole
    const droopTop = y > 0 ? Math.pow(x / 1.52, 1.6) * 0.09 * (y / 0.455) : 0;
    const ripple = Math.sin(x * 9 + y * 2) * 0.035 * (x / 1.52) + Math.sin(x * 17.0 - y * 5) * 0.012;
    p.setXYZ(i, x, y - droopTop - Math.pow(x / 1.52, 2) * 0.03, ripple);
  }
  geo.computeVertexNormals();
  const cloth = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: flagTexture(), roughness: 0.85, side: THREE.DoubleSide }));
  cloth.position.set(0.02, poleH - 0.04 - 0.455, 0); g.add(cloth);
  g.position.copy(ground('flag', -0.3));
  g.rotation.y = 120 * D2R; // front of the cloth toward CAM 1 (real orientation approximate)
  return shadowAll(g);
}

export function buildDish() {
  const g = new THREE.Group();
  const metal = std(0xcfcfcf, 0.45, 0.7);
  const fabric = new THREE.MeshStandardMaterial({ color: 0xd8d8d0, roughness: 0.55, metalness: 0.3, side: THREE.DoubleSide });
  const upright = new THREE.Group();
  for (let i = 0; i < 3; i++) { const a = i * 2.094; upright.add(rod(new THREE.Vector3(Math.cos(a) * 0.9, 0, Math.sin(a) * 0.9), new THREE.Vector3(0, 1.8, 0), 0.02, metal)); }
  const head = new THREE.Group(); head.position.y = 1.9;
  const dish = new THREE.Mesh(new THREE.ConeGeometry(1.5, 0.45, 24, 1, true), fabric); dish.rotation.x = Math.PI; dish.position.y = 0.2; head.add(dish);
  const feed = rod(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.9, 0), 0.015, metal); head.add(feed);
  upright.add(head);
  g.add(upright);
  g.position.copy(ground('sband'));
  shadowAll(g);
  return {
    group: g, head, upright,
    aim(earthENU) { // point the dish axis at Earth
      const dir = new THREE.Vector3(earthENU[0], earthENU[2], -earthENU[1]).normalize();
      head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    },
    setFallen(f) {
      if (f) { upright.rotation.set(0, 0.6, 1.35); upright.position.set(0, 0.25, 0); head.quaternion.set(0, 0, 0, 1); head.rotation.set(0.9, 0, 0.3); }
      else { upright.rotation.set(0, 0, 0); upright.position.set(0, 0, 0); }
    },
  };
}

export function buildSWC() {
  const g = new THREE.Group();
  const metal = std(0xdddddd, 0.4, 0.8);
  g.add(at(cyl(0.02, 0.02, 1.5, metal, 6), 0, 0.75, 0));
  const foil = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 1.3), new THREE.MeshStandardMaterial({ color: 0xf0f0f0, metalness: 0.9, roughness: 0.25, side: THREE.DoubleSide }));
  foil.position.set(0.17, 0.75, 0); g.add(foil);
  g.position.copy(ground('swc', -0.2));
  return { group: shadowAll(g), foil };
}

export function buildALSEP() {
  const g = new THREE.Group();
  const gold = std(0xb8913a, 0.45, 0.7), silver = std(0xd8d8d8, 0.35, 0.8), white = std(0xe8e8e2, 0.6), dark = std(0x2a2a2a, 0.6, 0.3);
  const place = (id, obj, du = 0) => { obj.position.copy(ground(id, du)); g.add(obj); return obj; };
  // central station: base box, raised sunshield, helical antenna on a mast
  const cs = new THREE.Group();
  cs.add(at(box(0.68, 0.17, 0.7, gold), 0, 0.12, 0));
  cs.add(at(box(0.8, 0.02, 0.8, silver), 0, 0.62, 0));
  for (const [x, z] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) cs.add(at(cyl(0.01, 0.01, 0.42, silver, 4), x, 0.41, z));
  cs.add(at(cyl(0.015, 0.015, 0.6, silver, 6), 0.3, 0.92, 0));
  cs.add(at(cyl(0.02, 0.02, 0.58, std(0x777777, 0.5, 0.5), 8), 0.3, 1.45, 0, 0, 0, 0.5));
  place('alsep_cs', cs);
  // SNAP-27: finned dark cylinder
  const rtg = new THREE.Group();
  rtg.add(at(cyl(0.11, 0.11, 0.46, dark, 16), 0, 0.33, 0));
  for (let i = 0; i < 8; i++) { const f = box(0.2, 0.44, 0.01, dark); f.position.set(Math.cos(i * 0.785) * 0.15, 0.33, Math.sin(i * 0.785) * 0.15); f.rotation.y = -i * 0.785; rtg.add(f); }
  rtg.add(at(cyl(0.02, 0.02, 0.1, dark, 6), 0, 0.05, 0));
  place('alsep_rtg', rtg);
  // seismometer: shiny cylinder on a 1.5 m skirt
  const pse = new THREE.Group();
  pse.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.75, 24), std(0xcfcfcf, 0.3, 0.8)), 0, 0.02, 0, -Math.PI / 2, 0, 0));
  pse.add(at(cyl(0.12, 0.14, 0.32, silver, 16), 0, 0.18, 0));
  place('alsep_pse', pse);
  // magnetometer: three 1 m arms with sensor heads, ~1 m tall
  const lsm = new THREE.Group();
  lsm.add(at(box(0.24, 0.13, 0.27, white), 0, 0.5, 0));
  for (let i = 0; i < 3; i++) { const a = i * 2.094; const tip = new THREE.Vector3(Math.cos(a) * 0.76, 0.95, Math.sin(a) * 0.76); lsm.add(rod(new THREE.Vector3(0, 0.6, 0), tip, 0.012, white)); const s = cyl(0.04, 0.04, 0.12, white, 8); s.position.copy(tip); lsm.add(s); lsm.add(rod(tip, tip.clone().setY(0), 0.008, white)); }
  place('alsep_lsm', lsm);
  // solar wind spectrometer
  const sws = new THREE.Group(); sws.add(at(box(0.28, 0.2, 0.28, white), 0, 0.25, 0));
  for (const [x, z] of [[-0.12, -0.12], [0.12, -0.12], [-0.12, 0.12], [0.12, 0.12]]) sws.add(rod(new THREE.Vector3(x, 0.15, z), new THREE.Vector3(x * 1.4, 0, z * 1.4), 0.008, white));
  place('alsep_sws', sws);
  // ion detector on legs
  const side = new THREE.Group(); side.add(at(box(0.11, 0.39, 0.33, gold), 0, 0.32, 0));
  side.add(at(box(0.7, 0.01, 0.7, std(0x888888, 0.5, 0.6)), 0, 0.08, 0));
  place('alsep_side', side);
  const cover = (() => { const o = box(0.4, 0.05, 0.4, std(0xcfcfcf, 0.4, 0.7)); o.rotation.set(0.2, 0.5, 0.1); return o; })();
  place('pse_cover', cover, 0.02);
  return shadowAll(g);
}

export function buildBackpacks() {
  const g = new THREE.Group();
  const white = std(0xe6e6e0, 0.7);
  const p1 = box(0.66, 0.25, 0.5, white); p1.position.set(0, 0.1, 0); p1.rotation.set(0.1, 0.7, 0.05); g.add(p1);
  const p2 = box(0.66, 0.25, 0.5, white); p2.position.set(-1.1, 0.12, 0.8); p2.rotation.set(-0.2, -0.4, 0.3); g.add(p2);
  const bag = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), std(0xd0d0c8, 0.9)); bag.scale.y = 0.6; bag.position.set(0.7, 0.1, 0.9); g.add(bag);
  g.position.copy(ground('backpacks', 0));
  return shadowAll(g);
}

// The invented webcam on its pole tripod
export function buildWebcam(heading) {
  const g = new THREE.Group();
  const grey = std(0x8a8a8a, 0.5, 0.6), black = std(0x111111, 0.5, 0.2);
  for (let i = 0; i < 3; i++) { const a = i * 2.094; g.add(rod(new THREE.Vector3(Math.cos(a) * 0.45, 0, Math.sin(a) * 0.45), new THREE.Vector3(0, 0.9, 0), 0.015, grey)); }
  g.add(at(cyl(0.02, 0.02, 0.5, grey, 6), 0, 1.15, 0));
  const body = box(0.18, 0.14, 0.26, std(0xd8d8d0, 0.6)); body.position.set(0, 1.45, 0); g.add(body);
  const lens = cyl(0.045, 0.05, 0.08, black, 12); lens.rotation.x = Math.PI / 2; lens.position.set(0, 1.45, -0.16); g.add(lens);
  const panel = box(0.35, 0.01, 0.25, std(0x1a2238, 0.4, 0.4)); panel.position.set(0, 1.58, 0.05); panel.rotation.x = -0.3; g.add(panel);
  g.rotation.y = -heading * D2R;
  return shadowAll(g);
}

// Procedural rocks around a point. Size-frequency from Surveyor 3 counts in this crater:
// N(>=y mm) = 3e6 * y^-2.56 per 100 m^2 (JPL PD 125, fig VII-19). Mostly half buried.
export function buildRocks(centres, seed = 1) {
  let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const geos = [];
  for (let v = 0; v < 4; v++) {
    const g = new THREE.IcosahedronGeometry(1, 2);
    const p = g.attributes.position; const k = [rnd() * 9, rnd() * 9, rnd() * 9];
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      let f = 1 + 0.22 * Math.sin(x * 3 + k[0]) * Math.sin(y * 3.3 + k[1]) + 0.12 * Math.sin(z * 5.1 + k[2]);
      // facets: flatten along a few random planes (angular blocks)
      f *= 1 - 0.25 * Math.max(0, x * Math.cos(k[0]) + z * Math.sin(k[0]) - 0.5);
      p.setXYZ(i, x * f * (1 + v * 0.1), y * f * 0.75, z * f);
    }
    g.computeVertexNormals(); geos.push(g);
  }
  const mat = new THREE.MeshStandardMaterial({ color: 0x8a8580, roughness: 0.95, flatShading: true });
  const group = new THREE.Group();
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p3 = new THREE.Vector3();
  const lists = geos.map(() => []);
  for (const c of centres) {
    const area = Math.PI * c.r * c.r;
    // rocks >= 6 cm: 3e6 * 60^-2.56 per 100 m^2 ~ 0.85 per m^2. Visible sizes only.
    const count = Math.min(9000, Math.round(area / 100 * 3e6 * Math.pow(60, -2.56)));
    for (let i = 0; i < count; i++) {
      const rr = c.r * Math.sqrt(rnd()), a = rnd() * Math.PI * 2;
      const e = c.e + Math.cos(a) * rr, n = c.n + Math.sin(a) * rr;
      if (c.avoid && c.avoid.some(([ae, an, ar]) => Math.hypot(e - ae, n - an) < ar)) continue;
      const size = 0.06 * Math.pow(rnd(), -1 / 2.56) / 2; // radius m, inverse-CDF of the power law
      const r = Math.min(size, 0.6);
      const bury = 0.35 + 0.3 * rnd();
      p3.set(e, heightAt(e, n) - r * bury * 0.75, -n);
      q.setFromEuler(new THREE.Euler(rnd() * 0.5, rnd() * 6.28, rnd() * 0.5));
      sc.set(r * (0.8 + rnd() * 0.5), r, r * (0.8 + rnd() * 0.5));
      lists[i % geos.length].push(m4.compose(p3, q, sc).clone());
    }
  }
  lists.forEach((l, i) => {
    const im = new THREE.InstancedMesh(geos[i], mat, l.length);
    l.forEach((m, k) => im.setMatrixAt(k, m));
    im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false;
    group.add(im);
  });
  return group;
}
