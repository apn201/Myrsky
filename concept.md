# Ocean of Storms
## Webcam: Ocean of Storms

**NASA Space Apps Challenge 2026**  
**Hackathon:** 14–15 November 2026  
**Challenge:** Abandoned but Not Forgotten  
**Product type:** Browser-based interactive scientific storytelling experience  
**Primary platform:** Desktop + mobile browser  
**Architecture:** Static frontend, client-side computation, no required backend

---

# 1. Product Definition

## One sentence

**Ocean of Storms is a forgotten 1997 Moon webcam that never existed: a real-time browser reconstruction of the Apollo 12 landing site where the visitor can rewind 57 years and discover that the scene is calculated from real NASA data.**

## Core idea

The visitor initially believes they are looking at:

> an abandoned, low-quality webcam pointed at the Moon.

They gradually discover that:

> **there is no camera.**

The image is generated from:

- NASA lunar terrain data
- spacecraft/object positions
- Sun position
- Earth position
- lunar sky geometry
- star positions
- lighting and shadows
- historical mission dates

The interface deliberately hides the sophistication underneath an obsolete-looking webcam page.

The contrast between **1997 presentation** and **2026 computational science** is the product.

---

# 2. Design Principles

## 2.1 It is a webcam, not a simulator

Do not turn this into:

- an open-world Moon
- a flight simulator
- Google Earth for the Moon
- an Apollo mission dashboard
- a mission transcript browser
- a conventional 3D educational application

The visitor has a fixed camera.

They can:

- pan
- tilt
- zoom
- rewind
- fast-forward
- change camera
- change date

They cannot walk.

---

## 2.2 The magic comes before the explanation

The visitor should first experience the strange thing.

Only afterwards should they learn how it works.

Bad:

> "This is a NASA-data-driven 3D reconstruction."

Good:

> "Webcam: Ocean of Storms"

Then let them discover that it isn't a webcam.

---

## 2.3 No dashboard aesthetics

Avoid:

- cards everywhere
- modern gradients
- giant buttons
- SaaS UI
- excessive icons
- analytics-style panels
- modern navigation bars

The frontend should feel like an abandoned personal website from approximately 1996–1998.

The underlying technology can be modern.

---

## 2.4 Scientific claims must be traceable

Every non-fictional object or physical behaviour must have a source.

Maintain a clear distinction:

### REAL

Measured or documented:

- terrain
- landing-site coordinates
- hardware locations
- Apollo hardware
- Surveyor 3
- Sun position
- Earth position
- stars
- mission dates
- lunar illumination

### MODELLED

Our reconstruction:

- terrain rendering
- 3D hardware geometry
- camera positions
- small rocks
- bootprints
- visual exposure
- Earth texture representation
- shadows

### INVENTED

Explicit fiction:

- webcam
- cameras
- camera cables
- fictional 1997 website
- camera electronics

Nothing invented should be presented as historical fact.

---

# 3. The Primary User Journey

The first-time experience should be approximately:

```text
OPEN SITE
    |
    v
1997-STYLE WEBCAM
    |
    v
looks like a still image
    |
    v
visitor notices LIVE / controls
    |
    v
presses REW
    |
    v
scene moves backwards through time
    |
    v
1969
    |
    v
Apollo 12 landing site appears
    |
    v
visitor pans / explores
    |
    v
discovers Earth / hardware / Surveyor
    |
    v
discovers CAM 2
    |
    v
CAM 1 visible from CAM 2
    |
    v
INFO
    |
    v
"THERE IS NO CAMERA."
    |
    v
explanation of NASA data + physics
```

This sequence should be tested before optional features are added.

---

# 4. Landing Page

## 4.1 Visual hierarchy

Top:

```text
WEBCAM: OCEAN OF STORMS
```

Main viewport:

```text
+------------------------------------------------+
|                                                |
|                                                |
|                 MOON SCENE                     |
|                                                |
|                                                |
| CAM 1                             LIVE         |
+------------------------------------------------+
```

Below or overlaid:

