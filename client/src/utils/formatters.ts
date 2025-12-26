/**
 * Utility functions for formatting data
 */

/**
 * Format price to display with 2 decimal places
 * Handles both number and string inputs safely
 */
export const formatPrice = (price: number | string | null | undefined): string => {
  if (price === null || price === undefined) {
    return '0.00';
  }
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return '0.00';
  }
  
  return numPrice.toFixed(2);
};

/**
 * Format currency with dollar sign
 */
export const formatCurrency = (price: number | string | null | undefined): string => {
  return `$${formatPrice(price)}`;
};

/**
 * Parse price input to number
 */
export const parsePrice = (price: string | number): number => {
  if (typeof price === 'number') {
    return price;
  }
  
  const parsed = parseFloat(price);
  return isNaN(parsed) ? 0 : parsed;
};