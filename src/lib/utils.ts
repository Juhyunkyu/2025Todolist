import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 상수 정의
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEX_COLOR_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
const ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';



/**
 * Combines class names using clsx and tailwind-merge
 * This ensures that Tailwind classes are properly merged and conflicting classes are resolved
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string into a human-readable format
 * @param date - Date string or Date object
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Invalid date 체크
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date provided');
    }
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    
    return dateObj.toLocaleDateString('ko-KR', { ...defaultOptions, ...options });
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Formats a date string into a relative time format (e.g., "2 hours ago")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Invalid date 체크
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date provided');
    }
    
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    
    // 미래 날짜 처리
    if (diffInMs < 0) {
      return '미래';
    }
    
    const diffInSeconds = Math.floor(diffInMs / 1000);
    
    if (diffInSeconds < 60) {
      return '방금 전';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks}주 전`;
    }
    
    return formatDate(dateObj);
  } catch (error) {
    console.warn('Error formatting relative time:', error);
    return 'Invalid Date';
  }
}

/**
 * Truncates text to a specified length and adds ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || maxLength <= 0) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generates a cryptographically secure random ID string
 * @param length - Length of the ID (default: 8)
 * @returns Random ID string
 */
export function generateId(length: number = 8): string {
  if (length <= 0) return '';
  
  // crypto.randomUUID() 사용 (더 안전한 랜덤 생성)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, length);
  }
  
  // 폴백: Math.random() 사용
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length));
  }
  return result;
}

/**
 * Debounces a function call
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  if (wait < 0) {
    throw new Error('Wait time must be non-negative');
  }
  
  let timeout: NodeJS.Timeout | undefined;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param value - Value to check
 * @returns True if value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>).length === 0;
  }
  return false;
}

/**
 * Capitalizes the first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str || typeof str !== 'string') return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Converts a string to kebab-case
 * @param str - String to convert
 * @returns Kebab-case string
 */
export function toKebabCase(str: string): string {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Converts a string to camelCase
 * @param str - String to convert
 * @returns Camel-case string
 */
export function toCamelCase(str: string): string {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

/**
 * Validates an email address
 * @param email - Email to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Formats a number with commas (e.g., 1000 -> 1,000)
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  return num.toLocaleString('ko-KR');
}

/**
 * Calculates the percentage between two numbers
 * @param value - Current value
 * @param total - Total value
 * @returns Percentage (0-100)
 */
export function calculatePercentage(value: number, total: number): number {
  if (typeof value !== 'number' || typeof total !== 'number' || isNaN(value) || isNaN(total)) {
    return 0;
  }
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// 테마 관련 유틸리티 함수들

/**
 * Formats a CSS property name to kebab-case
 * @param property - CSS property name
 * @returns Formatted CSS property name
 */
export const formatCSSProperty = (property: string): string => {
  if (!property || typeof property !== 'string') return '';
  return property.replace(/([A-Z])/g, '-$1').toLowerCase();
};

/**
 * Creates a React CSS properties object from a styles record
 * @param styles - Styles record
 * @returns React CSS properties object
 */
export const createStyleObject = (styles: Record<string, unknown>): React.CSSProperties => {
  if (!styles || typeof styles !== 'object') return {};
  
  const result: Record<string, unknown> = {};
  
  Object.entries(styles).forEach(([key, value]) => {
    if (key.startsWith(':') || key.startsWith('@')) {
      // 의사 클래스나 미디어 쿼리는 건너뛰기
      return;
    }
    
    const cssProperty = formatCSSProperty(key);
    if (cssProperty) {
      result[cssProperty] = value;
    }
  });
  
  return result as React.CSSProperties;
};

/**
 * Converts hex color to rgba
 * @param hex - Hex color string
 * @param alpha - Alpha value (0-1)
 * @returns RGBA color string
 */
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  if (!hex || typeof hex !== 'string') return hex;
  if (alpha < 0 || alpha > 1) {
    console.warn('Alpha value must be between 0 and 1');
    alpha = Math.max(0, Math.min(1, alpha));
  }
  
  const result = HEX_COLOR_REGEX.exec(hex);
  if (!result) return hex;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Creates responsive styles object
 * @param mobile - Mobile styles
 * @param tablet - Tablet styles (optional)
 * @param desktop - Desktop styles (optional)
 * @returns Responsive styles object
 */
export const createResponsiveStyle = (
  mobile: React.CSSProperties,
  tablet?: React.CSSProperties,
  desktop?: React.CSSProperties
): React.CSSProperties & Record<string, React.CSSProperties> => {
  const result = {
    ...mobile,
  } as React.CSSProperties & Record<string, React.CSSProperties>;
  
  if (tablet) {
    result['@media (min-width: 768px)'] = tablet;
  }
  
  if (desktop) {
    result['@media (min-width: 1024px)'] = desktop;
  }
  
  return result;
};