# New Era Herbals E-commerce Platform

## Overview
New Era Herbals is an e-commerce platform dedicated to organic herbal products and natural wellness solutions. It provides a seamless shopping experience with a comprehensive product catalog, shopping cart, checkout process, and an integrated blog. The platform also features an efficient admin dashboard for complete store management. Built with modern web technologies, it emphasizes performance, scalability, and an intuitive user interface, aiming to establish a premium, health-focused brand identity. Key capabilities include robust product management, advanced search, content management, and sophisticated analytics tracking.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
The frontend is developed using React 18 with TypeScript, powered by Vite. React Router v6 manages navigation, and TanStack Query handles server-side state.

**UI/UX Decisions:**
- **Shadcn/ui** components ensure a consistent and accessible user interface.
- **Tailwind CSS** is used for styling, featuring a custom natural/eco-friendly color palette (forest greens, sage, warm ivory, bronze/gold accents).
- A **mobile-first, responsive design** adheres to WCAG 2.2 compliance, incorporating adaptive padding, text scaling, and touch-friendly components.
- Modern design elements include glassmorphism effects, subtle shadows, and smooth animations.
- Accessibility is prioritized with features like keyboard navigation for search autocomplete.

**Key Features & Technical Implementations:**
- **Product Management**: Detailed catalog with variants, images, and ratings.
- **Shopping Cart & Checkout**: Supports guest and authenticated users through a multi-step checkout process.
- **Search Functionality**: Real-time autocomplete with product images, names, and prices.
- **Content Management**: Tools for managing blog posts and hero sliders.
- **Admin Dashboard**: Comprehensive tools for managing products, orders, users, and content.
- **Performance Optimization**: Includes route-based code splitting, bundle optimization, optimized TanStack Query settings, and image loading optimization.
- **Header Design**: Features a glassmorphism effect, premium logo styling, enhanced navigation, and an improved search bar.

### Backend
Supabase serves as the Backend-as-a-Service, providing a PostgreSQL database and Supabase Auth for authentication and authorization with Row-Level Security (RLS).

**Data Models:**
Core data models include `products`, `categories`, `product_variants`, `orders`, `cart_items`, `users`, `addresses`, `coupons`, `reviews`, `blog_posts`, `hero_slides`, and `catalog_feeds`.

**Business Logic:**
- Product recommendation engine.
- Coupon validation with usage limits and expiration.
- Inventory management with stock tracking.
- Order processing workflows.
- Product variant deduplication.

## External Dependencies

**Analytics & Advertising:**
- **Google Tag Manager (GTM)**: Used for centralized tracking of various user interactions (page views, product views, add-to-cart, purchases, searches).
- **Meta Pixel**: Integrated for specific event tracking.

**Third-Party Services:**
- **Supabase**: Provides authentication (email/password, social logins), PostgreSQL database, Edge Functions (e.g., `newsletter-signup`, `catalog-feed` generation), and storage solutions.

**UI Libraries:**
- **Radix UI primitives**: Forms the foundation for UI components.
- **Embla Carousel**: Used for image galleries and carousels.
- **React Hook Form with Zod**: Utilized for form validation.
- **Lucide React**: Provides icons.
- **date-fns**: For date formatting utilities.

**Integrations:**
- WhatsApp Business for customer support.
- Social media links (Facebook, Instagram, TikTok).
- Newsletter subscription system.
- Product recommendation tracking.
- Catalog feed exports for advertising platforms.

## Recent Changes & Critical Bug Fixes (Nov 24, 2025)

### 🔴 CRITICAL: BeginCheckout Re-Tracking on Coupon Applied - FIXED ✅
**Problem:** BeginCheckout event fired ONLY on checkout page load with FULL price. When user applied coupon, the UI updated to discounted price, but the pixel NEVER re-tracked with the new value.

**Root Cause:** 
- useEffect had empty dependency array `[]` → only ran once on mount
- At mount time, `appliedCoupon` was `null` → discount calculated as 0
- When coupon was applied later, effect never re-ran → pixel stuck with old full price

**Impact (Before Fix):**
- Google Ads optimized bids for WRONG conversion value (full price instead of discounted)
- Meta Pixel learned from incorrect purchase data
- ROAS calculations completely wrong
- Lost visibility into actual discounted conversion values

**Solution:**
1. Moved `appliedCoupon` useState declaration before useEffect (was after)
2. Added `appliedCoupon` to dependency array
3. Effect now re-runs when coupon applied, re-tracking with correct discounted price

**Result:**
- BeginCheckout fires TWICE: once on load (full price) and again on coupon applied (discounted price)
- Pixel sees BOTH events with correct values for accurate conversion optimization
- Google Ads and Meta Pixel now learn from real, discounted prices
- Console logging: `📊 [Tracking] BeginCheckout - Total: X, Items: Y, Coupon Applied: CODE`

**Files Modified:** 
- `src/pages/Checkout.tsx` (lines 136-182 useEffect, line 137 appliedCoupon state moved)