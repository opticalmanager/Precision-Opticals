# 3D Eyewear GLB Asset Specifications

## 1. Geometric Conventions
- **Units**: Meters ($1.0 = 1\text{ meter}$).
- **Standard Frame Width**: ~0.135m to 0.145m (135mm - 145mm).
- **Coordinate Origin $(0, 0, 0)$**: Must be centered on the nasal bridge between the two lenses, flush with the back surface of the bridge where it contacts the nasal dorsum.
- **Orientation**:
  - Front of glasses facing $-Z$ (into screen) or $+Z$ (towards viewer).
  - Top of frame facing $+Y$.
  - Right temple extends along $-X$, Left temple along $+X$.
- **Temples**: Modeled in the open / worn position extending back along the $-Z$ axis by ~0.14m (140mm).

## 2. Mesh Hierarchy
```text
Root/
├── frame            (Metal / Acetate PBR material)
├── leftLens         (Transparent glass material, name must include 'lens')
├── rightLens        (Transparent glass material, name must include 'lens')
├── leftTemple       (Optional separate node for folding animations)
├── rightTemple      (Optional separate node for folding animations)
├── leftNosePad      (Optional)
└── rightNosePad     (Optional)
```

## 3. Polygon & Performance Budget
- **Triangle Budget**: Max 25,000 triangles (ideal: 12,000 - 18,000).
- **File Size**: Target < 1.0 MB compressed (max 2.0 MB).
- **Textures**: Max 1024x1024 for baseColor / roughness / metalness. Lenses do not require textures.
- **Compression**: Draco geometry compression or Meshopt enabled.
