/**
 * 🛡️ HTML Sanitization Utility
 * Protects against XSS attacks by sanitizing user-generated content
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content for safe rendering
 * Allows basic formatting tags while removing dangerous content
 */
export const sanitizeHtml = (dirty: string): string => {
  // Configure DOMPurify with safe whitelist
  const config = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    // Force links to open in new tab and be nofollow
    ADD_ATTR: ['target', 'rel'],
  };

  let clean = DOMPurify.sanitize(dirty, config);

  // Ensure all links are safe
  clean = clean.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');

  return clean;
};

/**
 * Sanitize and escape text for email HTML
 * More restrictive - removes all HTML tags
 */
export const sanitizeForEmail = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate and limit string length
 */
export const validateAndTruncate = (text: string, maxLength: number): string => {
  if (!text) return '';
  return text.trim().slice(0, maxLength);
};
