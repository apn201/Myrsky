# Project page: copy-paste, field by field

Matches the 2026 form (Project Summary, Project Links, Project Information). All English.
Screenshots for the page body are in `submission/screenshots/` (the form takes JPG/PNG/GIF up to 10 MB, pasted into Project Details).

---

## PROJECT SUMMARY

### Project Name

Webcam: Ocean of Storms

### Summary  (limit 1500 characters; this text is 1096 characters, 202 words)

Less than an hour into the first Apollo 12 moonwalk in November 1969, the TV camera was pointed at the Sun and burned out. The world never saw the landing site on TV. Until now. A forgotten 1997 webcam points at the Apollo 12 site. It shows the site live, tonight. Tap REW and it rewinds 57 years: the lunar module's top half comes back, the flag goes down, the science station disappears, and Surveyor 3 stands alone in its crater in 1967. Every object appears at the minute it really did. A two-minute "Tell me the story" tour walks school-age visitors through what each machine did and what it found out.

Then the info page reveals the trick: there is no camera. The picture is calculated in the browser from NASA data: the LROC height model and orbital photo of the site, the measured position of every piece of hardware, mission times to the second, and the real Sun, Earth and stars for any date. It turns abandoned hardware into a place you can visit, and shows young people how open data can rebuild somewhere nobody can go. Runs in any browser, on a phone too, with no install or login.

---

## PROJECT LINKS

### Project Demonstration

https://youtu.be/bli1WI9fx6s

