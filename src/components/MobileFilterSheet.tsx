import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal } from 'lucide-react';
import { useCategories, type Category } from '@/hooks/useCategories';

interface MobileFilterSheetProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  productType: string;
  setProductType: (type: string) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  activeFilterCount: number;
}

export const MobileFilterSheet = ({
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  productType,
  setProductType,
  onClearFilters,
  onApplyFilters,
  activeFilterCount,
}: MobileFilterSheetProps) => {
  const { data: categories = [] } = useCategories();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 w-full">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Filter Products</span>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6 overflow-y-auto h-[calc(90vh-140px)] pb-4">
          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">Categories</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'bg-muted/50 text-muted-foreground'
                }`}
              >
                All Categories
              </button>
              {categories.map((category: Category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                    selectedCategory === category.slug
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">Price Range</h3>
            <div className="space-y-4">
              <Slider
                min={0}
                max={10000}
                step={100}
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>PKR {priceRange[0]}</span>
                <span>PKR {priceRange[1]}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Product Type */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">Product Type</h3>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'All Products' },
                { value: 'single-items', label: 'Single Items' },
                { value: 'kits-deals', label: 'Kits & Deals' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setProductType(type.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                    productType === type.value
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
          <Button onClick={onApplyFilters} className="w-full" size="lg">
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
