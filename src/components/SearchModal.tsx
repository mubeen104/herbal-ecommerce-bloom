import { useState, useEffect, useRef } from "react";
import { Search, Clock, TrendingUp, Package, Tag, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSearch } from "@/hooks/useSearch";
import { useNavigate } from "react-router-dom";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localQuery, setLocalQuery] = useState("");
  const {
    query,
    searchResults,
    isSearching,
    suggestions,
    searchHistory,
    performSearch,
    clearSearchHistory,
    setQuery
  } = useSearch();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Update search query with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, setQuery]);

  const handleSearchSubmit = (searchTerm: string) => {
    performSearch(searchTerm);
    navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
    onClose();
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.type === 'product') {
      handleSearchSubmit(suggestion.text);
    } else if (suggestion.type === 'category') {
      navigate(`/shop?category=${suggestion.id}`);
      onClose();
    } else if (suggestion.type === 'recent') {
      setLocalQuery(suggestion.text);
    }
  };

  const handleProductClick = (product: any) => {
    navigate(`/shop?search=${encodeURIComponent(product.name)}`);
    performSearch(product.name);
    onClose();
  };

  const getMainImage = (product: any) => {
    if (product.product_images && product.product_images.length > 0) {
      return product.product_images.sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.image_url;
    }
    return "/placeholder.svg";
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package className="h-4 w-4" />;
      case 'category':
        return <Tag className="h-4 w-4" />;
      case 'recent':
        return <Clock className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 gap-0">
        {/* Search Header */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search products, categories..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && localQuery.trim()) {
                  handleSearchSubmit(localQuery);
                }
              }}
              className="pl-10 pr-4 text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {localQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setLocalQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search Content */}
        <div className="flex-1 overflow-y-auto">
          {!localQuery && (
            /* Empty State - Recent Searches and Suggestions */
            <div className="p-4 space-y-6">
              {searchHistory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-foreground flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Recent Searches
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearchHistory}
                      className="text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.slice(0, 6).map((term, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => setLocalQuery(term)}
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Popular Categories
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {suggestions.filter(s => s.type === 'category').slice(0, 6).map((suggestion) => (
                    <Button
                      key={suggestion.id}
                      variant="ghost"
                      className="justify-start h-auto p-3"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      {suggestion.text}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {localQuery && (
            /* Search Results and Suggestions */
            <div className="p-4 space-y-4">
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Suggestions</h3>
                  <div className="space-y-1">
                    {suggestions.slice(0, 5).map((suggestion) => (
                      <Button
                        key={suggestion.id}
                        variant="ghost"
                        className="w-full justify-start h-auto p-2"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {getSuggestionIcon(suggestion.type)}
                        <span className="ml-2">{suggestion.text}</span>
                        {suggestion.type === 'recent' && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            Recent
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {searchResults && searchResults.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Products ({searchResults.length})
                    </h3>
                    <div className="space-y-2">
                      {searchResults.slice(0, 8).map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                          onClick={() => handleProductClick(product)}
                        >
                          <img
                            src={getMainImage(product)}
                            alt={product.name}
                            className="h-10 w-10 object-cover rounded border border-border"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-foreground truncate">
                              {product.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                          {product.categories.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {product.categories[0].name}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                    {searchResults.length > 8 && (
                      <Button
                        variant="ghost"
                        className="w-full mt-2"
                        onClick={() => handleSearchSubmit(localQuery)}
                      >
                        View all {searchResults.length} results
                      </Button>
                    )}
                  </div>
                </>
              )}

              {/* No Results */}
              {localQuery && !isSearching && searchResults?.length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or browse our categories
                  </p>
                </div>
              )}

              {/* Loading */}
              {isSearching && (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3 p-2">
                      <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions Footer */}
        <div className="p-4 border-t border-border bg-muted/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Press Enter to search</span>
            <span>Esc to close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;