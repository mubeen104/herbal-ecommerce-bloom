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
      <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden">
        <div className="relative">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-semibold text-center">Quick Add</DialogTitle>
          </DialogHeader>
          
          <div className="p-6 space-y-6">
            {/* Product Image & Basic Info */}
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={getMainImage()}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-lg leading-tight mb-1 truncate">
                  {product.name}
                </h3>
                {selectedVariant && (
                  <p className="text-sm text-muted-foreground mb-2 truncate">
                    {selectedVariant.name}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-primary">
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

            {/* Stock Status */}
            <div className="flex justify-center">
              <Badge variant={isOutOfStock ? "destructive" : "default"} className="text-xs">
                {isOutOfStock ? "Out of Stock" : `${maxQuantity} in stock`}
              </Badge>
            </div>
            {/* Variant Selector */}
            {variants && variants.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Select Variant:
                </label>
                <ProductVariantSelector
                  variants={variants}
                  selectedVariant={selectedVariant}
                  onVariantChange={setSelectedVariant}
                />
              </div>
            )}

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Quantity:
                </label>
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center border border-border rounded-lg bg-background">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="h-9 w-9 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 text-foreground font-medium min-w-[50px] text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                      disabled={quantity >= maxQuantity}
                      className="h-9 w-9 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-xs text-muted-foreground">
                    {maxQuantity} available
                  </span>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="pt-2">
              <Button
                onClick={handleAddToCart}
                disabled={isLoading || isOutOfStock || (variants && variants.length > 0 && !selectedVariant)}
                className="w-full rounded-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isOutOfStock 
                  ? "Out of Stock" 
                  : variants && variants.length > 0 && !selectedVariant
                  ? "Select a Variant"
                  : `Add ${quantity} to Cart`
                }
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};