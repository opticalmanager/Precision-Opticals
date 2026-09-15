-- ==============================================================================
-- Precision Optics - 04_try_on_schema.sql
-- Eyewear Virtual Try-On Database Extension
-- ==============================================================================

-- 1. Add Try-On columns to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS try_on_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS try_on_model_url TEXT,
  ADD COLUMN IF NOT EXISTS try_on_configuration JSONB DEFAULT '{
    "modelVersion": 1,
    "calibrationVersion": 1,
    "scaleMultiplier": 1.0,
    "verticalOffset": -0.008,
    "depthOffset": 0.015,
    "pitchOffset": 0.02,
    "yawOffset": 0.0,
    "rollOffset": 0.0,
    "frameWidth": 140,
    "lensWidth": 53,
    "bridgeWidth": 18,
    "templeLength": 145
  }'::jsonb;

-- 2. Index for filtering products that have 3D Try-On available
CREATE INDEX IF NOT EXISTS idx_products_try_on_enabled ON public.products(try_on_enabled);

-- 3. Set canonical GLBs on flagship frames
UPDATE public.products
SET
  try_on_enabled = true,
  try_on_model_url = '/models/eyewear/cartier_rimless_round.glb'
WHERE slug = 'figma-cartier-blue-rimless' OR id::text = 'figma-cartier-blue-rimless';

UPDATE public.products
SET
  try_on_enabled = true,
  try_on_model_url = '/models/eyewear/rectangle_titanium_gold.glb'
WHERE slug = 'figma-brown-gradient-rimless' OR id::text = 'figma-brown-gradient-rimless';

UPDATE public.products
SET
  try_on_enabled = true,
  try_on_model_url = '/models/eyewear/fastrack_wayfarer_black.glb'
WHERE slug = 'figma-fastrack-black-wayfarer' OR id::text = 'figma-fastrack-black-wayfarer';

UPDATE public.products
SET
  try_on_enabled = true,
  try_on_model_url = '/models/eyewear/classic_aviator_gold.glb'
WHERE slug = 'figma-fastrack-gold-oval' OR id::text = 'figma-fastrack-gold-oval';

UPDATE public.products
SET
  try_on_enabled = true,
  try_on_model_url = '/models/eyewear/rectangle_titanium_gold.glb'
WHERE slug = 'figma-cartier-gold-rectangle' OR id::text = 'figma-cartier-gold-rectangle';
