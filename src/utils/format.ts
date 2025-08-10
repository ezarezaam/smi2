/**
 * Utility functions for formatting values
 */

/**
 * Format a date string to a localized format
 * @param dateString - Date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format a number as currency (IDR)
 * @param amount - Number to format as currency
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  if (amount === null || amount === undefined) return '-';
  
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `Rp ${amount}`;
  }
};

/**
 * Format a number with thousand separators
 * @param num - Number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number): string => {
  if (num === null || num === undefined) return '-';
  
  try {
    return new Intl.NumberFormat('id-ID').format(num);
  } catch (error) {
    console.error('Error formatting number:', error);
    return num.toString();
  }
};
