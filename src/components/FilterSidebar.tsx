import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { X, SlidersHorizontal } from 'lucide-react';
import { useCategories, type Category } from '@/hooks/useCategories';

interface FilterSidebarProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  productType: string;
  setProductType: (type: string) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export const FilterSidebar = ({
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  productType,
  setProductType,
  onClearFilters,
  activeFilterCount,
}: FilterSidebarProps) => {
  const { data: categories = [] } = useCategories();
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    type: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 sticky top-20 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Filters</h2>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear All
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="space-y-6">
          {/* Categories Filter */}
          <div>
            <button
              onClick={() => toggleSection('categories')}
              className="flex items-center justify-between w-full mb-3 group"
            >
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                Categories
              </h3>
              <span className="text-xs text-muted-foreground">
                {expandedSections.categories ? '−' : '+'}
              </span>
            </button>

            {expandedSections.categories && (
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category: Category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      selectedCategory === category.slug
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Price Range Filter */}
          <div>
            <button
              onClick={() => toggleSection('price')}
              className="flex items-center justify-between w-full mb-3 group"
            >
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                Price Range
              </h3>
              <span className="text-xs text-muted-foreground">
                {expandedSections.price ? '−' : '+'}
              </span>
            </button>

            {expandedSections.price && (
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
            )}
          </div>

          <Separator />

          {/* Product Type Filter */}
          <div>
            <button
              onClick={() => toggleSection('type')}
              className="flex items-center justify-between w-full mb-3 group"
            >
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                Product Type
              </h3>
              <span className="text-xs text-muted-foreground">
                {expandedSections.type ? '−' : '+'}
              </span>
            </button>

            {expandedSections.type && (
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Products' },
                  { value: 'single-items', label: 'Single Items' },
                  { value: 'kits-deals', label: 'Kits & Deals' },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setProductType(type.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      productType === type.value
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
