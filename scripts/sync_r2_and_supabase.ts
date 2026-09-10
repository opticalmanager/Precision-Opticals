import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Client } from 'pg';
import { PRODUCTS } from '../data/products';

const R2_ENDPOINT = 'https://60b5b6284d20e2f6dbb15298f1778400.r2.cloudflarestorage.com';
const R2_ACCESS_KEY_ID = '56598c1f1d0fe0331a433c7fc34da144';
const R2_SECRET_ACCESS_KEY = '32dc102cee96309b1f6061c5afa377b4d60504e1702aaf43fe9bb67e19060061';
const R2_BUCKET = 'precision-optics-catalog';
const R2_PUBLIC_BASE = 'https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev';

const DB_URL = 'postgresql://postgres.rtyaihaeogqdxvqyycir:data%40precisionoptics2026@aws-0-ap-south-1.pooler.supabase.com:5432/postgres';

const s3 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function uploadFileToR2(localPath: string, r2Key: string, contentType: string): Promise<string> {
  const content = fs.readFileSync(localPath);
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: r2Key,
      Body: content,
      ContentType: contentType,
    })
  );
  const publicUrl = `${R2_PUBLIC_BASE}/${r2Key}`;
  console.log(`Uploaded ${localPath} -> ${publicUrl}`);
  return publicUrl;
}

async function uploadDirectory(dirPath: string, keyPrefix: string): Promise<Record<string, string>> {
  const urls: Record<string, string> = {};
  if (!fs.existsSync(dirPath)) return urls;

  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isFile()) {
      const ext = path.extname(file).toLowerCase();
      const contentType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.svg' ? 'image/svg+xml' : 'application/octet-stream';
      const r2Key = `${keyPrefix}/${file}`;
      const url = await uploadFileToR2(fullPath, r2Key, contentType);
      urls[file] = url;
    }
  }
  return urls;
}

