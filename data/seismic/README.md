# Apollo 12 seismometer (Passive Seismic Experiment), station S12

Raw data: FDSN network XA, station S12, from the EarthScope (former IRIS) data centre, https://service.earthscope.org/fdsnws/dataselect/1/ . Downloaded 20 Oct 2026. Station metadata: 19 Nov 1969 14:23 to 30 Sep 1977 18:50 UTC.
Long-period channels MH1, MH2 (horizontal), MHZ (vertical) at 6.625 samples/s are under location code 00. Short-period SHZ (53 samples/s) under the blank location code.
Credit: Apollo Passive Seismic Experiment, network XA (1969-1977); data from the EarthScope Consortium. Check the exact citation/DOI on the network page before publishing.

## Files

| File | What |
|---|---|
| `S12_*_loc00_ascent_impact.mseed` | MH1, MH2, MHZ, 20 Nov 1969 22:10-23:40 UTC |
| `S12_SHZ_ascent_impact_1969-11-20T2210.mseed` | SHZ, same window. Mostly fill values, not usable. |
| `S12_MHZ_loc00_backpacks.mseed` | MHZ, 20 Nov 1969 09:00-09:15 UTC |
| `S12_ascent_impact.png`, `S12_backpacks.png` | raw traces |
| `S12_ascent_impact_MHZ_clean.png/.csv` | **use this one.** Dropouts replaced (0.3 % of samples), band-pass 0.2-1.5 Hz, plus a 10 s envelope. CSV: seconds from impact, filtered counts, envelope, about 2.2 rows per second. |
| `S12_backpacks_MHZ_clean.png/.csv` | same processing. No identifiable impact. |

## What the data shows

- **Ascent stage impact** (22:17:17 UTC, 73 km away): signal rises within about a minute, peaks 5-15 minutes after impact, fades through about 40 minutes, faintly above noise to about an hour. Matches "rang for about an hour". The two spikes at +63 min are artefacts from a data gap.
- **Backpacks** (thrown out during a communication break; Houston at 136:45:23, 09:07:23 UTC, "We copy two impacts on the PSE during jettison"): not identifiable in the long-period vertical channel for 09:00-09:15. The two spikes near -6 min are gap artefacts. The impacts may be outside this window or only in the short-period channel, which has no data here. Open.
