# Webcam: Ocean of Storms

NASA Space Apps Challenge 2026. Hackathon 14-15 November 2026. Solo, Universal Event.
Challenge: Abandoned but not Forgotten - storytelling about NASA's discarded equipment on the Moon and Mars.
Status: concept locked 6 Oct 2026, two-camera version. Updated 7 Oct 2026: sound cut, astronaut figures doubtful, jump links and date field added, opens on LIVE, webcam filter with clean fullscreen, layers panel, "did you know" ticker as bonus. Build plan synced 8 Oct. Nothing built.
Facts: `ocean-of-storms-objects.md` and `ocean-of-storms-verification.md`. Weekend: `ocean-of-storms-build-plan.md`.
Engineering spec: `concept.md` (8 Oct 2026), newer than this file on build details: architecture, state model, data layer, debug mode, priorities P0-P2, demo script, product test. This file keeps the story and the science.

## The fiction

In November 1969 the Apollo 12 crew left two 4K 25 fps cameras at the landing site.
They are wired to the nuclear generator that powers the science instruments.
In 1996 somebody made a website for the live stream.
The last update was in 1997.
The stream still works. Nobody is looking after the page.

## What the visitor sees

A neglected personal homepage. H1: "Webcam: Ocean of Storms".
An "under construction" gif. A visitor counter. "Last updated 1997".
One picture of grey ground and a black sky. It looks like a still.
It is not a still. It moves, at the real speed. Half a degree of Sun per hour.

Then they find the controls. Nothing announces them.

- VCR buttons: REW, PLAY, FF.
- Time acceleration: the three-arrow button from old flight sims.
- Pan, tilt, zoom.
- CAM 1 / CAM 2.
- A row of plain text jump links under the picture, and a date field. See "Getting to the good moments".
- A small "info" link.

Speed time up and the shadows dance. Earth turns. Stars wheel during the lunar night.
Rewind far enough and a lander stands there with two people next to it.
Rewind further and there is only Surveyor 3, alone since April 1967.

## The joke and the point

The page looks like a relic. The picture is computed.
Everything in the frame is where it really is, for any moment from 1967 to today.
The front page never says so. The info page does.

## Not this

- Not a remake of Apollo in Real Time. That project does not cover Apollo 12, and we are not filling that gap. No transcript browser, no mission timeline UI.
- Not a dashboard. Not a platform. Two cameras, one place.
- Not an open world. Nobody walks anywhere. See below.
- Not 90s technology. It only looks like it. Under the skin it is modern HTML5 and JavaScript, fully responsive, mobile first.

## Two cameras, no walking

The world is a real 3D scene: terrain from orbiter height data, with the hardware standing on it. Pan, tilt and zoom work because of that.
The viewer does not move. Decided 6 Oct 2026.

Why no movement:

- It is a webcam. A camera that walks breaks the fiction.
- One viewpoint can be dressed by hand in two days. A free-roaming one cannot. The height data is 2 m per pixel and looks like a smooth dune anywhere that has not been dressed.
- An open-world Moon is a different project, and others have made it.

Why two cameras:

- From the lander the instruments are 130 m away and Surveyor is 160 m off, down in a crater. On one camera half of "what they left behind" is a few pixels.
- A camera switch is true to the period. Webcam pages had CAM 1 and CAM 2.

| | CAM 1 | CAM 2 |
|---|---|---|
| Where | by the lander, where the real TV camera's tripod stood | on the slope of Surveyor crater |
| Sees | lander, flag, fallen antenna, backpacks under the hatch, footpaths, the instruments in the distance | Surveyor 3 close up, the crater wall, the lander on the rim behind |
| History | every date, so 1967 is seen from here at long range (working default) | from 19 Nov 1969. Before that it shows an empty "no signal" state. Working default, to confirm. |
| Priority | must have | first on the should-have list |

A possible CAM 3 at the instruments, with the generator in frame, only if Sunday goes well.

### The cameras see each other

Each camera is a small tripod in the other one's picture.
That gives a built-in test of the whole scene:

- The bearing from CAM 1 to CAM 2 and from CAM 2 to CAM 1 must be exact opposites. From the coordinates, Surveyor is 113 m south and 111 m east of the lander, so roughly south-east one way and north-west the other.
- Each must find the other at the predicted spot in the frame. If it does not, a position, a heading or the terrain is wrong.
- Line of sight over the crater rim comes out of the terrain data. If the rim hides one camera from the other, we learn that on Saturday, not from a judge.
- CAM 2 can be checked against a real photograph. The crew photographed Surveyor with the lander on the rim behind it. Our CAM 2 framing should match that picture.

For the info page this is a good plain lesson: two cameras that can see each other prove where they both are.