```text
[ REW ] [ PLAY ] [ FF ]

[ < ] [ > ] [ ZOOM + ] [ ZOOM - ]

CAM 1   CAM 2

1996-11-...
```

Footer:

```text
Visitors: 004817

Last updated: 1997

info
```

Do not make the controls visually polished.

They should look functional, slightly ugly and old.

---

# 5. Initial State

On first load:

```text
camera = CAM1
mode = LIVE
date = current date/time
quality = webcam
```

The current 2026 lunar conditions should be calculated.

During the hackathon weekend the expected result is approximately:

- lunar night
- stars visible
- Earth visible
- Earthlight illuminating terrain
- no Sunlit ground

The exact state must always come from the astronomical calculation rather than hardcoded assumptions.

---

# 6. The First-Load Illusion

The initial image should be intentionally subtle.

Do not show:

- obvious animation
- large UI notifications
- explanatory text
- an instructional overlay

The scene should initially resemble a frozen webcam image.

However, physical quantities must continue changing.

Examples:

- stars move
- Earth position changes
- Earth phase changes
- illumination changes

The user should eventually notice:

> "Wait. This image is moving."

---

# 7. Webcam Rendering Mode

Default mode:

## BAD WEBCAM

Apply a lightweight post-processing effect.

Suggested effects:

- reduced effective resolution
- mild compression
- subtle sensor noise
- slight frame-rate reduction
- tiny colour instability
- occasional dropped frame
- subtle transmission artifact
- slight exposure instability

Do **not** make it look like VHS.

The intended aesthetic is:

> cheap 1997/1998 webcam

not:

> 1980s videotape.

The degradation must never prevent the visitor from understanding the scene.

---

# 8. Fullscreen Mode

Fullscreen removes the webcam degradation.

The same scene is rendered cleanly.

This creates a second reveal:

> The "bad webcam" was only presentation.

Fullscreen should therefore be useful for:

- studying objects
- examining shadows
- screenshots
- judge demonstrations
- mobile exploration

---

# 9. Camera Controls

## Desktop

Support:

- mouse drag = pan
- mouse wheel = zoom
- optional right/left interaction for tilt
- UI buttons

## Mobile

Support:

- one-finger drag = pan
- pinch = zoom
- tap controls
- camera switching
- date input

Do not require keyboard input.

---

# 10. Camera Model

The camera is fixed in physical space.

It can rotate.

It cannot translate.

Conceptually:

```text
CAMERA POSITION
      |
      +---- pan
      |
      +---- tilt
      |
      +---- zoom
```

No:

```text
WASD
walk
fly
orbit
free camera
```

The visitor should always feel like they are operating a mounted webcam.

---

# 11. CAM 1

## Location

Approximate position of the Apollo 12 TV-camera tripod.

## Primary subjects

CAM 1 should be optimized to see:

- Intrepid descent stage
- American flag
- fallen antenna
- backpacks
- footpaths
- nearby surface details
- distant instrument package
- Surveyor region where practical

This is the primary camera.

CAM 1 is mandatory for MVP.

---

# 12. CAM 2

## Location

Near Surveyor 3 / Surveyor crater.

## Primary subjects

- Surveyor 3
- crater
- lander on rim
- surface details

CAM 2 is strongly preferred over optional science features.

The camera should be positioned using actual coordinates.

Do not eyeball the position.

---

# 13. Mutual Camera Verification

This is a key product feature.

Each camera must be capable of seeing the other where terrain permits.

Calculate:

```text
CAM1 -> CAM2 bearing
CAM2 -> CAM1 bearing
```

These should be reciprocal directions.

Use terrain to determine actual line of sight.

The application should allow a developer/debug mode to show:

```text
CAM 1
position
heading
bearing to CAM 2
distance

CAM 2
position
heading
bearing to CAM 1
distance

LINE OF SIGHT
VISIBLE / BLOCKED
```

The production interface does not need to show all of this.

The educational page should explain it.

---

# 14. Historical Camera Availability

