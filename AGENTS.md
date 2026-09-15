# Precision Optics — Agent & Developer Operating Manual

Welcome to the **Precision Optics** codebase. This document is the authoritative source of truth for coding rules, architectural conventions, visual standards, and development guidelines. All AI agents and human engineers working on this repository **must** strictly adhere to these rules.

---

## 1. Core Architectural Mental Model

Precision Optics is an enterprise-grade luxury optical e-commerce platform and clinical atelier system. The application operates in two distinct, deeply integrated environments:

1. **Luxury Customer Storefront (`/`, `/shop`, `/product/[slug]`, `/cart`, etc.)**:
   - High-fidelity shopping experience for designer eyewear (Cartier, Maybach, GAST, Lindberg Titanium, etc.).
   - Interactive clinical lens customizer (OD/OS prescription inputs, Zeiss single-vision, progressive, and blue-light packages).
   - Real-time WebAssembly + WebGL 3D Virtual Try-On (MediaPipe 478 face landmarks + Three.js).
2. **Enterprise Admin Operating System (`/admin`, `/admin/products`, `/admin/orders`, etc.)**:
   - High-density executive command center.
   - 5-stage optical laboratory assembly queue (`Confirmed` → `In Lab Assembly` → `Quality Check` → `Dispatched` → `Delivered`).
   - Printable GST tax invoices (`@media print` HSN codes 9003/9001).
   - SKU-level variant stock management, Cloudflare R2 image synchronization, and universal settings store.

---

## 2. Mandatory UI & Design System Constraints

### 2.1. Strict Zero Unicode Emojis Policy
- **Absolute Rule**: **NEVER** use unicode emojis anywhere in UI text, headings, badges, buttons, tooltips, placeholders, or toast notifications (strictly NO emojis like 👓, ⚡, 🏷️, ★, ✔, ❤️, 🚀, 📦, etc.).
- **Approved Icon Library**: Always use **Lucide Icons** (`lucide-react`) or clean inline SVGs.
  - Wishlist / Favorites: `<Heart className="..." />`
  - Offers / Discounts: `<Zap className="..." />` or `<Tag className="..." />`
  - Rating Stars: `<Star className="fill-amber-400 text-amber-400 ..." />`
  - Search: `<Search className="..." />`
  - Filters: `<SlidersHorizontal className="..." />` or `<ChevronDown className="..." />`
  - Close / Clear: `<X className="..." />`
  - Reset / Reload: `<RotateCcw className="..." />`
  - Lab / Processing: `<FlaskConical className="..." />` or `<Clock className="..." />`

### 2.2. Viewport Geometry & Container Widths (No Over-Stretching)
- **Never** allow card grids, content sections, or admin tables to stretch uncontrollably edge-to-edge on 2K/4K displays.
- **Standard Width Constraints**:
  - **Storefront Catalog / PLP**: `max-w-[1440px]` or `max-w-[1480px]` with `mx-auto px-4 sm:px-6 lg:px-8`.
  - **Content Sections & Footers**: `max-w-[1280px]` or `max-w-7xl` with `mx-auto`.
  - **Admin Operating Center**: `max-w-[1400px]` with `mx-auto px-4 sm:px-6 lg:px-8`.
- **Aspect Ratios**: Maintain consistent aspect ratios for product cards (`aspect-[4/3]` or `aspect-square`) and luxury hero banners. Never distort images.

### 2.3. Luxury Color Palette & Design Tokens

| Token / Role | Hex Code | Purpose / Usage |
|---|---|---|
| **Cream Canvas** | `#FAF7F2` | Storefront main background (`bg-[#FAF7F2]`) |
| **Header Cream** | `#FAF3EB` | Luxury header & navigation background (`bg-[#FAF3EB]`) |
| **Espresso Dark** | `#2A1E17` | Primary luxury typography & dark UI surfaces (`text-[#2A1E17]`, `bg-[#2A1E17]`) |
| **Brand Orange** | `#C86A28` / `#EA580C` | Primary CTA buttons, focus states, and accents |
| **Border Neutral** | `#EBE6DF` / `#E8DCCF` | Hairline dividers, card outlines, and inputs |
| **Active Blue** | `#007AFF` | Selected filter checkboxes and active state rings |
| **Admin Canvas** | `#F8F9FA` | Clean SaaS background for administrative views |

### 2.4. Responsive & Touch Standards
- **Mobile First**:
  - Mobile (`< 640px`): Single-column cards, slide-over drawer filters, sticky bottom navigation.
  - Tablet (`640px - 1024px`): 2-to-3 column grid, minimum `44px` touch targets.
  - Desktop (`> 1024px`): 4-column product grid with sticky left filter rail or dense admin tables.
