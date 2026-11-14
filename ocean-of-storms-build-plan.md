# Webcam: Ocean of Storms - weekend build plan

Plan only. No code exists and none is written before the hackathon starts.
Written 6 Oct 2026. Updated the same day for the 2026 FAQ and for the two-camera decision.
Updated 8 Oct 2026 to match the concept: sound cut, jump links and date field, webcam filter with clean fullscreen, layers panel, "did you know" ticker as bonus.
Updated again 8 Oct for the new `concept.md` (engineering spec, 65 sections). Where it disagrees with `ocean-of-storms-concept.md` on build details, `concept.md` is newer and wins. The facts in `ocean-of-storms-objects.md` still win over both.
Hackathon 14-15 Nov 2026. Submission closes at the end time of the event, Universal Event.

## The rule this plan obeys

2026 participant FAQ, dated 23 Sep 2026:

> Teams are not allowed to begin working on the challenges prior to the hackathon.

That is all it says. No definition of "working". The 2022 FAQ was softer and allowed planning. This one does not say so.

How we read it:

| Activity | Reading |
|---|---|
| Learning the subject, reading sources, collecting facts | Fine. Nobody can forbid reading about Apollo 12. |
| Thinking up the idea, a concept note | Fine. Every team arrives with an idea. |
| An hour plan for the weekend | Fine. |
| Asking a rights holder for permission | Fine. |
| Writing the actual text that goes on the site | Grey. It is part of the deliverable. |
| Generic tooling: editor, Node, a hosting account, learning the rendering library on a throwaway sample | Fine. It is not the challenge solution. `concept.md` agrees. |
| Code, converted data, 3D models, the page | Not allowed. |

Consequence for the copy doc: it is a reference, not a deliverable. The words on the site get written on the weekend. Juha was going to rewrite them in his own voice anyway.

If in doubt, ask the organisers through the Contact Us page what counts as working on the challenge. One email settles it.

## Other things the FAQ settles

- Solo is allowed. "You may be on a team by yourself."
- Universal Event projects are judged only against other Universal Event projects. The nomination rate is said to be comparable to local events.
- A local event can be chosen or changed at any time until the hackathon closes.
- One team, one challenge.
- Challenge statements come out 28 October, with full details, resources and requirements. Today there is only the summary. The statement can add requirements we have not seen.
- Space Apps Connect opens 2-3 November.
- Project Submission Guide and Judging and Awards Guide come out 13 November, the day before.
- Nominees and finalists in December 2026. Global winners in January 2027.
- Participant Terms and Conditions exist and are unread. Licence and ownership of the submission will be in there.

## Dates to act on

| Date | What |
|---|---|
| 28 Oct | Challenge statement out. Read it the same day. Check the concept still fits and note the required data resources. |
| 2-3 Nov | Space Apps Connect opens. |
| 13 Nov | Submission guide and judging guide out. Read both that evening. |
| 14 Nov 09:00 | Start. First line of code. |
| 14 Nov 18:22 | Apollo 12 launch, 57 years ago to the minute. |
| 15 Nov 23:59 | Submission closes, team lead's local time. To be confirmed in the submission guide. |

## Two ideas that keep it buildable

**The picture is a function of the time.**
There is no simulation and no state. Give the page a date, it draws that date.
LIVE means time equals now. REW and FF change the number. A "show me" link is a date in the URL.

**The viewer does not move.**
The world is one 3D scene. A camera is a fixed position, a heading and a lens.
CAM 2 is the same scene from a second position, so it costs dressing, not engineering.
No walking, no open world.

## Parts

