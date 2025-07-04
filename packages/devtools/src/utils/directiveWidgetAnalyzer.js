/**
 * Directive-Based Widget Usage Analyzer
 * Analyzes SQL directives to determine widget usage across entities
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Analyze widget usage from SQL directives
 */
export async function analyzeDirectiveWidgetUsage() {
    console.log('🔍 Analyzing widget usage from SQL directives...');

    const rootPath = path.resolve(__dirname, '../../../../..');

    // Look for directive sources
    const directiveSources = [
        // SQL views with embedded directives
        path.join(rootPath, 'sql/views/client'),
        path.join(rootPath, 'sql/views/admin'),
        // Generated directive files
        path.join(rootPath, 'packages/shared-config/src/client/directives'),
        path.join(rootPath, 'packages/shared-config/src/admin/directives'),
        // DevTools generated directives
        path.join(rootPath, 'packages/devtools/src/automation/page/directives'),
        // App-specific directive files if they exist
        path.join(rootPath, 'apps/wf-client/src/config/directives'),
        path.join(rootPath, 'apps/wf-admin/src/config/directives')
    ];

    const widgetUsageMap = {};

    for (const sourcePath of directiveSources) {
        try {
            await analyzeDirectivesInPath(sourcePath, widgetUsageMap, rootPath);
        } catch (error) {
            // Path might not exist, that's okay
            console.log(`  ⏭️  Skipping ${sourcePath} (not found)`);
        }
    }

    // Convert to final format
    const finalUsageMap = processUsageResults(widgetUsageMap);

    console.log(`✅ Directive analysis complete. Found ${Object.keys(finalUsageMap).length} widgets in use.`);
    return finalUsageMap;
}

/**
 * Analyze directives in a specific path
 */
async function analyzeDirectivesInPath(dirPath, usageMap, rootPath) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            await analyzeDirectivesInPath(fullPath, usageMap, rootPath);
        } else if (entry.isFile()) {
            if (entry.name.endsWith('.sql') || entry.name.endsWith('.json')) {
                await analyzeFileDirectives(fullPath, usageMap, rootPath);
            }
        }
    }
}

/**
 * Analyze directives in a specific file
 */
async function analyzeFileDirectives(filePath, usageMap, rootPath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const relativePath = path.relative(rootPath, filePath);

        let directives = {};

        if (filePath.endsWith('.json')) {
            // Parse JSON directive files
            try {
                directives = JSON.parse(content);
            } catch (error) {
                console.warn(`Warning: Could not parse JSON in ${relativePath}`);
                return;
            }
        } else if (filePath.endsWith('.sql')) {
            // Extract directives from SQL comments
            directives = extractDirectivesFromSQL(content);
        }

        // Find widget usage in the directives
        findWidgetUsageInDirectives(directives, relativePath, usageMap);

    } catch (error) {
        console.warn(`Warning: Could not read ${filePath}:`, error.message);
    }
}

/**
 * Extract directives from SQL comments
 */
function extractDirectivesFromSQL(sqlContent) {
    const directives = {};
    const lines = sqlContent.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Look for SQL field definitions with directives
        // Pattern: fieldName AS alias -- directive1; directive2:value; directive3
        const fieldMatch = line.match(/(\w+)\s+AS\s+(\w+)\s*--\s*(.+)/i);
        if (fieldMatch) {
            const [, fieldName, alias, directiveString] = fieldMatch;
            const fieldDirectives = parseDirectiveString(directiveString);

            if (Object.keys(fieldDirectives).length > 0) {
                directives[alias] = {
                    fieldName,
                    alias,
                    ...fieldDirectives
                };
            }
        }
    }

    return directives;
}

/**
 * Parse directive string into object
 */
function parseDirectiveString(directiveString) {
    const directives = {};
    const parts = directiveString.split(';');

    for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;

        if (trimmed.includes(':')) {
            const [key, value] = trimmed.split(':');
            directives[key.trim()] = value.trim();
        } else {
            directives[trimmed] = true;
        }
    }

    return directives;
}

/**
 * Find widget usage in parsed directives
 */
function findWidgetUsageInDirectives(directives, filePath, usageMap) {
    const entityName = getEntityNameFromPath(filePath);
    const appType = getAppTypeFromPath(filePath);

    for (const [fieldName, fieldDirectives] of Object.entries(directives)) {
        let widgetId = null;

        // Check for explicit widget directive
        if (fieldDirectives.widget) {
            widgetId = fieldDirectives.widget;
        }
        // Check for entity directive (legacy format) and map to widget
        else if (fieldDirectives.entity) {
            widgetId = mapEntityToWidget(fieldDirectives.entity);
        }
        // For select types without explicit widget, infer from entity
        else if (fieldDirectives.type === 'select' && fieldDirectives.entity) {
            widgetId = mapEntityToWidget(fieldDirectives.entity);
        }

        if (widgetId) {
            if (!usageMap[widgetId]) {
                usageMap[widgetId] = {
                    usages: [],
                    summary: {
                        totalUsages: 0,
                        entities: new Set(),
                        apps: new Set(),
                        fields: new Set()
                    }
                };
            }

            const usage = {
                entity: entityName,
                field: fieldName,
                filePath: filePath,
                app: appType,
                type: 'directive',
                directives: fieldDirectives,
                widgetSource: fieldDirectives.widget ? 'widget' : 'entity'
            };

            usageMap[widgetId].usages.push(usage);
            usageMap[widgetId].summary.totalUsages++;
            usageMap[widgetId].summary.entities.add(entityName);
            usageMap[widgetId].summary.apps.add(appType);
            usageMap[widgetId].summary.fields.add(`${entityName}.${fieldName}`);
        }
    }
}

