import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Package, Sparkles } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MegaMenu = ({ isOpen, onClose }: MegaMenuProps) => {
  const { data: categories = [], isLoading } = useCategories();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute left-0 right-0 top-full mt-0 bg-white border-t border-border shadow-2xl animate-in slide-in-from-top-2 z-50"
      onMouseLeave={onClose}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Categories Section */}
          <div className="md:col-span-3">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Shop by Category
              </h3>
              <div className="h-px bg-gradient-to-r from-primary/30 via-primary/10 to-transparent"></div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted/20 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/shop?category=${category.slug}`}
                    onClick={onClose}
                    className="group relative bg-gradient-to-br from-muted/10 to-muted/5 hover:from-primary/10 hover:to-accent/10 rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 border border-border/50 hover:border-primary/30"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                          {category.name}
                        </h4>
                        {category.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <Link
              to="/shop"
              onClick={onClose}
              className="inline-flex items-center mt-6 text-sm font-semibold text-primary hover:text-primary/80 transition-colors duration-300"
            >
              View All Products
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {/* Featured/Promotional Section */}
          <div className="md:col-span-1 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6 border border-primary/20">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Featured
              </h3>
            </div>

            <div className="space-y-4">
              <Link
                to="/shop?featured=true"
                onClick={onClose}
                className="block group"
              >
                <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border hover:border-primary/30">
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 mb-1">
                    Featured Products
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Discover our bestselling organic supplements
                  </p>
                </div>
              </Link>

              <Link
                to="/shop?kits_deals=true"
                onClick={onClose}
                className="block group"
              >
                <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border hover:border-primary/30">
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 mb-1">
                    Kits & Deals
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Save with our curated wellness bundles
                  </p>
                </div>
              </Link>

              <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                <p className="text-xs font-semibold text-primary mb-1">
                  💚 Free Shipping
                </p>
                <p className="text-xs text-muted-foreground">
                  On orders over $50
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
