/**
 * Show user feedback message
 */
export async function showNotification(action, data) {
  const message = action.message || 'Operation completed';
  const type = action.type || 'success';

  // For now, use simple alert - can be enhanced with proper notification system
  if (type === 'error') {
    alert(`❌ ${message}`);
  } else {
    alert(`✅ ${message}`);
  }

  console.log(`📢 Notification: ${message} (${type})`);
}