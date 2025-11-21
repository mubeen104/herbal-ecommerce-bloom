/**
 * Utility functions for pixel tracking
 */

/**
 * Converts display currency to ISO 4217 currency code
 * @param displayCurrency - Currency symbol or code (e.g., 'Rs', '$', 'PKR', 'USD')
 * @returns ISO 4217 currency code (e.g., 'PKR', 'USD')
 */
export const getCurrencyCode = (displayCurrency: string): string => {
  const currencyMap: Record<string, string> = {
    'Rs': 'PKR',
    'PKR': 'PKR',
    '₨': 'PKR',
    '$': 'USD',
    'USD': 'USD',
    '€': 'EUR',
    'EUR': 'EUR',
    '£': 'GBP',
    'GBP': 'GBP',
    '¥': 'JPY',
    'JPY': 'JPY',
    '₹': 'INR',
    'INR': 'INR',
    'AUD': 'AUD',
    'CAD': 'CAD',
    'CHF': 'CHF',
    'CNY': 'CNY',
    'HKD': 'HKD',
    'NZD': 'NZD',
    'SEK': 'SEK',
    'SGD': 'SGD'
  };

  return currencyMap[displayCurrency] || 'USD';
};

/**
 * Gets standardized product identifier for tracking
 * Always uses product UUID as primary identifier
 * @param product - Product object
 * @param variant - Optional variant object
 * @returns Standardized product ID (UUID)
 */
export const getProductId = (product: any, variant?: any): string => {
  return product.id;
};

/**
 * Gets product SKU for metadata
 * @param product - Product object
 * @param variant - Optional variant object
 * @returns Product SKU
 */
export const getProductSKU = (product: any, variant?: any): string => {
  return variant?.sku || product.sku || product.id;
};

/**
 * Validates and sanitizes price value
 * @param price - Price value to validate
 * @returns Valid price or throws error
 */
export const validatePrice = (price: any): number => {
  const numPrice = typeof price === 'number' ? price : parseFloat(price);

  if (isNaN(numPrice)) {
    throw new Error(`Invalid price: ${price} is not a number`);
  }

  if (numPrice < 0) {
    throw new Error(`Invalid price: ${price} is negative`);
  }

  if (numPrice > 10000000) {
    throw new Error(`Invalid price: ${price} exceeds maximum (10,000,000)`);
  }

  if (!isFinite(numPrice)) {
    throw new Error(`Invalid price: ${price} is not finite`);
  }

  return numPrice;
};

/**
 * Validates and sanitizes quantity value
 * @param quantity - Quantity value to validate
 * @returns Valid quantity or throws error
 */
export const validateQuantity = (quantity: any): number => {
  const numQuantity = typeof quantity === 'number' ? quantity : parseInt(quantity);

  if (isNaN(numQuantity)) {
    throw new Error(`Invalid quantity: ${quantity} is not a number`);
  }

  if (numQuantity <= 0) {
    throw new Error(`Invalid quantity: ${quantity} must be positive`);
  }

  if (numQuantity > 10000) {
    throw new Error(`Invalid quantity: ${quantity} exceeds maximum (10,000)`);
  }

  if (!Number.isInteger(numQuantity)) {
    throw new Error(`Invalid quantity: ${quantity} must be an integer`);
  }

  return numQuantity;
};

/**
 * Sanitizes metadata object by removing sensitive data
 * @param metadata - Metadata object to sanitize
 * @returns Sanitized metadata
 */
export const sanitizeMetadata = (metadata: any): any => {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }

  const safe = { ...metadata };

  // Remove sensitive fields
  const sensitiveFields = [
    'email',
    'phone',
    'password',
    'credit_card',
    'creditCard',
    'card_number',
    'cardNumber',
    'cvv',
    'ssn',
    'social_security',
    'address',
    'street',
    'postal_code',
    'zip_code',
    'ip_address',
    'user_agent',
    'access_token',
    'refresh_token',
    'api_key',
    'secret'
  ];

  sensitiveFields.forEach(field => {
    delete safe[field];
  });

  // Truncate long strings
  Object.keys(safe).forEach(key => {
    if (typeof safe[key] === 'string' && safe[key].length > 500) {
      safe[key] = safe[key].substring(0, 500) + '...';
    }
  });

  return safe;
};

/**
 * Gets consistent brand name from settings or default
 * @param product - Product object (may have brand in future)
 * @param defaultBrand - Default brand name
 * @returns Brand name
 */
export const getBrandName = (product: any, defaultBrand: string = 'New Era Herbals'): string => {
  return product?.brand || defaultBrand;
};

/**
 * Formats tracking data with validation
 * @param productData - Raw product data
 * @param currency - Display currency
 * @returns Validated and formatted tracking data
 */
export const formatProductTrackingData = (
  productData: {
    id: string;
    name: string;
    price: number;
    sku?: string;
    category?: string;
    variant?: any;
  },
  currency: string
) => {
  try {
    const validatedPrice = validatePrice(productData.price);
    const currencyCode = getCurrencyCode(currency);
    const productId = getProductId(productData, productData.variant);
    const productSKU = getProductSKU(productData, productData.variant);

    return {
      product_id: productId,
      name: productData.name,
      price: validatedPrice,
      currency: currencyCode,
      category: productData.category,
      brand: getBrandName(productData),
      sku: productSKU
    };
  } catch (error) {
    console.error('Error formatting product tracking data:', error);
    throw error;
  }
};
