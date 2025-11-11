import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { Leaf, ShoppingBag, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MegaMenu = ({ isOpen, onClose }: MegaMenuProps) => {
  const { data: categories = [], isLoading } = useCategories();

  const getCategoryIcon = (slug: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      supplements: <Leaf className="h-5 w-5 text-primary" />,
      "teas-beverages": <Sparkles className="h-5 w-5 text-primary" />,
      skincare: <Sparkles className="h-5 w-5 text-primary" />,
    };
    return iconMap[slug] || <ShoppingBag className="h-5 w-5 text-primary" />;
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute left-0 right-0 top-full w-full bg-background/95 backdrop-blur-xl border-b border-border shadow-2xl animate-fade-in z-40"
      onMouseLeave={onClose}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Shop by Category
          </h3>
          <p className="text-xs text-muted-foreground">
            Explore our premium collection of natural herbal products
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted/20 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.slug}`}
                onClick={onClose}
                className="group"
              >
                <Card className="border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg overflow-hidden bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <div className="relative h-24 overflow-hidden">
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <h4 className="text-white font-semibold text-sm line-clamp-1 text-shadow">
                          {category.name}
                        </h4>
                      </div>
                    </div>
                    <div className="p-3 flex items-center gap-2">
                      {getCategoryIcon(category.slug)}
                      <p className="text-xs text-muted-foreground line-clamp-1 flex-1">
                        {category.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-border/50">
          <Link
            to="/shop"
            onClick={onClose}
            className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors group"
          >
            View All Products
            <svg
              className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};