| Part | Job | Approach |
|---|---|---|
| Clock | one time value, speed, direction | plain JS, URL parameter for deep links. Holding REW or FF ramps the speed up continuously, so dates fly past and the scene updates every frame. |
| State and determinism | one state object (date, camera, orientation, zoom, speed, live, quality, layers) that the renderer reads | same state gives the same picture, so screenshots and the demo are repeatable. No state kept in the UI separately. |
| Data layer | every object and event as a record with valid-from, valid-to, position, uncertainty and sources | drives date-aware visibility, the HUD sheets and the generated sources page. Each dataset also records source, URL, name, date accessed and use. |
| Sky maths | Sun and Earth direction at the site, Moon's orientation | a JS astronomy library with JPL-grade accuracy, runs in the browser |
| Ground | terrain mesh from the 2 m height map | WebGL scene, height map as an image |
| Near ground | detail closer than the 2 m data can show | first line of defence is the autofocus (next row), which blurs the foreground. Second line is a few modelled rocks and bootprints per camera, placed from the crew's panoramas where possible, marked as modelled. |
| Autofocus | shallow depth of field that hides the low-resolution foreground | a depth-based blur in the same post-process pass as the picture filter. The focus distance has a floor (about 15-20 m, to be tuned) so nothing nearer than the well-resolved range is ever sharp. Focus pulls with a small overshoot, like a hunting autofocus, when the camera pans, zooms or switches, or when the date jumps. Tapping an object focuses on it, if it is beyond the floor. |
| Light | Sun as the only strong light, Earth as weak light at night | one directional light with shadow map, one dim fill |
| Earth | sphere in the sky, lit from the real Sun direction | texture on a sphere. Phase comes free from the lighting. |
| Stars | points from a bright star catalogue | rotate with the Moon's orientation |
| Exposure | day: no stars, hard contrast. Night: stars, soft Earthlight | one switch driven by Sun height, with a short fade |
| Objects | lander, flag, fallen antenna, backpacks, instruments, Surveyor | simple models, each with a from-date and to-date |
| Cameras | list of fixed viewpoints: position, heading, pan and tilt limits, zoom cap | a table. CAM 1 at the tripod spot, CAM 2 on the crater slope. |
| Cross-check | each camera must see the other where geometry predicts | a debug overlay that draws the predicted spot. Line of sight tested against the terrain. |
| Picture filter | cheap 1997 webcam, not VHS: low effective resolution, mild compression, sensor noise, lower frame rate, small colour and exposure wobble, an occasional dropped frame or transmission artifact | one post-process pass on the canvas. Never hides the scene. Off in fullscreen. Two quality tiers (webcam, full), the first doubling as the phone low-detail switch. |
| Debug overlay | date, camera, Sun and Earth azimuth and elevation, bearing and distance between cameras, line of sight clear or blocked, FPS, visible objects. Wireframe terrain, object origins, axes, Sun vector. | off by default, switched on by a URL parameter. Built with the terrain on Saturday. Not part of the normal page. |
| Layers panel | toggles for filter, autofocus, shadows, Sun, Earthlight, stars, Earth, labels, camera markers, exposure | a settings object read by the render loop. Each toggle has one sentence of text. A "show me" link can set it. |
| HUD | labels and spec sheets, each with a "show on camera" link | HTML over the canvas. Old technical page style, not cards. |
| Skin | the 1996 homepage, with the visitor counter | HTML and CSS, responsive. Counter is local or deterministic, no backend. |
| Info page | the explanation | static HTML, "show me" links carry a date and a camera |
| Navigation | get to the good moments fast | one structured list of jump targets (id, label, date, camera, optional layer). It drives the row of text links under the picture, the info page's "show me" links and the ticker. No date is written twice. A native date and time input sets the clock. Opens on LIVE. |

The same astronomy library, in its Python form, gave a Sun height of 5.14 degrees at touchdown. The documented value is 5.1. That was a fact check on the concept, not project code.

## The camera cross-check

Known from the two site coordinates: Surveyor is 113 m south and 111 m east of the lander.

1. Put CAM 1 and CAM 2 at their positions.
2. Compute the bearing each way. They must differ by exactly 180 degrees.
3. Draw a marker in each view where the other camera should be.
4. Look. If the tripod model is not under the marker, a position, a heading or the terrain georeferencing is off.
5. Test line of sight over the crater rim. If the rim blocks it, move CAM 2 up the slope until both see each other, and note that.
6. Compare CAM 2's framing with the crew's own photo of Surveyor with the lander on the rim behind it.

This is the cheapest test of the whole scene and it doubles as a section on the info page.

## Data and assets to fetch on the day

