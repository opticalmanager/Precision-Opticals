import { Product } from '@/types';
import { AKONI_DEMO_PRODUCTS } from './akoniDemoDataset';

/**
 * Precision Optics - Active Fallback Catalog
 * Cleanly mapped from the 91 uploaded Akoni demo products.
 */
export const PRODUCTS: Product[] = (AKONI_DEMO_PRODUCTS || []).map((item) => ({
  id: item.slug,
  brand: item.brand || 'Akoni',
  name: item.title,
  subtitle: 'Swiss Precision Eyewear',
  price: item.price,
  originalPrice: item.originalPrice,
  category: (item.categorySlug || 'sunglasses') as 'sunglasses' | 'eyeglasses',
  gender: (item.gender || 'unisex') as any,
  shape: (item.shape || 'rectangle') as any,
  rimType: (item.rimType || 'full-rim') as any,
  material: (item.material || 'titanium') as any,
  color: item.color || 'Obsidian Black / Gold',
  colorHex: item.colorHex || '#1A1A1A',
  lensProperties: ['anti-reflective', 'uv-protection', 'blue-light-filter'],
  isNewArrival: true,
  isBestSeller: false,
  isOnSale: false,
  isLimitedEdition: false,
  rating: 4.9,
  reviewCount: 18,
  images: item.images && item.images.length > 0 ? item.images : [],
  description: item.description || '',
  specs: {
    lensWidth: item.specs?.lensWidth || 52,
    bridgeWidth: item.specs?.bridgeWidth || 19,
    templeLength: item.specs?.templeLength || 145,
    frameWidth: 140,
    weight: item.specs?.weight || '24g',
  },
  variants: [
    {
      id: item.sku || `AKN-${item.slug}`,
      colorName: item.color || 'Obsidian Black / Gold',
      colorHex: item.colorHex || '#1A1A1A',
      image: item.images?.[0] || '',
      inStock: (item.stockQuantity || 12) > 0,
    },
  ],
  tryOnEnabled: false,
}));
