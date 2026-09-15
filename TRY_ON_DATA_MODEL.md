# Try-On Data Model: Schema, TypeScript Types & Calibration Presets

## 1. Database Schema Extension

The Virtual Try-On configuration is stored directly on the `public.products` table in PostgreSQL / Supabase, allowing each product to specify its 3D model URL, optical calibration offsets, and feature flags.

### Migration SQL (`supabase/migrations/04_try_on_schema.sql`)

```sql
-- ------------------------------------------------------------------------------
-- 04_TRY_ON_SCHEMA.SQL
-- Precision Optics Virtual Try-On Database Extension
-- ------------------------------------------------------------------------------

-- Add Try-On columns to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS try_on_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS try_on_model_url TEXT,
  ADD COLUMN IF NOT EXISTS try_on_configuration JSONB DEFAULT '{
    "modelVersion": 1,
    "calibrationVersion": 1,
    "scaleMultiplier": 1.0,
    "verticalOffset": 0.0,
    "depthOffset": 0.0,
    "pitchOffset": 0.0,
    "yawOffset": 0.0,
    "rollOffset": 0.0,
    "frameWidth": 140,
    "lensWidth": 53,
    "bridgeWidth": 18,
    "templeLength": 145
  }'::jsonb;

-- Create index for products with Try-On enabled for fast filtering
CREATE INDEX IF NOT EXISTS idx_products_try_on_enabled ON public.products(try_on_enabled);

-- Update existing catalog products with default canonical try-on models
UPDATE public.products
SET 
  try_on_enabled = true,
  try_on_model_url = CASE 
    WHEN shape = 'round' OR rim_type = 'rimless' THEN '/models/eyewear/cartier_rimless_round.glb'
    WHEN shape = 'wayfarer' OR shape = 'square' THEN '/models/eyewear/fastrack_wayfarer_black.glb'
    WHEN shape = 'aviator' THEN '/models/eyewear/classic_aviator_gold.glb'
    WHEN shape = 'rectangle' THEN '/models/eyewear/rectangle_titanium_gold.glb'
    ELSE '/models/eyewear/rectangle_titanium_gold.glb'
  END
WHERE try_on_model_url IS NULL;
```

---

## 2. TypeScript Data Model

Located in `types/tryOn.ts` and exported via `types/index.ts`:

```typescript
/**
 * Eyewear Virtual Try-On TypeScript Interface Definitions
 * Precision Optics Engine
 */

export interface FrameCalibration {
  /** Multiplier applied to calculated IPD-based scale (typically 0.85 - 1.25) */
  scaleMultiplier: number;
  /** Vertical translation offset relative to sellion / nose bridge in Three.js units (meters) */
  verticalOffset: number;
  /** Depth translation offset along Z-axis (meters) */
  depthOffset: number;
  /** Horizontal translation offset along X-axis (meters) */
  horizontalOffset?: number;
  /** Pantoscopic tilt rotation offset (radians) */
  pitchOffset: number;
  /** Face-form wrap rotation offset (radians) */
  yawOffset: number;
  /** Frame roll rotation offset (radians) */
  rollOffset: number;
}

export interface TryOnConfiguration extends FrameCalibration {
  enabled: boolean;
  modelUrl: string;
  modelVersion: number | string;
  calibrationVersion: number | string;
  /** Physical frame measurements in millimeters */
  frameWidth?: number;
  lensWidth?: number;
  bridgeWidth?: number;
  templeLength?: number;
  /** Optional custom material overrides */
  materials?: {
    frameColor?: string;
    frameMetalness?: number;
    frameRoughness?: number;
    lensColor?: string;
    lensTransmission?: number;
    lensRoughness?: number;
  };
}

export interface FacePose {
  /** 3D position in Three.js world space coordinates */
  position: {
    x: number;
    y: number;
    z: number;
  };
  /** Rotation Euler angles in radians */
  rotation: {
    pitch: number; // Head nodding up / down (X-axis)
    yaw: number;   // Head turning left / right (Y-axis)
    roll: number;  // Head tilting side to side (Z-axis)
  };
  /** Interpupillary distance in normalized image space */
  eyeDistance: number;
  /** Calculated base scale for 3D model */
  scale: number;
}

export type TrackingConfidenceState =
  | 'HIGH_CONFIDENCE'
  | 'MEDIUM_CONFIDENCE'
  | 'LOW_CONFIDENCE'
  | 'LOST';

export interface FaceQualityScore {
  overallConfidence: number; // 0.0 to 1.0
  state: TrackingConfidenceState;
  isCentered: boolean;
  isAdequatelyLit: boolean;
  isWithinRotationBounds: boolean;
  message?: string;
}

export interface DiagnosticMetrics {
  renderFps: number;
  trackingFps: number;
  trackingLatencyMs: number;
  confidence: number;
  facePitchDeg: number;
  faceYawDeg: number;
  faceRollDeg: number;
  appliedScale: number;
  videoWidth: number;
  videoHeight: number;
  canvasWidth: number;
  canvasHeight: number;
}
```

---

## 3. Product Extension in `types/index.ts`

```typescript
export interface Product {
  // Existing fields...
  id: string;
  brand: string;
  name: string;
  price: number;
  // ...

  // Try-On Extension Fields
  tryOnEnabled?: boolean;
  tryOnModelUrl?: string;
  tryOnConfig?: TryOnConfiguration;
}
```

---

## 4. Canonical Calibration Presets by Silhouette

Because different frame silhouettes sit differently on the face, the system incorporates factory default presets:

| Silhouette | Default Model Asset | Scale Multiplier | Vertical Offset (Y) | Depth Offset (Z) | Pantoscopic Pitch |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Rimless Oval/Round** | `/models/eyewear/cartier_rimless_round.glb` | `1.02` | `-0.008m` | `+0.015m` | `0.02 rad` |
| **Full-Rim Wayfarer** | `/models/eyewear/fastrack_wayfarer_black.glb` | `1.05` | `-0.012m` | `+0.018m` | `0.04 rad` |
| **Classic Aviator** | `/models/eyewear/classic_aviator_gold.glb` | `1.06` | `-0.015m` | `+0.016m` | `0.03 rad` |
| **Titanium Rectangle** | `/models/eyewear/rectangle_titanium_gold.glb` | `1.00` | `-0.007m` | `+0.014m` | `0.02 rad` |
| **Cat-Eye Acetate** | `/models/eyewear/cateye_luxury_havana.glb` | `1.03` | `-0.010m` | `+0.017m` | `0.05 rad` |

---

## 5. Model Versioning & Invalidation Strategy

1. `modelVersion`: Incremented whenever the 3D geometry mesh, vertex coordinates, or material setup of a GLB file is updated.
2. `calibrationVersion`: Incremented whenever the numerical offsets (scale, X, Y, Z, pitch, yaw, roll) are updated.
3. Cache Busting: GLB URLs appended with query string `?v=${modelVersion}` ensure client browsers and CDNs immediately fetch updated assets when a model is re-exported.
