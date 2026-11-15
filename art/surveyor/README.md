# Surveyor 3 cut-out: masking brief

**Source:** NASA crew photo AS12-48-7100 (Apollo 12, 20 Nov 1969). The crop is pixels x 351–2012, y 1006–2106 of `data/photos/surveyor/AS12-48-7100HR.jpg`.

## Files here

- `AS12-48-7100_surveyor_crop.png`: the raw crop at full resolution, 1661 × 1100. Mask this one.
- `current_mask_full_REFERENCE.png`: the current automatic mask, for comparison only.
- `GUIDE_camera_red_scoop_blue.jpg`: where the TV camera (red) and the surface sampler (blue) are.

## Please deliver

Deliver three PNGs with alpha. Each one must be exactly 1661 × 1100 on the same canvas: don't crop, move or resize anything, so the placement in the scene stays right.

1. `sv_photo_full.png`: the whole spacecraft, as in 1967 until the crew visit.
2. `sv_photo_nocam.png`: the same, without the TV camera (red box). The crew cut it off at 06:48 UTC on 20 Nov 1969.
3. `sv_photo_bare.png`: without the TV camera and without the **scoop head** at the end of the sampler arm (the claw at the right end of the blue box). The crew took the scoop and a piece of tubing; the folding arm itself stayed on Surveyor. My current automatic mask wrongly removes the whole arm.

## Mask tips

- **Keep:** solar panel, antenna, mast, compartments, struts, legs, footpads, the arm on the left, cables.
- **Remove:** the ground, including the ground seen through the gaps between struts and through the sampler arm's lattice.
- **Paint out the black réseau crosses (+):** the camera's calibration marks, which sit on top of the spacecraft. One crosses the mast and one the sampler arm.
- **Edges:** a 1–2 px soft edge is fine. The shader drops pixels below 45 % alpha, so fully transparent should mean ground.
- **Shadows:** leave the shadows on the ground out. The scene draws its own shadows.
- **Colour:** leave it as it is. The scene relights and tints the photo for the Sun, Earthlight and the paint colour.

Drop the three files into `web/assets/`, replacing the old ones. The page then uses them at full resolution, and the zoom limit loosens automatically, about three times closer.
