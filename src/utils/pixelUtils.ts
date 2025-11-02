// Utility functions for Meta Pixel enhanced matching and event validation

export interface StandardizedEventData {
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  content_category?: string;
  currency: string;
  value: number;
  num_items?: number;
  contents?: Array<{
    id: string;
    quantity: number;
    item_price: number;
  }>;
}

export interface StandardizedProductData {
  id: string;
  name: string;
  price: number;
  currency: string;
  quantity?: number;
  category?: string;
  brand?: string;
}

/**
 * Validate and standardize product ID
 */
export const standardizeProductId = (product: any): string => {
  return String(product.sku || product.id || product.product_id || '');
};

/**
 * Normalize currency code
 */
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

/**
 * Validate event data before sending
 */
export const validateEventData = (data: any): boolean => {
  if (!data.currency || !data.value) return false;
  if (isNaN(parseFloat(data.value))) return false;
  return true;
};

/**
 * SHA-256 hash function for Meta Pixel advanced matching
 * Hashes user data before sending to protect privacy
 */
export const sha256Hash = async (value: string): Promise<string> => {
  if (!value) return '';
  
  // Normalize: lowercase and trim
  const normalized = value.toLowerCase().trim();
  
  try {
    // Use SubtleCrypto API for hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.warn('SHA-256 hashing failed:', error);
    return '';
  }
};

/**
 * Get Facebook browser ID (fbp cookie)
 */
export const getFacebookBrowserId = (): string | null => {
  const fbpCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('_fbp='));
  return fbpCookie ? fbpCookie.split('=')[1] : null;
};

/**
 * Get Facebook click ID (fbc cookie)
 */
export const getFacebookClickId = (): string | null => {
  const fbcCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('_fbc='));
  return fbcCookie ? fbcCookie.split('=')[1] : null;
};

/**
 * Extract phone number digits only (normalize)
 */
export const normalizePhone = (phone: string): string => {
  if (!phone) return '';
  // Remove all non-digit characters
  return phone.replace(/\D/g, '');
};

/**
 * Create enhanced matching parameters for Meta Pixel
 */
export const createEnhancedMatchingParams = async (userData?: {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  userId?: string;
}) => {
  if (!userData) return {};

  const params: any = {};

  // Hash user data for privacy
  if (userData.email) {
    params.em = await sha256Hash(userData.email);
  }
  
  if (userData.phone) {
    const normalizedPhone = normalizePhone(userData.phone);
    if (normalizedPhone) {
      params.ph = await sha256Hash(normalizedPhone);
    }
  }
  
  if (userData.firstName) {
    params.fn = await sha256Hash(userData.firstName);
  }
  
  if (userData.lastName) {
    params.ln = await sha256Hash(userData.lastName);
  }
  
  if (userData.city) {
    params.ct = await sha256Hash(userData.city);
  }
  
  if (userData.state) {
    params.st = await sha256Hash(userData.state);
  }
  
  if (userData.zipCode) {
    params.zp = await sha256Hash(userData.zipCode);
  }
  
  if (userData.country) {
    params.country = await sha256Hash(userData.country);
  }
  
  if (userData.userId) {
    params.external_id = userData.userId; // Don't hash external_id
  }

  // Get Facebook browser and click IDs
  const fbp = getFacebookBrowserId();
  const fbc = getFacebookClickId();
  
  if (fbp) params.fbp = fbp;
  if (fbc) params.fbc = fbc;

  // Add client info (these should NOT be hashed)
  params.client_user_agent = navigator.userAgent;
  
  return params;
};
