# Project page text (NASA Space Apps 2026)

Paste each block into the matching field on the team's Project tab. Replace the `[...]` parts. All English.

---

## Project Name

Webcam: Ocean of Storms

## High-Level Project Summary

A forgotten 1997 webcam pointed at the Apollo 12 landing site on the Moon. It shows the site live, tonight, under blue Earthlight. Hold REW and it rewinds 57 years: the lunar module's top half comes back, the flag goes down, the science station disappears, and Surveyor 3 stands alone in its crater in 1967. A two-minute "Tell me the story" tour walks school-age visitors through what each machine did and what it found out. Then the info page reveals the trick: there is no camera. The picture is calculated in the browser from NASA data: the LROC height model and orbital photo of the site, the measured position of every piece of hardware, and the real Sun, Earth and star positions for any date. It turns abandoned hardware into something you can visit, and it shows young people how real data can rebuild a place nobody can go.

## Link to Project Demo

[link to the 30-second video or the slide deck]

## Link to Final Project

[https://... live site]  (source: [https://github.com/... repository])

## Detailed Project Description

**What it does.** The page looks like an abandoned personal homepage from 1997 with a webcam picture of the Apollo 12 site in the Ocean of Storms. The camera is live: right now it is lunar night, stars are out, and the ground is lit by Earthlight. The visitor can pan, zoom, switch between two cameras, and move through time: hold REW or FF and the speed ramps from minutes per second to decades per second. Every object appears and disappears at the minute it really did: Surveyor 3 on 20 April 1967; Intrepid on 19 November 1969 at 06:54:35 UTC; the flag at 12:41; the S-band dish, which a thruster test blew over two hours before liftoff; the ALSEP science station; the backpacks thrown out before launch; Surveyor's TV camera and scoop, which the crew cut off and took home.

**Storytelling for school-age visitors.** A "Tell me the story" button plays a two-minute guided tour with captions: night on the Moon today, Earth in the sky, a rewind to 1967 and Surveyor alone, the Apollo 12 landing with 5-degree morning shadows, the flag, the science station and its nuclear generator, the crew visiting Surveyor (seen from CAM 2 as its camera disappears), liftoff, the 1977 switch-off, and back to live. A "Did you know?" line follows the date. Every object has a short spec sheet in plain language with sources; the SNAP-27 generator's sheet computes how much heat its plutonium still gives off on the date you are viewing. "Show me" links jump to key moments, and every view has a shareable link.

**The reveal.** The info page opens with "THERE IS NO CAMERA." It separates what is real (terrain, positions, dates, Sun, Earth, stars), what is modelled (3D shapes, rocks below 2 m, exposure, autofocus) and what is invented (the cameras and the 1997 website). It explains why the sky is black in daytime, why Earth stays in one place, why the science station needed a nuclear generator, and how the two cameras verify each other: each draws a marker where the other should be, and the line of sight over the crater rim is tested against the height model.

**How it works.** A Python script turns the LROC NAC digital terrain model (2 m) and SLDEM2015 (59 m, out to the horizon) into height grids, and the LROC 0.5 m orthophoto into a ground brightness map. The orthophoto's baked-in 2010 shading is removed by fitting it against the terrain's shading; the fitted Sun azimuth (272 degrees) matches the computed one (273), an independent check of the geometry. Hardware and its shadows are painted out of the photo so the 3D models replace them. In the browser, three.js renders the terrain, hardware and sky. Sun and Earth directions come from Astronomy Engine plus the IAU rotation model of the Moon, transformed into local east-north-up at the LROC coordinates of the lander. The Sun at touchdown comes out at 5.15 degrees; the mission documents say 5.1. Shadows combine a shadow map for the hardware with a ray march toward the Sun across the height map for the terrain. Rocks are generated with the size distribution Surveyor 3 itself measured in this crater. A single post-process pass adds autofocus blur, auto exposure (centre-weighted, so Earth is exposed properly when you zoom in on it) and a light webcam look whose noise grows with the camera gain at night.

**Benefits.** Students usually hear about active missions. This puts them at a site where old hardware still stands, lets them discover its history by playing with time, and then shows that what they saw was built from open data and physics. It runs in any modern browser, desktop or phone, with no install, no account and no backend.

**Tools.** JavaScript (ES modules), GLSL, HTML/CSS, three.js, Astronomy Engine, Python (NumPy, Pillow) for data preparation. Static hosting on Apache.

**What we hope to achieve.** More sites (Apollo 11-17, Lunokhod, Mars landers) using the same "picture as a function of time" approach, and a classroom version where students check the cameras against the astronauts' own photographs.

## Use of Super Intelligence (SI)

Yes. The code (JavaScript, GLSL shaders, the Python data-preparation script) and first drafts of the page text were written with Claude Code (Anthropic), an AI coding assistant, working from the author's own concept, plans and fact sheets prepared before the event. The idea, the research, the choice and checking of facts, and all design decisions are the author's. Every code file has a header stating the AI assistance; the HTML pages carry an `ai-disclosure` meta tag; the README and the info page say the same. No images, video or audio are AI-generated: the ground and Earth images are NASA's, the lunar module is NASA's 3D model, other hardware is built from simple shapes.

## NASA Data

- LROC NAC DTM and orthophotos of the Apollo 12 landing site, product NAC_DTM_APOLLO12 (NASA/GSFC/Arizona State University, PDS LROLRC_2001): terrain heights (2 m) and ground brightness (0.5 m).
- LROC coordinates of anthropogenic objects on the Moon (Wagner et al. 2017, updated 2026): positions of Intrepid, Surveyor 3, ALSEP.
- SLDEM2015 (LRO LOLA + Kaguya TC), NASA PDS Geosciences Node: terrain from the site to the horizon.
- NASA 3D Resources: Apollo Lunar Module model.
- NASA Space Science Data Coordinated Archive (NSSDCA): Apollo 12 LM, ALSEP and Surveyor 3 records.
- Apollo 12 Mission Report (MSC-01855), Apollo 12 Press Kit, Apollo 12 Preliminary Science Report (SP-235), ALSEP Flight System Familiarization Manual (1969), Surveyor III Mission Report (JPL TR 32-1177), Surveyor 3 Preliminary Science Results (JPL PD 125), Surveyor Program Results (SP-184): dimensions, deployment layout, rock counts, facts on the spec sheets.
- Apollo Lunar Surface Journal (NASA History Office): event times to the second.
- NASA Blue Marble 2002 (NASA Earth Observatory/GSFC): Earth texture.

## Space Agency Partner Data and Other References

- Kaguya Terrain Camera data (JAXA), as part of SLDEM2015.
- Yale Bright Star Catalogue, 5th revised edition (Hoffleit and Warren), via CDS Strasbourg.
- Astronomy Engine, Don Cross, MIT licence.
- three.js (MIT licence), including GLTFLoader and DRACOLoader; Draco decoder (Google, Apache 2.0).
- Henriksen et al. (2017), Extracting accurate and precise topography from LROC narrow angle camera stereo observations, Icarus 283.
- Wagner et al. (2017), Coordinates of anthropogenic features on the Moon, Icarus 283, 92-103.
- Brian McInall's 2018 planimetric map in the Apollo Lunar Surface Journal was used only as a reference for small-object positions; it is not reproduced.
- Code assistance: Claude Code (Anthropic), see SI section.
- No copyrighted images, music or text are reproduced. No NASA logos or insignia are used.
