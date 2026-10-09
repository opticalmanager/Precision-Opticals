-- ==============================================================================
-- Migration 06: Scraped Catalog & Extended Shape Alignment
-- Supports all scraped designer eyewear and contact lenses from Dayal Opticals
-- ==============================================================================

-- 1. Add source_url, color_variants, and package_dimensions columns to products
ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS color_variants JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS package_dimensions JSONB DEFAULT '{"lengthCm": 18, "breadthCm": 9, "heightCm": 7, "weightKg": 0.25}'::jsonb;

-- 2. Relax shape constraint to support avant-garde shapes and contact lenses
ALTER TABLE IF EXISTS public.products
  DROP CONSTRAINT IF EXISTS products_shape_check;

-- 3. Relax rim_type constraint to support contact lenses and custom constructions
ALTER TABLE IF EXISTS public.products
  DROP CONSTRAINT IF EXISTS products_rim_type_check;

-- 4. Relax original_price check constraint to allow NULL or matching prices
ALTER TABLE IF EXISTS public.products
  DROP CONSTRAINT IF EXISTS products_original_price_check;

ALTER TABLE IF EXISTS public.products
  ADD CONSTRAINT products_original_price_check CHECK (original_price IS NULL OR original_price >= base_price);

-- 5. Index for source_url deduplication queries
CREATE INDEX IF NOT EXISTS idx_products_source_url ON public.products(source_url);
