import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ProductVariant } from '@/hooks/useProductVariants';

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  onVariantChange: (variant: ProductVariant) => void;
  selectedVariant?: ProductVariant;
}

export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  variants,
  onVariantChange,
  selectedVariant
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Get all unique option keys (e.g., 'size', 'color')
  const optionKeys = Array.from(
    new Set(
      variants.flatMap(variant => 
        Object.keys(variant.variant_options || {})
      )
    )
  );

  // Get available values for each option key
  const getAvailableValues = (optionKey: string) => {
    return Array.from(
      new Set(
        variants
          .filter(variant => variant.variant_options[optionKey])
          .map(variant => variant.variant_options[optionKey])
      )
    );
  };

  // Find matching variant based on selected options
  const findMatchingVariant = (options: Record<string, string>) => {
    return variants.find(variant => {
      return Object.entries(options).every(([key, value]) => 
        variant.variant_options[key] === value
      );
    });
  };

  // Handle option selection
  const handleOptionChange = (optionKey: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionKey]: value };
    setSelectedOptions(newOptions);

    const matchingVariant = findMatchingVariant(newOptions);
    if (matchingVariant) {
      onVariantChange(matchingVariant);
    }
  };

  // Initialize with first variant if no selection
  useEffect(() => {
    if (!selectedVariant && variants.length > 0) {
      const firstVariant = variants[0];
      setSelectedOptions(firstVariant.variant_options || {});
      onVariantChange(firstVariant);
    }
  }, [variants, selectedVariant, onVariantChange]);

  // Update selected options when selectedVariant changes externally
  useEffect(() => {
    if (selectedVariant) {
      setSelectedOptions(selectedVariant.variant_options || {});
    }
  }, [selectedVariant]);

  if (variants.length <= 1) {
    return null; // Don't show selector if only one or no variants
  }

  return (
    <div className="space-y-4">
      {optionKeys.map(optionKey => (
        <div key={optionKey} className="space-y-2">
          <Label className="text-sm font-medium capitalize">
            {optionKey}
          </Label>
          <div className="flex flex-wrap gap-2">
            {getAvailableValues(optionKey).map(value => {
              const isSelected = selectedOptions[optionKey] === value;
              const isAvailable = variants.some(variant => 
                variant.variant_options[optionKey] === value &&
                variant.inventory_quantity > 0
              );

              return (
                <Button
                  key={value}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleOptionChange(optionKey, value)}
                  disabled={!isAvailable}
                  className={`
                    ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                    ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {value}
                  {!isAvailable && (
                    <span className="ml-1 text-xs">(Out of stock)</span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedVariant && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{selectedVariant.name}</h4>
                {selectedVariant.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedVariant.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-bold">
                    Rs {selectedVariant.price.toFixed(2)}
                  </span>
                  {selectedVariant.compare_price && selectedVariant.compare_price > selectedVariant.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      Rs {selectedVariant.compare_price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant={selectedVariant.inventory_quantity > 0 ? "default" : "destructive"}
                >
                  {selectedVariant.inventory_quantity > 0 
                    ? `${selectedVariant.inventory_quantity} in stock` 
                    : 'Out of stock'
                  }
                </Badge>
                {selectedVariant.sku && (
                  <p className="text-xs text-muted-foreground mt-1">
                    SKU: {selectedVariant.sku}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};