| What | From | Note |
|---|---|---|
| Terrain, 2 m per pixel, 12.9 MB GeoTIFF | LROC, product `NAC_DTM_APOLLO12` | needs converting to an image the browser reads |
| Orthophoto of the site | same product family | ground colour and the footpaths |
| Crew panoramas and the Surveyor photo | Apollo 12 image library | reference for rock placement and for the CAM 2 check |
| Earth daily picture | NASA GIBS | could-have. Fallback: Blue Marble still. |
| Bright star catalogue | Yale Bright Star Catalogue or similar | about 9,000 stars, small file |
| Lander model | NASA 3D resources (Ames) | format and licence unchecked. Fallback: build from boxes. |
| Surveyor model | not found yet | fallback: build from boxes and three legs. Matters more now that CAM 2 looks straight at it. |
| Under construction gif | make one | old ones have unknown owners |
| Deployment times for every object | Lunar Surface Journal, EVA 1, EVA 2, close-out | drives the state table in the object sheet. Gathering, can be done before the weekend. |
| Painted-out orthophotos | made from the 0.5 m orthophoto | for dates before 20 Apr 1967 and before 19 Nov 1969. Making them is building, so on the day. |
| Footprint and path layers | made, following the dark tracks in the orthophoto | one for EVA 1, one for EVA 2. On the day. |
| Ground, rock and boot print references | Apollo 12 Image Library | for the generated near-camera detail. Gathering, before the weekend. |

Date range starts in 1967 (Surveyor 3 lands 20 Apr 1967). Object states over time are in `ocean-of-storms-objects.md`, section "States over time". Positions are in `data/positions/positions.csv`.

Whatever the 28 October challenge statement lists as its resources goes on top of this table.

## Hours

About 39 hours from Saturday 09:00 to Sunday 23:59. Sleep is in the plan.

**Saturday**

| Time | Work | Done when |
|---|---|---|
| 09-10 | Repo, hosting, empty page live on the internet | a URL exists |
| 10-12 | Clock and sky maths. Print Sun height for touchdown. | it says 5.1 |
| 12-15 | Terrain in the scene, CAM 1 at the tripod spot, Sun light and shadows, debug overlay | grey ground, long shadows at touchdown time, overlay shows Sun and camera numbers |
| 15-17 | Earth and stars, exposure switch | night looks like night |
| 17-18 | Food | |
| 18:22 | Apollo 12 launch, 57 years ago to the minute | worth a screenshot |
| 18-20 | Objects placed with date windows. Lander, flag, Surveyor first. | rewind shows 1967, 1969, today |
| 20-21 | Autofocus blur first (about 30 min), then rocks and bootprints near CAM 1 for the rest of the hour. If the blur already hides the dune, fewer rocks are needed. | the foreground stops looking like a dune |
| 21-23 | Time controls, pan, tilt, zoom, date field and jump-link row. Phone test. | usable with a thumb, every jump link lands |

**Sunday**

| Time | Work | Done when |
|---|---|---|
| 09-10 | CAM 2 on the crater slope, camera switch, cross-check overlay | each camera finds the other under its marker |
| 10-12 | 1996 skin around the picture, front page text written, webcam filter, clean fullscreen | it looks abandoned, the default view looks like a bad feed, fullscreen is crisp |
| 12-14 | HUD labels and spec sheets, written from the object sheet | every object answers a tap |
| 14-15 | Layers panel, wired to the render flags | each toggle changes the picture, no toggle breaks the scene |
| 15-17 | Info page written, with "show me" links | each link lands on the right moment and camera |
| 17-18 | One hour for the first science extra (eclipses), or the ticker if eclipses are done | stop at 18:00 whatever state |
| 18-19 | Fact pass against the object sheet. Fix wrong numbers. | no unsourced claim on the page |
| 19-21 | Demo video and submission text | uploaded |
| 21-23 | Buffer. If anyone is awake: the product test from `concept.md`. Hand over the page, say nothing, and watch whether they find REW, reach Apollo 12 and open info within about two minutes. | the buffer is spent on overruns first |
| 23:59 | Deadline | |

CAM 2 took the first Sunday hour, the rocks took one from Saturday evening, and the layers panel took one on Sunday afternoon. What paid for them: the should-have block shrank from two hours to one, and the fact pass from two hours to one. The webcam filter moved to Sunday morning with the skin, because it is part of the look. If Saturday runs late, the filter is the first thing that does not move back. Astronaut figures are unlikely unless something goes faster than planned.

The schedule is now full. The buffer (21-23 Sunday) is the only slack, and it is also where an overrun lands. If Saturday ends behind, cut in the order from the concept: figures, then CAM 2. The layers panel can then shrink to three toggles (filter, shadows, stars).

## Order of extras, if time appears

1. Lunar eclipses, with dates as "show me" links and jump links.
2. "Did you know" ticker. Bonus. Cheap: it reuses the jump-link table, adding date windows and one-line texts. About 45 minutes, most of it writing.
3. Ground temperature readout.
4. Generator heat readout.
5. Astronaut figures during the two moonwalks. Doubtful.
(Mission audio is cut.)
6. Light delay, Earth's size, Earth's wobble, Earthlight.
7. Real Earth clouds.
8. Seismometer trace, shadow ruler, magnetic tail lamp.
9. CAM 3 at the instruments.

