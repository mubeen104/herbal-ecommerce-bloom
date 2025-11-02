export interface StandardizedProductData {
  id: string;
  name: string;
  price: number;
  currency: string;
  quantity?: number;
  category?: string;
  brand?: string;
}

export const standardizeProductId = (product: any): string => {
  return String(product.sku || product.id || product.product_id || '');
};

export const normalizeCurrency = (currency: string): string => {
  const currencyMap: { [key: string]: string } = {
    'Rs': 'PKR',
    'rs': 'PKR',
    'PKR': 'PKR',
    'USD': 'USD',
    '$': 'USD'
  };
  return currencyMap[currency] || 'PKR';
};

export const validateEventData = (data: any): boolean => {
  if (!data.currency || !data.value) return false;
  if (isNaN(parseFloat(data.value))) return false;
  return true;
};
