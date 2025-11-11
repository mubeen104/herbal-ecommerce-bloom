import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FilterSidebar } from '@/components/FilterSidebar';
import { MobileFilterSheet } from '@/components/MobileFilterSheet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Eye, X } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useGuestCart } from '@/hooks/useGuestCart';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { AddToCartModal } from '@/components/AddToCartModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [searchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'all'
  );
  const [sortBy, setSortBy] = useState<string>('newest');
  const [productType, setProductType] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [addToCartProduct, setAddToCartProduct] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productVariants, setProductVariants] = useState<Record<string, any[]>>({});

  const { data: products, isLoading: productsLoading } = useProducts();
  const { addToCart, isLoading: cartLoading } = useGuestCart();
  const { currency } = useStoreSettings();
  const navigate = useNavigate();

  const filteredProducts = products?.filter((product) => {
    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' ||
      product.product_categories?.some((pc: any) => pc.categories.slug === selectedCategory);
    const matchesType =
      productType === 'all' ||
      (productType === 'kits-deals' && product.is_kits_deals) ||
      (productType === 'single-items' && !product.is_kits_deals);
    const matchesPrice =
      product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesType && matchesPrice;
  });

  const sortedProducts = filteredProducts?.sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  useEffect(() => {
    const fetchVariants = async () => {
      if (!sortedProducts || sortedProducts.length === 0) return;

      const { data } = await supabase
        .from('product_variants')
        .select('*')
        .eq('is_active', true)
        .in('product_id', sortedProducts.map((p) => p.id));

      if (data) {
        const variantsByProduct = data.reduce((acc, variant) => {
          if (!acc[variant.product_id]) {
            acc[variant.product_id] = [];
          }
          acc[variant.product_id].push(variant);
          return acc;
        }, {} as Record<string, any[]>);
        setProductVariants(variantsByProduct);
      }
    };

    fetchVariants();
  }, [sortedProducts]);

  const handleAddToCart = async (productId: string, quantity: number, variantId?: string) => {
    await addToCart(productId, quantity, variantId);
  };

  const getMainImage = (product: any) => {
    if (product.product_images?.length > 0) {
      return product.product_images.sort((a: any, b: any) => a.sort_order - b.sort_order)[0]
        .image_url;
    }
    return '/logo.png';
  };

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (productType !== 'all' ? 1 : 0) +
    (priceRange[0] !== 0 || priceRange[1] !== 10000 ? 1 : 0);

  const clearFilters = () => {
    setSelectedCategory('all');
    setProductType('all');
    setPriceRange([0, 10000]);
  };

  return (
    <>
      <Helmet>
        <title>Shop Premium Natural Herbal Products & Organic Supplements | New Era Herbals</title>
        <meta
          name="description"
          content="Browse our collection of premium natural herbal products, organic supplements, ayurvedic herbs, and wellness solutions."
        />
        <link rel="canonical" content="https://www.neweraherbals.com/shop" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Shop Natural Products
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                Discover our premium collection of organic herbs, supplements, and wellness essentials
              </p>
            </div>
          </div>
        </section>

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-8">
              {/* Desktop Sidebar - Hidden on mobile */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <FilterSidebar
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  productType={productType}
                  setProductType={setProductType}
                  onClearFilters={clearFilters}
                  activeFilterCount={activeFilterCount}
                />
              </aside>

              {/* Main Content */}
              <div className="flex-1">
                {/* Top Bar with Sort and Mobile Filter */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="text-sm text-muted-foreground">
                    {sortedProducts && (
                      <span>
                        Showing {sortedProducts.length} of {products?.length || 0} products
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Mobile Filter Button */}
                    <div className="lg:hidden flex-1 sm:flex-initial">
                      <MobileFilterSheet
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        productType={productType}
                        setProductType={setProductType}
                        onClearFilters={clearFilters}
                        onApplyFilters={() => {}}
                        activeFilterCount={activeFilterCount}
                      />
                    </div>

                    {/* Sort Dropdown */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="name">Name A-Z</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active Filters */}
                {activeFilterCount > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">
                      Active Filters:
                    </span>
                    {selectedCategory !== 'all' && (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() => setSelectedCategory('all')}
                      >
                        Category: {selectedCategory} <X className="ml-1 h-3 w-3" />
                      </Badge>
                    )}
                    {productType !== 'all' && (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() => setProductType('all')}
                      >
                        Type: {productType} <X className="ml-1 h-3 w-3" />
                      </Badge>
                    )}
                    {(priceRange[0] !== 0 || priceRange[1] !== 10000) && (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() => setPriceRange([0, 10000])}
                      >
                        Price: PKR {priceRange[0]} - {priceRange[1]} <X className="ml-1 h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                )}

                {/* Products Grid */}
                {productsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="overflow-hidden">
                        <Skeleton className="w-full aspect-square" />
                        <CardContent className="p-4 space-y-3">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-6 w-24" />
                          <Skeleton className="h-10 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : sortedProducts?.length === 0 ? (
                  <Card className="p-12 text-center">
                    <h3 className="text-xl font-semibold mb-2">No products found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters to find what you're looking for
                    </p>
                    <Button onClick={clearFilters}>Clear Filters</Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    {sortedProducts?.map((product) => (
                      <Card
                        key={product.id}
                        className="group overflow-hidden hover:shadow-xl transition-all duration-300 border hover:border-primary/50"
                      >
                        <CardContent className="p-0">
                          <div className="relative aspect-square overflow-hidden">
                            <img
                              src={getMainImage(product)}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            {product.compare_price && product.compare_price > product.price && (
                              <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                                Sale
                              </Badge>
                            )}
                            {product.inventory_quantity === 0 && (
                              <div className="absolute inset-0 bg-background/90 flex items-center justify-center">
                                <Badge variant="secondary">Out of Stock</Badge>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => setSelectedProduct(product)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Quick View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>{product.name}</DialogTitle>
                                  </DialogHeader>
                                  {selectedProduct && (
                                    <div className="grid md:grid-cols-2 gap-6">
                                      <img
                                        src={getMainImage(selectedProduct)}
                                        alt={selectedProduct.name}
                                        className="w-full aspect-square object-cover rounded-lg"
                                      />
                                      <div className="space-y-4">
                                        <div className="text-2xl font-bold">
                                          {currency} {selectedProduct.price.toFixed(2)}
                                        </div>
                                        <p className="text-muted-foreground">
                                          {selectedProduct.description || selectedProduct.short_description}
                                        </p>
                                        <Button
                                          onClick={() => setAddToCartProduct(selectedProduct)}
                                          disabled={selectedProduct.inventory_quantity === 0}
                                          className="w-full"
                                        >
                                          <ShoppingCart className="h-4 w-4 mr-2" />
                                          Add to Cart
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>

                          <div className="p-3 sm:p-4 space-y-2">
                            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                              {product.name}
                            </h3>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold text-base">
                                  {currency} {product.price.toFixed(2)}
                                </div>
                                {product.compare_price && product.compare_price > product.price && (
                                  <div className="text-xs text-muted-foreground line-through">
                                    {currency} {product.compare_price.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setAddToCartProduct(product)}
                                disabled={product.inventory_quantity === 0}
                                className="flex-1"
                              >
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => navigate(`/product/${product.id}`)}
                                className="flex-1"
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />

        {addToCartProduct && (
          <AddToCartModal
            product={addToCartProduct}
            isOpen={!!addToCartProduct}
            onClose={() => setAddToCartProduct(null)}
            onAddToCart={handleAddToCart}
            isLoading={cartLoading}
          />
        )}
      </div>
    </>
  );
}
