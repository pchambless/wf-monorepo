/**
 * Non-JSX version of auth module for server-side use
 * Use this file when importing from server contexts to avoid JSX parsing issues
 */

// Simple auth utilities with no JSX
export function isAuthenticated() {
    return false; // Default implementation
}

export function login() {
    return Promise.resolve(false); // Default implementation  
}

export function logout() {
    return Promise.resolve(true); // Default implementation
}

// No React context or provider exports in this server version