The fictional camera exists only from:

```text
1969-11-19
```

for CAM 2 if the final decision requires this.

Before that date:

- CAM 1 may show the site
- CAM 2 should either be unavailable or show an appropriate empty/undefined state

Do not silently create historical contradictions.

---

# 15. Time System

The scene is a deterministic function of time.

Conceptually:

```text
scene = render(
    location,
    camera,
    datetime,
    camera_orientation,
    render_options
)
```

Changing the date should not require loading another scene.

Everything should recalculate.

---

# 16. Time Controls

Controls:

```text
REW
PLAY
FF
```

and speed selector:

```text
1x
60x
3600x
1 day/sec
1 month/sec
```

The exact speed implementation can be adjusted for usability.

---

# 17. VCR Behaviour

REW/FF should feel like physical transport controls.

Holding REW:

```text
normal
    ↓
faster
    ↓
very fast
    ↓
historical dates fly past
```

Do not simply jump between predefined dates.

The scene should continuously update.

This makes the time travel feel physical.

---

# 18. LIVE

When:

```text
sceneDate ≈ currentDate
```

show:

```text
LIVE
```

When the user leaves real time:

```text
LIVE
```

turns off.

The current selected date should always be visible.

---

# 19. Date Input

Provide a simple native date/time input.

No complex calendar UI.

Also provide jump links.

Example:

```text
Touchdown
Flag
Backpacks
Liftoff
Surveyor 1967
Lunar eclipse
Back to LIVE
```

These are simple links, not a timeline application.

---

# 20. Jump Targets

Maintain a single structured list.

Example:

```javascript
const jumpTargets = [
  {
    id: "surveyor-1967",
    label: "Surveyor alone",
    date: "...",
    camera: "CAM1"
  },
  {
    id: "touchdown",
    label: "Touchdown",
    date: "...",
    camera: "CAM1"
  }
];
```

The same data must drive:

1. front-page jump links
2. info-page "show me" links
3. future event/ticker system

Do not duplicate these dates in multiple places.

---

# 21. Mission Events

Initial events:

- Surveyor 3 arrival
- Apollo 12 launch
- Apollo 12 landing
- flag deployment
- equipment deployment
- backpacks thrown
- liftoff
- ascent-stage impact
- later mission/instrument events

Only include events with verified sources.

---

# 22. The Moon Scene

## Terrain

Use the NASA LRO Apollo 12 terrain dataset specified in the project research.

Target:

```text
~2 m/pixel
```

Do not generate fictional terrain.

The terrain is important because:

- shadows depend on it
- camera line-of-sight depends on it
- camera-to-camera visibility depends on it
- crater geometry depends on it

---

# 23. Terrain Rendering Strategy

Do not attempt to build the entire Moon.

Build only the required local terrain around the Apollo 12 site.

Recommended approach:

```text
heightmap
    ↓
local terrain mesh
    ↓
material / albedo
    ↓
Sun lighting
    ↓
shadow map
```

The camera should remain within the dressed area.

---

# 24. Hardware

Required MVP objects:

### Apollo 12

- Intrepid descent stage
- US flag
- antenna
- backpacks
- instrument package
- major visible equipment
- Surveyor 3

Secondary objects:

- rubbish bags
- tool carrier
- Hasselblad
- map
- TV cable
- colour film
- footpaths

Objects should be prioritized by:

1. visibility
2. storytelling value
3. judge recognition
4. implementation effort

Do not model objects nobody can see.

---

# 25. Model Fidelity

The product does not require movie-quality Apollo hardware.

Models must be:

- recognizable
- correctly positioned
- correctly scaled
- visually consistent
- sufficiently detailed for the camera's maximum zoom

Do not spend the weekend producing beautiful internal geometry that is never visible.

---

# 26. Rocks and Surface Details

Near each camera:

- place a small number of rocks
- place selected bootprints
- reproduce notable surface features where practical

These have two purposes:

1. hide limitations of terrain resolution
2. provide recognizable shadow-casting objects

