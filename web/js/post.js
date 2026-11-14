// The camera: one full-screen pass from the linear HDR render to a webcam picture.
// Lens: soft optics, barrel distortion, lateral chromatic aberration, vignetting, glare around bright things.
// Sensor: auto exposure (set from main.js), CCD vertical smear from the Sun, a soft highlight shoulder,
// black level, read noise that grows with gain, hot pixels at night.
// Encoder: 4:2:0 chroma, light 8x8 block quantization, 6-bit steps. Rare transmission glitches.
// The scene is rendered at reduced resolution and scaled up, as a cheap camera would.
// Code written with an AI assistant (Claude Code, Anthropic), Nov 2026.
import * as THREE from 'three';

export function createPost(renderer, samples = 4) {
  const size = new THREE.Vector2();
  renderer.getDrawingBufferSize(size);
  const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples });
  rt.texture.minFilter = THREE.LinearFilter; rt.texture.magFilter = THREE.LinearFilter;
  rt.depthTexture = new THREE.DepthTexture(size.x, size.y);
  rt.depthTexture.type = THREE.FloatType;
  const uniforms = {
    tColor: { value: rt.texture }, tDepth: { value: rt.depthTexture },
    res: { value: size.clone() }, outRes: { value: size.clone() }, time: { value: 0 }, exposure: { value: 1 },
    webcam: { value: 1 }, dof: { value: 1 }, focus: { value: 30 }, aperture: { value: 1 },
    near: { value: 0.1 }, far: { value: 30000 }, gain: { value: 0 }, glitch: { value: 0 }, glitchY: { value: 0.5 },
    signal: { value: 1 }, sunUV: { value: new THREE.Vector2(-9, -9) }, sunAmt: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
varying vec2 vUv;
uniform sampler2D tColor; uniform sampler2D tDepth; uniform vec2 res; uniform vec2 outRes; uniform float time; uniform float exposure;
uniform float webcam; uniform float dof; uniform float focus; uniform float aperture; uniform float near; uniform float far;
uniform float gain; uniform float glitch; uniform float glitchY; uniform float signal; uniform vec2 sunUV; uniform float sunAmt;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float linDepth(vec2 uv){ float z = texture2D(tDepth, uv).r; z = z * 2.0 - 1.0; return 2.0 * near * far / (far + near - z * (far - near)); }
float coc(float d){ return clamp(abs(1.0 / focus - 1.0 / d) * aperture * 3.0, 0.0, 1.0); }
vec3 hdr(vec2 uv){ return texture2D(tColor, uv).rgb; }
float luma(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
void main(){
  vec2 uv = vUv;
  vec2 pix = 1.0 / res;
  float cam = webcam;
  // --- transmission glitch: a band slips sideways
  if (cam > 0.5 && glitch > 0.0) {
    float band = step(abs(uv.y - glitchY), 0.03 * glitch);
    uv.x += band * (hash(vec2(floor(uv.y * 80.0), time)) - 0.5) * 0.08;
  }
  // --- lens: barrel distortion
  vec2 cc = uv - 0.5; float r2 = dot(cc * vec2(res.x / res.y, 1.0), cc * vec2(res.x / res.y, 1.0));
  if (cam > 0.5) uv = 0.5 + cc * (1.0 - 0.035 * r2) ;
  vec3 col = hdr(uv);
  // --- autofocus blur
  if (dof > 0.5) {
    float d = linDepth(uv);
    float c = coc(d);
    if (c > 0.02) {
      vec3 acc = col; float wsum = 1.0;
      float r = c * 7.0;
      for (int i = 0; i < 16; i++) {
        float a = float(i) * 2.39996; float rr = sqrt(float(i) + 0.5) / 4.0;
        vec2 o = vec2(cos(a), sin(a)) * rr * r * pix;
        float dd = linDepth(uv + o);
        float w = (dd < d) ? coc(dd) : 1.0;
        acc += hdr(uv + o) * w; wsum += w;
      }
      col = acc / wsum;
    }
  }
  if (cam > 0.5) {
    // --- lateral chromatic aberration (added as a fringe on top of the blurred picture)
    vec2 ca = cc * 0.0035 * (0.3 + r2);
    vec3 base = hdr(uv);
    col.r += hdr(uv + ca).r - base.r;
    col.b += hdr(uv - ca).b - base.b;
    col = max(col, vec3(0.0));
    // --- glare: light scattered inside a cheap lens around anything very bright
    vec3 glare = vec3(0.0);
    float jit = hash(vUv * res) * 6.2832;
    for (int i = 0; i < 12; i++) {
      float a = float(i) * 0.5236 + jit;
      vec2 o1 = vec2(cos(a), sin(a)) * vec2(res.y / res.x, 1.0) * (0.6 + 0.8 * hash(vUv * res + float(i)));
      glare += max(hdr(uv + o1 * 0.012) * exposure - 1.2, 0.0) * 0.5;
      glare += max(hdr(uv + o1 * 0.035) * exposure - 2.0, 0.0) * 0.25;
      glare += max(hdr(uv + o1 * 0.09) * exposure - 6.0, 0.0) * 0.12;
    }
    col += glare / 12.0 / exposure * 0.6;
    // --- CCD smear: a vertical streak through a very bright source
    float smear = 0.0;
    for (int i = 0; i < 24; i++) smear += max(luma(hdr(vec2(uv.x, (float(i) + 0.5) / 24.0))) * exposure - 25.0, 0.0);
    col += vec3(0.95, 0.97, 1.0) * smear * 0.0025 / exposure;
  }
  // --- veiling glare and lens ghosts when the Sun is in or near the frame (in exposure units)
  if (cam > 0.5 && sunAmt > 0.0) {
    vec2 asp = vec2(res.x / res.y, 1.0);
    float ds = length((vUv - sunUV) * asp);
    vec3 veil = vec3(0.75, 0.82, 1.0) * sunAmt * (0.035 + 0.25 * exp(-ds * 3.5) + 1.5 * exp(-ds * 16.0));
    vec2 axis = vec2(0.5) - sunUV;
    for (int i = 0; i < 4; i++) {
      float k = float(i) * 0.55 + 0.45; float rad = 0.04 + 0.05 * float(i);
      vec2 gp = sunUV + axis * k * 2.0;
      float gd = length((vUv - gp) * asp);
      vec3 tint = i == 0 ? vec3(0.6, 0.8, 1.0) : (i == 1 ? vec3(1.0, 0.8, 0.6) : (i == 2 ? vec3(0.7, 1.0, 0.8) : vec3(0.9, 0.7, 1.0)));
      veil += tint * sunAmt * 0.07 * smoothstep(rad, rad * 0.6, gd);
    }
    col += veil / max(exposure, 1e-6);
  }
  // --- exposure and sensor response
  col *= exposure;
  if (cam > 0.5) col *= 1.0 - 0.32 * r2; // vignetting
  vec3 lin = col;
  col = 1.0 - exp(-col * 1.15);              // soft shoulder: highlights roll off, then clip
  col = pow(col, vec3(1.0 / 2.2));
  if (cam > 0.5) {
    // 4:2:0 chroma: colour comes from the 2x2 block, brightness from the pixel
    vec2 blk = (floor(vUv * outRes / 2.0) * 2.0 + 1.0) / outRes;
    vec3 cb = 1.0 - exp(-hdr(blk) * exposure * 1.15); cb = pow(cb, vec3(1.0 / 2.2));
    float y = luma(col);
    col = clamp(y + (cb - luma(cb)), 0.0, 1.0);
    // light 8x8 block quantization: flatten fine detail a little inside each block
    vec2 b8 = (floor(vUv * outRes / 8.0) * 8.0 + 4.0) / outRes;
    vec3 c8 = pow(1.0 - exp(-hdr(b8) * exposure * 1.15), vec3(1.0 / 2.2));
    col = mix(col, col + (luma(c8) - luma(col)) * 0.12, 1.0 - smoothstep(0.0, 0.15, abs(luma(c8) - luma(col))));
    // sensor: black level, read noise (luma fine grain + blotchy chroma), more with gain
    vec2 px = floor(vUv * outRes);
    float t = floor(time * 15.0);
    float nl = hash(px + t * 1.37) - 0.5;
    vec2 pc = floor(px / 3.0);
    vec3 nc = vec3(hash(pc + t * 2.1), hash(pc + t * 3.3 + 7.0), hash(pc + t * 5.7 + 3.0)) - 0.5;
    float g = 0.012 + 0.07 * gain;
    col += nl * g + nc * g * 0.6 * vec3(1.0, 0.6, 1.2);
    col = 0.03 + col * 0.96;                       // black is never quite black
    // hot pixels: fixed positions, visible when the gain is up
    float hp = step(0.99985, hash(px * 0.731 + 11.0));
    col += hp * gain * vec3(0.8, 0.5, 0.4);
    // slight colour cast and wobble of a cheap sensor
    col *= vec3(1.0 + 0.01 * sin(time * 0.7), 1.01, 0.985 - 0.01 * sin(time * 0.53));
    col = floor(col * 63.0 + hash(px + 0.5)) / 63.0; // 6-bit steps, dithered
  }
  col *= signal;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`,
    depthTest: false, depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  const scene = new THREE.Scene(); scene.add(quad);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  let scale = 0.72; // render scale while the webcam look is on
  return {
    rt, uniforms,
    setScale(s) { scale = s; },
    setSize(w, h) {
      uniforms.outRes.value.set(w, h);
      const sw = Math.round(w * scale), sh = Math.round(h * scale);
      rt.setSize(sw, sh); uniforms.res.value.set(sw, sh);
    },
    render(sceneMain, camera) {
      renderer.setRenderTarget(rt); renderer.render(sceneMain, camera);
      renderer.setRenderTarget(null); renderer.render(scene, cam);
    },
  };
}
