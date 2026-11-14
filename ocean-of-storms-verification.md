# Webcam: Ocean of Storms - verification

Checked 6 Oct 2026. Answers the "to verify" list in `ocean-of-storms-concept.md`.
Where this file and the concept disagree, this file is right.

## Result per item

| # | Item | Result | State |
|---|---|---|---|
| 1 | Rules on pre-work | The 2022 FAQ says planning ahead is fine but "start the actual work when the hackathon begins". The 2026 FAQ would not load for me. | Assume no code before 14 Nov. Read the 2026 FAQ. |
| 2 | Apollo 12 audio | Exists. Tapes recorded at the Honeysuckle Creek station in Australia by Bernie Scrivener, digitised to MP3, indexed by mission time in the Apollo 12 Flight Journal. The index covers launch to splashdown including both moonwalks, with some gaps. | Good enough. Not listened to yet. Rights: see below. |
| 3 | Terrain | `NAC_DTM_APOLLO12`, 2.00 m per pixel, 32-bit GeoTIFF, 12.9 MB. Covers about 5 km by 2.7 km around the site. | Confirmed. Small enough for a browser after conversion. |
| 4 | Left-behind inventory | Partly sourced. Instruments and Surveyor confirmed. Positions and the small items are not. | Open. |
| 5 | TV camera | Returned to Earth. Westinghouse got a picture off the undamaged part of the tube. | Confirmed. Our camera stands where its tripod stood. |
| 6 | Sun and the anniversary | Confirmed by calculation. See below. | Confirmed. |
| 7 | 3D models | NASA Ames publishes a lunar module model. Format, detail and licence not checked. Surveyor not found yet. | Open. |
| 8 | Solo entry | The 2022 FAQ: "An individual is allowed to submit a project independently". Universal Event deadline follows the team lead's local time. | Fine, pending the 2026 FAQ. |
| 9 | Generator | SNAP-27, plutonium-238, about 70 W electrical at the start. | Confirmed at that level. Position not sourced. |

## Sun, Earth and the anniversary

Computed with an ephemeris library for the landing site, 3.0124 S, 23.4216 W.

The model reproduces history: it gives a Sun elevation of 5.14 degrees at touchdown. The documented figure is 5.1.

| Moment (UTC) | Sun elevation 1969 | Sun elevation 2026 |
|---|---|---|
| Launch, 14 Nov 16:22 | -50.7 | -51.5 |
| Touchdown, 19 Nov 06:54 | 5.1 | 4.4 |
| Liftoff from the Moon, 20 Nov 14:25 | 21.1 | 20.3 |

- 57 years is 20819 days. 705 lunar months is 20819.07 days.
- The Sun in 2026 runs about 0.7 degrees behind 1969. That is 90 minutes.
- Local sunrise: 18 Nov 1969 about 20:50 UTC. 18 Nov 2026 about 22:20 UTC, which is 00:20 on the 19th in Finland.
- At submission, 15 Nov 23:59 Finnish time, the Sun is 36 degrees below the horizon. The judges get the night view.
- Earth's height in the sky ranges from 58 to 74 degrees over a year. Earth does not line up across the 57 years the way the Sun does: 62 degrees in Nov 1969, 74 in Nov 2026.

## Facts that changed

- The flag is standing. Orbiter images from 2009-2011 show it still casting a shadow. The fallen flag is Apollo 11's. I had this wrong in conversation.
- Surveyor 3 is 163 m from the lander, not 180.
- The seismometer signal after the ascent stage impact lasted more than an hour.
- Plutonium-238 after 57 years: 64 percent of the original heat.

## Confirmed timeline (UTC)

- Launch: 14 Nov 1969, 16:22:00
- Touchdown: 19 Nov 1969, 06:54:35
- Two moonwalks: 3 h 56 min and 3 h 49 min
- Liftoff from the Moon: 20 Nov 1969, 14:25:47
- Ascent stage impact: 20 Nov 1969, 22:17:17
- Instrument stations switched off: 30 Sep 1977

## Confirmed on the ground

- Intrepid descent stage
- Instrument package: central station, magnetometer, passive seismometer, solar wind spectrometer, ion detector with cold cathode gauge, dust detector
- SNAP-27 generator
- US flag, standing
- Surveyor 3, minus its TV camera and other parts brought home

Not sourced yet: backpacks and tools thrown out, the antenna, Al Bean's silver pin, any other personal items, and the position of everything.

## Rights

- NASA mission audio is NASA material. These particular recordings were made privately at the tracking station and digitised by individuals. Credit them, and ask before using.
- The journal transcripts and commentary are copyrighted by their editors. We do not use them, so it does not bite.
- Terrain: check the citation line the orbiter team asks for.

## Still open

1. The 2026 participant FAQ: pre-work, AI use, licence of submissions. The site blocks my reader. Paste it in.
2. The challenge page's own resource list. Submissions must show how the provided data was used. Same block. Paste it in.
3. Object positions: needs the traverse and deployment maps.
4. Small and personal items, each with a source.
5. Lander and Surveyor models: format and licence.
6. Listen to the audio around launch and the first moonwalk.

## What the rule does to the plan

If "no actual work before the start" still holds, all code is written on 14-15 November.
Allowed beforehand, as planning: this research, the design, the object list with sources, the asset and data list, the page copy.
Not allowed: the renderer, the ephemeris code, the page.
So the must-have list in the concept has to fit two days solo. It is tight. Cutting order if needed: mission audio first, astronaut figures second, real Earth clouds third.
