// FileSystemMonitor.js - Implements file change watching for the impact tracking system
import chokidar from 'chokidar';
import path from 'path';
import { EventEmitter } from 'events';
import { createLogger } from '@whatsfresh/shared-imports';

const log = createLogger('FileSystemMonitor');

/**
 * Monitors file system changes across the monorepo
 * Emits events for file changes, additions, and deletions
 * @implements {FileChangeEmitter} from types.js
 */
class FileSystemMonitor extends EventEmitter {
    /**
     * @param {Object} config - Configuration options
     * @param {string[]} config.watchPaths - Paths to watch for changes
     * @param {string[]} config.excludePatterns - Patterns to exclude (glob patterns)
     * @param {number} config.debounceMs - Debounce time in milliseconds
     */
    constructor(config = {}) {
        super();
        this.config = {
            watchPaths: config.watchPaths || [],
            excludePatterns: config.excludePatterns || [
                '**/node_modules/**',
                '**/.git/**',
                '**/dist/**',
                '**/*.log',
                '**/build/**',
                '**/.DS_Store'
            ],
            debounceMs: config.debounceMs || 1000,
        };

        this.watcher = null;
        this.isWatching = false;
        this.monorepoRoot = config.monorepoRoot || process.cwd();

        log.debug('Created FileSystemMonitor with config:', this.config);
    }

    /**
     * Start watching for file changes
     */
    start() {
        if (this.isWatching) {
            log.warn('FileSystemMonitor already started');
            return;
        }

        if (!this.config.watchPaths.length) {
            log.error('No watch paths configured');
            throw new Error('No watch paths configured');
        }

        try {
            log.info('Starting file system monitoring for paths:', this.config.watchPaths);

            // Initialize chokidar watcher
            this.watcher = chokidar.watch(this.config.watchPaths, {
                ignored: this.config.excludePatterns,
                persistent: true,
                ignoreInitial: true,
                awaitWriteFinish: {
                    stabilityThreshold: this.config.debounceMs,
                    pollInterval: 100
                }
            });

            // Set up event handlers with proper debounce
            this.watcher
                .on('add', path => this.handleFileEvent('add', path))
                .on('change', path => this.handleFileEvent('change', path))
                .on('unlink', path => this.handleFileEvent('unlink', path))
                .on('error', error => {
                    log.error('Watcher error:', error);
                    this.emit('error', error);
                });

            this.isWatching = true;
            log.info('File system monitoring started');
        } catch (error) {
            log.error('Failed to start file system monitoring:', error);
            throw error;
        }
    }

    /**
     * Stop watching for file changes
     */
    stop() {
        if (!this.isWatching || !this.watcher) {
            log.warn('FileSystemMonitor not started');
            return;
        }

        try {
            this.watcher.close();
            this.watcher = null;
            this.isWatching = false;
            log.info('File system monitoring stopped');
        } catch (error) {
            log.error('Error stopping file system monitoring:', error);
            throw error;
        }
    }

    /**
     * Handle file events and emit standardized FileChangeEvent objects
     * @param {string} eventType - The type of event (add, change, unlink)
     * @param {string} filePath - Absolute path to the changed file
     */
    handleFileEvent(eventType, filePath) {
        try {
            const relativePath = path.relative(this.monorepoRoot, filePath);

            // Create standardized event object
            const fileChangeEvent = {
                type: eventType,
                filePath: filePath,
                relativePath: relativePath,
                timestamp: new Date().toISOString(),
                fileName: path.basename(filePath),
                fileExt: path.extname(filePath)
            };

            log.debug(`File ${eventType} detected:`, relativePath);

            // Emit both specific and general events
            this.emit(eventType, fileChangeEvent);
            this.emit('change', fileChangeEvent);
        } catch (error) {
            log.error(`Error handling ${eventType} event for ${filePath}:`, error);
        }
    }

    /**
     * Utility method to check if a file should be excluded
     * @param {string} filePath - Path to check
     * @returns {boolean} - True if file should be excluded
     */
    shouldExcludeFile(filePath) {
        // Convert file path to relative path for matching
        const relativePath = path.relative(this.monorepoRoot, filePath);

        // Check against exclude patterns
        for (const pattern of this.config.excludePatterns) {
            // Simple wildcard matching for now
            // In a real implementation, use minimatch or similar for proper glob matching
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
}

export default FileSystemMonitor;