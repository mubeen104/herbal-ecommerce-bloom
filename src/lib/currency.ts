/**
 * Currency utility functions for consistent currency formatting across the app
 */

export const formatCurrency = (amount: number, currency: string = 'PKR'): string => {
  const formattedAmount = amount.toFixed(2);
  
  // Return formatted currency string
  return `${currency} ${formattedAmount}`;
};

export const getCurrencySymbol = (currency: string = 'PKR'): string => {
  const currencySymbols: Record<string, string> = {
    'PKR': 'Rs',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹',
    'AED': 'AED',
    'SAR': 'SAR',
  };
  
  return currencySymbols[currency] || currency;
};

export const formatPrice = (amount: number, currency: string = 'PKR'): string => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol} ${amount.toFixed(2)}`;
};