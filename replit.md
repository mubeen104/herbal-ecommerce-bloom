# New Era Herbals E-commerce Platform

## Overview

New Era Herbals is an e-commerce platform designed for selling organic herbal products and natural wellness solutions. It features a product catalog, shopping cart, checkout, blog, and an admin dashboard for comprehensive store management. The platform aims to provide a seamless shopping experience for customers and efficient management tools for administrators, leveraging modern web technologies to ensure performance, scalability, and an intuitive user interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with **React 18** and **TypeScript**, using **Vite** for development and optimized builds. **React Router v6** handles client-side navigation, and **TanStack Query** manages server state, caching, and data synchronization.

**UI/UX Decisions:**
- **Shadcn/ui** components, based on Radix UI primitives, are used for a consistent and accessible UI.
- **Tailwind CSS** provides utility-first styling with a custom natural/eco-friendly color palette (forest greens, sage).
- The design employs a **mobile-first, responsive approach** with adaptive padding, text scaling, and touch-friendly components, ensuring WCAG 2.2 compliance.
- Modern design elements like glassmorphism effects, subtle shadows, and smooth animations are used throughout, including the header, product cards, and product detail pages.
- Accessibility is a priority, with features like keyboard navigation for search autocomplete and progressive enhancement for components like carousels.

**Key Features & Technical Implementations:**
- **Product Management**: Catalog with variants, images, ratings, and a modern product detail page design featuring enhanced typography, dedicated information sections, and clear call-to-action buttons.
- **Shopping Cart & Checkout**: Supports both guest and authenticated users with a multi-step checkout and address management.
- **Search Functionality**: Modern product search with real-time autocomplete, displaying product images, names, and prices, and supporting keyboard navigation.
- **Content Management**: Blog system with rich text, and hero slider management.
- **Admin Dashboard**: Comprehensive tools for product, order, user, and content management.
- **Performance Optimization**: Route-based code splitting (lazy loading for 40+ pages), bundle optimization (manual chunking), optimized TanStack Query settings, and image loading optimization (responsive `srcSet`, preloading, blur placeholders).
- **Header Design**: Features a modern glassmorphism effect, premium logo styling, improved navigation with visual feedback, and an enhanced search bar.

### Backend Architecture

**Supabase** serves as the Backend-as-a-Service, providing a **PostgreSQL** database and **Supabase Auth** for user authentication and authorization. Row-Level Security (RLS) is implemented for data access control.

**Data Models:**
Core data models include `products`, `categories`, `product_variants`, `orders`, `cart_items`, `users`, `addresses`, `coupons`, `reviews`, `blog_posts`, `hero_slides`, and `catalog_feeds`.

**Business Logic:**
- A product recommendation engine utilizes scoring algorithms.
- Coupon validation includes usage limits, expiration, and minimum purchase requirements.
- Inventory management with stock tracking.
- Order processing with status workflows.
- Product variant deduplication with database constraints.

## External Dependencies

**Analytics & Advertising:**
- **Google Tag Manager (GTM)**: Centralized tag management for all tracking, including page views, product views, add-to-cart, purchases, and searches. Configured via `VITE_GTM_ID`. Supports various advertising platforms like Meta Pixel, Google Ads, TikTok, etc.

**Third-Party Services:**
- **Supabase**: Provides authentication (email/password, social logins), PostgreSQL database with real-time capabilities, Edge Functions, and storage for media files.
  - **Supabase Edge Functions**: Used for `newsletter-signup` and `catalog-feed` generation.

**UI Libraries:**
- **Radix UI primitives**: Foundation for UI components.
- **Embla Carousel**: For image galleries and product carousels.
- **React Hook Form with Zod**: For robust form validation.
- **Lucide React**: For icons.
- **date-fns**: For date formatting.

**Integrations:**
- WhatsApp Business integration for customer support.
- Social media links (Facebook, Instagram, TikTok).
- Newsletter subscription system.
- Product recommendation tracking.
- Catalog feed exports for advertising platforms (Google Shopping, Meta, etc.).

