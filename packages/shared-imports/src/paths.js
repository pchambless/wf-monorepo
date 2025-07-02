/**
 * Centralized path resolution for the WhatsFresh monorepo
 * Eliminates the ../../../../ madness everywhere
 */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Calculate base paths once - go up from shared-imports/src to packages/, then to targets
const PACKAGES_DIR = path.resolve(__dirname, '../..');
const APPS_DIR = path.resolve(PACKAGES_DIR, '../apps');

/**
 * Absolute paths to all shared packages
 */
export const packagePaths = {
  sharedConfig: path.join(PACKAGES_DIR, 'shared-config/src'),
  sharedUI: path.join(PACKAGES_DIR, 'shared-ui/src'),
  sharedEvents: path.join(PACKAGES_DIR, 'shared-events/src'),
  devtools: path.join(PACKAGES_DIR, 'devtools/src'),
  sharedImports: path.join(PACKAGES_DIR, 'shared-imports/src')
};

/**
 * Absolute paths to all apps
 */
export const appPaths = {
  client: path.join(APPS_DIR, 'wf-client/src'),
  server: path.join(APPS_DIR, 'wf-server/src'),
  admin: path.join(APPS_DIR, 'wf-admin/src')
};

/**
 * Root directories
 */
export const rootPaths = {
  monorepo: path.resolve(PACKAGES_DIR, '..'),
  packages: PACKAGES_DIR,
  apps: APPS_DIR
};

/**
 * Utility function to resolve paths relative to packages
 */
export function resolvePackage(packageName, ...segments) {
  const basePath = packagePaths[packageName];
  if (!basePath) {
    throw new Error(`Unknown package: ${packageName}. Available: ${Object.keys(packagePaths).join(', ')}`);
  }
  return path.join(basePath, ...segments);
}

/**
 * Utility function to resolve paths relative to apps
 */
export function resolveApp(appName, ...segments) {
  const basePath = appPaths[appName];
  if (!basePath) {
    throw new Error(`Unknown app: ${appName}. Available: ${Object.keys(appPaths).join(', ')}`);
  }
  return path.join(basePath, ...segments);
}

// Debug logging
console.log('📦 Shared paths initialized:', {
  packages: Object.keys(packagePaths),
  apps: Object.keys(appPaths),
  root: rootPaths.monorepo
});