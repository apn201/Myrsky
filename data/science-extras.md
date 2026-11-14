# Science extras: the numbers

Gathered 20 Oct 2026. Sources in `docs/` unless a URL is given.

## Ground temperature

Measured at this crater by Surveyor 3 (brightness temperature of the surface seen by its compartments A and B), *Surveyor 3 Preliminary Science Results*, JPL Project Document 125, fig. VI-20 (PDF p.141):

| Sun height (sun angle from sunrise) | Temperature |
|---|---|
| 30 deg, morning | about 330 K, 57 C |
| near noon (90-100 deg) | about 390 K, 117 C (peak) |
| 175 deg, just before sunset | about 255 K, -18 C |

Night is not measured at this site (Surveyor 3 stopped just after sunset). Diviner orbiter, equator: 387-397 K at noon, about 95 K (-178 C) just before sunrise (Diviner team, Level 4 products post, https://diviner.ucla.edu/single-post/2018/04/20/new-diviner-level-4-data-products ; reference paper Williams et al. 2017, Icarus 283).
The surface cools fast at sunset and slowly through the night. For the readout: a curve driven by Sun height in the day, decaying to about 95 K by dawn.
Note: the site is tilted about 10 deg toward the west (Surveyor report), so the morning warms a little later than on flat ground.

## Eclipses (Earth covering the Sun, seen from the site)

`sky/lunar_eclipses_1967-2035.csv`: 157 lunar eclipses from the NASA catalogue (F. Espenak, https://eclipse.gsfc.nasa.gov/LEcat5/ ), times converted from TD to UTC. Every lunar eclipse is seen from the near side as Earth passing in front of the Sun:
- total: Earth covers the Sun completely; red ring of sunlight refracted through Earth's atmosphere; ground goes dark copper.
- partial: total for part of the near side, partial for the rest.
- penumbral: Earth covers part of the Sun.
The catalogue durations are for the whole Moon. Whether and how long the site itself is in the umbra needs the geometry computed for the site (on the weekend).

**24 April 1967, 09:48-14:06 UTC: total, four days after Surveyor 3 landed.** Surveyor 3 "recorded this event with television pictures of the earth's disc completely occulting the sun while the earth's atmosphere refracted light from the sun" (Surveyor III Mission Report). It also measured the ground cooling (fig. VI-22, PDF p.143): from about 388 K (115 C) to about 215 K (-58 C) by the end of totality around 13:10, back to about 385 K by 14:20. Earth-based predictions had expected 165 K.
Next ones from the page's "live" end: 2026-08-28 04:13 UTC partial; 2027-02-20 penumbral.

## Seismometer

See `seismic/README.md`. Use the ascent stage impact (20 Nov 1969 22:17:17 UTC): real trace, rings for about an hour. The backpack impacts are not identifiable in the data downloaded so far.

## Generator heat

In the object sheet ("The generator, for the readout"). Show heat only.

## Sky objects: what can be seen, and when

The lunar sky is black day and night: there is no air to scatter sunlight. Whether a star or planet shows is a question of the camera's exposure, not of the sky.
- Day (Sun up, ground brightly lit): exposure set for sunlit ground. Stars and most planets are far too faint to record. Earth (about magnitude -16 to -17 when full) always shows. Venus at its brightest (about -4.6) and Jupiter (about -2.9) are borderline: a faint point at most, and not in the photos the crews took.
- Night (Sun down, ground lit only by Earthlight): long exposure, so stars, planets and the Milky Way show.
- Spacecraft overhead (CSM in 1969, LRO today) are sunlit points, bright when the site is dark and the craft is still in sunlight; in daylight they would be lost like the stars.
- The callouts can show where an object is even when it is too faint to see, which is itself a lesson ("Venus is here, but your camera is set for daylight").
- Planets are not in the Yale catalogue; their positions are computed from the date (weekend). Star catalogue J2000 positions need precession for 1969 (about 0.4 deg); fine for a webcam.