Clearly document which are reconstructed/modelled.

---

# 27. Sun

The Sun position must be calculated from the selected date/time.

Do not animate the Sun using a fake periodic function.

The renderer should receive something like:

```javascript
sunDirection
```

from the astronomy layer.

The Sun drives:

- direct illumination
- shadows
- sky position
- exposure
- lunar day/night state

---

# 28. Shadows

Shadows are one of the most important visual proof points.

They must respond to:

- Sun direction
- object geometry
- terrain

A flag or other object should produce visibly changing shadows as time moves.

This is one of the strongest demonstrations that the image is calculated.

---

# 29. Earth

Earth should be physically positioned in the lunar sky.

The viewer should have to tilt the camera upward to find it.

Earth should:

- remain in the appropriate region of the sky
- rotate
- change phase
- respond to lunar geometry/libration as appropriate

The Earth should not behave like a generic skybox object.

---

# 30. Earth Texture

For present-day dates:

Use the NASA GIBS daily Earth imagery where technically practical.

For historical dates:

Use generic Blue Marble imagery.

Clearly label historical Earth imagery as:

> Generic Earth representation.

Do not imply that the actual 1969 cloud pattern has been reconstructed.

---

# 31. Stars

Use a star catalogue.

Stars should be positioned according to celestial coordinates.

They should appear to move correctly as lunar time progresses.

Stars should not normally be visible in the daylight exposure.

---

# 32. Exposure

Default:

```text
PHYSICALLY PLAUSIBLE CAMERA EXPOSURE
```

During lunar daylight:

- Sunlit surface visible
- sky black
- stars invisible

During lunar night:

- stars visible
- surface may be illuminated by Earthlight
- Sun absent

Optional educational exposure override:

```text
EXPOSURE OFF
```

This allows stars and bright surface illumination to coexist.

This is explicitly an educational visualization, not a claim about what a real camera would capture.

---

# 33. Educational Reveal

The INFO page is part of the product.

It is not documentation bolted onto the side.

First heading:

# THERE IS NO CAMERA.

Then:

> This picture is calculated.

Explain:

1. what is real
2. what is modelled
3. what is invented

Then explain the physics.

---

# 34. INFO Page Structure

## 1. There is no camera

Explain the central trick.

## 2. What is real / modelled / invented

Three concise lists.

## 3. Where is the Sun?

Show current calculated Sun elevation.

Button:

```text
SHOW ME
```

returns to relevant scene/date.

## 4. Why are the shadows correct?

Explain terrain + Sun direction.

## 5. Why is the sky black?

Explain exposure.

## 6. Why can Earth stay in the sky?

Explain lunar geometry.

## 7. Why can the system theoretically run at night?

Explain SNAP-27 / Pu-238.

## 8. How do we know the cameras are positioned correctly?

Explain mutual visibility.

## 9. The 57-year coincidence

Explain:

```text
705 lunar months ≈ 57 years
```

## 10. Sources and credits

List datasets and references.

---

# 35. "Show Me" Links

Every educational explanation should be actionable.

Example:

> Shadows are determined by the actual Sun direction.

```text
[ SHOW ME ]
```

Clicking it:

- returns to camera
- sets relevant date
- sets relevant camera
- optionally enables the relevant layer

The visitor should be able to immediately see the claim.

---

# 36. Object HUD

Objects can have subtle labels.

Example:

```text
[ SURVEYOR 3 ]
```

Clicking opens a compact object sheet.

Example:

```text
SURVEYOR 3

Landed:
20 April 1967

Location:
Apollo 12 landing site

Status:
Abandoned

Mass:
...

Source:
...

[ SHOW ON CAMERA ]
```

Do not create modern card-heavy UI.

Think:

> old technical webpage / NASA document

---

# 37. SNAP-27

The generator deserves special treatment.

Display a small technical readout:

```text
POWER
SNAP-27
Pu-238

1969
~70 W electrical

2026
calculated remaining output
```

The exact electrical-output model must be sourced.

Do not imply that the fictional camera actually existed.