### Near the cameras

A few modelled rocks and bootprints close to each camera. The low Sun needs something to cast shadows with, and it hides the smoothness of the 2 m data.
Place them from the crew's own panorama photos where possible. Mark them as modelled.

Zoom is capped. The further it goes, the better the models must be, and Surveyor from boxes and legs does not survive a close look.

### Autofocus instead of thousands of stones

Decided 25 Oct 2026. The 2 m terrain data cannot show anything smaller than a few metres, and dressing the whole foreground with rocks is not feasible. So the camera has a shallow depth of field.

- The focus sits on the range where the data is good. The foreground in front of it is blurred.
- Focus moves like an old autofocus: a small pull and overshoot back and forth after every pan, zoom, camera switch or date jump.
- The focus distance has a floor, so nothing nearer than the well-resolved range is ever sharp. The few modelled rocks stay as shadow casters, but fewer are needed.
- It lives in the same post-process pass as the webcam filter. Cost is small because the webcam tier renders at low resolution anyway.
- It stays on in fullscreen, because fullscreen would otherwise expose the foreground. It is a layer toggle, and the info page lists it under "modelled": the blur hides the resolution of the terrain data, and the toggle lets you see that for yourself.
- Limit downward tilt so the ground at the camera's feet is rarely in frame.

## The info page

One small link in the footer, between the visitor counter and the "best viewed in" badge. Lowercase "info". Nothing draws the eye to it.

This is where the mask comes off. The site is educational, so the explanation is part of the site, not only of the submission write-up.

First line of the page: "There is no camera."

Then, in plain language for a school-age reader:

1. **What is real, what is modelled, what is made up.** Three short lists. Made up: the cameras and their cable. Everything else is measured or calculated.
2. **Where the Sun is.** How a day on the Moon lasts a month. A live number: the Sun's height at the site right now.
3. **Why the shadows are right.** The ground is a real height map made from orbit. Shadows are cast from the real Sun direction.
4. **Why the sky is black at noon.** Exposure. Stars only show during the two-week night.
5. **Why Earth never sets.** It hangs in one spot, turns once a day and goes through phases.
6. **Where the stars come from.** A catalogue, turned at the Moon's slow rate.
7. **Why the picture never goes dark.** The real plutonium generator, and how much heat it has left.
8. **How we know the cameras point the right way.** They can see each other.
9. **The coincidence.** 705 lunar months is 57 years, almost to the hour.
10. **Sources and credits.** Every dataset, every object's source, and where AI was used.

Each section ends with a "show me" link that jumps a camera to the moment that proves the point: touchdown, local noon, deep night, the day Surveyor arrived.
That is the teaching device. Read a claim, press a link, see it.

Tone: the front page stays in character. The info page is written straight, by the present-day author, dated 2026.
Look: same plain style as the front page, so it does not feel like leaving the site.

The info page also does a job for the judges. A submission has to show how the challenge's data was used. This page is that, live.

## Power: nuclear

The cameras run day and night. No "NO SIGNAL" during the 14-day lunar night.

The reason is real hardware. Apollo 12 left a plutonium-238 generator (SNAP-27, about 70 W electrical at the start) to power the instrument package. The fictional cameras are plugged into it.
Plutonium-238 has a half-life of about 88 years. After 57 years the fuel still gives 64 percent of its original heat. The electrical output has dropped further than that.

On the front page this is one dry line in the camera specs. The generator also gets its own spec sheet in the HUD, because it is the most interesting thing they left.

## What is computed

| Thing | How | Source |
|---|---|---|
| Sun direction at the site | ephemeris, in the browser | JPL ephemeris via a JS astronomy library, checked offline against JPL Horizons / SPICE |
| Shadows | cast from Sun direction over terrain and hardware | LRO terrain model `NAC_DTM_APOLLO12`, 2 m per pixel |
| Earth position, phase, rotation | ephemeris plus lunar libration | same ephemeris |
| Earth's face today | recent real cloud imagery as texture | NASA GIBS daily mosaic |
| Earth's face in history | generic Earth, labelled as generic | Blue Marble |
| Stars | catalogue positions, lunar sky rotation | bright star catalogue |
| Exposure | sunlit day: black sky. Night: stars, ground lit by Earth | computed from Sun and Earth illumination |
| Hardware on the ground | hand-placed models at surveyed positions | LRO images, Lunar Surface Journal, the science report site map |
| Camera headings | each camera must see the other where geometry says | the two site coordinates |

Physics that shapes the experience:

