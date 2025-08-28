/**
 * Studio Context Store
 * Simple key-value store for Studio state management
 */

// Studio state container
const studioState = {
  selectedApp: 'plans',
  selectedPage: null,
  selectedEventType: null,
  isDirty: false,
  activeTab: 'componentDetail',
  isLoading: false
};

/**
 * Get value from context store
 */
export function getVal(key) {
  return studioState[key];
}

/**
 * Set value in context store
 */
export function setVal(key, value) {
  studioState[key] = value;
  
  // Optional: trigger re-renders if needed
  if (typeof window !== 'undefined' && window.studioStateChanged) {
    window.studioStateChanged(key, value);
  }
}

/**
 * Get all values (for debugging)
 */
export function getAllVals() {
  return { ...studioState };
}

/**
 * Reset to defaults
 */
export function resetStore() {
  studioState.selectedApp = 'plans';
  studioState.selectedPage = null;
  studioState.selectedEventType = null;
  studioState.isDirty = false;
  studioState.activeTab = 'componentDetail';
  studioState.isLoading = false;
}

export default {
  getVal,
  setVal,
  getAllVals,
  resetStore
};