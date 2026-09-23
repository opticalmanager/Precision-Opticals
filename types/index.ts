export type GenderCategory = 'men' | 'women' | 'unisex' | 'kids';

export type FrameShape =
  | 'aviator'
  | 'cat-eye'
  | 'rectangle'
  | 'round'
  | 'square'
  | 'geometric'
  | 'oval'
  | 'wayfarer';

export type RimType = 'full-rim' | 'half-rim' | 'rimless' | 'semi-rimless';

export type FrameMaterial =
  | 'titanium'
  | 'acetate'
  | 'metal'
  | '18k-gold-plated'
  | 'horn'
  | 'horn-gold'
  | 'combination'
  | 'stainless-steel'
  | 'polymer';

export type LensProperty =
  | 'polarized'
  | 'uv-protection'
  | 'photochromic'
  | 'gradient'
  | 'blue-light-filter'
  | 'anti-reflective';

export interface ProductVariant {
  id: string;
  colorName: string;
  colorHex: string;
  image: string;
  inStock?: boolean;
}

export interface ProductSpecs {
  lensWidth: number; // e.g. 53mm
  bridgeWidth: number; // e.g. 18mm
  templeLength: number; // e.g. 145mm
  frameWidth: number; // e.g. 140mm
  weight?: string;
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  subtitle?: string;
  price: number; // In INR
  originalPrice?: number;
  category: 'sunglasses' | 'eyeglasses' | 'meta-smart' | 'kids';
  gender: GenderCategory;
  shape: FrameShape;
  rimType: RimType;
  material: FrameMaterial;
  color: string;
  colorHex: string;
  lensProperties: LensProperty[];
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  isLimitedEdition?: boolean;
  rating?: number;
  reviewCount?: number;
  images: string[];
  description: string;
  specs: ProductSpecs;
  variants?: ProductVariant[];
  tryOnEnabled?: boolean;
  tryOnModelUrl?: string;
  tryOnConfig?: import('./tryOn').TryOnConfiguration;
}

export * from './tryOn';

export interface FilterState {
  category: string;
  brands: string[];
  shapes: FrameShape[];
  rimTypes: RimType[];
  materials: FrameMaterial[];
  colors: string[];
  properties: LensProperty[];
  gender: GenderCategory[];
  priceRange: [number, number];
  searchQuery: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'rating';
  onlyNewArrivals?: boolean;
  onlySale?: boolean;
  minDiscount?: number;
}

export type LensTypeOption = 'single-vision' | 'progressive' | 'zero-power-blue' | 'frame-only';

export interface LensPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  badge?: string;
}

export interface PrescriptionData {
  rightEye: {
    sph: string;
    cyl: string;
    axis: string;
    add?: string;
  };
  leftEye: {
    sph: string;
    cyl: string;
    axis: string;
    add?: string;
  };
  pd: string; // Pupillary Distance
  fileName?: string;
}

export interface SelectedLensConfig {
  lensType: LensTypeOption;
  lensPackage?: LensPackage;
  coatings: string[];
  prescription?: PrescriptionData;
  totalLensPrice: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedVariant?: ProductVariant;
  lensConfig?: SelectedLensConfig;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  apartment?: string;
}

export type PaymentMethod = 'razorpay' | 'upi' | 'card' | 'netbanking' | 'cod';

export interface Order {
  id: string;
  trackingNumber: string;
  createdAt: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentId?: string;
  paymentDetails?: any;
  paymentStatus?: 'paid' | 'unpaid' | 'failed' | 'refunded';
  subtotal: number;
  discount: number;
  couponApplied?: string;
  cleaningKitAdded?: boolean;
  totalAmount: number;
  status: 'confirmed' | 'optician_assembly' | 'quality_check' | 'dispatched' | 'delivered';
  estimatedDeliveryDate: string;
}

export interface Brand {
  id: string;
  name: string;
  origin: string;
  tagline: string;
  featuredImage: string;
  description: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  timings?: string;
  hours?: string;
  hasEyeTestingLab?: boolean;
  isFlagship?: boolean;
  image?: any;
  coordinates?: {
    lat: number;
    lng: number;
  };
  mapUrl?: string;
  mapEmbedUrl?: string;
}

export interface AppointmentBooking {
  id: string;
  type: 'in-store' | 'home';
  fullName: string;
  phone: string;
  email: string;
  service: string;
  storeLocation?: string;
  address?: string;
  pincode?: string;
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed';
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: 'customer' | 'optician' | 'admin';
  joinedDate?: string;
  gemPoints: number;
  savedAddresses: ShippingAddress[];
  savedPrescriptions: {
    id: string;
    title: string;
    date: string;
    doctorName?: string;
    data: PrescriptionData;
  }[];
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'info' | 'error' | 'warning';
}