- A lunar day is 29.5 Earth days. About 14 days of light, 14 of night.
- In daylight the sky is black with no stars. That is correct exposure, not a bug.
- Earth sits 58 to 74 degrees above the horizon and barely moves. It turns once a day and runs through phases in a month. You must tilt up to find it.
- At touchdown the Sun was 5.1 degrees up. 1969 opens with very long shadows.

## The anniversary coincidence

57 years is 20819 days. 705 lunar months is 20819.07 days.
Checked by calculation: at touchdown the Sun was 5.1 degrees up in 1969 and is 4.4 degrees up at the same clock time in 2026.

Consequences:

- Apollo 12 launched 14 Nov 1969, 16:22 UTC. That is Saturday 14 Nov 2026, 18:22 Finnish time. During the hackathon.
- On the hackathon weekend the site is in lunar night, as it was in 1969. The live picture at submission is stars and Earthlight.
- Local sunrise in 2026 is 18 Nov about 22:20 UTC, 00:20 on the 19th in Finland. Touchdown was 19 Nov, ten hours after sunrise. The page gets its daylight back on the anniversary of the landing.

## Controls, borrowed from history

- VCR transport: REW, PLAY, FF, as physical-looking buttons.
- Time acceleration with three arrows, as in old flight and space sims. Steps: 1x, 60x, 3600x, one day per second, one month per second.
- Date display styled as a camcorder timestamp burned into the picture, with CAM 1 or CAM 2 in the corner.
- "LIVE" lamp that goes out when you leave real time.
- Pan / tilt / zoom as a clunky webcam control pad. Drag and pinch also work on phones.
- Camera switch as two buttons.
- Mission clock in ground elapsed time, shown only while the date is inside the mission.

### Getting to the good moments

Decided 7 Oct 2026. The picture is a function of the date, so this costs little.

- The page opens on LIVE: night, stars, Earthlight. The "looks like a still" reveal stays.
- Directly under the picture sits a row of plain text links in 1996 style, so nobody has to hunt with REW. Each is a date plus a camera. Draft list: Touchdown, Flag shadow at sunset, Backpacks hit the ground, Liftoff, Surveyor alone 1967, Lunar eclipse, Back to live.
- A date field for typing or picking any moment. A plain date input is enough, not a calendar widget.
- The same list of jump targets feeds the info page's "show me" links. One list, two uses.
- Fallback if LIVE proves too dull in testing: first load runs a fast rewind to touchdown, then a "live" button returns.

## Picture quality and layers

Decided 7 Oct 2026. Only the first view holds the illusion, so the picture gets two faces.

**Default: a bad webcam feed.** The computed image goes through a filter pass: low effective resolution, mild compression, sensor noise, a lower frame rate, a little colour and exposure wobble, an occasional dropped frame or transmission artifact. The target is a cheap 1997 webcam, not 1980s videotape, so no VHS look. Subtle, so the content stays readable. It sells the 1996 page and the "this is a still" first impression.

**Fullscreen: clean.** The button is styled as a webcam "enlarge" link. In fullscreen the filter is off and the scene renders at full resolution and quality, for study and for screen grabs. This is the educational face.

**Layers panel.** A small link opens a panel of toggles. Default is "realistic", which means everything on and the filter on.

| Toggle | Effect |
|---|---|
| Noise and transmission errors | filter on or off |
| Autofocus | off shows the sharp, low-resolution foreground the blur normally hides |
| Shadows | off shows the ground flat-lit |
| Sun | removes the direct light |
| Earthlight | removes the night fill |
| Stars | on in daylight too, to show what exposure hides |
| Earth | hide or show |
| Labels | HUD names on the objects |
| Camera markers | the cross-check overlay |
| Exposure | off lets stars and sunlit ground show together, as the eye would |

The toggles are the teaching device. Switch exposure off at noon and the stars appear. Switch shadows off and the ground turns into a smooth dune. Each toggle gets one sentence of explanation, and the info page links to it ("show me" can also set a toggle).

Cost: the filter is one post-process pass. Most toggles are flags on parts the scene already has. Quality tiers (webcam, full) double as the low-detail switch for phones.

## What they left behind

Pan and zoom to look around. A simple HUD overlay labels each object. Tap one for its spec sheet: what it is, mass, power, what it measured, last contact, state today.
The full sheet with positions and sources is `ocean-of-storms-objects.md`. Short version:

At the lander:

- Intrepid descent stage
- US flag. Hanging, because the crossbar latch failed. Still standing.
- Dish antenna. Lying on the ground, blown over by a thruster test before liftoff.
- Two backpacks under the hatch, thrown out before liftoff. The seismometer recorded them landing.
- Rubbish bags, a tool carrier, a broken Hasselblad, a dropped map, the cut TV cable
- A roll of colour film left by mistake. Never developed.
- Footpaths

