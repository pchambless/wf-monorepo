/**
 * Get default user email from environment variables
 * Used for dev mode when no session exists
 *
 * Supports both Vite (VITE_) and Create React App (REACT_APP_) env vars
 *
 * @returns {string|undefined} Default user email if configured
 */
export function getDefaultUserEmail() {
  console.log('🔍 Checking for default email...');
  console.log('🔍 typeof import.meta:', typeof import.meta);
  console.log('🔍 typeof process:', typeof process);
  console.log('🔍 process.env:', process.env);
  console.log('🔍 All REACT_APP vars:', Object.keys(process.env || {}).filter(k => k.startsWith('REACT_APP')));

  // Check Vite env first (import.meta.env)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEFAULT_USER_EMAIL) {
    console.log('🔍 Found Vite env:', import.meta.env.VITE_DEFAULT_USER_EMAIL);
    return import.meta.env.VITE_DEFAULT_USER_EMAIL;
  }

  // Check Create React App env (process.env)
  if (typeof process !== 'undefined' && process.env?.REACT_APP_DEFAULT_USER_EMAIL) {
    console.log('🔍 Found CRA env:', process.env.REACT_APP_DEFAULT_USER_EMAIL);
    return process.env.REACT_APP_DEFAULT_USER_EMAIL;
  }

  console.log('🔍 No default email found!');
  return undefined;
}
