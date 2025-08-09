import fs from 'fs';
import path from 'path';
import { createLogger } from '@whatsfresh/shared-imports';

const log = createLogger('ImpactTrackingConfig');

/**
 * Default configuration for impact tracking system
 * @type {Object}
 */
export const defaultConfig = {
    // Root directory of the monorepo
    monorepoRoot: process.cwd(),

    // Paths to watch for file changes (relative to monorepoRoot)
    watchPaths: [
        'packages/shared-imports/src/**/*',
        'apps/wf-client/src/**/*',
        'apps/wf-server/server/**/*',
        'sql/database/**/*'
    ],

    // Patterns to exclude from file watching
    excludePatterns: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/*.log',
        '**/build/**',
        '**/.DS_Store',
        '**/coverage/**'
    ],

    // Backup directory for storing original files before modification
    backupDirectory: '.kiro/impact-tracking/backups',

    // Timing configurations
    debounceMs: 1000,       // Debounce time for file watching
    batchTimeoutMs: 5000,   // Timeout for batching related changes

    // Database configurations
    database: {
        impactsTable: 'api_wf.plan_impacts',
        plansTable: 'api_wf.plans'
    },

    // Automatic impact detection settings
    impactDetection: {
        enableCrossAppAnalysis: true,
        maxFilesPerBatch: 10,
        skipExtensions: ['.log', '.lock', '.md']
    }
};

/**
 * Required configuration fields with validation functions
 * @type {Object}
 */
const requiredFields = {
    monorepoRoot: (value) => typeof value === 'string' && fs.existsSync(value),
    watchPaths: (value) => Array.isArray(value) && value.length > 0,
    backupDirectory: (value) => typeof value === 'string',
    debounceMs: (value) => typeof value === 'number' && value > 0
};

/**
 * Load configuration with environment overrides
 * @param {Object} envOverrides - Environment-specific overrides
 * @returns {Object} - Merged configuration
 */
export function loadConfig(envOverrides = {}) {
    try {
        // Start with default configuration
        let config = { ...defaultConfig };

        // Apply environment variables if available
        if (process.env.WF_MONOREPO_ROOT) {
            config.monorepoRoot = process.env.WF_MONOREPO_ROOT;
        }

        if (process.env.WF_IMPACT_BACKUP_DIR) {
            config.backupDirectory = process.env.WF_IMPACT_BACKUP_DIR;
        }

        if (process.env.WF_IMPACT_DEBOUNCE_MS) {
            config.debounceMs = parseInt(process.env.WF_IMPACT_DEBOUNCE_MS, 10);
        }

        // Apply manual overrides (highest priority)
        config = { ...config, ...envOverrides };

        // Ensure monorepoRoot is absolute
        if (!path.isAbsolute(config.monorepoRoot)) {
            config.monorepoRoot = path.resolve(process.cwd(), config.monorepoRoot);
        }

        // Resolve relative backup directory to absolute path
        if (!path.isAbsolute(config.backupDirectory)) {
            config.backupDirectory = path.resolve(config.monorepoRoot, config.backupDirectory);
        }

        // Validate the configuration
        validateConfig(config);

        log.info('Configuration loaded successfully');
        return config;
    } catch (error) {
        log.error('Failed to load configuration:', error);
        throw error;
    }
}

/**
 * Validate configuration object
 * @param {Object} config - Configuration to validate
 * @throws {Error} If validation fails
 */
export function validateConfig(config) {
    // Check required fields
    for (const [field, validator] of Object.entries(requiredFields)) {
        if (!config[field]) {
            throw new Error(`Missing required configuration field: ${field}`);
        }

        if (!validator(config[field])) {
            throw new Error(`Invalid configuration value for ${field}: ${config[field]}`);
        }
    }

    // Check that monorepoRoot exists
    if (!fs.existsSync(config.monorepoRoot)) {
        throw new Error(`Monorepo root directory does not exist: ${config.monorepoRoot}`);
    }

    return true;
}

/**
 * Create backup directories if they don't exist
 * @param {Object} config - Configuration object
 */
export function setupBackupDirectories(config) {
    try {
        const backupDir = config.backupDirectory;

        if (!fs.existsSync(backupDir)) {
            log.info(`Creating backup directory: ${backupDir}`);
            fs.mkdirSync(backupDir, { recursive: true });
        }

        // Create subdirectories for organization
        const subdirs = ['sql', 'client', 'server', 'shared'];

        for (const subdir of subdirs) {
            const fullPath = path.join(backupDir, subdir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
        }

        log.info('Backup directories set up successfully');
        return true;
    } catch (error) {
        log.error('Failed to set up backup directories:', error);
        throw error;
    }
}

/**
 * Get absolute paths to watch based on config
 * @param {Object} config - Configuration object
 * @returns {Array<string>} - Array of absolute paths
 */
export function getWatchPaths(config) {
    return config.watchPaths.map(watchPath => {
        // If it's already absolute, return as is
        if (path.isAbsolute(watchPath)) {
            return watchPath;
        }

        // Otherwise resolve relative to monorepoRoot
        return path.resolve(config.monorepoRoot, watchPath);
    });
}

/**
 * Check if a file should be excluded based on exclude patterns
 * @param {string} filePath - Path to check
 * @param {Object} config - Configuration object
 * @returns {boolean} - True if file should be excluded
 */
export function shouldExcludeFile(filePath, config) {
    // Convert to relative path for pattern matching
    const relativePath = path.relative(config.monorepoRoot, filePath);

    // Check file extension against skipExtensions
    const fileExt = path.extname(filePath);
    if (config.impactDetection.skipExtensions.includes(fileExt)) {
        return true;
    }

    // Check against exclude patterns
    for (const pattern of config.excludePatterns) {
        // Simple wildcard matching (in real code, use minimatch or similar)
        if (pattern.includes('**')) {
            const parts = pattern.split('**');
            const startsWith = parts[0] ? relativePath.startsWith(parts[0].replace('/', '')) : true;
            const endsWith = parts[1] ? relativePath.endsWith(parts[1].replace('/', '')) : true;
            if (startsWith && endsWith) return true;
        } else if (relativePath === pattern) {
            return true;
        }
    }

    return false;
}

/**
 * Initialize the impact tracking configuration
 * @param {Object} overrides - Optional configuration overrides
 * @returns {Object} - Fully initialized configuration
 */
export function initializeConfig(overrides = {}) {
    // Load configuration with overrides
    const config = loadConfig(overrides);

    // Set up backup directories
    setupBackupDirectories(config);

    log.info('Impact tracking configuration initialized');
    return config;
}

export default {
    defaultConfig,
    loadConfig,
    validateConfig,
    setupBackupDirectories,
    getWatchPaths,
    shouldExcludeFile,
    initializeConfig
};