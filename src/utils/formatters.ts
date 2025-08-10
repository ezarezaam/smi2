/**
 * Format a number as currency (IDR)
 * @param value Number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Format a date string or Date object to localized format
 * @param date Date string or Date object to format
 * @returns Formatted date string or '-' if invalid
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  // Return placeholder if date is null or undefined
  if (!date) return '-';
  
  try {
    // If date is already a Date object, use it directly
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return '-';
    }
    
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};
