/**
 * Widget Usage Analyzer
 * Scans the codebase to find where widgets are actually used
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple widget registry for analysis (avoids JSX import issues)
const ANALYSIS_WIDGET_REGISTRY = {
    // CRUD Widgets
    'crudTbl': { component: 'CrudTbl', category: 'crud', description: 'CRUD table with add/edit/delete' },
    'entryForm': { component: 'EntryForm', category: 'crud', description: 'Entity entry form' },
    'entryList': { component: 'EntryList', category: 'crud', description: 'Entity list view' },

    // Select Widgets  
    'selAcct': { component: 'SelAcct', category: 'select', description: 'Account selector' },
    'selBtch': { component: 'SelBtch', category: 'select', description: 'Batch selector' },
    'selBrnd': { component: 'SelBrnd', category: 'select', description: 'Brand selector' },
    'selIngr': { component: 'SelIngr', category: 'select', description: 'Ingredient selector' },
    'selProd': { component: 'SelProd', category: 'select', description: 'Product selector' },
    'selMeas': { component: 'SelMeas', category: 'select', description: 'Measurement selector' },
    'selVndr': { component: 'SelVndr', category: 'select', description: 'Vendor selector' },
    'selWrkr': { component: 'SelWrkr', category: 'select', description: 'Worker selector' },
    'selRcpe': { component: 'SelRcpe', category: 'select', description: 'Recipe selector' },

    // Recent Item Widgets
    'rcntAcct': { component: 'RcntAcct', category: 'recent', description: 'Recent accounts' },
    'rcntBtch': { component: 'RcntBtch', category: 'recent', description: 'Recent batches' },
    'rcntBrnd': { component: 'RcntBrnd', category: 'recent', description: 'Recent brands' },
    'rcntIngr': { component: 'RcntIngr', category: 'recent', description: 'Recent ingredients' },
    'rcntProd': { component: 'RcntProd', category: 'recent', description: 'Recent products' },
    'rcntIngrBtch': { component: 'RcntIngrBtch', category: 'recent', description: 'Recent ingredient batches' },
    'rcntProdBtch': { component: 'RcntProdBtch', category: 'recent', description: 'Recent product batches' },

    // Display Widgets
    'dispAcct': { component: 'DispAcct', category: 'display', description: 'Account display' },
    'dispBtch': { component: 'DispBtch', category: 'display', description: 'Batch display' },
    'dispBrnd': { component: 'DispBrnd', category: 'display', description: 'Brand display' },
    'dispIngr': { component: 'DispIngr', category: 'display', description: 'Ingredient display' },
    'dispProd': { component: 'DispProd', category: 'display', description: 'Product display' },
    'dispMeas': { component: 'DispMeas', category: 'display', description: 'Measurement display' },
    'dispVndr': { component: 'DispVndr', category: 'display', description: 'Vendor display' },
    'dispWrkr': { component: 'DispWrkr', category: 'display', description: 'Worker display' },
    'dispRcpe': { component: 'DispRcpe', category: 'display', description: 'Recipe display' },

    // Form Widgets
    'formAcct': { component: 'FormAcct', category: 'form', description: 'Account form' },
    'formBtch': { component: 'FormBtch', category: 'form', description: 'Batch form' },
    'formBrnd': { component: 'FormBrnd', category: 'form', description: 'Brand form' },
    'formIngr': { component: 'FormIngr', category: 'form', description: 'Ingredient form' },
    'formProd': { component: 'FormProd', category: 'form', description: 'Product form' },
    'formMeas': { component: 'FormMeas', category: 'form', description: 'Measurement form' },
    'formVndr': { component: 'FormVndr', category: 'form', description: 'Vendor form' },
    'formWrkr': { component: 'FormWrkr', category: 'form', description: 'Worker form' },
    'formRcpe': { component: 'FormRcpe', category: 'form', description: 'Recipe form' }
};

/**
 * Search for widget usage in the codebase
 * @param {string} searchPath - Root path to search
 * @param {string} widgetId - Widget ID to search for
 * @returns {Array} Array of usage locations
 */
async function findWidgetUsage(searchPath, widgetId) {
    const usageLocations = [];

    try {
        await searchInDirectory(searchPath, widgetId, usageLocations);
    } catch (error) {
        console.warn(`Error searching ${searchPath}:`, error.message);
    }

    return usageLocations;
}

/**
 * Recursively search for widget usage in a directory
 */
async function searchInDirectory(dirPath, widgetId, usageLocations) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            // Skip node_modules, .git, build directories
            if (['node_modules', '.git', 'build', 'dist', '.next'].includes(entry.name)) {
                continue;
            }
            await searchInDirectory(fullPath, widgetId, usageLocations);
        } else if (entry.isFile()) {
            // Only search in relevant file types
            if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
                await searchInFile(fullPath, widgetId, usageLocations);
            }
        }
    }
}

/**
 * Search for widget usage in a specific file
 */
