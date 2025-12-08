/**
 * Navigate to URL via browser navigation
 */
export async function navigate(content, context) {
  // content is the URL to navigate to
  window.location.href = content;
}