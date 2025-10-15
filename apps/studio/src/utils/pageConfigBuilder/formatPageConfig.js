import stringify from 'json-stringify-pretty-compact';

/**
 * Custom JSON formatter for pageConfig
 * Uses json-stringify-pretty-compact to keep small objects on one line
 * - Trigger actions: {"action": "clearVals", "params": [...]}
 * - Column definitions: {"name": "id", "dataType": "int", ...}
 * - Everything else: standard pretty formatting
 */
export const formatPageConfig = (pageConfig) => {
  return stringify(pageConfig, {
    maxLength: 150,
    indent: 2
  });
};