- **Micro-interactions**: Smooth 60 FPS transitions (`hover:scale-105`, `transition-all duration-300`).

---

## 3. Client Routing & Next.js App Router Rules

### 3.1. Navigation Rule (Never Raw `<a>` for Internal Links)
- **Always** use `Link` from `next/link` for internal page navigation (e.g. `<Link href="/admin/products">`).
- **Never** use raw HTML `<a>` tags for internal routes. Raw `<a>` tags trigger hard browser page reloads, causing flash of unstyled content (FOUC), resetting React Context state, and risking Service Worker cache conflicts.

### 3.2. Next.js Static Prerender & `<Suspense>` Boundaries
- Any component or page that consumes dynamic search query parameters via `useSearchParams()` **must** be wrapped in a `<Suspense fallback={<LoadingSpinner />}>` boundary to prevent Next.js build-time prerendering failures.

### 3.3. Service Worker Cleanser
- Precision Optics utilizes a lightweight service worker cleanser in `app/layout.tsx` to automatically unregister legacy service workers from past origins and ensure pristine client caching.

---

## 4. Backend & Database Access Patterns

### 4.1. Dual Data Layer Architecture
1. **Server / Admin Layer (`lib/adminDb.ts` & `lib/db.ts`)**:
   - Uses `pg.Pool` connecting directly to PostgreSQL via `DATABASE_URL`.
   - Used in server-side API route handlers (`app/api/admin/*`) and Server Actions.
   - Provides low-latency parameterized SQL queries with full transaction support.
2. **Client / Edge Layer (`lib/supabase.ts`)**:
   - Uses `@supabase/supabase-js` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Handles client authentication state, session tokens, and RLS-scoped user queries.

### 4.2. Universal Admin Settings Storage
- All system configurations are consolidated in the `public.admin_settings` table (`key TEXT PRIMARY KEY`, `value JSONB NOT NULL`).
- Standard keys: `general`, `payments`, `shipping`, `content`, `loyalty`, `roles`.
- Always read and update settings through `/api/admin/settings` to maintain atomic transactional integrity.

### 4.3. Cloudflare R2 Object Storage
- Product photography and 3D GLB assets are stored on Cloudflare R2 via `@aws-sdk/client-s3` (`lib/r2.ts`).
- Public asset URLs are served via `R2_PUBLIC_URL`.

### 4.4. Graceful Fallbacks & Offline Resilience
- The product catalog service (`lib/productsService.ts`) implements optimistic fallbacks to ensure the storefront continues rendering smoothly during maintenance or temporary network blips.

---

## 5. Coding & TypeScript Standards

1. **Strict Type Safety**: Enable strict typing across all files. Define shared domain models in `types/` (e.g., `Product`, `Order`, `Prescription`, `LensPackage`). Never use `any` when explicit types can be modeled.
2. **Form Validation**: Use `react-hook-form` paired with `zod` schemas and `@hookform/resolvers/zod` for all form inputs.
3. **Optimized Renders**: Memoize expensive filter arrays, matrix computations, and table sorters with `useMemo` and `useCallback`.
4. **Codebase Cleanliness**: Preserve existing comments, docstrings, and architectural patterns.

---

## 6. 3D Virtual Try-On (VTO) Architecture

- **Engine**: Google MediaPipe Face Landmarker (`@mediapipe/tasks-vision`) + Three.js (`three`).
- **Tracking Pipeline**: 478 3D landmarks → Kalman Filter smoothing → Perspective-n-Point pose calculation → WebGL canvas overlay.
- **Model Calibration**: Frame width, pupil distance scaling, and vertical/depth offsets are stored in `products.try_on_configuration` JSONB.

---

## 7. Documentation Suite Reference

For deep-dive architectural context, database schemas, and technical specs, refer to the `docs/` folder:
- [`docs/overview.md`](file:///c:/Users/Gaurav/Desktop/Precision-Opticals/docs/overview.md): Business domain, customer personas, lens customizer, and optical lab workflows.
- [`docs/architecture.md`](file:///c:/Users/Gaurav/Desktop/Precision-Opticals/docs/architecture.md): Layered architecture, Mermaid diagrams, directory layout, and security model.
- [`docs/tech_stack.md`](file:///c:/Users/Gaurav/Desktop/Precision-Opticals/docs/tech_stack.md): Complete list of dependencies, package versions, and environment variables.
- [`docs/database_schema.md`](file:///c:/Users/Gaurav/Desktop/Precision-Opticals/docs/database_schema.md): Complete PostgreSQL table schemas, ER diagram, triggers, and RLS policies.
