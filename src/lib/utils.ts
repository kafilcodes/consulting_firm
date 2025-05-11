import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency
 * @param amount The amount to format
 * @param currency The currency code (default: 'INR')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format a date string or Date object into a readable format
 * @param date The date to format (string, Date object, or Firebase Timestamp)
 * @param includeTime Whether to include the time in the formatted string
 * @returns Formatted date string
 */
export function formatDate(date: any, includeTime: boolean = false): string {
  if (!date) return '';
  
  let dateObj: Date;
  
  try {
    // Handle different input types
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'object' && date !== null) {
      // Handle Firebase Timestamp object
      if (date.toDate && typeof date.toDate === 'function') {
        dateObj = date.toDate();
      } else if (date.seconds !== undefined) {
        // Handle Firestore Timestamp-like object
        dateObj = new Date(date.seconds * 1000);
      } else if (date.nanoseconds !== undefined && !date.seconds) {
        // Some weird edge case of Timestamp with only nanoseconds
        dateObj = new Date();
      } else {
        // Unknown object type
        console.warn('Unknown date format:', date);
        return '';
      }
    } else {
      console.warn('Unsupported date format:', date);
      return '';
    }
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date object created from:', date);
      return '';
    }
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error, 'Input was:', date);
    return '';
  }
}

/**
 * Generate a unique order ID
 * @returns A string in the format SKS-YYYYMMDD-XXXX where XXXX is a random number
 */
export function createOrderId(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  
  return `SKS-${year}${month}${day}-${random}`;
} 