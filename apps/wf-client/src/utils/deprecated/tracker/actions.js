/**
 * User action types for tracking interactions
 */
export const ACTION_TYPES = {
  ROW_SELECT: 'ROW_SELECT',
  ADD_NEW: 'ADD_NEW',
  SAVE: 'SAVE',
  DELETE: 'DELETE',
  REFRESH: 'REFRESH'
};

/**
 * Track user actions for analytics
 */
export const startUserAction = (actionType, data) => {
  // Add to tracking sequence
  console.debug(`[Tracker] User Action: ${actionType}`, data || '');
  // Future: This will integrate with metrics collection
};
