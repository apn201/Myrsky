// One full-screen pass: autofocus blur, exposure + tone mapping, and the 1997 webcam look
// (light sensor noise that grows with gain, mild blockiness, rare transmission errors).
// Code written with an AI assistant (Claude Code, Anthropic), Nov 2026.
import * as THREE from 'three';

export function createPost(renderer, samples = 4) {
  const size = new THREE.Vector2();
  renderer.getDrawingBufferSize(size);
  const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples });
  rt.depthTexture = new THREE.DepthTexture(size.x, size.y);
  rt.depthTexture.type = THREE.FloatType;
  const uniforms = {
    tColor: { value: rt.texture }, tDepth: { value: rt.depthTexture },
    res: { value: size.clone() }, time: { value: 0 }, exposure: { value: 1 },
    webcam: { value: 1 }, dof: { value: 1 }, focus: { value: 30 }, aperture: { value: 1 },
    near: { value: 0.1 }, far: { value: 30000 }, gain: { value: 0 }, glitch: { value: 0 }, glitchY: { value: 0.5 },
    signal: { value: 1 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
varying vec2 vUv;
uniform sampler2D tColor; uniform sampler2D tDepth; uniform vec2 res; uniform float time; uniform float exposure;
uniform float webcam; uniform float dof; uniform float focus; uniform float aperture; uniform float near; uniform float far;
uniform float gain; uniform float glitch; uniform float glitchY; uniform float signal;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float linDepth(vec2 uv){ float z = texture2D(tDepth, uv).r; z = z * 2.0 - 1.0; return 2.0 * near * far / (far + near - z * (far - near)); }
vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
float coc(float d){ return clamp(abs(1.0 / focus - 1.0 / d) * aperture * 3.0, 0.0, 1.0); }
void main(){
  vec2 uv = vUv;
  if (webcam > 0.5 && glitch > 0.0) { // a band of the frame slips sideways for a moment
    float band = step(abs(uv.y - glitchY), 0.03 * glitch);
    uv.x += band * (hash(vec2(floor(uv.y * 80.0), time)) - 0.5) * 0.08;
  }
  if (webcam > 0.5) { // light blockiness, like a cheap compressor
    vec2 blk = floor(uv * res / 2.0) * 2.0 / res + 1.0 / res;
    uv = mix(uv, blk, 0.6);
  }
  vec3 col = texture2D(tColor, uv).rgb;
  if (dof > 0.5) {
    float d = linDepth(uv);
    float c = coc(d);
    if (c > 0.02) {
      vec3 acc = col; float wsum = 1.0;
      float r = c * 7.0;
      for (int i = 0; i < 16; i++) {
        float a = float(i) * 2.39996; float rr = sqrt(float(i) + 0.5) / 4.0;
        vec2 o = vec2(cos(a), sin(a)) * rr * r / res;
        float dd = linDepth(uv + o);
        float w = (dd < d) ? coc(dd) : 1.0; // sharp near objects do not bleed over
        acc += texture2D(tColor, uv + o).rgb * w; wsum += w;
      }
      col = acc / wsum;
    }
  }
  col *= exposure;
  if (webcam > 0.5) {
    float n = hash(uv * res + fract(time * 13.1)) - 0.5;
    float lum = dot(col, vec3(0.3, 0.6, 0.1));
    col += n * (0.006 + 0.05 * gain) * (0.3 + sqrt(max(lum, 0.0)));
    col.r *= 1.0 + 0.012 * sin(time * 0.7);
    col.b *= 1.0 - 0.012 * sin(time * 0.53);
  }
  col = aces(col);
  col = pow(col, vec3(1.0 / 2.2));
  if (webcam > 0.5) { col = floor(col * 64.0 + hash(uv * res) ) / 64.0; }
  col *= signal;
  gl_FragColor = vec4(col, 1.0);
}`,
    depthTest: false, depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  const scene = new THREE.Scene(); scene.add(quad);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return {
    rt, uniforms,
    setSize(w, h) { rt.setSize(w, h); uniforms.res.value.set(w, h); },
    render(sceneMain, camera) {
      renderer.setRenderTarget(rt); renderer.render(sceneMain, camera);
      renderer.setRenderTarget(null); renderer.render(scene, cam);
    },
  };
}