**Environment Variables:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GTM_ID` - Google Tag Manager ID for centralized event tracking
- `VITE_META_PIXEL_ID` - Meta Pixel ID for direct pixel tracking (15-16 digit number)

## Recent Updates (November 24, 2025)

### Fixed Meta Pixel Event Tracking - Unified GTM + Direct Implementation ✅
Resolved issues with Meta Pixel events triggering loosely by implementing a unified, reliable tracking system that fires events through BOTH GTM and direct Meta Pixel.

**Root Causes Fixed:**
- ❌ **Problem**: Meta Pixel script was never being loaded - only GTM was initialized
- ❌ **Problem**: Broken `useShopTracking` hook attempted to use `fbq()` without initialization
- ❌ **Problem**: Competing implementations (GTM vs direct fbq) with no fallback mechanism
- ❌ **Problem**: No direct Meta Pixel initialization, events silently failed

**Solution Implemented:**
- ✅ **New**: Added proper Meta Pixel script initialization in Analytics.tsx
- ✅ **New**: Dual-fire event system - all events fire to both GTM AND Meta Pixel directly
- ✅ **New**: Meta Pixel event mapping using standard Meta event names (ViewContent, AddToCart, Purchase, etc.)
- ✅ **New**: Proper error handling and console logging for debugging
- ✅ **New**: Environment variable `VITE_META_PIXEL_ID` for pixel configuration
- ✅ **Removed**: Broken `useShopTracking` hook that caused loose event triggering
- ✅ **Updated**: Analytics utility functions to fire events reliably through both platforms

**Technical Changes:**
1. **Analytics.tsx** - Enhanced to load both GTM and Meta Pixel scripts on app mount
2. **analytics.ts** - Added `initializeMetaPixel()` function with proper fbq queue initialization
3. **analytics.ts** - Added `fireMetaPixelEvent()` helper function with error handling
4. **analytics.ts** - Updated all tracking functions: `trackPageView`, `trackViewContent`, `trackAddToCart`, `trackBeginCheckout`, `trackPurchase`, `trackSearch`, `trackCustomEvent` to fire to both platforms
5. **Shop.tsx** - Removed broken `useShopTracking` import and call
6. **AdminPixels.tsx** - Added setup instructions for `VITE_META_PIXEL_ID` environment variable

**Events Now Firing Reliably:**
- ✅ **PageView** - Page navigation events
- ✅ **ViewContent** - Product page views
- ✅ **AddToCart** - Add to cart actions
- ✅ **InitiateCheckout** - Checkout start
- ✅ **Purchase** - Order completion (conversion event)
- ✅ **Search** - Product searches

**Setup Instructions:**
Users now need to configure TWO environment variables for complete event tracking:
```
VITE_GTM_ID=GTM-XXXXXXX          # For GTM-managed pixels
VITE_META_PIXEL_ID=123456789012  # For direct Meta Pixel (15-16 digits)
```

**Verification:**
- Console logs now show: "Meta Pixel script loaded successfully" when properly configured
- Events appear in Meta Business Suite Events Manager within 30 seconds of firing
- GTM debugger shows all events in dataLayer
- Comprehensive error handling prevents silent failures

## Previous Updates (November 22, 2025)

### Premium Herbal & Health-Focused Brand Identity ✨
Transformed the design from generic/template-like to a distinctive **herbal wellness premium aesthetic** with a sophisticated botanical color palette and enhanced brand presence.

**Color Palette Transformation:**
- **Primary Color**: Deep forest green (150° 42% 28%) - Premium, natural, health-focused
- **Background**: Warm ivory (45° 15% 98%) - Natural, organic feel instead of stark white
- **Accent Color**: Bronze/gold (30° 65% 45%) - Premium wellness positioning, warm luxury
- **Additional Botanicals**: Olive green, moss green for subtle accents
- **Dark Mode**: Deep forest background with warm ivory text and bronze accents - maintains herbal aesthetic
- **Sidebar**: Botanical-themed colors matching the main palette

**Premium Header Enhancement:**
- Added subtle bronze/gold accent border at bottom for premium feel
- Enhanced logo area with gradient background incorporating accent colors
- Improved glassmorphism effect with botanical color gradients
- Premium shadow and backdrop blur effects
- Border-accent/20 styling for sophisticated separation

**Product Card Button Redesign - All Carousels:**
- **FeaturedProducts.tsx** ✅ - "Add to Cart" buttons: Bronze/gold gradient (from-accent via-accent to-accent-bronze)
- **BestSellingProducts.tsx** ✅ - "Add to Cart" buttons: Bronze/gold gradient + Fixed crash (added missing `isLoading` prop)
- **NewArrivals.tsx** ✅ - "Add to Cart" buttons: Bronze/gold gradient
- **KitsDeals.tsx** ✅ - "Add to Cart" buttons: Bronze/gold gradient
- Enhanced hover effects with `hover:opacity-95` and `shadow-md` for premium interaction feedback

**Bug Fix:**
- Fixed "Add to Cart" crash in BestSellingProducts component by:
  - Adding missing `isLoading={cartLoading}` prop to AddToCartModal
  - Implementing proper conditional rendering pattern: `{addToCartProduct && (...)}`
  - Ensures modal only renders when product is selected

**Design Consistency:**
- Unified botanical color palette across all components
- Premium gold/bronze accents create luxury wellness positioning
- Deep forest greens evoke natural, health-conscious brand
- Warm ivory backgrounds feel organic and approachable
- All interactive elements use premium gradient styling
- Dark mode maintains herbal aesthetic throughout