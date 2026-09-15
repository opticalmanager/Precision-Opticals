# Precision Optics — Technology Stack & Dependencies

This document provides a comprehensive technical breakdown of the frameworks, libraries, services, and tooling powering the **Precision Optics** platform.

---

## 1. Core Framework & Runtime

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | `16.2.4` | Full-stack React framework utilizing the App Router, Server Components, Route Handlers, and Turbopack bundler. |
| **React** | `19.0.0` | Declarative component library utilizing concurrent rendering and modern hook patterns. |
| **TypeScript** | `^5.0.0` | Static type system with strict type checking enabled across the entire codebase. |
| **Node.js** | `>= 20.0.0` | Server runtime executing SSR, server actions, and API route handlers. |

---

## 2. Frontend UI, Styling & Animation

| Package | Version | Purpose |
|---|---|---|
| **Tailwind CSS** | `^4.0.0` | Modern utility-first CSS engine configured with custom luxury design tokens and print media variants. |
| **@tailwindcss/postcss** | `^4.0.0` | PostCSS plugin integration for Tailwind CSS v4. |
| **Lucide Icons (`lucide-react`)** | `^0.487.0` | Official icon library (Zero Emojis policy strictly enforced; all iconography is SVG-based). |
| **Sonner** | `^1.7.4` | Performant, customizable toast notification manager. |
| **Motion (`motion`)** | `^12.23.24` | 60 FPS hardware-accelerated fluid UI transitions and gesture animations. |
| **@radix-ui/react-slot** | `^1.1.2` | Polymorphic component composition primitive for reusable UI components. |
| **@base-ui/react** | `^1.4.1` | Unstyled accessible primitives for complex interactive widgets. |
| **tailwind-merge & clsx** | `^2.6.1` / `^2.1.1` | Safe utility class merging and conditional className concatenation. |
| **tw-animate-css** | `^1.4.0` | Pre-built CSS animation utilities. |

---

## 3. Computer Vision & 3D Virtual Try-On

| Package | Version | Purpose |
|---|---|---|
| **Three.js (`three`, `@types/three`)** | `^0.186.0` | WebGL 3D rendering engine managing scene graphs, PBR materials, dynamic lighting, and eyewear meshes. |
| **@mediapipe/tasks-vision** | `^1.0.1` | WebAssembly & WebGL AI computer vision model detecting 478 3D facial landmarks at 60 FPS directly on the client. |

---

## 4. Backend, Database & Cloud Infrastructure

| Service / Package | Version | Purpose |
|---|---|---|
| **PostgreSQL (Supabase)** | `15+` | Relational database hosting products, variants, orders, prescriptions, appointments, and settings. |
| **pg (`pg`, `@types/pg`)** | `^8.23.0` | High-throughput node PostgreSQL client pool (`pg.Pool`) for direct server-side data access. |
| **@supabase/supabase-js** | `^2.115.0` | Supabase client SDK managing user authentication and Row-Level Security (RLS) policies. |
| **Cloudflare R2** | — | High-performance, S3-compatible, egress-free object storage for product photography and 3D GLB models. |
| **@aws-sdk/client-s3** | `^3.1127.0` | AWS S3 client utilized to communicate securely with Cloudflare R2 object buckets. |
| **@aws-sdk/s3-request-presigner** | `^3.1127.0` | Generates secure pre-signed URLs for direct client-to-R2 image uploads. |

---

## 5. Forms & Data Validation

| Package | Version | Purpose |
|---|---|---|
| **React Hook Form (`react-hook-form`)** | `^7.54.2` | Performant, uncontrolled form state management with minimal re-renders. |
| **Zod (`zod`)** | `^3.24.4` | TypeScript-first schema declaration and runtime validation library. |
| **@hookform/resolvers** | `^3.10.0` | Validation resolver binding Zod schemas directly to React Hook Form instances. |

---

## 6. Environment Variables Reference

| Variable Name | Required | Description | Example / Format |
|---|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string for `pg.Pool` | `postgresql://postgres.[ref]:[pass]@[host]:5432/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project API gateway endpoint | `https://[ref].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public anonymous API key | `eyJhbGciOiJIUzI1NiIsIn...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase elevated service role key | `eyJhbGciOiJIUzI1NiIsIn...` |
| `R2_ACCOUNT_ID` | Yes | Cloudflare account identifier | `4770ee76ded14c04b1a8924c...` |
| `R2_ACCESS_KEY_ID` | Yes | Cloudflare R2 API access key | `[access_key_id]` |
| `R2_SECRET_ACCESS_KEY` | Yes | Cloudflare R2 API secret key | `[secret_access_key]` |
| `R2_BUCKET_NAME` | Yes | Cloudflare R2 storage bucket name | `precision-opticals` |
| `R2_PUBLIC_URL` | Yes | Public CDN URL for Cloudflare R2 bucket | `https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev` |

---

## 7. Package Scripts

- **`npm run dev`**: Starts Next.js development server with Turbopack (`next dev`).
- **`npm run build`**: Executes TypeScript type checks and generates optimized production build (`next build`).
- **`npm run start`**: Launches the compiled production server (`next start`).
- **`npm run lint`**: Executes ESLint against all source files (`next lint`).
