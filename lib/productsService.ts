import { supabase } from "@/lib/supabase";
import { PRODUCTS } from "@/data/products";
import { AKONI_DEMO_PRODUCTS } from "@/data/akoniDemoDataset";
import { Product, FilterState } from "@/types";

/**
 * Precision Optics - Product Data Service
 * Provides zero-latency cached catalog loading with automatic Supabase database hydration.
 */

// In-memory cache for ultra-fast instantaneous responses
let cachedProducts: Product[] | null = null;

export function invalidateProductsCache(): void {
  cachedProducts = null;
}

const mappedAkoniDemoProducts: Product[] = (AKONI_DEMO_PRODUCTS || []).map((item) => ({
  id: item.slug,
  brand: item.brand || "Akoni",
  name: item.title,
  subtitle: "Swiss Precision Eyewear",
  price: item.price,
  originalPrice: item.originalPrice,
  category: (item.categorySlug || "sunglasses") as "sunglasses" | "eyeglasses",
  gender: (item.gender || "unisex") as any,
  shape: (item.shape || "rectangle") as any,
  rimType: (item.rimType || "full-rim") as any,
  material: (item.material || "titanium") as any,
  color: item.color || "Obsidian Black / Gold",
  colorHex: item.colorHex || "#1A1A1A",
  lensProperties: ["anti-reflective", "uv-protection", "blue-light-filter"],
  isNewArrival: true,
  isBestSeller: false,
  isOnSale: false,
  isLimitedEdition: false,
  rating: 4.9,
  reviewCount: 18,
  images: item.images && item.images.length > 0 ? item.images : ["/images/products/figma_cartier_blue_rimless.png"],
  description: item.description || "",
  specs: {
    lensWidth: item.specs?.lensWidth || 52,
    bridgeWidth: item.specs?.bridgeWidth || 19,
    templeLength: item.specs?.templeLength || 145,
    frameWidth: 140,
    weight: item.specs?.weight || "24g",
  },
  variants: [
    {
      id: item.sku || `AKN-${item.slug}`,
      colorName: item.color || "Obsidian Black / Gold",
      colorHex: item.colorHex || "#1A1A1A",
      image: item.images?.[0] || "/images/products/figma_cartier_blue_rimless.png",
      inStock: (item.stockQuantity || 12) > 0,
    },
  ],
  tryOnEnabled: false,
}));

export const ALL_FALLBACK_PRODUCTS: Product[] = [...PRODUCTS, ...mappedAkoniDemoProducts];

/**
 * Fetch all active products from Supabase with graceful fallback to local catalogue.
 */
export async function getCatalogProducts(forceRefresh = false): Promise<Product[]> {
  if (!forceRefresh && cachedProducts && cachedProducts.length > 0) {
    return cachedProducts;
  }

  try {
    // Attempt to load from Supabase if online
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        brand:brands(name, slug),
        category:categories(name, slug),
        product_variants(*),
        product_images(*)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      // Fallback to rich static dataset
      cachedProducts = ALL_FALLBACK_PRODUCTS;
      return ALL_FALLBACK_PRODUCTS;
    }

    // Map database rows to frontend Product interface
    const mapped: Product[] = data.map((row: any) => {
      const localMatch = PRODUCTS.find((p) => p.id === row.slug);
      const rawImages = (row.product_images || [])
        .slice()
        .sort((a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || (a.display_order || 0) - (b.display_order || 0))
        .map((img: any) => (img.url || img.image_url)?.trim())
        .filter((url: string | undefined): url is string => Boolean(url && (url.startsWith("/") || url.startsWith("http"))));

      const resolvedImages = rawImages.length > 0 
        ? rawImages 
        : (localMatch?.images && localMatch.images.length > 0 
            ? localMatch.images 
            : ["/images/products/figma_cartier_blue_rimless.png"]);

      return {
        id: row.slug || row.id,
        brand: row.brand?.name || localMatch?.brand || "PRECISION",
        name: row.name,
        subtitle: row.subtitle || localMatch?.subtitle || row.name,
        price: Number(row.base_price) || localMatch?.price || 87125,
        originalPrice: row.original_price ? Number(row.original_price) : localMatch?.originalPrice,
        category: row.category?.slug || localMatch?.category || "sunglasses",
        gender: row.gender || localMatch?.gender || "unisex",
        shape: row.shape || localMatch?.shape || "rectangle",
        rimType: row.rim_type || localMatch?.rimType || "rimless",
        material: row.material || localMatch?.material || "titanium",
        color: row.color || localMatch?.color || "Gold",
        colorHex: row.color_hex || localMatch?.colorHex || "#D4AF37",
        lensProperties: row.lens_properties && row.lens_properties.length > 0 ? row.lens_properties : (localMatch?.lensProperties || ["uv-protection"]),
        isNewArrival: row.is_new_arrival ?? localMatch?.isNewArrival ?? false,
        isBestSeller: row.is_best_seller ?? localMatch?.isBestSeller ?? false,
        isOnSale: row.is_on_sale ?? localMatch?.isOnSale ?? false,
        isLimitedEdition: row.is_limited_edition ?? localMatch?.isLimitedEdition ?? false,
        rating: Number(row.rating) || localMatch?.rating || 5.0,
        reviewCount: Number(row.review_count) || localMatch?.reviewCount || 0,
        images: resolvedImages,
        description: row.description || localMatch?.description || "",
        specs: row.specs || localMatch?.specs || {
          lensWidth: 53,
          bridgeWidth: 18,
          templeLength: 145,
          frameWidth: 140,
          weight: "20g",
        },
        variants: row.product_variants && row.product_variants.length > 0
          ? row.product_variants.map((v: any) => {
              const variantImgObj = (row.product_images || []).find((img: any) => img.variant_id === v.id);
              const rawVarUrl = variantImgObj?.url || variantImgObj?.image_url;
              const validVarImg = (rawVarUrl && (rawVarUrl.startsWith("/") || rawVarUrl.startsWith("http")))
                ? rawVarUrl.trim()
                : resolvedImages[0];

              return {
                id: v.id,
                colorName: v.color_name,
                colorHex: v.color_hex,
                image: validVarImg,
                inStock: v.stock_quantity > 0,
              };
            })
          : localMatch?.variants,
        tryOnEnabled: row.try_on_enabled ?? localMatch?.tryOnEnabled ?? false,
        tryOnModelUrl: row.try_on_model_url || localMatch?.tryOnModelUrl,
        tryOnConfig: row.try_on_configuration || localMatch?.tryOnConfig,
      };
    });

    // Ensure all static PRODUCTS are included if not present in DB
    const existingSlugs = new Set(mapped.map((p) => p.id));
    for (const localProd of ALL_FALLBACK_PRODUCTS) {
      if (!existingSlugs.has(localProd.id)) {
        mapped.push(localProd);
      }
    }

    // Sort to prioritize Figma reference products first, matching the design exactly
    const figmaOrder = [
      'figma-cartier-blue-rimless',
      'figma-brown-gradient-rimless',
      'figma-fastrack-black-wayfarer',
      'figma-fastrack-gold-oval',
      'figma-cartier-gold-rectangle',
    ];
    mapped.sort((a, b) => {
      const idxA = figmaOrder.indexOf(a.id);
      const idxB = figmaOrder.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });

    cachedProducts = mapped;
    return mapped;
  } catch (err) {
    console.warn("Supabase fetch fallback to local catalogue:", err);
    cachedProducts = ALL_FALLBACK_PRODUCTS;
    return ALL_FALLBACK_PRODUCTS;
  }
}