async function run() {
  console.log('=== Starting Cloudflare R2 Upload & Supabase DB Sync ===');

  // 1. Upload local product images
  console.log('\n1. Uploading product images to Cloudflare R2...');
  const productImgUrls = await uploadDirectory(path.join(process.cwd(), 'public/images/products'), 'products');
  console.log(`Uploaded ${Object.keys(productImgUrls).length} product images.`);

  // 2. Connect to Supabase Postgres
  console.log('\n2. Connecting to Supabase Postgres database...');
  const pg = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
  });
  await pg.connect();
  console.log('Connected to PostgreSQL successfully.');

  // 3. Ensure Categories
  console.log('\n3. Upserting Categories in database...');
  const categories = [
    { slug: 'sunglasses', name: 'Sunglasses', desc: 'Precision luxury tinted sunglasses' },
    { slug: 'eyeglasses', name: 'Eyeglasses', desc: 'Optical prescription frames & blue-light blockers' },
    { slug: 'meta-smart', name: 'Smart Glasses', desc: 'Next-gen audio & camera AI spectacles' },
    { slug: 'kids', name: 'Junior Eyewear', desc: 'Durable flex-hinge frames for kids & teens' },
    { slug: 'contact-lenses', name: 'Contact Lenses', desc: 'Breathable daily & monthly contact lenses' },
  ];

  const categoryIdMap: Record<string, string> = {};
  for (const cat of categories) {
    const res = await pg.query(
      `INSERT INTO public.categories (slug, name, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO UPDATE
       SET name = EXCLUDED.name, description = EXCLUDED.description
       RETURNING id, slug;`,
      [cat.slug, cat.name, cat.desc]
    );
    categoryIdMap[res.rows[0].slug] = res.rows[0].id;
  }
  console.log('Categories synced:', Object.keys(categoryIdMap));

  // 4. Ensure Brands
  console.log('\n4. Upserting Brands in database...');
  const brandNames = Array.from(new Set(PRODUCTS.map((p) => p.brand).filter(Boolean)));
  // Add missing luxury brands
  ['Cartier', 'FASTRACK', 'GAST', 'Tom Ford', 'Ray-Ban', 'Prada', 'Gucci', 'Lindberg', 'Jacques Marie Mage'].forEach((b) => {
    if (!brandNames.includes(b)) brandNames.push(b);
  });

  const brandIdMap: Record<string, string> = {};
  for (const bName of brandNames) {
    const slug = bName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const res = await pg.query(
      `INSERT INTO public.brands (slug, name)
       VALUES ($1, $2)
       ON CONFLICT (slug) DO UPDATE
       SET name = EXCLUDED.name
       RETURNING id, slug;`,
      [slug, bName]
    );
    brandIdMap[bName.toLowerCase()] = res.rows[0].id;
    brandIdMap[slug] = res.rows[0].id;
  }
  console.log('Brands synced:', Object.keys(brandIdMap).length);

  // 5. Upsert All Products & Images
  console.log(`\n5. Upserting ${PRODUCTS.length} Products to Supabase...`);
  for (const prod of PRODUCTS) {
    const brandKey = prod.brand?.toLowerCase() || 'precision';
    const brandId = brandIdMap[brandKey] || brandIdMap[brandKey.replace(/[^a-z0-9]+/g, '-')] || null;
    const catSlug = prod.category || 'sunglasses';
    const catId = categoryIdMap[catSlug] || categoryIdMap['sunglasses'];

    const insertProd = await pg.query(
      `INSERT INTO public.products (
        slug, name, subtitle, brand_id, category_id, gender, shape, rim_type,
        material, color, color_hex, base_price, original_price, lens_properties,
        specs, description, is_new_arrival, is_best_seller, is_on_sale,
        is_limited_edition, is_active, rating
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19,
        $20, true, $21
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        subtitle = EXCLUDED.subtitle,
        brand_id = EXCLUDED.brand_id,
        category_id = EXCLUDED.category_id,
        gender = EXCLUDED.gender,
        shape = EXCLUDED.shape,
        rim_type = EXCLUDED.rim_type,
        material = EXCLUDED.material,
        color = EXCLUDED.color,
        color_hex = EXCLUDED.color_hex,
        base_price = EXCLUDED.base_price,
        original_price = EXCLUDED.original_price,
        lens_properties = EXCLUDED.lens_properties,
        specs = EXCLUDED.specs,
        description = EXCLUDED.description,
        is_new_arrival = EXCLUDED.is_new_arrival,
        is_best_seller = EXCLUDED.is_best_seller,
        is_on_sale = EXCLUDED.is_on_sale,
        is_limited_edition = EXCLUDED.is_limited_edition,
        is_active = true,
        rating = EXCLUDED.rating
      RETURNING id, slug;`,
      [
        prod.id,
        prod.name,
        prod.subtitle || prod.name,
        brandId,
        catId,
        prod.gender || 'unisex',
        prod.shape || 'rectangle',
        prod.rimType || 'rimless',
        prod.material || 'titanium',
        prod.color || 'Gold',
        prod.colorHex || '#D4AF37',
        prod.price,
        prod.originalPrice || null,
        prod.lensProperties || [],
        JSON.stringify(prod.specs || {}),
        prod.description || '',
        Boolean(prod.isNewArrival),
        Boolean(prod.isBestSeller),
        Boolean(prod.isOnSale),
        Boolean(prod.isLimitedEdition),
        prod.rating || 5.0,
      ]
    );

    const dbProdId = insertProd.rows[0].id;

    // Remove existing images for this product and re-insert
    await pg.query('DELETE FROM public.product_images WHERE product_id = $1', [dbProdId]);

    // Insert image URLs
    const imagesToInsert: string[] = [];
    for (const img of prod.images) {
      if (img.startsWith('/images/products/')) {
        const fname = path.basename(img);
        const r2Url = productImgUrls[fname] || `${R2_PUBLIC_BASE}/products/${fname}`;
        imagesToInsert.push(r2Url);
      } else {
        imagesToInsert.push(img);
      }
    }

    if (imagesToInsert.length === 0) {
      imagesToInsert.push(`${R2_PUBLIC_BASE}/products/figma_cartier_blue_rimless.png`);
    }

    for (let idx = 0; idx < imagesToInsert.length; idx++) {
      await pg.query(
        `INSERT INTO public.product_images (product_id, url, display_order, is_primary)
         VALUES ($1, $2, $3, $4);`,
        [dbProdId, imagesToInsert[idx], idx, idx === 0]
      );
    }

    // Insert variants if present
    if (prod.variants && prod.variants.length > 0) {
      await pg.query('DELETE FROM public.product_variants WHERE product_id = $1', [dbProdId]);
      for (const v of prod.variants) {
        await pg.query(
          `INSERT INTO public.product_variants (product_id, color_name, color_hex, sku, is_default)
           VALUES ($1, $2, $3, $4, $5);`,
          [dbProdId, v.colorName, v.colorHex, `${prod.id}-${v.id}`, false]
        );
      }
    }

    console.log(`Synced product: ${prod.id} (${prod.name}) with ${imagesToInsert.length} images.`);
  }

  await pg.end();
  console.log('\n=== All Cloudflare R2 Uploads & Supabase DB Sync Completed Successfully! ===');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
