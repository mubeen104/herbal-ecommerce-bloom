import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
      className="absolute left-0 top-full mt-0 bg-background/95 backdrop-blur-md border border-border shadow-xl rounded-b-lg animate-in slide-in-from-top-2 z-50 min-w-[220px]"
      onMouseLeave={onClose}
    >
      <div className="py-2">
        {isLoading ? (
          <div className="px-4 py-2 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-muted/20 rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.slug}`}
                onClick={onClose}
                className="block px-6 py-3 text-foreground hover:text-primary hover:bg-primary/5 transition-colors duration-200 font-medium"
              >
                {category.name}
              </Link>
            ))}
            <div className="border-t border-border mt-2 pt-2">
              <Link
                to="/shop"
                onClick={onClose}
                className="block px-6 py-3 text-primary hover:bg-primary/5 transition-colors duration-200 font-semibold"
              >
                View All Products
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