/**
 * Filter and sort catalog in-memory with maximum performance and zero latency.
 */
export function filterAndSortProducts(
  products: Product[],
  filterState: FilterState
): Product[] {
  let result = [...products];

  // 1. Category Filter
  if (filterState.category && filterState.category !== "all") {
    const cat = filterState.category.toLowerCase();
    if (cat === "sunglasses") {
      result = result.filter((p) => p.category === "sunglasses");
    } else if (cat === "eyeglasses") {
      result = result.filter((p) => p.category === "eyeglasses");
    } else if (cat === "meta-smart" || cat === "smart-glasses") {
      result = result.filter((p) => p.category === "meta-smart");
    } else if (cat === "kids") {
      result = result.filter((p) => p.category === "kids" || p.gender === "kids");
    } else if (cat === "new" || cat === "new-arrivals") {
      result = result.filter((p) => p.isNewArrival);
    } else if (cat === "sale") {
      result = result.filter((p) => p.isOnSale || (p.originalPrice && p.originalPrice > p.price));
    } else if (cat === "contact-lenses" || cat === "contacts") {
      result = result.filter((p) => (p.category as string) === "contact-lenses");
    } else {
      result = result.filter((p) => p.category.toLowerCase() === cat);
    }
  }

  // 2. Gender Filter
  if (filterState.gender && filterState.gender.length > 0) {
    result = result.filter((p) => {
      if (filterState.gender.includes("men")) {
        return p.gender === "men" || p.gender === "unisex";
      }
      if (filterState.gender.includes("women")) {
        return p.gender === "women" || p.gender === "unisex";
      }
      if (filterState.gender.includes("kids")) {
        return p.gender === "kids" || p.category === "kids";
      }
      return filterState.gender.includes(p.gender);
    });
  }

  // 3. Luxury Brands Filter
  if (filterState.brands && filterState.brands.length > 0) {
    result = result.filter((p) =>
      filterState.brands.some(
        (brand) =>
          p.brand?.toLowerCase().includes(brand.toLowerCase()) ||
          p.id.toLowerCase().includes(brand.toLowerCase())
      )
    );
  }

  // 4. Frame Shapes Filter
  if (filterState.shapes && filterState.shapes.length > 0) {
    result = result.filter((p) => filterState.shapes.includes(p.shape));
  }

  // 5. Rim Types Filter
  if (filterState.rimTypes && filterState.rimTypes.length > 0) {
    result = result.filter((p) => filterState.rimTypes.includes(p.rimType));
  }

  // 6. Materials Filter
  if (filterState.materials && filterState.materials.length > 0) {
    result = result.filter((p) => filterState.materials.includes(p.material));
  }

  // 7. Search Query Filter
  if (filterState.searchQuery && filterState.searchQuery.trim() !== "") {
    const q = filterState.searchQuery.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.subtitle?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }

  // 8. Sorting
  if (filterState.sortBy === "price-asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (filterState.sortBy === "price-desc") {
    result.sort((a, b) => b.price - a.price);
  } else if (filterState.sortBy === "newest") {
    result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
  } else if (filterState.sortBy === "rating") {
    result.sort((a, b) => (b.rating || 5) - (a.rating || 5));
  }

  return result;
}
