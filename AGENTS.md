# Precision Optics - Agent & Developer Rules

This document outlines mandatory guidelines and architectural standards for all AI agents and developers working on the **Precision Optics** codebase.

---

## 1. Design Constraints & Container Widths (Do Not Over-Stretch)
- **Constrained Layouts**: Never allow sections, banners, or card grids to stretch uncontrollably or span edge-to-edge without boundary on wide displays (e.g., 2K, 4K).
- **Standard Container Widths**:
  - Main Catalog / PLP: Constrain to `max-w-[1440px]` or `max-w-[1480px]` with `mx-auto px-4 sm:px-6 lg:px-8`.
  - Content Sections & Footer: Constrain to `max-w-[1280px]` or `max-w-7xl` with `mx-auto`.
- **Aspect Ratios & Proportions**: Keep image cards, hero visuals, and banners in their intended aspect ratios. Do not distort or blow up elements disproportionately to fill empty space.
- **Breathing Room**: Preserve the balanced, luxury whitespace specified in the Figma mockups.

---

## 2. Strict Prohibition of Unicode Emojis (Icons Only)
- **Zero Emojis Policy**: **NEVER** use unicode emojis anywhere in UI text, headings, badges, buttons, tooltips, or placeholders (e.g., strictly no ❤️, ⚡, 🏷️, ★, ✔, 👓, 🔥, 🚀).
- **Approved Icon Library**: Always use **Lucide Icons** (`lucide-react`) or inline SVGs.
  - Wishlist / Favorites: `<Heart className="..." />`
  - Sale / Offers: `<Zap className="..." />` or `<Tag className="..." />`
  - Rating Stars: `<Star className="fill-amber-400 text-amber-400 ..." />`
  - Search: `<Search className="..." />`
  - Filters: `<SlidersHorizontal className="..." />` or `<ChevronDown className="..." />`
  - Close / Clear: `<X className="..." />`
  - Reset: `<RotateCcw className="..." />`

---

## 3. Fully Responsive Design Standards
- **Mobile First / Fluid Breakpoints**:
  - Mobile (`< 640px`): Single column cards, collapsible filters in full-height slide-over drawer, sticky mobile navigation.
  - Tablet (`640px - 1024px`): 2-column or 3-column grids, optimized touch targets (`min-h-[44px]`).
  - Desktop (`> 1024px`): 4-column product grid with fixed/sticky left filter sidebar.
- **Touch-Friendly Controls**: Ensure buttons, pill chips, and checkboxes have comfortable hit areas and smooth tap feedback.
- **Typography Scaling**: Headings and product titles must scale gracefully between mobile and desktop without awkward wrapping or layout shifting.

---

## 4. Figma Design Fidelity & Visual Hierarchy
- **Palette Consistency**:
  - Cream Background: `#FAF7F2`
  - Header Background: `#FAF3EB`
  - Luxury Espresso / Dark Text: `#2A1E17`
  - Brand Orange / Accent: `#C86A28` / `#EA580C`
  - Selection / Active Checkbox Blue: `#007AFF`
  - Light Gray Borders: `#EBE6DF` / `#E8DCCF`
  - Footer Dark Chocolate: `#2A1E17`
- **Component Consistency**: Always align with existing design tokens and extracted Figma visual assets.

---

## 5. Performance & Zero-Latency Standards
- **Optimized Rendering**: Product lists, cards, and filter calculations must use `useMemo`, `useCallback`, and `React.memo` where appropriate to prevent unnecessary re-renders.
- **Smooth Animations**: Transitions should be 60 FPS CSS transforms (`hover:scale-105`, `transition-all duration-300`).
- **Database & Offline Fallbacks**: Components should load instantly with zero layout shifts, utilizing optimistic local state and graceful fallbacks when querying external services.
