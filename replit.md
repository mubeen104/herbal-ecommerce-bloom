# New Era Herbals E-commerce Platform

## Overview

New Era Herbals is an e-commerce platform for organic herbal products and natural wellness solutions. It offers a seamless shopping experience with a product catalog, shopping cart, checkout, and blog, alongside an efficient admin dashboard for comprehensive store management. The platform leverages modern web technologies for performance, scalability, and an intuitive user interface, aiming to provide a premium, health-focused brand identity.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend uses **React 18** with **TypeScript**, built with **Vite**. **React Router v6** manages navigation, and **TanStack Query** handles server state.

**UI/UX Decisions:**
- **Shadcn/ui** components provide a consistent and accessible UI.
- **Tailwind CSS** is used for styling with a custom natural/eco-friendly color palette (forest greens, sage, warm ivory, bronze/gold accents).
- A **mobile-first, responsive design** ensures WCAG 2.2 compliance, featuring adaptive padding, text scaling, and touch-friendly components.
- Modern design elements include glassmorphism effects, subtle shadows, and smooth animations.
- Accessibility features like keyboard navigation for search autocomplete are prioritized.

**Key Features & Technical Implementations:**
- **Product Management**: Catalog with variants, images, ratings, and a detailed product page.
- **Shopping Cart & Checkout**: Supports guest and authenticated users with multi-step checkout.
- **Search Functionality**: Real-time autocomplete with product images, names, and prices.
- **Content Management**: Blog and hero slider management.
- **Admin Dashboard**: Tools for product, order, user, and content management.
- **Performance Optimization**: Route-based code splitting, bundle optimization, optimized TanStack Query settings, and image loading optimization.
- **Header Design**: Features a glassmorphism effect, premium logo styling, improved navigation, and an enhanced search bar.

### Backend Architecture

**Supabase** acts as the Backend-as-a-Service, offering a **PostgreSQL** database and **Supabase Auth** for authentication and authorization with Row-Level Security (RLS).

**Data Models:**
Includes `products`, `categories`, `product_variants`, `orders`, `cart_items`, `users`, `addresses`, `coupons`, `reviews`, `blog_posts`, `hero_slides`, and `catalog_feeds`.

**Business Logic:**
- Product recommendation engine.
- Coupon validation with usage limits and expiration.
- Inventory management with stock tracking.
- Order processing workflows.
- Product variant deduplication.

## External Dependencies

**Analytics & Advertising:**
- **Google Tag Manager (GTM)**: For centralized tracking of page views, product views, add-to-cart, purchases, and searches (`VITE_GTM_ID`). Supports various platforms (Meta Pixel, Google Ads, TikTok).
- **Meta Pixel**: Directly integrated for event tracking (`VITE_META_PIXEL_ID`).

**Third-Party Services:**
- **Supabase**: Provides authentication (email/password, social logins), PostgreSQL database, Edge Functions (`newsletter-signup`, `catalog-feed` generation), and storage.

**UI Libraries:**
- **Radix UI primitives**: Foundation for UI components.
- **Embla Carousel**: For image galleries and carousels.
- **React Hook Form with Zod**: For form validation.
- **Lucide React**: For icons.
- **date-fns**: For date formatting.

**Integrations:**
- WhatsApp Business for customer support.
- Social media links (Facebook, Instagram, TikTok).
- Newsletter subscription system.
- Product recommendation tracking.
- Catalog feed exports for advertising platforms.