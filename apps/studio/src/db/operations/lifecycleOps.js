import { db } from '../studioDb.js';
import {
  loadContainerReference,
  loadComponentReference,
  loadTriggerActionReference,
  loadTriggerClassReference,
  loadSQLReference,
  loadEventTypes,
  loadEventSQL,
  loadTriggers
} from '../../utils/referenceLoaders.js';

/**
 * App Startup - Load all master data and references once
 * Called when Studio app first loads
 */
export const initializeApp = async () => {
  console.log('🚀 Initializing Studio app...');

  const results = await Promise.all([
    loadEventTypes(),
    loadEventSQL(),
    loadTriggers(),
    loadContainerReference(),
    loadComponentReference(),
    loadTriggerActionReference(),
    loadTriggerClassReference(),
    loadSQLReference()
  ]);

  const allSuccess = results.every(r => r.success);
  console.log(allSuccess ? '✅ App initialized' : '⚠️ Some data failed to load');

  return { success: allSuccess, results };
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
 * Refresh Container/Component References
 * Called after eventTypes INSERT/UPDATE/DELETE
 */
export const refreshEventTypeReferences = async () => {
  console.log('🔄 Refreshing eventType references...');

  const results = await Promise.all([
    loadContainerReference(),
    loadComponentReference()
  ]);

  const allSuccess = results.every(r => r.success);
  console.log(allSuccess ? '✅ EventType references refreshed' : '⚠️ Some references failed');

  return { success: allSuccess, results };
};

/**
 * Refresh Trigger Action/Class References
 * Called after triggers INSERT/UPDATE/DELETE
 */
export const refreshTriggerReferences = async () => {
  console.log('🔄 Refreshing trigger references...');

  const results = await Promise.all([
    loadTriggerActionReference(),
    loadTriggerClassReference()
  ]);

  const allSuccess = results.every(r => r.success);
  console.log(allSuccess ? '✅ Trigger references refreshed' : '⚠️ Some references failed');

  return { success: allSuccess, results };
};

/**
 * Refresh SQL References
 * Called after eventSQL INSERT/UPDATE/DELETE
 */
export const refreshSQLReferences = async () => {
  console.log('🔄 Refreshing SQL references...');

  const result = await loadSQLReference();

  console.log(result.success ? '✅ SQL references refreshed' : '⚠️ SQL references failed');

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
 */
export const warnBeforeNavigation = async () => {
  const hasChanges = await hasPendingChanges();

  if (hasChanges) {
    return window.confirm(
      'You have unsaved changes. Navigating away will lose these changes. Continue?'
    );
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