async function searchInFile(filePath, widgetId, usageLocations) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const widget = ANALYSIS_WIDGET_REGISTRY[widgetId];
        if (!widget) return;

        const searchPatterns = [
            // Component usage: <SelVndr, <selVndr
            new RegExp(`<${widget.component}[\\s/>]`, 'g'),
            new RegExp(`<${widgetId}[\\s/>]`, 'g'),
            // Import statements
            new RegExp(`import.*\\{[^}]*${widget.component}[^}]*\\}.*from`, 'g'),
            new RegExp(`import.*\\{[^}]*${widgetId}[^}]*\\}.*from`, 'g'),
            // Direct references
            new RegExp(`\\b${widget.component}\\b`, 'g'),
            new RegExp(`\\b${widgetId}\\b`, 'g')
        ];

        const lines = content.split('\\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNum = i + 1;

            for (const pattern of searchPatterns) {
                if (pattern.test(line)) {
                    usageLocations.push({
                        file: filePath,
                        line: lineNum,
                        content: line.trim(),
                        type: determineUsageType(filePath, line)
                    });
                    break; // Only count one match per line
                }
            }
        }
    } catch (error) {
        // Ignore file read errors (permissions, binary files, etc.)
    }
}

/**
 * Determine the type of usage based on file path and line content
 */
function determineUsageType(filePath, lineContent) {
    if (lineContent.includes('import')) return 'import';
    if (lineContent.includes('<')) return 'component';
    if (filePath.includes('pageMap')) return 'pageMap';
    if (filePath.includes('pages/') || filePath.includes('components/')) return 'usage';
    return 'reference';
}

/**
 * Analyze widget usage across the entire codebase
 */
export async function analyzeWidgetUsage() {
    console.log('🔍 Analyzing widget usage across codebase...');

    const rootPath = path.resolve(__dirname, '../../../../../');
    const searchPaths = [
        path.join(rootPath, 'apps'),
        path.join(rootPath, 'packages/shared-ui/src'),
        path.join(rootPath, 'packages/shared-config/src')
    ];

    const widgetUsageMap = {};

    for (const [widgetId, widget] of Object.entries(ANALYSIS_WIDGET_REGISTRY)) {
        console.log(`  📊 Analyzing usage for ${widgetId}...`);

        const allUsages = [];

        // Search in all specified paths
        for (const searchPath of searchPaths) {
            try {
                const usages = await findWidgetUsage(searchPath, widgetId);
                allUsages.push(...usages);
            } catch (error) {
                console.warn(`Could not search ${searchPath}:`, error.message);
            }
        }

        // Group and clean up results
        const cleanedUsages = cleanupUsageResults(allUsages, rootPath);

        widgetUsageMap[widgetId] = {
            widget,
            usages: cleanedUsages,
            summary: generateUsageSummary(cleanedUsages)
        };
    }

    console.log(`✅ Widget usage analysis complete. Found usage data for ${Object.keys(widgetUsageMap).length} widgets.`);
    return widgetUsageMap;
}

/**
 * Clean up and deduplicate usage results
 */
function cleanupUsageResults(usages, rootPath) {
    const seen = new Set();
    const cleaned = [];

    for (const usage of usages) {
        // Make file path relative to root
        const relativePath = path.relative(rootPath, usage.file);
        const key = `${relativePath}:${usage.line}`;

        if (!seen.has(key)) {
            seen.add(key);
            cleaned.push({
                ...usage,
                file: relativePath,
                app: determineApp(relativePath),
                component: determineComponent(relativePath)
            });
        }
    }

    return cleaned.sort((a, b) => a.file.localeCompare(b.file));
}

/**
 * Determine which app a file belongs to
 */
function determineApp(filePath) {
    if (filePath.includes('apps/wf-client/')) return 'client';
    if (filePath.includes('apps/wf-admin/')) return 'admin';
    if (filePath.includes('apps/wf-server/')) return 'server';
    if (filePath.includes('packages/')) return 'shared';
    return 'unknown';
}

/**
 * Determine component/page name from file path
 */
function determineComponent(filePath) {
    // Extract meaningful component name from path
    const parts = filePath.split('/');

    // For pages
    if (parts.includes('pages')) {
        const pageIndex = parts.indexOf('pages');
        if (pageIndex + 1 < parts.length) {
            return parts[pageIndex + 1];
        }
    }

    // For components
    if (parts.includes('components')) {
        const filename = parts[parts.length - 1];
        return filename.replace(/\.(js|jsx|ts|tsx)$/, '');
    }

    // Default to filename
    const filename = parts[parts.length - 1];
    return filename.replace(/\.(js|jsx|ts|tsx)$/, '');
}

/**
 * Generate a summary of widget usage
 */
function generateUsageSummary(usages) {
    const apps = new Set();
    const components = new Set();
    const pageCount = usages.filter(u => u.file.includes('pages/')).length;
    const componentCount = usages.filter(u => u.file.includes('components/')).length;

    usages.forEach(usage => {
        apps.add(usage.app);
        components.add(usage.component);
    });

    return {
        totalUsages: usages.length,
        apps: Array.from(apps).filter(app => app !== 'unknown'),
        components: Array.from(components),
        pageUsages: pageCount,
        componentUsages: componentCount
    };
}

/**
 * Generate widget usage report as JSON
 */
export async function generateWidgetUsageReport() {
    const usageMap = await analyzeWidgetUsage();

    const reportPath = path.resolve(__dirname, '../../../docs/generated/widget-usage-report.json');
    await fs.writeFile(reportPath, JSON.stringify(usageMap, null, 2));

    console.log(`📊 Widget usage report generated: ${reportPath}`);
    return usageMap;
}
