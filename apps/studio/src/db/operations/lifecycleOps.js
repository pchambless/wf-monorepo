import { db } from '../studioDb.js';
import {
  loadEventTypes,
  loadEventSQL,
  loadTriggers
} from '../../utils/referenceLoaders.js';

// Prevent multiple simultaneous initialization (React StrictMode calls useEffect twice)
let initializePromise = null;

/**
 * App Startup - Load all master data
 * Called when Studio app first loads
 * Note: ref* tables removed - dropdowns query master tables directly
 */
export const initializeApp = async () => {
  // Return existing promise if already initializing
  if (initializePromise) {
    console.log('⏳ Initialization already in progress, waiting...');
    return initializePromise;
  }

  console.log('🚀 Initializing Studio app...');

  initializePromise = (async () => {
    try {
      const results = await Promise.all([
        loadEventTypes(),
        loadEventSQL(),
        loadTriggers()
      ]);

      const allSuccess = results.every(r => r.success);
      console.log(allSuccess ? '✅ App initialized' : '⚠️ Some data failed to load');

      return { success: allSuccess, results };
    } finally {
      // Clear promise after completion so it can be called again later if needed
      setTimeout(() => { initializePromise = null; }, 100);
    }
  })();

  return initializePromise;
};

/**
 * Clear Working Data - Clear page-specific data
 * Called when:
 * - Navigating to different page
 * - Changing apps
 * - Refreshing URL
 */
export const clearWorkingData = async () => {
  console.log('🧹 Clearing working data...');

  await db.eventComp_xref.clear();
  await db.eventTriggers.clear();
  await db.eventProps.clear();

  console.log('✅ Working data cleared');
};

/**
 * Refresh EventTypes Master Table
 * Called after eventTypes INSERT/UPDATE/DELETE
 * Dropdowns query this table directly - no separate ref* tables needed
 */
export const refreshEventTypeReferences = async () => {
  console.log('🔄 Refreshing eventTypes master table...');
  const result = await loadEventTypes();
  console.log(result.success ? '✅ EventTypes refreshed' : '⚠️ EventTypes refresh failed');
  return result;
};

/**
 * Refresh Triggers Master Table
 * Called after triggers INSERT/UPDATE/DELETE
 * Dropdowns query this table directly - no separate ref* tables needed
 */
export const refreshTriggerReferences = async () => {
  console.log('🔄 Refreshing triggers master table...');
  const result = await loadTriggers();
  console.log(result.success ? '✅ Triggers refreshed' : '⚠️ Triggers refresh failed');
  return result;
};

/**
 * Refresh EventSQL Master Table
 * Called after eventSQL INSERT/UPDATE/DELETE
 * Dropdowns query this table directly - no separate ref* tables needed
 */
export const refreshSQLReferences = async () => {
  console.log('🔄 Refreshing eventSQL master table...');
  const result = await loadEventSQL();
  console.log(result.success ? '✅ EventSQL refreshed' : '⚠️ EventSQL refresh failed');
  return result;
};

/**
 * Check for Pending Changes
 * Returns true if there are unsaved changes in working data
 */
export const hasPendingChanges = async () => {
  const components = await db.eventComp_xref.filter(c => c._dmlMethod !== null).count();
  const triggers = await db.eventTriggers.filter(t => t._dmlMethod !== null).count();
  const props = await db.eventProps.filter(p => p._dmlMethod !== null).count();

  return components > 0 || triggers > 0 || props > 0;
};

/**
 * Warn Before Navigation
 * Check for unsaved changes before clearing working data
 * Offers to save changes before navigating
 */
export const warnBeforeNavigation = async () => {
  const hasChanges = await hasPendingChanges();

  if (hasChanges) {
    const result = window.confirm(
      'You have unsaved changes.\n\nClick OK to save and continue.\nClick Cancel to discard changes and continue anyway.'
    );

    if (result) {
      // User chose to save - sync all pending changes
      const { syncComponents } = await import('./eventComp_xref/index.js');
      const { syncProps } = await import('./eventProps/index.js');
      const { syncTriggers } = await import('./eventTriggers/index.js');

      try {
        const [compResults, propResults, triggerResults] = await Promise.all([
          syncComponents(),
          syncProps(),
          syncTriggers()
        ]);

        const allResults = [...compResults, ...propResults, ...triggerResults];
        const failed = allResults.filter(r => !r.success);

        if (failed.length > 0) {
          alert(`⚠️ Some changes failed to save:\n${failed.map(r => r.error).join('\n')}\n\nNavigating anyway.`);
        } else {
          console.log(`✅ Saved ${allResults.length} changes before navigation`);
        }
      } catch (error) {
        alert(`❌ Failed to save changes: ${error.message}\n\nNavigating anyway.`);
      }
    }

    // Continue navigation regardless (changes saved or discarded)
    return true;
  }

  return true;
};

/**
 * Navigate to Page
 * Safe navigation with change detection
 */
export const navigateToPage = async (pageID, loadPageCallback) => {
  const canNavigate = await warnBeforeNavigation();

  if (!canNavigate) {
    return { success: false, cancelled: true };
  }

  await clearWorkingData();

  // Load new page data
  const result = await loadPageCallback(pageID);

  return result;
};
