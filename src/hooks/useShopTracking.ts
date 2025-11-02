import { useEffect } from 'react';

export const useShopTracking = (
  products: any[] = [],
  category?: string,
  searchTerm?: string
) => {
  useEffect(() => {
    if (!products || products.length === 0) return;

    const productData = products.slice(0, 10).map(product => ({
      id: product.sku || product.id,
      name: product.name,
      price: product.price,
      currency: 'PKR',
      category: product.product_categories?.[0]?.categories?.name || 'Herbal Products',
      brand: 'New Era Herbals'
    }));

    if (category && category !== 'all') {
      const validProducts = productData.filter(p => p.id && !isNaN(p.price));

      if (window.fbq) {
        window.fbq('track', 'ViewContent', {
          content_type: 'product_group',
          content_ids: validProducts.map(p => String(p.id)),
          contents: validProducts.map(p => ({
            id: String(p.id),
            quantity: 1,
            item_price: p.price
          })),
          num_items: validProducts.length,
          currency: 'PKR',
          value: validProducts.reduce((sum, p) => sum + p.price, 0)
        });
      }

      if (window.gtag) {
        window.gtag('event', 'view_item_list', {
          item_list_name: category,
          currency: 'PKR',
          value: productData.reduce((sum, p) => sum + p.price, 0),
          items: productData.map((p, i) => ({
            item_id: p.id,
            item_name: p.name,
            item_category: p.category,
            price: p.price,
            index: i
          }))
        });
      }
    }

    if (searchTerm && searchTerm.trim()) {
      const validProducts = productData.filter(p => p.id && !isNaN(p.price));

      if (window.fbq) {
        window.fbq('track', 'Search', {
          search_string: searchTerm,
          content_type: 'product',
          content_ids: validProducts.map(p => String(p.id)),
          contents: validProducts.map(p => ({
            id: String(p.id),
            quantity: 1,
            item_price: p.price
          })),
          num_items: validProducts.length,
          currency: 'PKR',
          value: validProducts.reduce((sum, p) => sum + p.price, 0)
        });
      }

      if (window.gtag) {
        window.gtag('event', 'search', {
          search_term: searchTerm,
          search_results: products.length
        });
      }
    }
  }, [products, category, searchTerm]);
};
