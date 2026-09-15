# Frame Calibration Guide

## Overview
Because different eyewear styles (e.g. wireframe rimless vs thick acetate wayfarer) have distinct nose pad depths, pantoscopic tilts, and bridge curvatures, each product model supports custom calibration overrides.

## Admin Calibration Studio
Navigate to:
`/admin/try-on-calibrator`

### Key Controls
1. **Product Dropdown**: Select any eyewear model from the catalog.
2. **Scale Multiplier** (Default `1.0`): Adjusts the frame size relative to the detected interpupillary distance (IPD). Range: `0.75x - 1.35x`.
3. **Nose Bridge Height (Y)** (Default `0.0m`): Moves the resting point of the bridge vertically along the nasal dorsum.
4. **Eye-to-Lens Depth (Z)** (Default `0.015m`): Moves the frame closer to or farther from the eyes to avoid intersecting eyelashes.
5. **Horizontal Shift (X)** (Default `0.0m`): Fine-tunes optical centering.
6. **Pantoscopic Tilt (Pitch)**: Incline angle of the frame front relative to the temples (typically 5° to 10° forward tilt).
7. **Face-Form Wrap (Yaw)**: Curvature of the frame around the face contour.
8. **Level (Roll)**: Rotational level.

### Persistence
- Clicking **Save Calibration** writes the configuration to `localStorage` and prepares the JSON configuration for database storage.
- Clicking **Copy JSON** copies the exact configuration object to paste directly into `Product.tryOnConfig` or database seed files.
