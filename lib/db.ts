import { supabase } from "@/lib/supabase";
import { Product, Brand, LensPackage, ProductVariant } from "@/types";
import { PRODUCTS as FALLBACK_PRODUCTS } from "@/data/products";
import { LUXURY_BRANDS as FALLBACK_BRANDS } from "@/data/brands";

/**
 * Fetch all active categories from Supabase
 */
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return [
        { slug: "sunglasses", name: "Sunglasses" },
        { slug: "eyeglasses", name: "Eyeglasses" },
        { slug: "meta-smart", name: "Meta Smart Glasses" },
        { slug: "contact-lenses", name: "Contact Lenses" },
        { slug: "kids", name: "Kids Eyewear" },
      ];
    }
    return data;
  } catch {
    return [];
  }
}

/**
 * Fetch all active brands from Supabase
 */
export async function getBrands(): Promise<Brand[]> {
  try {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_BRANDS;
    }

    return data.map((b) => ({
      id: b.slug,
      name: b.name,
      origin: b.origin || "",
      tagline: b.tagline || "",
      featuredImage: b.featured_image_url || "",
      description: b.description || "",
    }));
  } catch {
    return FALLBACK_BRANDS;
  }
}

/**
 * Fetch products with optional filtering from Supabase
 */
export async function getProducts(options?: {
  category?: string;
  brand?: string;
  gender?: string;
  shape?: string;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  limit?: number;
}): Promise<Product[]> {
  try {
    let query = supabase
      .from("products")
      .select(`
        *,
        brand:brands(name, slug),
        category:categories(name, slug),
        variants:product_variants(*),
        images:product_images(url, display_order)
      `)
      .eq("is_active", true);

    if (options?.category && options.category !== "all") {
      query = query.eq("category.slug", options.category);
    }
    if (options?.gender && options.gender !== "all") {
      query = query.eq("gender", options.gender);
    }
    if (options?.shape) {
      query = query.eq("shape", options.shape);
    }
    if (options?.isNewArrival) {
      query = query.eq("is_new_arrival", true);
    }
    if (options?.isBestSeller) {
      query = query.eq("is_best_seller", true);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Return fallback data matching options
      let res = [...FALLBACK_PRODUCTS];
      if (options?.category && options.category !== "all") {
        res = res.filter((p) => p.category === options.category);
      }
      if (options?.gender && options.gender !== "all") {
        res = res.filter((p) => p.gender === options.gender || p.gender === "unisex");
      }
      if (options?.isNewArrival) {
        res = res.filter((p) => p.isNewArrival);
      }
      if (options?.isBestSeller) {
        res = res.filter((p) => p.isBestSeller);
      }
      if (options?.limit) {
        res = res.slice(0, options.limit);
      }
      return res;
    }

    // Map Supabase rows to client Product interface
    return data.map((row: any) => {
      const sortedImages = (row.images || [])
        .sort((a: any, b: any) => a.display_order - b.display_order)
        .map((img: any) => img.url);

      const mappedVariants: ProductVariant[] = (row.variants || []).map((v: any) => ({
        id: v.id,
        colorName: v.color_name,
        colorHex: v.color_hex,
        image: sortedImages[0] || "",
        inStock: v.stock_quantity > 0,
      }));

      return {
        id: row.slug || row.id,
        brand: row.brand?.name || "Precision",
        name: row.name,
        subtitle: row.subtitle,
        price: Number(row.base_price),
        originalPrice: row.original_price ? Number(row.original_price) : undefined,
        category: (row.category?.slug || "sunglasses") as any,
        gender: row.gender as any,
        shape: row.shape as any,
        rimType: row.rim_type as any,
        material: row.material as any,
        color: row.color,
        colorHex: row.color_hex,
        lensProperties: row.lens_properties || [],
        isNewArrival: row.is_new_arrival,
        isBestSeller: row.is_best_seller,
        isOnSale: row.is_on_sale,
        isLimitedEdition: row.is_limited_edition,
        rating: Number(row.rating || 5.0),
        reviewCount: row.review_count || 0,
        images: sortedImages.length > 0 ? sortedImages : ["/images/placeholder.jpg"],
        description: row.description || "",
        specs: row.specs || { lensWidth: 52, bridgeWidth: 18, templeLength: 145, frameWidth: 140 },
        variants: mappedVariants,
        tryOnEnabled: row.try_on_enabled ?? false,
        tryOnModelUrl: row.try_on_model_url || undefined,
        tryOnConfig: row.try_on_configuration || undefined,
      };
    });
  } catch (err) {
    console.warn("Error fetching products from database, using fallback:", err);
    return FALLBACK_PRODUCTS;
  }
}

/**
 * Fetch a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        brand:brands(name, slug),
        category:categories(name, slug),
        variants:product_variants(*),
        images:product_images(url, display_order)
      `)
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return FALLBACK_PRODUCTS.find((p) => p.id === slug) || null;
    }

    const sortedImages = (data.images || [])
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((img: any) => img.url);

    return {
      id: data.slug,
      brand: data.brand?.name || "Precision",
      name: data.name,
      subtitle: data.subtitle,
      price: Number(data.base_price),
      originalPrice: data.original_price ? Number(data.original_price) : undefined,
      category: (data.category?.slug || "sunglasses") as any,
      gender: data.gender as any,
      shape: data.shape as any,
      rimType: data.rim_type as any,
      material: data.material as any,
      color: data.color,
      colorHex: data.color_hex,
      lensProperties: data.lens_properties || [],
      isNewArrival: data.is_new_arrival,
      isBestSeller: data.is_best_seller,
      isOnSale: data.is_on_sale,
      isLimitedEdition: data.is_limited_edition,
      rating: Number(data.rating || 5.0),
      reviewCount: data.review_count || 0,
      images: sortedImages.length > 0 ? sortedImages : ["/images/placeholder.jpg"],
      description: data.description || "",
      specs: data.specs,
      variants: (data.variants || []).map((v: any) => ({
        id: v.id,
        colorName: v.color_name,
        colorHex: v.color_hex,
        image: sortedImages[0] || "",
        inStock: v.stock_quantity > 0,
      })),
      tryOnEnabled: data.try_on_enabled ?? false,
      tryOnModelUrl: data.try_on_model_url || undefined,
      tryOnConfig: data.try_on_configuration || undefined,
    };
  } catch {
    return FALLBACK_PRODUCTS.find((p) => p.id === slug) || null;
  }
}

/**
 * Fetch active lens customization packages
 */
export async function getLensPackages(): Promise<LensPackage[]> {
  try {
    const { data, error } = await supabase
      .from("lens_packages")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data) return [];
    return data.map((lp) => ({
      id: lp.id,
      name: lp.name,
      description: lp.description,
      price: Number(lp.price),
      badge: lp.badge || undefined,
    }));
  } catch {
    return [];
  }
}
