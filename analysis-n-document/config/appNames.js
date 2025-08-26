/**
 * App Name Configuration
 * 
 * Maps between different naming conventions in the monorepo.
 * - directoryName: The physical folder name under /apps
 * - packageName: The name in package.json
 * - displayName: Human-readable name for UI
 * - routePrefix: URL path prefix for routing
 */

export const appNameMap = {
    client: {
        directoryName: 'wf-client',
        appPath: '/home/paul/wf-monorepo-new/apps/wf-client',
        packageName: 'wf-client',
        displayName: 'Client Portal',
        routePrefix: '/client'
    },
    admin: {
        directoryName: 'wf-admin',
        appPath: '/home/paul/wf-monorepo-new/apps/wf-admin',
        packageName: 'wf-admin',
        displayName: 'Admin Portal',
        routePrefix: '/admin'
    },
    server: {
        directoryName: 'wf-server',
        appPath: '/home/paul/wf-monorepo-new/apps/wf-server',
        packageName: 'wf-server',
        displayName: 'Server API',
        routePrefix: '/api'
    },
    plans: {
        directoryName: 'wf-plan-management',
        appPath: '/home/paul/wf-monorepo-new/apps/wf-plan-management',
        packageName: 'wf-plan-management',
        displayName: 'Plan Management',
        routePrefix: '/plans'
    }
};

/**
 * Convert from logical app name to directory name
 * @param {string} appName - The logical app name (client, admin, server, plans)
 * @returns {string} The directory name (wf-*)
 */
export function getAppDirectory(appName) {
    return appNameMap[appName]?.directoryName || appName;
}

/**
 * Convert from directory name to logical app name
 * @param {string} dirName - The directory name (wf-*)
 * @returns {string} The logical app name
 */
export function getAppName(dirName) {
    // Strip wf- prefix if it exists
    const normalizedName = dirName.startsWith('wf-') ? dirName : `wf-${dirName}`;

    // Find the app whose directoryName matches
    const entry = Object.entries(appNameMap).find(
        ([_, config]) => config.directoryName === normalizedName
    );

    return entry ? entry[0] : dirName;
}

/**
 * Get package name for an app
 * @param {string} appName - The logical app name
 * @returns {string} The package name
 */
export function getPackageName(appName) {
    return appNameMap[appName]?.packageName || appName;
}

/**
 * Get display name for an app
 * @param {string} appName - The logical app name
 * @returns {string} The display name
 */
export function getDisplayName(appName) {
    return appNameMap[appName]?.displayName || appName;
}

/**
 * Get the list of all app names
 * @returns {string[]} Array of logical app names
 */
export function getAllAppNames() {
    return Object.keys(appNameMap);
}

export default {
    appNameMap,
    getAppDirectory,
    getAppName,
    getPackageName,
    getDisplayName,
    getAllAppNames
};
