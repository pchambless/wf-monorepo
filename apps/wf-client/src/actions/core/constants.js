/**
 * Standard application actions
 * 
 * Organized by functional categories for clearer imports and usage
 */

// Correctly export action types for consistent imports
// Navigation actions
export const NAVIGATION = {
  TAB_SELECT: 'tabSelect',
  PAGE_SELECT: 'pageSelect',
  MODAL_OPEN: 'modalOpen',
  MODAL_CLOSE: 'modalClose',
  DETAIL_NAVIGATE: 'detailNavigate',
  BREADCRUMB_NAVIGATE: 'breadcrumbNavigate',
  BACK_NAVIGATE: 'backNavigate'
};

// Data selection actions
export const SELECTION = {
  ROW_SELECT: 'rowSelect',
  ITEM_SELECT: 'itemSelect',
  FILTER_APPLY: 'filterApply',
  SORT_CHANGE: 'sortChange',
  CONTEXT_CHANGE: 'contextChange'
};

// Form actions
export const FORM = {
  FIELD_CHANGED: 'formFieldChanged',
  SUBMITTED: 'formSubmitted',
  VALIDATED: 'formValidated',
  MODE_CHANGED: 'formModeChanged',
  REFRESHED: 'formRefreshed',
};

// CRUD operations
export const CRUD = {
  ITEM_CREATE: 'itemCreate',
  ITEM_UPDATE: 'itemUpdate',
  ITEM_DELETE: 'itemDelete',
  LIST_REFRESH: 'listRefresh'
};

// UI state actions
export const UI = {
  STATE_CHANGE: 'stateChange',
  LOADING_START: 'loadingStart',
  LOADING_FINISH: 'loadingFinish',
  ERROR_OCCUR: 'errorOccur'
};

// Combined export for convenience
export const ACTIONS = {
  NAVIGATION,
  SELECTION,
  FORM,
  CRUD,
  UI
};

/**
 * Action implementation status metadata
 * This doesn't affect the action constants but provides useful information
 * about which actions are implemented and which are planned for the future
 * 
 * Status:
 * - implemented: Currently in use in the application
 * - inProgress: Being implemented but not fully used
 * - planned: Planned for future implementation
 * - deprecated: No longer recommended for use
 * 
 * Priority:
 * - high: Critical for MVP
 * - medium: Important for good UX
 * - low: Nice to have
 */
export const ACTION_STATUS = {
  // Navigation actions
  [NAVIGATION.TAB_SELECT]: { status: 'implemented', priority: 'high' },
  [NAVIGATION.PAGE_SELECT]: { status: 'planned', priority: 'medium' },
  [NAVIGATION.MODAL_OPEN]: { status: 'planned', priority: 'low' },
  [NAVIGATION.MODAL_CLOSE]: { status: 'planned', priority: 'low' },
  [NAVIGATION.DETAIL_NAVIGATE]: { status: 'planned', priority: 'low' },
  [NAVIGATION.BREADCRUMB_NAVIGATE]: { status: 'planned', priority: 'low' },
  [NAVIGATION.BACK_NAVIGATE]: { status: 'planned', priority: 'low' },
  
  // Selection actions
  [SELECTION.ROW_SELECT]: { status: 'implemented', priority: 'high' },
  [SELECTION.ITEM_SELECT]: { status: 'planned', priority: 'medium' },
  [SELECTION.FILTER_APPLY]: { status: 'planned', priority: 'low' },
  [SELECTION.SORT_CHANGE]: { status: 'planned', priority: 'low' },
  [SELECTION.CONTEXT_CHANGE]: { status: 'planned', priority: 'low' },
  
  // Form actions
  [FORM.FIELD_CHANGED]: { status: 'planned', priority: 'high' },
  [FORM.SUBMITTED]: { status: 'planned', priority: 'high' },
  [FORM.VALIDATED]: { status: 'planned', priority: 'medium' },
  [FORM.MODE_CHANGED]: { status: 'planned', priority: 'low' },
  [FORM.REFRESHED]: { status: 'planned', priority: 'low' },
  
  // CRUD operations
  [CRUD.ITEM_CREATE]: { status: 'planned', priority: 'high' },
  [CRUD.ITEM_UPDATE]: { status: 'planned', priority: 'high' },
  [CRUD.ITEM_DELETE]: { status: 'planned', priority: 'high' },
  [CRUD.LIST_REFRESH]: { status: 'planned', priority: 'high' },
  
  // UI state actions
  [UI.STATE_CHANGE]: { status: 'planned', priority: 'low' },
  [UI.LOADING_START]: { status: 'planned', priority: 'medium' },
  [UI.LOADING_FINISH]: { status: 'planned', priority: 'medium' },
  [UI.ERROR_OCCUR]: { status: 'planned', priority: 'medium' },
};

// Utility function to get actions by status
export const getActionsByStatus = (status) => {
  return Object.entries(ACTION_STATUS)
    .filter(([_, meta]) => meta.status === status)
    .map(([actionType]) => actionType);
};

// Utility function to get actions by priority
export const getActionsByPriority = (priority) => {
  return Object.entries(ACTION_STATUS)
    .filter(([_, meta]) => meta.priority === priority)
    .map(([actionType]) => actionType);
};
