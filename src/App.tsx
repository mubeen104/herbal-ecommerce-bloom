import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import { Analytics } from "@/components/Analytics";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { queryClient } from "@/lib/reactQueryClient";
import { Skeleton } from "@/components/ui/skeleton";

// Eager load: pages used on initial load
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load: less critical pages
const Contact = lazy(() => import("./pages/Contact"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Profile = lazy(() => import("./pages/Profile"));
const Orders = lazy(() => import("./pages/Orders"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Category = lazy(() => import("./pages/Category"));

// Lazy load: admin pages (heavy)
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminPOS = lazy(() => import("./pages/admin/AdminPOS"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const AdminHeroSlides = lazy(() => import("./pages/admin/AdminHeroSlides"));
const AdminPixels = lazy(() => import("./pages/admin/AdminPixels"));
const AdminCatalogFeeds = lazy(() => import("./pages/admin/AdminCatalogFeeds"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminBlogs = lazy(() => import("./pages/admin/AdminBlogs"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-background p-4">
    <Skeleton className="h-12 w-full mb-4" />
    <Skeleton className="h-96 w-full mb-4" />
    <Skeleton className="h-12 w-full" />
  </div>
);


const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Analytics />
            <WhatsAppButton />
            <MobileBottomNav />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/category/:slug" element={<Suspense fallback={<PageLoader />}><Category /></Suspense>} />
            <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
            <Route path="/about" element={<Suspense fallback={<PageLoader />}><AboutUs /></Suspense>} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:orderId" element={<Suspense fallback={<PageLoader />}><OrderConfirmation /></Suspense>} />
            <Route path="/profile" element={<Suspense fallback={<PageLoader />}><Profile /></Suspense>} />
            <Route path="/orders" element={<Suspense fallback={<PageLoader />}><Orders /></Suspense>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPassword /></Suspense>} />
            <Route path="/privacy-policy" element={<Suspense fallback={<PageLoader />}><PrivacyPolicy /></Suspense>} />
            <Route path="/terms-of-service" element={<Suspense fallback={<PageLoader />}><TermsOfService /></Suspense>} />
            <Route path="/cookie-policy" element={<Suspense fallback={<PageLoader />}><CookiePolicy /></Suspense>} />
            <Route path="/blog" element={<Suspense fallback={<PageLoader />}><Blog /></Suspense>} />
            <Route path="/blog/:slug" element={<Suspense fallback={<PageLoader />}><BlogPost /></Suspense>} />
            <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminLayout><AdminDashboard /></AdminLayout></Suspense>} />
            <Route path="/admin/pos" element={<Suspense fallback={<PageLoader />}><AdminLayout><AdminPOS /></AdminLayout></Suspense>} />
            <Route path="/admin/products" element={<Suspense fallback={<PageLoader />}><AdminLayout><AdminProducts /></AdminLayout></Suspense>} />
            <Route path="/admin/categories" element={<Suspense fallback={<PageLoader />}><AdminLayout><AdminCategories /></AdminLayout></Suspense>} />
            <Route path="/admin/orders" element={<Suspense fallback={<PageLoader />}><AdminLayout><AdminOrders /></AdminLayout></Suspense>} />
            <Route path="/admin/users" element={<Suspense fallback={<PageLoader />}><AdminLayout><AdminUsers /></AdminLayout></Suspense>} />
            <Route path="/admin/analytics" element={<Suspense fallback={<PageLoader />}><AdminLayout><AdminAnalytics /></AdminLayout></Suspense>} />
            <Route path="/admin/reviews" element={<Suspense fallback={<PageLoader />}><AdminLayout><AdminReviews /></AdminLayout></Suspense>} />
            <Route path="/admin/testimonials" element={<Suspense fallback={<PageLoader />}><AdminLayout><AdminTestimonials /></AdminLayout></Suspense>} />
            <Route path="/admin/coupons" element={<Suspense fallback={<PageLoader />}><AdminLayout><AdminCoupons /></AdminLayout></Suspense>} />
            <Route path="/admin/hero-slides" element={<Suspense fallback={<PageLoader />}><AdminLayout><AdminHeroSlides /></AdminLayout></Suspense>} />
            <Route path="/admin/pixels" element={<Suspense fallback={<PageLoader />}><AdminLayout><AdminPixels /></AdminLayout></Suspense>} />
            <Route path="/admin/catalog-feeds" element={<Suspense fallback={<PageLoader />}><AdminLayout><AdminCatalogFeeds /></AdminLayout></Suspense>} />
            <Route path="/admin/blog" element={<Suspense fallback={<PageLoader />}><AdminLayout><AdminBlogs /></AdminLayout></Suspense>} />
            <Route path="/admin/settings" element={<Suspense fallback={<PageLoader />}><AdminLayout><AdminSettings /></AdminLayout></Suspense>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
