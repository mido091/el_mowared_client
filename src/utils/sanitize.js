import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML or plain text to prevent XSS attacks.
 * @param {string} content - The content to sanitize.
 * @param {object} options - DOMPurify configuration.
 */
export const sanitize = (content, options = {}) => {
  if (!content) return '';
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'li', 'ol'],
    ALLOWED_ATTR: [],
    ...options
  });
};

/**
 * Escapes plain text for safer display.
 */
export const escapeText = (text) => {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};
