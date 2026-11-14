# Procedural ground: the numbers

Rules for generating rocks and small craters below the 2 m resolution of the LROC height map. Every number has a source. Gathered 20 Oct 2026; documents in `docs/`.

## Rocks: how many

Surveyor 3 counted 2205 fragments from 1 mm to over 1 m in this same crater. For the "characteristic" surface away from block fields:

N = 3 x 10^6 x y^-2.56 per 100 m², where N = number of fragments at least y millimetres across.

(*Surveyor 3 Preliminary Science Results*, JPL Project Document 125, 1967, fig. VII-19, `docs/Surveyor3_Preliminary_Science_Results_1967.pdf`.) Surveyor 1 gave an exponent of -2.1; the report says the difference may be within measurement error.

| Size or larger | Per 100 m² | Per m² |
|---|---|---|
| 1 cm | 8,300 | 83 |
| 2 cm | 1,400 | 14 |
| 5 cm | 134 | 1.3 |
| 10 cm | 23 | 0.23 |
| 20 cm | 3.9 | 0.04 |
| 50 cm | 0.37 | one per 270 m² |
| 1 m | 0.063 | one per 1,600 m² |

Below about 2 cm, rocks belong in the ground texture, not as objects.

## Rocks: where

- Big blocks are concentrated in strewn fields around fresh craters. Density rises toward the crater, and the crater floor is full of blocks too.
- Strewn fields are about an order of magnitude coarser than the normal surface.
- At this site, two fields: around Block Crater (sharp, 13 m, north-east wall of Surveyor Crater, blocks "a few centimetres to more than 2 m") and around two subdued craters high on the south-west wall (largest 15 m).
- Sharp Crater (14 m) and Block Crater (13 m, 3 m deep) are the fresh blocky craters; Head and Bench have glass-spattered rocks on their rims (Preliminary Science Report ch. 10).
- Blocks seen from orbit in the 0.5 m orthophoto can be placed where they really are.

## Rocks: shape

From 25 blocks in each strewn field (*Surveyor: Program Results*, SP-184, p. 71-74):

| Field | Roundness factor | Burial factor |
|---|---|---|
| Fresh crater (Block Crater) | 0.17 ± 0.11, angular | 0.62 ± 0.09 |
| Older, subdued craters | 0.33 ± 0.17, more rounded | 0.69 ± 0.07 |

Roundness: mean radius of circles fitted to the corners, divided by the radius of the enclosing circle (0 = sharp, 1 = round). Burial: angles where the outline meets the ground, summed and divided by 2π (0 = sits on top, 1 = only the top shows).
So: rocks are mostly half-buried, angular near fresh craters, rounder far from them. No correlation between roundness and burial within one field.
A 0.5 m boulder at Bench Crater had a soil fillet around its base (AS12-48-7062).

## Rocks: making many from three scans

Only three scans, and that is final (user, 20 Oct): 12013,11 (5.5 cm, angular), 12038,7 (8.4 cm, angular), 12019,0 (8.7 cm, rounder). Two angular ones for fresh-crater fields, one rounder for old ground.
Plan for the weekend:
- The scans set the look: their textures give colour and fine surface detail, their outlines give the roundness to aim for.
- Most rocks are procedural shapes (noise-displaced, fractured blobs) tuned to roundness 0.17 near fresh craters and 0.33 elsewhere, wearing the scan textures (triplanar, so no unwrapping).
- The scans themselves are used for the few biggest rocks close to the camera, scaled up, rotated, mirrored and stretched. Burial (0.6-0.7) hides a different part of each copy, which breaks up repetition.
- Every rock gets dust on the upper surfaces and a soil fillet at the base.
- The page should say rocks are generated from three real Apollo 12 samples and real Surveyor 3 counts.
- Full-resolution zips deleted 20 Oct (same mesh as the web versions).

## Small craters: how many

Steady-state distribution for craters under 100 m at this site (Preliminary Science Report ch. 10, fig. 10-21):

F = 10^10.9 x c^-2.00 per 10^6 km², c in metres. Per square metre: F = 0.079 / c².

| Diameter or larger | One per |
|---|---|
| 10 cm | 0.13 m² |
| 50 cm | 3.2 m² |
| 1 m | 13 m² |
| 2 m | 50 m² |
| 5 m | 320 m² |
| 10 m | 1,260 m² |

Craters above about 5 m are already in the LROC height map (2 m pixels); generate the smaller ones. Most are subdued (steady state means old craters are being worn down as new ones form); a few are fresh and sharp.

## Ground near the lander

- Engine blast swept the surface; "some small craters have not been completely obliterated by the plume" (AS12-47-6911).
- Boot prints: compressed soil is smooth and more reflective (AS12-47-6999). Footprints are only a few cm deep on the firm ground near Surveyor (AS12-48-7133).
- Soil albedo: undisturbed 9 %, disturbed 7-7.4 %, rock 12-16 % (Preliminary Science Report table 10-IV).
- Stereo close-ups of 3-inch squares of real soil: AS12-57-8446 to 8455 in `photos/ground_rocks_boots/`.
