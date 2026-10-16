import { Product, GenderCategory, FrameShape } from '@/types';
import rawScrapedProducts from './dayal_scraped_products.json';

function normalizeShape(rawShape: string): FrameShape {
  if (!rawShape) return 'rectangle';
  const s = rawShape.toLowerCase();
  if (s.includes('aviator')) return 'aviator';
  if (s.includes('wayfarer')) return 'wayfarer';
  if (s.includes('cat') || s.includes('cateye')) return 'cat-eye';
  if (s.includes('round')) return 'round';
  if (s.includes('square')) return 'square';
  if (s.includes('rectang')) return 'rectangle';
  if (s.includes('hexagon')) return 'hexagon';
  if (s.includes('octagon')) return 'octagonal';
  if (s.includes('geometric')) return 'geometric';
  if (s.includes('oval')) return 'oval';
  if (s.includes('toric')) return 'toric';
  if (s.includes('spherical')) return 'spherical';
  return s.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function normalizeCategory(rawCat: string, rawType?: string): 'sunglasses' | 'eyeglasses' | 'contact-lenses' | 'meta-smart' {
  const c = (rawCat || rawType || '').toLowerCase();
  if (c.includes('meta') || c.includes('smart')) return 'meta-smart';
  if (c.includes('contact') || c.includes('lens')) return 'contact-lenses';
  if (c.includes('sun')) return 'sunglasses';
  return 'eyeglasses';
}

const ALLOWED_TRY_ON_MODELS_MAP: Record<string, string> = {
  // Aviator
  'do-7768807407862': '/models/eyewear/classic_aviator_gold.glb',
  'do-9472808255734': '/models/eyewear/classic_aviator_gold.glb',
  'do-7768807014646': '/models/eyewear/classic_aviator_gold.glb',
  'do-10328545427702': '/models/eyewear/classic_aviator_gold.glb',

  // Wayfarer / Square
  'do-7775902597366': '/models/eyewear/fastrack_wayfarer_black.glb',
  'do-7755061625078': '/models/eyewear/fastrack_wayfarer_black.glb',
  'do-9215419678966': '/models/eyewear/fastrack_wayfarer_black.glb',
  'do-9217741193462': '/models/eyewear/fastrack_wayfarer_black.glb',

  // Round / Rimless
  'do-7768808358134': '/models/eyewear/cartier_rimless_round.glb',
  'do-7768808521974': '/models/eyewear/cartier_rimless_round.glb',
  'do-7768808784118': '/models/eyewear/cartier_rimless_round.glb',
  'do-8872681111798': '/models/eyewear/cartier_rimless_round.glb',

  // Cat-Eye
  'do-9412932567286': '/models/eyewear/cateye_luxury_havana.glb',
  'do-9414431768822': '/models/eyewear/cateye_luxury_havana.glb',
  'do-9414435176694': '/models/eyewear/cateye_luxury_havana.glb',
  'do-7970540880118': '/models/eyewear/cateye_luxury_havana.glb',

  // Rectangle / Titanium
  'do-7774373019894': '/models/eyewear/rectangle_titanium_gold.glb',
  'do-7756053872886': '/models/eyewear/rectangle_titanium_gold.glb',
  'do-9212133769462': '/models/eyewear/rectangle_titanium_gold.glb',
  'do-9215431573750': '/models/eyewear/rectangle_titanium_gold.glb',

  // Flagships
  'figma-cartier-blue-rimless': '/models/eyewear/cartier_rimless_round.glb',
  'figma-brown-gradient-rimless': '/models/eyewear/rectangle_titanium_gold.glb',
  'figma-fastrack-black-wayfarer': '/models/eyewear/fastrack_wayfarer_black.glb',
  'figma-fastrack-gold-oval': '/models/eyewear/classic_aviator_gold.glb',
  'figma-cartier-gold-rectangle': '/models/eyewear/rectangle_titanium_gold.glb',
};

/**
 * Precision Optics - Active Fallback & Master Catalog
 * Cleanly mapped from the authentic scraped & curated designer eyewear & contact lens products.
 */
export const PRODUCTS: Product[] = (rawScrapedProducts as any[]).map((item, idx) => {
  const category = normalizeCategory(item.category, item.type);
  const shape = normalizeShape(item.shape);
  const isContactLens = category === 'contact-lenses';
  const images = (item.images && item.images.length > 0) ? item.images : (item.img ? [item.img] : []);
  const primaryImage = item.img || images[0] || '';

  const variants = (item.colorVariants && item.colorVariants.length > 0)
    ? item.colorVariants.map((cv: any, cIdx: number) => ({
        id: cv.sku || cv.id || `VAR-${item.id}-${cIdx}`,
        colorName: (cv.colorName || 'Default').replace(/\s+/g, ' ').trim(),
        colorHex: cv.colorHex || '#1A1A1A',
        image: cv.featuredImage || primaryImage,
        inStock: cv.available !== false,
      }))
    : [
        {
          id: `VAR-${item.id}-0`,
          colorName: isContactLens ? 'Standard Box' : 'Classic',
          colorHex: (item.colors && item.colors[0]) || '#1A1A1A',
          image: primaryImage,
          inStock: true,
        },
      ];

  const packageDimensions = item.packageDimensions || (isContactLens
    ? { lengthCm: 15, breadthCm: 10, heightCm: 4, weightKg: 0.08 }
    : { lengthCm: 18, breadthCm: 9, heightCm: 7, weightKg: 0.25 });

  const allowedModelUrl =
    item.tryOnModelUrl ||
    item.try_on_model_url ||
    ALLOWED_TRY_ON_MODELS_MAP[item.id] ||
    ALLOWED_TRY_ON_MODELS_MAP[item.slug];

  const hasAllowedModel = Boolean(
    !isContactLens &&
    allowedModelUrl &&
    typeof allowedModelUrl === 'string' &&
    (allowedModelUrl.toLowerCase().split('?')[0].endsWith('.glb') ||
     allowedModelUrl.toLowerCase().split('?')[0].endsWith('.gltf'))
  );

  return {
    id: item.id || `prod-${idx + 1}`,
    brand: item.brand || 'Precision',
    name: (item.name || 'Designer Eyewear').replace(/\s+/g, ' ').trim(),
    subtitle: item.tag || (isContactLens ? 'Clinical Contact Lenses' : `${item.brand} Luxury Eyewear`),
    price: Number(item.price) || 4999,
    originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
    category,
    gender: (item.gender || 'unisex') as GenderCategory,
    shape,
    rimType: isContactLens ? 'rimless' : (item.rimType || 'full-rim'),
    material: item.material || (isContactLens ? 'silicone-hydrogel' : 'acetate'),
    color: variants[0]?.colorName || (isContactLens ? 'Clear' : 'Black'),
    colorHex: variants[0]?.colorHex || '#1A1A1A',
    lensProperties: isContactLens
      ? ['uv-protection']
      : ['anti-reflective', 'uv-protection', 'blue-light-filter'],
    isNewArrival: item.tagType === 'new' || (item.discountPct === 0 && idx % 3 === 0),
    isBestSeller: item.brand === 'Ray-Ban' || item.brand === 'Vogue' || idx % 5 === 0,
    isOnSale: (item.discountPct && item.discountPct > 0) || (item.originalPrice && item.originalPrice > item.price),
    isLimitedEdition: item.name?.includes('SPECIAL') || item.name?.includes('LIMITED') || false,
    rating: Number(item.rating) || 4.8,
    reviewCount: 12 + ((idx * 7) % 65),
    images,
    description: item.description || '',
    specs: {
      lensWidth: item.measurements?.lensWidth || (isContactLens ? 14 : 53),
      bridgeWidth: item.measurements?.bridgeWidth || (isContactLens ? 8 : 18),
      templeLength: item.measurements?.templeLength || (isContactLens ? 0 : 145),
      frameWidth: isContactLens ? 0 : 140,
      weight: item.measurements?.weight || (isContactLens ? '0.08g' : '22g'),
      countryOfOrigin: item.specs?.countryOfOrigin,
      frontColor: item.specs?.frontColor,
      templeColor: item.specs?.templeColor,
      lensColor: item.specs?.lensColor,
      styleTip: item.specs?.styleTip,
    },
    variants,
    colorVariants: (item.colorVariants || []).map((cv: any) => ({
      ...cv,
      colorName: (cv.colorName || '').replace(/\s+/g, ' ').trim(),
    })),
    sourceUrl: item.sourceUrl || '',
    packageDimensions,
    tryOnEnabled: hasAllowedModel,
    tryOnModelUrl: hasAllowedModel ? allowedModelUrl : undefined,
  };
});