At the instruments, about 130 m west-north-west:

- Central station, SNAP-27 generator, seismometer, magnetometer, solar wind spectrometer, ion detector

In the crater, about 160 m south-east:

- Surveyor 3, tan with dust, minus its camera and scoop
- Al Bean's silver astronaut pin, somewhere on the slope

Not there: the colour TV camera. It burned out when pointed at the Sun and was brought home. CAM 1 stands where its tripod stood.

Out of frame but part of the story: the ascent stage, crashed on purpose on 20 Nov 1969. The seismometer rang for about an hour.

## Sound

Cut, 7 Oct 2026. No audio, no sound link, no rights to clear. Could return only as a post-hackathon idea (Honeysuckle Creek tapes, permission needed).

## Science extras, all could-have

Each is one readout or one effect, and each falls out of the date. None is needed for the entry.

| Extra | What the visitor gets | Based on |
|---|---|---|
| Lunar eclipses | Earth covers the Sun. A red ring in the sky, the ground goes copper. | same ephemeris, plus a list of eclipse dates as "show me" links |
| Ground temperature | A thermometer that swings from about plus 100 C at noon to about minus 170 C at night | orbiter temperature measurements, simplified to a curve by Sun height |
| Generator heat | A number that has been falling since 1969 | half-life of plutonium-238 |
| Light delay | "Picture is 1.28 s late", changing as the Moon's distance changes | Earth-Moon distance from the ephemeris |
| Earth's size in the sky | Earth grows and shrinks about 12 percent over a month | same |
| Earth's wobble | Trace of where Earth sits in the sky over a month. It draws a small loop. | lunar libration |
| Earthlight | How bright the night ground is, by Earth's phase | Earth phase |
| Shadow ruler | Measure the flag's shadow and compare with the 15-20 m seen from orbit | Sun height, orbiter images |
| Seismometer trace | The real wiggle from the backpacks hitting the ground and from the crash | Apollo seismic data archive, to be located |
| In Earth's magnetic tail | A lamp that lights for a few days around full Moon, when the solar wind instrument saw almost nothing | Moon's position relative to the Sun-Earth line |
| "Did you know" ticker | A short line under the picture that changes as the date moves, tied to real events: 1967 Surveyor bounces, 1969 lightning at launch, the burned-out TV camera, the thrown backpacks, the 1977 switch-off, the 2009 orbiter photos. Outside any event it shows a general fact. | a table of date windows and one-line texts, the same shape as the jump-link list. Facts from the object sheet. |
| Real Earth clouds | Yesterday's actual weather on the Earth in the sky | NASA daily satellite mosaic |

First four in order, if there is time: eclipses, "did you know" ticker, ground temperature, generator heat.
The ticker is bonus only. Its texts are written on the weekend, in the author's voice, and every claim needs a source in the object sheet.
The temperature figures and the magnetic tail effect are from what I know and need a source before they ship.

## Documentation

Two layers.

- The info page on the site, for visitors. Described above.
- The submission write-up, for judges. Same content with more depth: ephemeris and libration, terrain and shadow casting, exposure model, the two-camera cross-check, Earth texture pipeline, star field, the jump-link and date navigation, and where AI was used.

Both list what is measured, what is modelled and what is invented. The cameras and their cable to the generator are invented. Nothing else should be.

## Still open

1. The full challenge statement, out 28 October. It can add requirements.
2. Participant Terms and Conditions, unread.
3. Object positions: the science report site map is the source to read.
4. Whether CAM 2 has a clear line to CAM 1 over the crater rim. Known only once the terrain is loaded.
5. When each camera exists (working default in the CAM table).
6. SNAP-27 readout: heat only, or a sourced electrical model. `concept.md` asks for remaining output; the object sheet says heat only.

The pre-work rule is settled: "Teams are not allowed to begin working on the challenges prior to the hackathon." No code and no site text before 14 November.

## Weekend scope

Must have: the page, CAM 1 with correct Sun, shadows, Earth and stars, rocks near the camera, time controls back to 1967, hardware visible, HUD with spec sheets, the info page with its "show me" links.
Also must have now: the jump-link row, the date field, the webcam-quality filter and clean fullscreen.
Should have, in order: CAM 2 at Surveyor with the mutual-sight check, the layers panel, then the first science extra (eclipses). Astronaut figures are doubtful.
Could have: the other science extras above, CAM 3 at the instruments.
Will not have: walking, an open world, animated astronauts, sound, transcript UI, any backend that needs looking after.

Cutting order if two days is not enough: astronaut figures, then CAM 2.

## Possible epilogue, not part of the entry

A real bell in Kouvola, struck from the 1969 seismogram on 20 November. Parked.
