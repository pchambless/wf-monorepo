/**
 * Smart JSON formatter - handles nested JSON strings
 * Detects JSON strings in props and parses them for better readability
 *
 * @param {Object} props - Props object from eventProps
 * @returns {string} - Formatted JSON string with nested objects parsed
 *
 * Example:
 * Input:  { fields: "[\n  {\"name\": \"id\"}\n]" }
 * Output: { fields: [{ name: "id" }] }
 */
export const formatPropsForDisplay = (props) => {
  if (!props) return '{}';

  const formatted = {};
  for (const [key, value] of Object.entries(props)) {
    // Try to parse string values as JSON
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        formatted[key] = parsed; // Use parsed object/array
      } catch {
        formatted[key] = value; // Keep as string if not valid JSON
      }
    } else {
      formatted[key] = value;
    }
  }
  return JSON.stringify(formatted, null, 2);
};

/**
 * Parse props object - converts JSON strings to objects
 * Useful for editing/processing props
 *
 * @param {Object} props - Props object from eventProps
 * @returns {Object} - Props with nested JSON parsed
 */
export const parseProps = (props) => {
  if (!props) return {};

  const parsed = {};
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') {
      try {
        parsed[key] = JSON.parse(value);
      } catch {
        parsed[key] = value;
      }
    } else {
      parsed[key] = value;
    }
  }
  return parsed;
};
