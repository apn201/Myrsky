// Fact check: Sun height at Apollo 12 touchdown should be 5.1 degrees (documented).
// Run: node tools/check_sky.mjs
import fs from 'fs'; import vm from 'vm'; import path from 'path'; import { fileURLToPath, pathToFileURL } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const web = path.join(here, '..', 'web');
const ctx = {}; ctx.window = ctx; ctx.self = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(web, 'vendor/astronomy.browser.min.js'), 'utf8'), ctx);
globalThis.Astronomy = ctx.Astronomy;
const { skyState } = await import(pathToFileURL(path.join(web, 'js/sky.js')).href);
for (const d of ['1969-11-19T06:54:35Z', '1969-11-19T12:41:33Z', '1969-11-20T14:25:47Z', '1967-04-20T00:04:53Z', '2010-02-05T12:27:48Z', '2026-11-15T00:00:00Z']) {
  const s = skyState(new Date(d));
  console.log(d, 'sun az/el', s.sunAzEl.az.toFixed(2), s.sunAzEl.el.toFixed(2), '| earth az/el', s.earthAzEl.az.toFixed(2), s.earthAzEl.el.toFixed(2), 'lit', s.earthLit.toFixed(2), 'radius deg', (s.earthAngularRadius * 57.2958).toFixed(3));
}
const { sunCovered } = await import(pathToFileURL(path.join(web, 'js/sky.js')).href);
for (const d of ['1967-04-24T10:30:00Z', '1967-04-24T11:30:00Z', '1967-04-24T12:06:26Z', '1967-04-24T13:30:00Z']) {
  const s = skyState(new Date(d));
  console.log('eclipse check', d, 'covered', sunCovered(s).toFixed(2), 'sun el', s.sunAzEl.el.toFixed(1), 'earth el', s.earthAzEl.el.toFixed(1));
}
