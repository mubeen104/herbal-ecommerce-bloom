import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { ProductVariantSelector } from '@/components/ProductVariantSelector';
import { useProductVariants, ProductVariant } from '@/hooks/useProductVariants';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useToast } from '@/hooks/use-toast';
import { trackAddToCart } from './PixelTracker';

interface Product {
  id: string;
  name: string;
  price: number;
  compare_price?: number;
  inventory_quantity: number;
  product_images?: Array<{
    id: string;
    image_url: string;
    alt_text: string;
    sort_order: number;
  }>;
}

interface AddToCartModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  isLoading?: boolean;
}

export const AddToCartModal: React.FC<AddToCartModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  isLoading = false
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const { data: variants } = useProductVariants(product.id);
  const { currency } = useStoreSettings();
  const { toast } = useToast();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedVariant(null);
    }
  }, [isOpen]);

  const getCurrentPrice = () => selectedVariant?.price || product.price;
  const getCurrentComparePrice = () => selectedVariant?.compare_price || product.compare_price;
  const getCurrentInventory = () => selectedVariant?.inventory_quantity || product.inventory_quantity;

  const getMainImage = () => {
    if (selectedVariant?.product_variant_images && selectedVariant.product_variant_images.length > 0) {
      return selectedVariant.product_variant_images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))[0]?.image_url;
    }
    
    if (product.product_images && product.product_images.length > 0) {
      return product.product_images.sort((a, b) => a.sort_order - b.sort_order)[0].image_url;
    }
    
    return '/placeholder.svg';
  };

  const handleAddToCart = async () => {
    try {
      await onAddToCart(product.id, quantity, selectedVariant?.id);
      
      // Track add to cart event
      trackAddToCart({
        product_id: product.id,
        product_name: product.name,
        value: getCurrentPrice() * quantity,
        currency: currency
      });
      
      const displayName = selectedVariant ? 
        `${product.name} - ${selectedVariant.name}` : 
        product.name;
      toast({
        title: "Added to cart",
        description: `${quantity} x ${displayName} added to your cart.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const maxQuantity = getCurrentInventory();
  const isOutOfStock = maxQuantity <= 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-md rounded-3xl p-0 overflow-hidden mx-2 border-0 shadow-2xl bg-background/95 backdrop-blur-xl">
        {/* Modern Gradient Header */}
        <div className="relative bg-gradient-to-br from-primary/10 via-primary-glow/5 to-accent/10 p-6 pb-4">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23059669%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
          
          <DialogHeader className="relative">
            <div className="flex items-center justify-center mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <DialogTitle className="text-xl font-bold text-center bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Add to Cart
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="p-6 pt-2 space-y-6">
          {/* Modern Product Display */}
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border/30">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-background shadow-inner">
              <img
                src={getMainImage()}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground leading-tight mb-1 truncate">
                {product.name}
              </h3>
              {selectedVariant && (
                <p className="text-sm text-muted-foreground mb-2 truncate">
                  {selectedVariant.name}
                </p>
              )}
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  {currency} {getCurrentPrice().toFixed(2)}
                </span>
                {getCurrentComparePrice() && getCurrentComparePrice() > getCurrentPrice() && (
                  <span className="text-sm text-muted-foreground line-through">
                    {currency} {getCurrentComparePrice().toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Stock Status */}
          <div className="flex justify-center">
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              isOutOfStock 
                ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
            }`}>
              {isOutOfStock ? "❌ Out of Stock" : `✅ ${maxQuantity} Available`}
            </div>
          </div>

          {/* Modern Variant Selector */}
          {variants && variants.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Select Variant
              </label>
              <div className="bg-muted/20 rounded-2xl p-3 border border-border/30">
                <ProductVariantSelector
                  variants={variants}
                  selectedVariant={selectedVariant}
                  onVariantChange={setSelectedVariant}
                />
              </div>
            </div>
          )}

          {/* Sleek Quantity Selector */}
          {!isOutOfStock && (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Quantity
              </label>
              <div className="flex items-center justify-center">
                <div className="flex items-center bg-muted/30 rounded-2xl border border-border/30 overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="h-12 w-12 rounded-none hover:bg-primary/10 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="px-6 py-3 bg-background/50 text-foreground font-bold text-lg min-w-[60px] text-center">
                    {quantity}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    disabled={quantity >= maxQuantity}
                    className="h-12 w-12 rounded-none hover:bg-primary/10 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-center text-xs text-muted-foreground">
                Maximum {maxQuantity} items
              </div>
            </div>
          )}

          {/* Modern Action Button */}
          <div className="pt-2 space-y-3">
            <Button
              onClick={handleAddToCart}
              disabled={isLoading || isOutOfStock || (variants && variants.length > 0 && !selectedVariant)}
              className="w-full h-14 rounded-2xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transform hover:scale-[1.02] disabled:transform-none disabled:hover:scale-100"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5" />
                  {isOutOfStock 
                    ? "Out of Stock" 
                    : variants && variants.length > 0 && !selectedVariant
                    ? "Select a Variant"
                    : `Add ${quantity} to Cart • ${currency} ${(getCurrentPrice() * quantity).toFixed(2)}`
                  }
                </div>
              )}
            </Button>
            
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full h-12 rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};