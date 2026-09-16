import akoniData from "./akoniDemoDataset.json";

export interface AkoniDemoProduct {
  title: string;
  slug: string;
  price: number;
  originalPrice: number;
  brand: string;
  brandSlug: string;
  categorySlug: string;
  gender: string;
  shape: string;
  rimType: string;
  material: string;
  color: string;
  colorHex: string;
  description: string;
  specs: {
    is_demo: boolean;
    source: string;
    model_no: string;
    source_material: string;
    source_gender: string;
    source_shape: string;
    source_type: string;
    source_url: string;
    lensWidth: number;
    bridgeWidth: number;
    templeLength: number;
    weight: string;
  };
  images: string[];
  sku: string;
  stockQuantity: number;
}

export const AKONI_DEMO_PRODUCTS = akoniData as AkoniDemoProduct[];
