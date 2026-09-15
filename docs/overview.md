# Precision Optics — Project Overview

> **Estd. 1969** — Authorized Luxury Eyewear Atelier & Clinical Optometry Institution.

---

## 1. Executive Summary

**Precision Optics** is a full-stack, enterprise-grade optical e-commerce and clinical atelier platform. It provides a luxury shopping experience for high-end designer eyewear (Cartier, Maybach, GAST, Lindberg Titanium, Tom Ford, Ray-Ban Meta, etc.) combined with precision ophthalmic customization (Zeiss progressive lenses, BlueProtect coatings, high-index surfacing).

The platform seamlessly bridges physical boutique operations with high-fidelity digital commerce, featuring:
- **Luxury Customer Storefront**: Product listing with facet filters, PDP with dynamic lens configurator, real-time WebAssembly + WebGL 3D Virtual Try-On, wishlist, appointment scheduler, and multi-step checkout.
- **Enterprise Admin Operating System**: High-density executive command center, catalog & variant management with Cloudflare R2 image upload, optical lab assembly queue stepper, printable GST tax invoices, patron lifetime value (LTV) records with prescription archives, SKU-level stock control, and modular payment/shipping configurations.

---

## 2. Core Business Domains & Capabilities

### 2.1. Luxury Product Catalog & Collections
- **Eyewear Categorization**: Prescription Eyeglasses, Luxury Sunglasses, Screen Glasses, Smart Audio Glasses, and Clip-On Sets.
- **Atelier Specifications**: Accurate optical dimensions (Lens Width, Bridge Width, Temple Length, Frame Width, Weight), rim styles (Rimless, Half-Rim, Full-Rim), shapes (Aviator, Cat-Eye, Geometric, Rectangle, Round, Square, Wayfarer), and materials (Japanese Beta-Titanium, Italian Mazzucchelli Acetate, Gold-Plated, Horn).
- **Multi-Variant Structure**: SKU-level colorways with individual inventory counts, hex finish indicators, and Cloudflare R2 multi-angle imagery.

### 2.2. Clinical Lens Customizer & Prescription Engine
- **Prescription Workflow**: Right Eye (OD) and Left Eye (OS) Sphere (SPH), Cylinder (CYL), Axis, and Near Addition (ADD), along with single/dual Pupillary Distance (PD) in millimeters.
- **Lens Packages**:
  - *Single Vision*: Standard (1.50 Index), Thin (1.60 Index), Ultra-Thin (1.67 Index), Hyper-Thin (1.74 High Index).
  - *Progressive / Multifocal*: Zeiss SmartLife Individual 3, Digital Freeform Corridor.
  - *Blue Light & Computer Protection*: Zeiss DuraVision BlueProtect, Zero-Power Computer Lenses.
  - *Sun & Photochromic*: Zeiss Transitions Signature Gen 8, Polarized Tinting.

### 2.3. WebAssembly & 3D Virtual Try-On (VTO)
- **Computer Vision Pipeline**: Google MediaPipe Face Landmarker (478 3D facial landmarks) running client-side at 60 FPS.
- **3D Rendering Engine**: Three.js WebGL canvas overlay with real-time pose estimation (PnP), Kalman filtering for jitter reduction, dynamic lighting matching, and per-frame scale/offset calibration.

### 2.4. Optical Laboratory & Order Fulfillment
- **5-Stage Lab Stepper**: `Confirmed` &rarr; `In Lab Assembly` &rarr; `Quality Check` &rarr; `Dispatched` &rarr; `Delivered`.
- **Logistics Integration**: Courier partner routing (BlueDart Express, Delhivery Air, DHL International) and AWB tracking numbers.
- **Printable Tax Invoices**: Automated `@media print` layout generating GST-compliant tax invoices with HSN codes (9003 for frames, 9001 for ophthalmic lenses), CGST/SGST tax breakdown, and optical Rx verification seal.

### 2.5. Patron & Clientele Management
- **Customer Profiles**: Aggregated lifetime spend (LTV), total order history, average order value, and VIP tiers (`VIP Platinum`, `Gold Patron`, `Verified Client`).
- **Rx Archive**: Centralized patient prescription history accessible to boutique opticians.
- **Staff Concierge Notes**: Private atelier notes for custom frame adjustments and patron preferences.

### 2.6. Clinical Consultation & Boutique Booking
- In-store optical consultations and eye exams with date/time scheduling across retail boutique locations.

---

## 3. Key Personas & User Journeys

| Persona | Primary Interface | Key Actions |
|---|---|---|
| **Luxury Patron** | Customer Storefront (`/`, `/shop`, `/product/[slug]`, `/cart`) | Browse curated eyewear, filter by shape/material, try frames in 3D, input optical Rx, choose Zeiss lens packages, place insured orders, track dispatch. |
| **Boutique Optician** | Admin Orders & Lab Queue (`/admin/orders`, `/admin/orders/[id]`) | Inspect OD/OS prescription values, verify lens surfacing parameters, advance lab assembly steps, print lab packing slips and invoices. |
| **Catalog Manager** | Admin Catalog & Inventory (`/admin/products`, `/admin/inventory`, `/admin/categories`, `/admin/brands`) | Add new frame models, upload high-res imagery to Cloudflare R2, manage color variants, monitor low-stock SKUs, adjust real-time inventory. |
| **Store Administrator** | Admin Dashboard, Settings & Marketing (`/admin`, `/admin/settings`, `/admin/payments`, `/admin/discounts`) | Monitor executive revenue KPIs, configure payment gateways (Stripe, Razorpay, COD), set shipping thresholds, configure promo codes, manage staff roles. |

---

## 4. Key Performance & Quality Standards

1. **Zero Emojis Policy**: Mandatory use of `lucide-react` SVGs across the entire codebase to maintain luxury visual elegance.
2. **Controlled Viewport Geometry**: Max container width of `1440px` (storefront) and `1400px` (admin) to prevent layout distortion on ultra-wide 2K/4K displays.
3. **Sub-second Client Navigation**: Full utilization of Next.js App Router client-side routing (`next/link`) with optimistic state updates.
4. **Resilient Data Architecture**: Server-side PostgreSQL connection pooling via direct SQL (`lib/adminDb.ts`) alongside Supabase RLS security.
