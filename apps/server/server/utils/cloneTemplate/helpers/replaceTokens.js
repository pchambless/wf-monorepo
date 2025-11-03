/**
 * Token replacement utilities for template cloning
 */

/**
 * Replace {pageName} tokens in strings
 * @param {string} str - String with tokens
 * @param {string} pageName - Page name to replace tokens with
 * @returns {string} String with tokens replaced
 */
export function replaceTokens(str, pageName) {
  if (!str) return str;
  return str.replace(/\{pageName\}/g, pageName);
}

/**
 * Replace tokens in JSON content (for triggers)
 * Recursively handles objects and arrays
 * @param {any} content - JSON content (object, array, or string)
 * @param {string} pageName - Page name to replace tokens with
 * @returns {any} Content with tokens replaced
 */
export function replaceTokensInJSON(content, pageName) {
  if (!content) return content;

  // If content is a string, try to parse it
  let obj = content;
  if (typeof content === 'string') {
    try {
      obj = JSON.parse(content);
    } catch (e) {
      // If not JSON, just do string replacement
      return replaceTokens(content, pageName);
    }
  }

  // Recursively replace tokens in object
  const replaced = JSON.stringify(obj);
  const result = replaceTokens(replaced, pageName);

  try {
    return JSON.parse(result);
  } catch (e) {
    return result;
  }
}
