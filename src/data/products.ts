import { Product } from '@/src/types';

export const PRODUCTS: Product[] = [
  {
    id: 'gast-astro-as02-53',
    brand: 'GAST',
    name: 'ASTRO AS02 53',
    subtitle: 'Astro Collection in 8 Variants',
    price: 17900,
    originalPrice: 21900,
    category: 'sunglasses',
    gender: 'unisex',
    shape: 'rectangle',
    rimType: 'rimless',
    material: 'titanium',
    color: 'Gold / Emerald Green Tint',
    colorHex: '#D4AF37',
    lensProperties: ['polarized', 'uv-protection', 'anti-reflective'],
    isNewArrival: true,
    isBestSeller: true,
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Minimalist rimless silhouette with emerald green tinted nylon lenses, Japanese beta-titanium temple arms, and custom silicone nose pads with 18k gold detailing.',
    specs: {
      lensWidth: 53,
      bridgeWidth: 18,
      templeLength: 145,
      frameWidth: 138,
      weight: '16g'
    },
    variants: [
      { id: 'v1', colorName: 'Gold / Emerald Green', colorHex: '#D4AF37', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80', inStock: true },
      { id: 'v2', colorName: 'Silver / Glacier Blue', colorHex: '#C0C0C0', image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80', inStock: true },
      { id: 'v3', colorName: 'Rose Gold / Sunset Rose', colorHex: '#B76E79', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80', inStock: true },
      { id: 'v4', colorName: 'Matte Gunmetal / Smoke', colorHex: '#4A4A4A', image: 'https://images.unsplash.com/photo-1509695503492-412db9d2824e?auto=format&fit=crop&w=800&q=80', inStock: true }
    ]
  },
  {
    id: 'gast-pai-pa04-48',
    brand: 'GAST',
    name: 'PAI PA04 48',
    subtitle: 'Pai Collection in 8 Colorways',
    price: 15400,
    category: 'sunglasses',
    gender: 'unisex',
    shape: 'square',
    rimType: 'full-rim',
    material: 'acetate',
    color: 'Havana Tortoise / Warm Amber',
    colorHex: '#8B4513',
    lensProperties: ['uv-protection', 'anti-reflective'],
    isNewArrival: true,
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Chunky architectural Italian Mazzucchelli acetate frame with bevelled edges and 5-barrel German OBE hinges.',
    specs: {
      lensWidth: 48,
      bridgeWidth: 22,
      templeLength: 145,
      frameWidth: 140,
      weight: '34g'
    },
    variants: [
      { id: 'v1', colorName: 'Havana Tortoise', colorHex: '#8B4513', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80', inStock: true },
      { id: 'v2', colorName: 'Onyx Black', colorHex: '#111111', image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80', inStock: true }
    ]
  },
  {
    id: 'tom-ford-dax-0751-01v',
    brand: 'Tom Ford',
    name: 'DAX 0751 01V 50',
    subtitle: 'Signature T-Logo Luxury Series',
    price: 34500,
    originalPrice: 38000,
    category: 'sunglasses',
    gender: 'men',
    shape: 'square',
    rimType: 'full-rim',
    material: 'acetate',
    color: 'Glossy Black / Cobalt Blue Lenses',
    colorHex: '#0A0A0A',
    lensProperties: ['polarized', 'uv-protection'],
    isBestSeller: true,
    images: [
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Iconic Tom Ford bold silhouette featuring signature gold metal T temple inlays and 100% UV crystal blue mineral glass lenses.',
    specs: {
      lensWidth: 50,
      bridgeWidth: 21,
      templeLength: 145,
      frameWidth: 142,
      weight: '38g'
    }
  },
  {
    id: 'cartier-ct0344o-signature-c',
    brand: 'Cartier',
    name: 'Cartier CT0344O Signature C',
    subtitle: 'Precious Eyewear Collection (Paris)',
    price: 98000,
    category: 'eyeglasses',
    gender: 'men',
    shape: 'rectangle',
    rimType: 'rimless',
    material: 'titanium',
    color: '18k Gold Finish / Fluted Temples',
    colorHex: '#FFD700',
    lensProperties: ['blue-light-filter', 'anti-reflective', 'uv-protection'],
    isBestSeller: true,
    images: [
      'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Hand-assembled in Paris with Cartier signature C hinge motif, double C nose-pads, and fluted Godron engravings plated in genuine 18-karat gold.',
    specs: {
      lensWidth: 53,
      bridgeWidth: 19,
      templeLength: 140,
      frameWidth: 137,
      weight: '21g'
    }
  },
  {
    id: 'ray-ban-meta-wayfarer-matte-black',
    brand: 'Ray-Ban Meta',
    name: 'Ray-Ban Meta Wayfarer',
    subtitle: 'Next-Gen Smart Glasses with Meta AI & 12MP Camera',
    price: 32900,
    category: 'meta-smart',
    gender: 'unisex',
    shape: 'wayfarer',
    rimType: 'full-rim',
    material: 'acetate',
    color: 'Matte Black / Transitions Green',
    colorHex: '#222222',
    lensProperties: ['photochromic', 'uv-protection', 'blue-light-filter'],
    isNewArrival: true,
    isBestSeller: true,
    images: [
      '/images/meta_ai_glasses_1786080854572.jpg',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Equipped with ultra-wide 12MP camera, 5-mic audio array, open-ear spatial speakers, and voice-activated Meta AI. Capture HD videos and live-stream directly to Instagram.',
    specs: {
      lensWidth: 50,
      bridgeWidth: 22,
      templeLength: 150,
      frameWidth: 143,
      weight: '49g'
    }
  },
  {
    id: 'jacques-marie-mage-dealan',
    brand: 'Jacques Marie Mage',
    name: 'DEALAN Limited Batch',
    subtitle: '10mm Block Acetate (Made in Japan)',
    price: 72000,
    category: 'sunglasses',
    gender: 'unisex',
    shape: 'square',
    rimType: 'full-rim',
    material: 'acetate',
    color: 'Agar Tortoise / Amber Mineral',
    colorHex: '#5C4033',
    lensProperties: ['polarized', 'uv-protection'],
    isNewArrival: true,
    images: [
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Limited edition of 500 numbered pieces worldwide honoring Bob Dylan with precious arrowhead silver front pins and custom wirecore engraving.',
    specs: {
      lensWidth: 50,
      bridgeWidth: 20,
      templeLength: 142,
      frameWidth: 144,
      weight: '44g'
    }
  },
  {
    id: 'prada-pr-17ws-symbole',
    brand: 'Prada',
    name: 'PR 17WS Symbole',
    subtitle: 'Geometric Runway Series',
    price: 36000,
    category: 'sunglasses',
    gender: 'women',
    shape: 'cat-eye',
    rimType: 'full-rim',
    material: 'acetate',
    color: 'Monochrome Black / Dark Grey',
    colorHex: '#000000',
    lensProperties: ['uv-protection'],
    isBestSeller: true,
    images: [
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Sculptural temples showcasing iconic Prada triangle plaque in three-dimensional execution.',
    specs: {
      lensWidth: 49,
      bridgeWidth: 20,
      templeLength: 145,
      frameWidth: 141,
      weight: '36g'
    }
  },
  {
    id: 'lindberg-blok-titanium-6584',
    brand: 'Lindberg',
    name: 'Blok Titanium 6584',
    subtitle: 'Danish Ultra-Lightweight Architectural Optical',
    price: 54000,
    category: 'eyeglasses',
    gender: 'unisex',
    shape: 'geometric',
    rimType: 'rimless',
    material: 'titanium',
    color: 'Titanium Blue / Brushed Silver',
    colorHex: '#4682B4',
    lensProperties: ['blue-light-filter', 'anti-reflective'],
    isNewArrival: true,
    images: [
      'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Weighing just 2.7 grams, constructed completely without screws, rivets, or solder joints from pure Danish medical-grade titanium wire.',
    specs: {
      lensWidth: 51,
      bridgeWidth: 19,
      templeLength: 140,
      frameWidth: 135,
      weight: '2.7g'
    }
  },
  {
    id: 'mykita-lessrim-yoshio',
    brand: 'Mykita',
    name: 'Lessrim Yoshio',
    subtitle: 'Handmade in Berlin (Stainless Steel)',
    price: 46000,
    category: 'eyeglasses',
    gender: 'unisex',
    shape: 'round',
    rimType: 'semi-rimless',
    material: 'stainless-steel',
    color: 'Champagne Gold / Dark Brown Rim',
    colorHex: '#F7E7CE',
    lensProperties: ['blue-light-filter', 'anti-reflective'],
    isNewArrival: false,
    images: [
      'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Super-fine 0.5mm surgical steel profile with translucent rim overlay that appears almost completely invisible on the face.',
    specs: {
      lensWidth: 47,
      bridgeWidth: 21,
      templeLength: 140,
      frameWidth: 134,
      weight: '11g'
    }
  },
  {
    id: 'maybach-the-diplomat-i',
    brand: 'Maybach Eyewear',
    name: 'The Diplomat I',
    subtitle: '18k Gold Plated & Natural Horn',
    price: 185000,
    category: 'sunglasses',
    gender: 'men',
    shape: 'aviator',
    rimType: 'full-rim',
    material: 'horn-gold',
    color: 'Yellow Gold / Selected Buffalo Horn',
    colorHex: '#D4AF37',
    lensProperties: ['polarized', 'anti-reflective', 'uv-protection'],
    isBestSeller: false,
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Precision German handcrafted luxury combining titanium coated in pure gold, hand-carved Asian water buffalo horn, and Zeiss polarized gold mirrored optics.',
    specs: {
      lensWidth: 59,
      bridgeWidth: 15,
      templeLength: 145,
      frameWidth: 146,
      weight: '32g'
    }
  },
  {
    id: 'precision-kids-flex-pro',
    brand: 'Precision Junior',
    name: 'Flex Pro Active Myopia Shield',
    subtitle: 'BPA-Free Flexible Memory Polymer',
    price: 4200,
    category: 'kids',
    gender: 'kids',
    shape: 'round',
    rimType: 'full-rim',
    material: 'polymer',
    color: 'Ocean Blue / Sunshine Yellow',
    colorHex: '#1E90FF',
    lensProperties: ['blue-light-filter', 'uv-protection'],
    isNewArrival: true,
    images: [
      'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Unbreakable bendable frame engineered specifically for children with anti-drop head strap, blue-light screen filtering, and myopia progression support.',
    specs: {
      lensWidth: 44,
      bridgeWidth: 16,
      templeLength: 125,
      frameWidth: 120,
      weight: '14g'
    }
  }
];