Each is one readout or one effect. None may start after 18:00 on Sunday. The layers panel took the old extras hour, and the fact pass shrank from two hours to one, so there is room for one extra at most.

## The demo video

The site hides its own trick, so the video must not.
Thirty seconds, in this order: the dull still page. A hand finds REW. The lander appears with two people. Keep going, Surveyor alone. Back to LIVE, tilt up, Earth. Switch to CAM 2. The info page's first line.
A judge who watches only the video should understand the whole entry.

The video and the live demo aim at the same three moments from `concept.md`: time travel (a fake webcam rewinds to Apollo 12), the camera does not exist (the info page), and the cameras prove each other (CAM 2 sees CAM 1 on the rim). Everything else supports those three.

For a live demo, use the eight-step script in `concept.md` section 60: leave it on LIVE and say nothing for several seconds, press REW, stop at Apollo 12, pan up to Earth, open CAM 2, open info, toggle shadows, return to LIVE.

## Where it will go wrong

- **The challenge statement.** It arrives 28 October and may ask for something the concept lacks. Read it first, then decide.
- **Near-field ground.** 2 m data looks like a smooth dune from standing height. Now a problem in two places, not one. CAM 2 sits on a slope, which is harder to dress than flat ground. The answer is autofocus blur plus a few rocks, not thousands of stones. Open problems with the blur:
  - **Fullscreen.** The clean view removes the webcam filter, but if the blur goes too, the dune is exposed in the view meant for study. Keep the autofocus in fullscreen and offer it as a layer toggle, so a visitor who switches it off sees the raw foreground and the info page can say why it is there.
  - **Tilting down.** Pointing at the ground at your feet is the worst case. Limit the downward tilt so the near ground is rarely in frame.
  - **Honesty.** The blur is a modelling choice, so it is listed under "modelled" on the info page.
  - **Untested.** Whether it looks like autofocus or just like a cheap blur is only known on Saturday. Test it at the touchdown Sun angle and on CAM 2's slope before spending the rocks hour.
- **Line of sight.** The crater rim may hide the cameras from each other. Then CAM 2 moves, and its framing with it.
- **Shadow quality at 5 degrees Sun.** Grazing light is the hardest case for a shadow map. Test touchdown time first, not noon.
- **Phone performance.** A big terrain mesh on a phone. Have a low-detail switch from the start.
- **Positions.** Several object positions are still unsourced. Anything not sourced by Friday is left out, not guessed.
- **Surveyor up close.** CAM 2 looks straight at it. A crude model shows.
- **A dull LIVE view.** The page opens at lunar night. If testing shows judges bounce, switch to the fast-rewind-to-touchdown opening.
- **TV tripod position.** Two accounts disagree (6 m south-west, or "2 to 3 o'clock"). CAM 1 and its sight line to CAM 2 depend on it. Use 6 m south-west and mark it approximate.

## Before the weekend

1. Read the Participant Terms and Conditions. Licence and ownership.
2. Optional: ask the organisers what counts as working on the challenge.
3. Decide when each camera exists. Working default: CAM 1 works at every date, so Surveyor alone in 1967 is seen from it at long range. CAM 2 exists from 19 Nov 1969 and shows an empty "no signal" state before. `concept.md` section 14 leans the same way.
4. Decide the SNAP-27 readout. The object sheet says show heat, which is physics, and no invented electric figure. `concept.md` section 37 wants a "calculated remaining output". Either find a sourced electrical model or keep heat only.
5. List the jump-link moments: about eight, each with a date and a camera, taken from the timeline in the object sheet. Facts only. The link labels and the ticker texts are site text and get written on the weekend.
6. Finish the object sheet from the science report site map: positions, crater size, the generator's spot. This is reading, not building.
7. Find sources for the science extras: ground temperature figures, eclipse dates, the seismic data archive.
8. Decide hosting and the address. A hosting account is generic tooling and can be set up now.
9. 28 Oct: read the challenge statement.
10. 13 Nov: read the submission and judging guides.

## Submission notes

- Challenge: Abandoned but not Forgotten.
- The info page is the evidence of data use. Link to it directly.
- State the AI use plainly. Code was written with an assistant.
- State the invention plainly. The cameras are fiction, the rest is not.
- State the preparation plainly: idea and research before, everything on the site built on the weekend.
