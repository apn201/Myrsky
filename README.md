# Webcam: Ocean of Storms

NASA Space Apps Challenge 2026, challenge **Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars**.

**Live:** https://apn201.github.io/Myrsky/

A forgotten 1997 webcam pointed at the Apollo 12 landing site. Tap REW and it rewinds 57 years: Intrepid lifts off in reverse, the flag goes down, the crew's science station disappears, and Surveyor 3 stands alone in its crater in 1967.

Then the info page tells you: **there is no camera.** The picture is calculated in the browser from NASA data: the LROC height model and orbital photo of the site, the LROC coordinates of every piece of hardware, the Sun and Earth positions for the chosen date, and the stars. The cameras are the only invented part.

For school-age space fans: every object has a short spec sheet in plain language, a "did you know" line follows the date, and "show me" links jump to the moments that matter.

## Run it

It is a static site in `web/`. Any web server works:

```bash
python -m http.server 8137 --directory web
```

Then open http://localhost:8137 . Useful URL parameters: `?jump=touchdown`, `?t=1969-11-19T12:41:33Z&cam=1&yaw=245&pitch=4&fov=30`, `?layers=labels,-filter`, `?debug=1`.

No build step, no backend, no CDN: three.js and Astronomy Engine are in `web/vendor/`.

## How it works

| Part | Data | Code |
|---|---|---|
| Ground shape | LROC NAC DTM of the Apollo 12 site, 2 m/px; SLDEM2015 out to 12 km | `tools/prepare.py`, `web/js/terrain.js` |
| Ground brightness | LROC 0.5 m orthophoto M120012135. Its baked-in 2010 shading is divided out using the height model; hardware and its shadows are painted out | `tools/prepare.py` |
| Hardware positions | LROC anthropogenic objects table (Wagner et al. 2017), Apollo 12 Mission Report fig 3-6 | `web/js/data.js` |
| Hardware | Lunar module and Surveyor 3: cut-outs of crew photos (Apollo 12 panorama, AS12-48-7100), relit in the scene; their shadows come from 3D shapes (NASA 3D Resources lunar module, baked to a shadow-only mesh). ALSEP, flag, dish built from documented sizes | `web/js/models.js`, `tools/make_*` |
| Sun, Earth, stars | Astronomy Engine; IAU Moon rotation model; Yale Bright Star Catalogue | `web/js/sky.js` |
| Shadows | shadow map for hardware, plus a height-map ray march toward the Sun for the terrain | `web/js/terrain.js` |
| Webcam look, autofocus, exposure | one post-process pass | `web/js/post.js` |
| Timeline | Apollo Lunar Surface Journal event times, converted to UTC | `web/js/data.js` |

Checks: `node tools/check_sky.mjs` prints the Sun at touchdown (5.15 degrees; documented 5.1). The Sun direction fitted from the 2010 orthophoto's shading (azimuth 272) matches the computed 273.

Rebuilding `web/assets/` needs the large source files listed in `data/SOURCES.md` (they are not in git), then `python tools/prepare.py`.

## Data and credits

See `data/SOURCES.md` and the info page (`web/info.html`). Main NASA sources: LROC (NASA/GSFC/Arizona State University), NSSDCA, NASA 3D Resources, Apollo 12 Mission Report, Press Kit and Preliminary Science Report, Surveyor III Mission Report, NASA Blue Marble.

## Use of AI

The idea, research, fact sheets and decisions are the author's. The code (JavaScript, GLSL shaders, Python data preparation) and drafts of the page text were written with an AI coding assistant, **Claude Code (Anthropic)**, during the hackathon weekend. Every code file says so in its header, and the HTML pages carry an `ai-disclosure` meta tag. No images, video or audio on the site are AI-generated.

## Licence

Code: MIT (see `LICENSE`). NASA data and images follow NASA's media usage guidelines. The planning documents in the repo root are the author's notes.
