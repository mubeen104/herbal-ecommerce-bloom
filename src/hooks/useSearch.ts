import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  name: string;
  price: number;
  short_description?: string;
  slug: string;
  product_images: Array<{
    id: string;
    image_url: string;
    alt_text: string;
    sort_order: number;
  }>;
  categories: Array<{
    id: string;
    name: string;
  }>;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'recent';
  count?: number;
}

export const useSearch = (initialQuery: string = '') => {
  const [query, setQuery] = useState(initialQuery);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('search-history');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save search to history
  const addToSearchHistory = (searchTerm: string) => {
    if (searchTerm.trim() && !searchHistory.includes(searchTerm.trim())) {
      const newHistory = [searchTerm.trim(), ...searchHistory].slice(0, 10); // Keep only 10 recent searches
      setSearchHistory(newHistory);
      localStorage.setItem('search-history', JSON.stringify(newHistory));
    }
  };

  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('search-history');
  };

  // Fetch search results
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['search', query],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!query.trim()) return [];

      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          short_description,
          slug,
          product_images (
            id,
            image_url,
            alt_text,
            sort_order
          ),
          product_categories (
            categories (
              id,
              name
            )
          )
        `)
        .or(`name.ilike.%${query}%,short_description.ilike.%${query}%,tags.cs.{${query}}`)
        .eq('is_active', true)
        .limit(20);

      if (error) throw error;

      // Transform the data to match our interface
      return data?.map(product => ({
        ...product,
        categories: product.product_categories?.map((pc: any) => pc.categories).filter(Boolean) || []
      })) || [];
    },
    enabled: query.trim().length > 0,
  });

  // Fetch search suggestions
  const { data: suggestions } = useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: async (): Promise<SearchSuggestion[]> => {
      if (query.trim().length < 2) {
        // Return recent searches and popular categories when query is short
        const { data: categories } = await supabase
          .from('categories')
          .select('id, name')
          .eq('is_active', true)
          .limit(5);

        const categorySuggestions: SearchSuggestion[] = categories?.map(cat => ({
          id: cat.id,
          text: cat.name,
          type: 'category' as const
        })) || [];

        const recentSuggestions: SearchSuggestion[] = searchHistory.map((term, index) => ({
          id: `recent-${index}`,
          text: term,
          type: 'recent' as const
        }));

        return [...recentSuggestions, ...categorySuggestions];
      }

      // Fetch product suggestions based on query
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .eq('is_active', true)
        .limit(8);

      const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .eq('is_active', true)
        .limit(3);

      const productSuggestions: SearchSuggestion[] = products?.map(product => ({
        id: product.id,
        text: product.name,
        type: 'product' as const
      })) || [];

      const categorySuggestions: SearchSuggestion[] = categories?.map(cat => ({
        id: cat.id,
        text: cat.name,
        type: 'category' as const
      })) || [];

      return [...productSuggestions, ...categorySuggestions];
    },
    enabled: isSearchOpen,
  });

  // Perform search and add to history
  const performSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    addToSearchHistory(searchTerm);
    setIsSearchOpen(false);
  };

  // Clear current search
  const clearSearch = () => {
    setQuery('');
    setIsSearchOpen(false);
  };

  return {
    query,
    setQuery,
    searchResults,
    isSearching,
    suggestions: suggestions || [],
    searchHistory,
    isSearchOpen,
    setIsSearchOpen,
    performSearch,
    clearSearch,
    addToSearchHistory,
    clearSearchHistory,
  };
};