The fictional premise is:

> If a camera had been connected to the remaining available power.

---

# 38. 57-Year Coincidence

Make this a major educational moment.

Relevant facts:

```text
Apollo 12 launch:
14 Nov 1969

Hackathon:
14 Nov 2026

Difference:
57 years

705 lunar months:
approximately the same interval
```

During the hackathon, the live page should naturally make this visible.

Do not hardcode a fake "anniversary mode."

Calculate the live date normally.

---

# 39. Visitor Counter

Keep the counter.

Example:

```text
Visitors: 004817
```

Optional:

```text
Visitors now: 3
```

Do not build a backend purely for this.

A local/session or deterministic implementation is acceptable.

The counter is atmosphere, not functionality.

---

# 40. Optional Layers

Preferred order:

### Tier 1

- Sun
- shadows
- Earth
- stars

### Tier 2

- labels
- camera markers
- Earthlight

### Tier 3

- exposure override
- transmission effects

Do not build a complex rendering-debug interface.

---

# 41. Science Extras

Implement only after the core experience works.

Priority:

1. lunar eclipses
2. "Did you know" event ticker
3. ground temperature
4. generator heat
5. light delay
6. Earth's apparent size
7. lunar libration trace
8. shadow ruler
9. real seismometer traces
10. magnetic-tail effect
11. live Earth clouds

These are optional.

They must never delay:

- working camera
- time travel
- correct Sun
- correct terrain
- hardware
- educational reveal

---

# 42. Eclipse Feature

If implemented:

The Moon enters Earth's shadow.

The visitor can jump to a verified eclipse date.

Visual effect:

- Sun becomes obscured
- lunar surface illumination changes
- Earth/Sun geometry is visible

The implementation must be derived from the same astronomy system.

Do not create a separate eclipse simulation.

---

# 43. "Did You Know" Ticker

Optional.

It should be date-driven.

Example:

```text
DID YOU KNOW?

Surveyor 3 landed here in 1967.
```

As the date changes, the message changes.

Data structure:

```javascript
{
  start,
  end,
  text,
  source
}
```

Do not write arbitrary historical facts during development without sources.

---

# 44. Audio

**No audio in MVP.**

Do not spend hackathon time on:

- NASA recordings
- ambient Moon sound
- radio simulation
- sound effects

The silence is actually appropriate.

---

# 45. Performance

The scene must run acceptably on:

- modern desktop Chrome
- modern Safari
- modern Edge
- modern mobile Safari
- modern Android Chrome

Performance priority:

```text
stable interaction
>
correct scene
>
visual fidelity
>
extra effects
```

The degraded webcam mode can use lower-quality rendering.

Fullscreen can increase quality.

---

# 46. Architecture

Recommended conceptual architecture:

```text
                 APPLICATION
                      |
          +-----------+-----------+
          |                       |
      UI STATE                SCENE STATE
          |                       |
          +-----------+-----------+
                      |
                TIME / DATE
                      |
          +-----------+-----------+
          |           |           |
        SUN         EARTH       STARS
          |           |           |
          +-----------+-----------+
                      |
                RENDER ENGINE
                      |
          +-----------+-----------+
          |           |           |
       TERRAIN     HARDWARE    LIGHTING
```

---

# 47. Suggested Code Modules

Use clear separation.

```text
/src
  /astronomy
    sun.js
    earth.js
    stars.js
    moon.js
    ephemeris.js

  /scene
    terrain.js
    hardware.js
    cameras.js
    lighting.js
    shadows.js

  /time
    clock.js
    transport.js
    jumpTargets.js

  /ui
    webcam.js
    controls.js
    hud.js
    objectInfo.js
    layers.js
    infoPage.js

  /data
    objects.js
    events.js
    sources.js

  /render
    quality.js
    postprocess.js
```

Exact framework is implementation-dependent.

Do not over-engineer.

---

# 48. State Model

Central application state should resemble:

```javascript
{
  datetime,
  cameraId,
  cameraPosition,
  cameraHeading,
  cameraTilt,
  zoom,
  playbackMode,
  playbackSpeed,
  live,
  qualityMode,
  layers
}
```

Scene rendering should derive from this state.

Avoid duplicated state between UI and renderer.

---

# 49. Determinism

Given:

```text
same date
same camera
same camera orientation
same rendering settings
```

the application should produce the same scene.

This is important for:

- debugging
- screenshots
- judge demonstrations
- scientific credibility

---

# 50. Data Layer

Every object should have structured metadata.

Example:

```javascript
{
  id: "surveyor-3",
  name: "Surveyor 3",
  category: "spacecraft",

  position: {
    x: ...,
    y: ...,
    z: ...
  },

  scale: ...,

  validFrom: "...",
  validTo: null,

  model: "...",

  description: "...",

  sources: [
    "..."
  ],

  status: "abandoned"
}
```

This enables date-aware visibility.

---

# 51. Source Metadata

Every factual dataset must have:

```text
source
source URL
dataset name
date accessed
what it is used for
```

Maintain this separately from the UI.

The source page should be generated from the same metadata where practical.

---

# 52. Accuracy Rules

Never silently invent a precise value.

If an object's exact position is uncertain:

- use the best documented position
- record uncertainty
- avoid displaying unnecessary precision
- label modelled placement

Do not write:

> exact position: 130.274 m

if the source does not justify that precision.

---

# 53. Debug Mode

Build a developer-only debug overlay.

It should be switchable without modifying code.

Show:

```text
DATE
CAMERA
LAT/LON
ALTITUDE
SUN AZIMUTH
SUN ELEVATION
EARTH AZIMUTH
EARTH ELEVATION
CAM1 -> CAM2 BEARING
CAM2 -> CAM1 BEARING
CAM DISTANCE
FPS
VISIBLE OBJECTS
```

Also allow:

```text
wireframe terrain
camera marker
object origins
north/east axes
Sun vector
```

This is essential for Saturday debugging.

Do not expose it in the normal experience.

---

# 54. Camera Verification Tool

Provide a debug view:

```text
CAM 1
  |
  | bearing
  v
CAM 2
```

and a line in the 3D scene connecting them.

If terrain intersects the line:

```text
LINE OF SIGHT: BLOCKED
```

otherwise:

```text
LINE OF SIGHT: CLEAR
```

This allows the team to validate the mutual-camera concept before presentation.

---

# 55. Development Priorities

## P0 — Must work

### Scene

- local Moon terrain
- Sun
- basic lighting
- Apollo 12 lander
- flag
- Surveyor
- camera position

### Time

- current date
- arbitrary date
- REW
- FF
- PLAY
- LIVE

### Camera

- pan
- tilt
- zoom

### Web experience

- old webcam UI
- date display
- fullscreen
- webcam degradation

### Education

- INFO
- "THERE IS NO CAMERA"
- real/modelled/invented explanation
- sources

---

# 56. P1 — High-value

- CAM 2
- mutual camera visibility
- layers
- jump links
- date input
- Earth
- stars
- exposure mode
- object information

---

# 57. P2 — Only if everything works

- eclipse
- event ticker
- temperature
- generator heat
- light delay
- seismometer
- Earth clouds
- additional instruments
- CAM 3

---

# 58. Explicitly Do Not Build

Do not build:

- user accounts
- backend database
- CMS
- multiplayer
- chat
- walking
- open-world navigation
- mission transcript system
- Apollo mission timeline UI
- animated astronauts
- audio
- sound rights infrastructure
- generic AI chatbot
- procedural Moon covering the whole globe

These features dilute the concept.

---

# 59. Hackathon Weekend Plan

## Before the hackathon

No challenge implementation.

Allowed preparation:

- development environment
- generic rendering framework knowledge
- tooling
- research and verification required by the challenge rules

Do not create the actual challenge solution before the permitted start.

---

## Saturday Morning

### Goal

Get a bad but functioning Moon camera.

Implement:

1. project
2. terrain
3. camera
4. Sun
5. basic lighting
6. date
7. lander
8. webcam UI

At the end of this stage:

> visitor can look at the Apollo 12 landing site.

---

## Saturday Afternoon

Implement:

1. astronomical time calculation
2. Earth
3. stars
4. shadows
5. date navigation
6. REW/FF
7. historical hardware states

Target:

> visitor can rewind from 2026 to 1969.

---

## Saturday Evening

Implement:

1. CAM 2
2. Surveyor
3. camera mutual visibility
4. object HUD
5. jump links

Target:

> visitor discovers the physical relationship between the two cameras.

---

## Sunday Morning

Implement:

1. INFO page
2. real/modelled/invented explanation
3. sources
4. layers
5. fullscreen
6. webcam post-processing

Target:

> the complete story can be experienced without a presenter.

---

## Sunday Afternoon

Only now add:

- eclipse
- event ticker
- generator readout
- temperature
- visual polish

Then stop adding features.

---

# 60. Demo Script

The final demo should be reproducible.

## Step 1

Open:

```text
Webcam: Ocean of Storms
```

Leave it on LIVE.

Say nothing for several seconds.

Let the judge see the strange "webcam."

---

## Step 2

Point out:

```text
LIVE
```

Press REW.

Show the Moon moving backwards.

---

## Step 3

Stop at Apollo 12.

Show:

- lander
- flag
- tracks
- shadows

---

## Step 4

Pan upward.

Find Earth.

---

## Step 5

Open CAM 2.

Find Surveyor.

Show CAM 1 on the rim.

---

## Step 6

Open INFO.

Show:

# THERE IS NO CAMERA.

Explain that the image is calculated.

---

## Step 7

Toggle shadows.

Show how the scene changes.

---

## Step 8

Return to LIVE.

Show the current lunar conditions.

---

# 61. The Three "Wow" Moments

The product should optimize for exactly three.

## WOW #1 — Time travel

A fake webcam can be rewound to Apollo 12.

## WOW #2 — The camera doesn't exist

The entire picture is calculated.

## WOW #3 — The cameras prove each other

The two fictional cameras occupy physically calculated positions and can see each other.

Everything else supports these three moments.

---

# 62. Educational Outcome

After using the application, a school-age visitor should understand at least:

- the Moon has an extremely long day/night cycle
- the lunar sky can be black during daylight
- Earth behaves differently in the lunar sky than the Sun
- shadows reveal the Sun's position
- spacecraft can remain on the Moon for decades
- RTGs can provide long-duration power
- NASA's orbital measurements can reconstruct a surface
- a 3D scene can be scientifically constrained rather than invented

The visitor should learn these things by interacting with the scene.

---

# 63. The Product Test

At the end of development, give the application to someone without explaining it.

Ask them nothing.

Observe.

Within approximately two minutes they should:

1. understand it is a webcam
2. discover that time can be changed
3. reach Apollo 12
4. discover at least one object
5. discover INFO
6. understand that the image is calculated

If they immediately understand the technology, the fiction is too weak.

If they never understand the technology, the fiction is too strong.

The target is:

> **curiosity → discovery → surprise → explanation**

---

# 64. Quality Bar

The winning version is not the one with the most features.

It is the one where:

- the fake webcam feels believable
- the Moon looks physically convincing
- the time travel feels magical
- the historical objects are recognizable
- the shadows visibly respond to time
- Earth behaves correctly
- the CAM 1/CAM 2 relationship is convincing
- the educational reveal is extremely clear
- sources are transparent
- the whole thing works in a browser

A simple scene with correct physics is better than a beautiful scene with fake astronomy.

---

# 65. Final Product Statement

The application should leave the visitor with this realization:

> **There is no camera.**

The website is fictional.

The webcam is fictional.

But the Moon underneath it is real.

The terrain is real.

The Sun is calculated.

The Earth is calculated.

The stars are calculated.

The abandoned spacecraft are real.

And the visitor can move through time to see the place as it changed.

That is the product.