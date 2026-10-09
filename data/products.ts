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

function normalizeCategory(rawCat: string, rawType?: string): 'sunglasses' | 'eyeglasses' | 'contact-lenses' {
  const c = (rawCat || rawType || '').toLowerCase();
  if (c.includes('contact') || c.includes('lens')) return 'contact-lenses';
  if (c.includes('sun')) return 'sunglasses';
  return 'eyeglasses';
}

/**
 * Precision Optics - Active Fallback & Master Catalog
 * Cleanly mapped from the 864 live scraped designer eyewear & contact lens products.
 */
export const PRODUCTS: Product[] = (rawScrapedProducts as any[]).map((item, idx) => {
  const category = normalizeCategory(item.category, item.type);
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

  return {
    id: item.id || `prod-${idx + 1}`,
    brand: item.brand || 'Precision',
    name: (item.name || 'Designer Eyewear').replace(/\s+/g, ' ').trim(),
    subtitle: item.tag || (isContactLens ? 'Clinical Contact Lenses' : `${item.brand} Luxury Eyewear`),
    price: Number(item.price) || 4999,
    originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
    category,
    gender: (item.gender || 'unisex') as GenderCategory,
    shape: normalizeShape(item.shape),
    rimType: isContactLens ? 'contact-lens' : (item.rimType || 'full-rim'),
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
    },
    variants,
    colorVariants: (item.colorVariants || []).map((cv: any) => ({
      ...cv,
      colorName: (cv.colorName || '').replace(/\s+/g, ' ').trim(),
    })),
    sourceUrl: item.sourceUrl || '',
    packageDimensions,
    contactLensSpecs: item.contactLensSpecs || undefined,
    tryOnEnabled: !isContactLens,
  };
});
