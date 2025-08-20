import { Helmet } from 'react-helmet-async';
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import KitsDeals from "@/components/KitsDeals";
import Categories from "@/components/Categories";
import FeaturedBlogPosts from "@/components/blog/FeaturedBlogPosts";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>New Era Herbals - Premium Natural Wellness Products</title>
        <meta name="description" content="Discover premium organic herbal products, natural remedies, and wellness solutions. Shop certified organic supplements, herbal teas, and natural health products." />
        <meta name="keywords" content="herbal products, organic supplements, natural remedies, herbal teas, wellness products, organic health" />
        <link rel="canonical" href="/" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        <div className="space-y-16">
          <div className="animate-slide-down">
            <Hero />
          </div>
          <div className="animate-fade-in hover-lift" style={{ animationDelay: '0.2s' }}>
            <FeaturedProducts />
          </div>
          <div className="animate-slide-up hover-lift" style={{ animationDelay: '0.4s' }}>
            <KitsDeals />
          </div>
          <div className="animate-fade-in hover-lift" style={{ animationDelay: '0.6s' }}>
            <Categories />
          </div>
          <div className="animate-bounce-in hover-lift" style={{ animationDelay: '0.8s' }}>
            <FeaturedBlogPosts />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Index;
