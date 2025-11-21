import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SuggestedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_price: number | null;
  inventory_quantity: number;
  is_best_seller: boolean;
  is_featured: boolean;
  image_url: string;
  image_alt: string;
  suggestion_score: number;
}

export interface UseSuggestedCartProductsResult {
  data: SuggestedProduct[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  refetch: () => void;
}

interface CartItem {
  product_id?: string;
  products?: { id: string };
  product?: { id: string };
}

interface ProductWithRecommendations {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_price: number | null;
  inventory_quantity: number;
  is_best_seller: boolean;
  is_featured: boolean;
  image_url: string;
  image_alt: string;
  category_ids: string[];
}

function calculateCartSuggestionScore(
  cartProducts: ProductWithRecommendations[],
  candidateProduct: ProductWithRecommendations
): number {
  let score = 0;

  // Get all cart category IDs
  const cartCategoryIds = new Set<string>();
  cartProducts.forEach(p => {
    p.category_ids.forEach(catId => cartCategoryIds.add(catId));
  });

  // Calculate average cart price
  const avgCartPrice = cartProducts.reduce((sum, p) => sum + p.price, 0) / cartProducts.length;

  // Same category bonus: 15 points
  const hasSharedCategory = candidateProduct.category_ids.some(
    catId => cartCategoryIds.has(catId)
  );
  if (hasSharedCategory) {
    score += 15;
  }

  // Price compatibility: 10 points if within 0.5x to 1.5x of average
  const priceRatio = candidateProduct.price / avgCartPrice;
  if (priceRatio >= 0.5 && priceRatio <= 1.5) {
    score += 10;
  }

  // Best seller bonus: 8 points
  if (candidateProduct.is_best_seller) {
    score += 8;
  }

  // Featured bonus: 5 points
  if (candidateProduct.is_featured) {
    score += 5;
  }

  // Lower price preference: 3 points if cheaper than 70% of average
  if (candidateProduct.price < avgCartPrice * 0.7) {
    score += 3;
  }

  return score;
}

export const useSuggestedCartProducts = (
  cartItems: CartItem[],
  limit: number = 4
): UseSuggestedCartProductsResult => {
  const cartProductIds = cartItems
    .map(item => item.product_id || item.products?.id || item.product?.id)
    .filter(Boolean) as string[];

  const result = useQuery({
    queryKey: ['cart-suggestions', cartProductIds, limit],
    queryFn: async (): Promise<SuggestedProduct[]> => {
      if (!cartProductIds || cartProductIds.length === 0) {
        return [];
      }

      try {
        // Get cart products details from products table
        const { data: cartProducts, error: cartError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            slug,
            price,
            compare_price,
            inventory_quantity,
            is_best_seller,
            is_featured,
            product_categories(category_id)
          `)
          .in('id', cartProductIds)
          .eq('is_active', true);

        if (cartError) {
          console.error('Error fetching cart products:', cartError);
          throw cartError;
        }

        if (!cartProducts || cartProducts.length === 0) {
          return [];
        }

        // Enhance cart products with category IDs
        const enhancedCartProducts = cartProducts.map(p => ({
          ...p,
          category_ids: (p.product_categories || []).map((pc: any) => pc.category_id)
        }));

        // Get all other active products (not in cart) from products table
        const { data: candidateProducts, error: candidatesError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            slug,
            price,
            compare_price,
            inventory_quantity,
            is_best_seller,
            is_featured,
            product_categories(category_id),
            product_images(image_url, alt_text, sort_order)
          `)
          .eq('is_active', true)
          .gt('inventory_quantity', 0)
          .not('id', 'in', `(${cartProductIds.join(',')})`);

        if (candidatesError) {
          console.error('Error fetching candidate products:', candidatesError);
          throw candidatesError;
        }

        if (!candidateProducts || candidateProducts.length === 0) {
          return [];
        }

        // Calculate scores for all candidates
        const scoredProducts = candidateProducts.map(candidate => {
          const candidateCategoryIds = (candidate.product_categories || []).map(
            (pc: any) => pc.category_id
          );
          const primaryImage = (candidate.product_images || [])
            .sort((a: any, b: any) => a.sort_order - b.sort_order)[0];

          return {
            id: candidate.id,
            name: candidate.name,
            slug: candidate.slug,
            price: candidate.price,
            compare_price: candidate.compare_price,
            inventory_quantity: candidate.inventory_quantity,
            is_best_seller: candidate.is_best_seller,
            is_featured: candidate.is_featured,
            image_url: primaryImage?.image_url || '/placeholder.svg',
            image_alt: primaryImage?.alt_text || candidate.name,
            suggestion_score: calculateCartSuggestionScore(
              enhancedCartProducts as ProductWithRecommendations[],
              {
                ...candidate,
                category_ids: candidateCategoryIds,
                image_url: primaryImage?.image_url || '/placeholder.svg',
                image_alt: primaryImage?.alt_text || candidate.name
              } as ProductWithRecommendations
            ),
          };
        });

        // Filter products with score > 0, sort by score, and limit
        const topSuggestions = scoredProducts
          .filter(p => p.suggestion_score > 0)
          .sort((a, b) => b.suggestion_score - a.suggestion_score)
          .slice(0, limit);

        return topSuggestions;
      } catch (error) {
        console.error('Unexpected error in useSuggestedCartProducts:', error);
        throw error;
      }
    },
    enabled: cartProductIds.length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error) {
        if (error.message?.includes('permission denied')) return false;
        if (error.message?.includes('does not exist')) return false;
      }
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Cart suggestions query failed:', error);
    }
  });

  return {
    data: result.data || [],
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error || null,
    isSuccess: result.isSuccess,
    refetch: result.refetch,
  };
};

export const trackCartSuggestionView = async (
  cartProductIds: string[],
  suggestedProductId: string,
  sessionId: string,
  userId?: string
) => {
  try {
    if (cartProductIds.length > 0) {
      await supabase
        .from('product_recommendation_views')
        .insert({
          product_id: cartProductIds[0],
          recommended_product_id: suggestedProductId,
          session_id: sessionId,
          user_id: userId || null,
          source: 'cart_page'
        });
    }
  } catch (error) {
    console.error('Error tracking cart suggestion view:', error);
  }
};

export const trackCartSuggestionConversion = async (
  cartProductIds: string[],
  suggestedProductId: string,
  sessionId: string,
  userId?: string
) => {
  try {
    if (cartProductIds.length > 0) {
      await supabase
        .from('product_recommendation_conversions')
        .insert({
          product_id: cartProductIds[0],
          recommended_product_id: suggestedProductId,
          session_id: sessionId,
          user_id: userId || null,
          source: 'cart_page'
        });
    }
  } catch (error) {
    console.error('Error tracking cart suggestion conversion:', error);
  }
};
