# New Era Herbals E-commerce Platform

## Overview
New Era Herbals is an e-commerce platform for organic herbal products and natural wellness solutions. It provides a seamless shopping experience with product catalog, shopping cart, checkout, and an integrated blog. The platform includes an admin dashboard for store management, focusing on performance, scalability, and an intuitive user interface to establish a premium, health-focused brand. Key capabilities include robust product management, advanced search, content management, and sophisticated analytics.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
The frontend uses React 18 with TypeScript, Vite, React Router v6, and TanStack Query.
- **UI/UX:** Shadcn/ui for consistent UI, Tailwind CSS with a custom natural color palette, mobile-first responsive design adhering to WCAG 2.2, and modern design elements like glassmorphism. Accessibility is prioritized.
- **Key Features:** Product management with variants, shopping cart and multi-step checkout, real-time search with autocomplete, content management for blog and hero sliders, comprehensive admin dashboard, and performance optimizations (code splitting, image optimization).

### Backend
Supabase acts as the Backend-as-a-Service, providing a PostgreSQL database and Supabase Auth with Row-Level Security (RLS).
- **Data Models:** Includes `products`, `categories`, `product_variants`, `orders`, `cart_items`, `users`, `addresses`, `coupons`, `reviews`, `blog_posts`, `hero_slides`, and `catalog_feeds`.
- **Business Logic:** Implements product recommendations, coupon validation, inventory management, order processing, and product variant deduplication.

## External Dependencies

- **Analytics & Advertising:**
    - Google Tag Manager (GTM) for centralized tracking.
    - Meta Pixel for event tracking.
- **Third-Party Services:**
    - Supabase: Authentication (email/password, social logins), PostgreSQL, Edge Functions (`newsletter-signup`, `catalog-feed`), and storage.
- **UI Libraries:**
    - Radix UI primitives.
    - Embla Carousel for carousels.
    - React Hook Form with Zod for form validation.
    - Lucide React for icons.
    - date-fns for date utilities.
- **Integrations:**
    - WhatsApp Business for customer support.
    - Social media links (Facebook, Instagram, TikTok).
    - Newsletter subscription system.
    - Product recommendation tracking.
    - Catalog feed exports for advertising platforms.