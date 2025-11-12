import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Package } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

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
        {/* Simplified: Categories Only */}
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Shop by Category
            </h3>
            <div className="h-px bg-gradient-to-r from-primary/30 via-primary/10 to-transparent"></div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-muted/20 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/shop?category=${category.slug}`}
                  onClick={onClose}
                  className="group relative bg-gradient-to-br from-muted/10 to-muted/5 hover:from-primary/10 hover:to-accent/10 rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 border border-border/50 hover:border-primary/30"
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="w-full">
                      <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                        {category.name}
                      </h4>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="flex justify-center mt-6">
            <Link
              to="/shop"
              onClick={onClose}
              className="inline-flex items-center px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              View All Products
              <ChevronRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