(30 s video, public. Fallback if needed: the 7-slide PDF https://github.com/apn201/Myrsky/blob/main/submission/Webcam-Ocean-of-Storms-slides.pdf)

### Project

https://apn201.github.io/Myrsky/

---

## PROJECT INFORMATION

### Project Details

Paste the text below. Put screenshots where the `[IMAGE: ...]` lines are.

---

**Try it in two minutes**

1. Open https://apn201.github.io/Myrsky/ (desktop or phone, any modern browser). It opens LIVE: the Apollo 12 site right now.
2. Click **Tell me the story (2 min)**. Or use the "Show me" links: *1967: Surveyor 3 alone*, *1969: Apollo 12 lands*, *Crew visits Surveyor*, *Liftoff*.
3. Click **REW**, then click it again to go faster: an hour per second, then a day, a week, a month, a year, ten years.
4. Read the info page: https://apn201.github.io/Myrsky/info.html ("There is no camera").

Also on our own server: https://oos.helppox.com/ (same site). 30 s video: https://youtu.be/bli1WI9fx6s · Source code: https://github.com/apn201/Myrsky · Live slide deck: https://apn201.github.io/Myrsky/slides.html

[IMAGE: 01_page_touchdown.jpg  caption: The webcam page at touchdown, 19 Nov 1969 06:55 UTC. The Sun is 5 degrees up.]

**The missing pictures.** Apollo 12 took the first colour TV camera onto the lunar surface. On 19 November 1969 at 12:20 UTC, while it was being moved, it was pointed at the Sun and its tube burned out. Viewers on Earth saw nothing more of Apollo 12 on the surface; the crew carried the dead camera home. This project gives the site the camera it lost, and points it at the 57 years before and after.

**What it does.** The page looks like an abandoned personal homepage from 1997 with a webcam picture of the Apollo 12 site in the Ocean of Storms. The camera is live: right now it may be lunar night, with stars out and the ground lit by Earthlight. The visitor can pan, zoom, switch between two cameras and move through time. Every object appears and disappears at the minute it really did: Surveyor 3 on 20 April 1967; Intrepid on 19 November 1969 at 06:54:35 UTC; the flag at 12:41; the S-band dish, which a thruster test blew over two hours before liftoff; the ALSEP science station; the backpacks thrown out before launch; Surveyor's TV camera and scoop, which the crew cut off and took home.

[IMAGE: 02_surveyor_1967.jpg  caption: 24 April 1967. Surveyor 3 alone in its crater, two and a half years before anyone visits.]
[IMAGE: 06_visit_cam2.jpg  caption: CAM 2 in Surveyor crater, 20 Nov 1969: Intrepid on the rim while the crew cuts parts off Surveyor.]

**Storytelling for school-age visitors.** "Tell me the story" plays a two-minute guided tour with captions: night on the Moon today, Earth in the sky, a rewind to 1967 and Surveyor alone, the Apollo 12 landing with 5-degree morning shadows, the flag, the science station and its nuclear generator, the crew's visit to Surveyor (seen from CAM 2 as its camera disappears), liftoff, the 1977 switch-off, and back to live. A "Did you know?" line follows the date. Every object has a short spec sheet in plain language with sources; the SNAP-27 generator's sheet computes how much heat its plutonium still gives off on the date you are viewing. "Show me" links jump to key moments, and every view has a shareable link.

[IMAGE: 05_labels.jpg  caption: Labels on. Click any object for its story and sources.]

**The reveal.** The info page opens with "THERE IS NO CAMERA." It separates what is real (terrain, positions, dates, Sun, Earth, stars), what is modelled (3D shapes, rocks below 2 m, exposure, autofocus) and what is invented (the cameras and the 1997 website). It explains why the sky is black in daytime, why Earth stays in one place, why the science station needed a nuclear generator, and how the two cameras check each other: each draws a marker where the other should be, and the line of sight over the crater rim is tested against the height model.

[IMAGE: 13_info_reveal.jpg  caption: The info page: real, modelled, invented.]

**How it works.** A Python script turns the LROC NAC digital terrain model (2 m) and SLDEM2015 (59 m, out to the horizon) into height grids, and the LROC 0.5 m orthophoto into a ground brightness map. The orthophoto's baked-in 2010 shading is removed by fitting it against the terrain's shading; the fitted Sun azimuth (272 degrees) matches the computed one (273), an independent check of the geometry. Hardware and its shadows are painted out of the photo so the 3D models replace them. In the browser, three.js renders the terrain, hardware and sky. Sun and Earth directions come from Astronomy Engine plus the IAU rotation model of the Moon, transformed into local east-north-up at the LROC coordinates of the lander. The Sun at touchdown comes out at 5.15 degrees; the mission documents say 5.1. Shadows combine a shadow map for the hardware with a ray march toward the Sun across the height map for the terrain. Rocks are generated with the size distribution Surveyor 3 itself measured in this crater. The lunar module and Surveyor 3 are cut-outs of the crew's own photographs (Apollo 12 panorama and AS12-48-7100), relit for the current Sun and Earth, while 3D shapes cast their shadows. The picture then goes through a model of an imperfect camera, tuned against the crew's photographs: soft optics and autofocus, centre-weighted auto exposure, noise that grows with gain at night, vignetting, glare, and rare glitches. An optional "1969 TV look" turns it into the Apollo-era picture.

[IMAGE: 08_earth_1969.jpg  caption: Earth from the site on 19 Nov 1969, a crescent at its real position and phase.]
[IMAGE: 11_tv_look.jpg  caption: The optional "1969 TV look" layer.]

**Benefits.** Students mostly hear about missions flying now. This puts them at a site where old hardware still stands, lets them find its history by playing with time, and then shows that what they saw was built from open data and physics. It runs in any modern browser, desktop or phone, with no install, no account and no backend.

**Tools.** JavaScript (ES modules), GLSL shaders, HTML/CSS, three.js, Astronomy Engine; Python (NumPy, Pillow) for data preparation; Photoshop for the photo cut-out masks. Static hosting on GitHub Pages; no server code.

**What we hope to achieve.** More sites with the same "the picture is a function of the time" approach: all six Apollo sites, the Surveyors and Lunokhods, and Mars landers with HiRISE terrain. And a classroom mode where students check the webcam against the astronauts' own photographs.

---

### Use of Super Intelligence (SI)

Select the options for **code** and **text** (wording on the form may differ; pick the ones that mean "code/software" and "text/writing"). Do NOT select images, video or audio.

If there is a free-text box:

> The code (JavaScript, GLSL shaders, the Python data-preparation script) and first drafts of the page text and slide text were written with Claude Code (Anthropic), an AI coding assistant, working from the author's own concept, plans and fact sheets. The idea, research, choice and checking of facts, and all design decisions are the author's. Every code file has a header stating the AI assistance; the HTML pages carry an `ai-disclosure` meta tag; the README and the info page say the same. No images, video or audio are AI-generated: ground and Earth images are NASA's, the lunar module and Surveyor 3 are cut from NASA crew photographs, other hardware is built from simple shapes.

---

### NASA Data  (Link Text | Link URL, one row each)

| Link Text | Link URL |
|---|---|
| LROC NAC terrain model and 0.5 m orthophotos of the Apollo 12 site (NAC_DTM_APOLLO12) | https://data.lroc.im-ldi.com/lroc/view_rdr/NAC_DTM_APOLLO12 |
| LROC coordinates of anthropogenic objects on the Moon | https://data.lroc.im-ldi.com/lroc/view_rdr/SHAPEFILE_ANTHROPOGENIC_OBJECTS |
| SLDEM2015 lunar terrain (LRO LOLA + Kaguya), PDS Geosciences Node | https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/sldem2015/ |
| NASA 3D Resources: Apollo Lunar Module | https://github.com/nasa/NASA-3D-Resources/tree/master/3D%20Models/Apollo%20Lunar%20Module |
| NSSDCA: Apollo 12 Lunar Module / ALSEP (1969-099C) | https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C |
| NSSDCA: Surveyor 3 (1967-035A) | https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1967-035A |
| Apollo 12 Mission Report MSC-01855 (NTRS) | https://ntrs.nasa.gov/citations/19760072997 |
| Apollo 12 Preliminary Science Report SP-235 (NTRS) | https://ntrs.nasa.gov/citations/19700025955 |
| Apollo 12 Press Kit (1969) | https://apollojournals.org/alsj/a12/a12prskit.html |
| ALSEP Flight System Familiarization Manual (1969) | https://apollojournals.org/alsj/ALSEPManual1969_FSFM_RevB.pdf |
| Surveyor III Mission Report, JPL TR 32-1177 | https://apollojournals.org/alsj/a12/Surveyor-III-MIssionRpt1967028267.pdf |
| Apollo Lunar Surface Journal: Apollo 12 (event times) | https://apollojournals.org/alsj/a12/a12.html |
| Apollo 12 crew photographs (AS12-48-7100, panorama, AS12-49-7284) | https://apollojournals.org/alsj/a12/images12.html |
| NASA Blue Marble (Earth texture) | https://visibleearth.nasa.gov/collection/1484/blue-marble |
| NASA lunar eclipse catalogue (1967 eclipse seen from the Moon) | https://eclipse.gsfc.nasa.gov/LEcat5/LE1901-2000.html |
| NASA Science: Surveyor 3 | https://science.nasa.gov/mission/surveyor-3/ |

### Space Agency Partner & Other Data  (Link Text | Link URL)

| Link Text | Link URL |
|---|---|
| JAXA Kaguya Terrain Camera data (part of SLDEM2015) | https://darts.isas.jaxa.jp/planet/pdap/selene/ |
| Yale Bright Star Catalogue, 5th revised ed. (Hoffleit and Warren) | http://tdc-www.harvard.edu/catalogs/bsc5.html |
| Astronomy Engine (Don Cross, MIT licence) | https://github.com/cosinekitty/astronomy |
| three.js (MIT licence) | https://github.com/mrdoob/three.js |
| Wagner et al. 2017, Coordinates of anthropogenic features on the Moon, Icarus 283 | https://doi.org/10.1016/j.icarus.2016.05.011 |
| Henriksen et al. 2017, LROC NAC stereo topography, Icarus 283 | https://doi.org/10.1016/j.icarus.2016.05.012 |
| Claude Code (Anthropic): AI coding assistant, see SI section | https://www.anthropic.com/claude-code |
| Project source code (MIT) | https://github.com/apn201/Myrsky |

(Brian McInall's 2018 planimetric map in the Apollo Lunar Surface Journal was used only as a reference for small-object positions and is not reproduced. No copyrighted images, music or text are used. No NASA logos or insignia.)

---

### Verification (bottom of form)

Tick both boxes, then **Submit for Judging**. You can re-submit as often as you like until 23:59 tonight; the last saved version is judged.