/**
 * Map entity directive to widget name
 * This maps the legacy entity:entityName format to the corresponding widget
 */
function mapEntityToWidget(entityName) {
    // Common patterns for entity to widget mapping
    const entityToWidgetMap = {
        // Selection widgets
        'measList': 'selMeas',
        'vndrList': 'selVndr',
        'ingrList': 'selIngr',
        'ingrTypeList': 'selIngrType',
        'prodList': 'selProd',
        'prodTypeList': 'selProdType',
        'brndList': 'selBrnd',
        'acctList': 'selAcct',
        'userList': 'selUser',
        'wrkrList': 'selWrkr',
        'taskList': 'selTask',
        'rcpeList': 'selRcpe',

        // CRUD table widgets (if the entity ends with List, it's likely a CRUD table)
        'ingrBtchList': 'crudIngrBtch',
        'prodBtchList': 'crudProdBtch',
        'btchMapRcpeList': 'crudBtchMapRcpe'
    };

    // Direct mapping
    if (entityToWidgetMap[entityName]) {
        return entityToWidgetMap[entityName];
    }

    // Pattern-based mapping for entities not in the map
    if (entityName.endsWith('List')) {
        const baseName = entityName.replace('List', '');
        // Try selection widget first
        return `sel${baseName.charAt(0).toUpperCase() + baseName.slice(1)}`;
    }

    // Default fallback
    return `sel${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`;
}

/**
 * Extract entity name from file path
 */
function getEntityNameFromPath(filePath) {
    const filename = path.basename(filePath, path.extname(filePath));
    // Remove common suffixes
    return filename.replace(/List$|View$|Entity$/, '');
}

/**
 * Determine app type from file path
 */
function getAppTypeFromPath(filePath) {
    if (filePath.includes('/client/') || filePath.includes('wf-client')) return 'client';
    if (filePath.includes('/admin/') || filePath.includes('wf-admin')) return 'admin';
    if (filePath.includes('/server/') || filePath.includes('wf-server')) return 'server';
    return 'shared';
}

/**
 * Process usage results into final format
 */
function processUsageResults(usageMap) {
    const finalMap = {};

    for (const [widgetId, data] of Object.entries(usageMap)) {
        finalMap[widgetId] = {
            widget: {
                id: widgetId,
                name: widgetId, // We'll enhance this with actual widget metadata later
                description: `Widget ${widgetId}`,
                component: widgetId
            },
            usages: data.usages,
            summary: {
                totalUsages: data.summary.totalUsages,
                entities: Array.from(data.summary.entities),
                apps: Array.from(data.summary.apps),
                fields: Array.from(data.summary.fields)
            }
        };
    }

    return finalMap;
}

/**
 * Generate directive-based widget usage report
 */
export async function generateDirectiveWidgetReport() {
    console.log('📊 Generating directive-based widget usage report...');

    const usageMap = await analyzeDirectiveWidgetUsage();

    // Ensure output directory exists
    const outputDir = path.resolve(__dirname, '../../../docs/generated');
    await fs.mkdir(outputDir, { recursive: true });

    const reportPath = path.join(outputDir, 'directive-widget-usage.json');
    await fs.writeFile(reportPath, JSON.stringify(usageMap, null, 2));

    console.log(`📊 Directive widget usage report generated: ${reportPath}`);

    // Also generate a summary report
    const summaryPath = path.join(outputDir, 'directive-widget-summary.json');
    const summary = generateUsageSummary(usageMap);
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

    console.log(`📋 Widget usage summary generated: ${summaryPath}`);

    return usageMap;
}

/**
 * Generate usage summary statistics
 */
function generateUsageSummary(usageMap) {
    const summary = {
        totalWidgets: Object.keys(usageMap).length,
        totalUsages: 0,
        entitiesByWidget: {},
        appsByWidget: {},
        mostUsedWidgets: [],
        widgetsByApp: { client: [], admin: [], shared: [] }
    };

    const widgetUsageCount = [];

    for (const [widgetId, data] of Object.entries(usageMap)) {
        summary.totalUsages += data.summary.totalUsages;
        summary.entitiesByWidget[widgetId] = data.summary.entities;
        summary.appsByWidget[widgetId] = data.summary.apps;

        widgetUsageCount.push({
            widget: widgetId,
            count: data.summary.totalUsages,
            entities: data.summary.entities.length,
            apps: data.summary.apps
        });

        // Categorize by app
        for (const app of data.summary.apps) {
            if (summary.widgetsByApp[app]) {
                summary.widgetsByApp[app].push(widgetId);
            }
        }
    }

    // Sort by usage count
    summary.mostUsedWidgets = widgetUsageCount
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    return summary;
}
