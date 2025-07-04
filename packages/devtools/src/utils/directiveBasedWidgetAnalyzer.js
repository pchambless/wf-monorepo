/**
 * Directive-Based Widget Usage Analyzer
 * Analyzes widget usage by scanning SQL views and directive files
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Extract widget references from SQL comment directives
 * @param {string} content - SQL file content
 * @returns {Array} Array of widget references found
 */
function extractWidgetReferencesFromSQL(content, filePath) {
    const references = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
        // Look for SQL comment directives: -- directive1; directive2; widget:selVndr
        const commentMatch = line.match(/--\s*(.+)/);
        if (commentMatch) {
            const directives = commentMatch[1].split(';').map(d => d.trim());

            directives.forEach(directive => {
                // Look for widget: directives
                const widgetMatch = directive.match(/widget:(\w+)/i);
                if (widgetMatch) {
                    const widgetName = widgetMatch[1];
                    references.push({
                        widget: widgetName,
                        file: filePath,
                        line: index + 1,
                        context: line.trim(),
                        type: 'sql-directive'
                    });
                }

                // Also look for entity: directives and map them to widgets
                const entityMatch = directive.match(/entity:(\w+)/i);
                if (entityMatch) {
                    const entityName = entityMatch[1];
                    const widgetName = mapEntityToWidget(entityName);
                    if (widgetName) {
                        references.push({
                            widget: widgetName,
                            file: filePath,
                            line: index + 1,
                            context: line.trim(),
                            type: 'sql-entity-directive',
                            originalEntity: entityName
                        });
                    }
                }
            });
        }
    });

    return references;
}

/**
 * Map entity names to widget names based on naming conventions
 * @param {string} entityName - Entity name like 'vndrList', 'measList'
 * @returns {string|null} Widget name like 'selVndr', 'selMeas'
 */
function mapEntityToWidget(entityName) {
    // Map entity patterns to widget names
    const entityToWidgetMap = {
        'vndrList': 'selVndr',
        'brndList': 'selBrnd',
        'measList': 'selMeas',
        'ingrList': 'selIngr',
        'prodList': 'selProd',
        'wrkrList': 'selWrkr',
        'acctList': 'selAcct',
        'userAcctList': 'selUserAcct',
        'prodTypeList': 'selProdType',
        'ingrTypeList': 'selIngrType'
    };

    return entityToWidgetMap[entityName] || null;
}

/**
 * Extract widget references from directive JSON files
 * @param {string} content - JSON file content
 * @returns {Array} Array of widget references found
 */
function extractWidgetReferencesFromJSON(content, filePath) {
    const references = [];

    try {
        const data = JSON.parse(content);

        if (data.columns) {
            Object.entries(data.columns).forEach(([fieldName, fieldData]) => {
                if (fieldData.directives && fieldData.directives.widget) {
                    const widgetName = fieldData.directives.widget;
                    references.push({
                        widget: widgetName,
                        file: filePath,
                        field: fieldName,
                        context: `${fieldName}: ${JSON.stringify(fieldData.directives)}`,
                        type: 'directive-json',
                        viewName: data.viewName || path.basename(filePath, '.json')
                    });
                }
            });
        }
    } catch (error) {
        console.warn(`Error parsing JSON file ${filePath}:`, error.message);
    }

    return references;
}

/**
 * Analyze widget usage from directive files and SQL views
 */
export async function analyzeDirectiveBasedWidgetUsage() {
    console.log('🔍 Analyzing widget usage from directives and SQL views...');

    const rootPath = path.resolve(__dirname, '../../../../..');
    const searchPaths = [
        path.join(rootPath, 'sql/views/client'),
        path.join(rootPath, 'sql/views/admin'),
        path.join(__dirname, '../automation/page/directives'),
        path.join(__dirname, '../automation/data/directives')
    ];

    const allReferences = [];

    for (const searchPath of searchPaths) {
        try {
            const files = await fs.readdir(searchPath);

            for (const file of files) {
                const filePath = path.join(searchPath, file);
                const relativePath = path.relative(rootPath, filePath);

                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    let references = [];

                    if (file.endsWith('.sql')) {
                        references = extractWidgetReferencesFromSQL(content, relativePath);
                    } else if (file.endsWith('.json')) {
                        references = extractWidgetReferencesFromJSON(content, relativePath);
                    }

                    allReferences.push(...references);
                } catch (error) {
                    // Skip files that can't be read
                    console.warn(`Could not read ${relativePath}:`, error.message);
                }
            }
        } catch (error) {
            console.warn(`Could not access directory ${searchPath}:`, error.message);
        }
    }

    // Group references by widget
    const widgetUsageMap = {};

    allReferences.forEach(ref => {
        if (!widgetUsageMap[ref.widget]) {
            widgetUsageMap[ref.widget] = {
                widget: ref.widget,
                usages: [],
                summary: {
                    totalUsages: 0,
                    sqlFiles: 0,
                    directiveFiles: 0,
                    views: new Set(),
                    apps: new Set()
                }
            };
        }

        widgetUsageMap[ref.widget].usages.push(ref);

        // Update summary
        const summary = widgetUsageMap[ref.widget].summary;
        summary.totalUsages++;

        if (ref.type.includes('sql')) {
            summary.sqlFiles++;
        } else if (ref.type.includes('json')) {
            summary.directiveFiles++;
        }

        if (ref.viewName) {
            summary.views.add(ref.viewName);
        }

        // Determine app from file path
        if (ref.file.includes('client')) {
            summary.apps.add('client');
        } else if (ref.file.includes('admin')) {
            summary.apps.add('admin');
        }
    });

    // Convert Sets to Arrays in summaries
    Object.values(widgetUsageMap).forEach(widget => {
        widget.summary.views = Array.from(widget.summary.views);
        widget.summary.apps = Array.from(widget.summary.apps);
    });

    console.log(`✅ Found ${allReferences.length} widget references across ${Object.keys(widgetUsageMap).length} widgets`);

    return widgetUsageMap;
}

/**
 * Generate a detailed widget usage report from directives
 */
export async function generateDirectiveBasedUsageReport() {
    const usageMap = await analyzeDirectiveBasedWidgetUsage();

    const reportPath = path.resolve(__dirname, '../../../docs/generated/directive-widget-usage-report.json');

    // Ensure directory exists
    await fs.mkdir(path.dirname(reportPath), { recursive: true });

    await fs.writeFile(reportPath, JSON.stringify(usageMap, null, 2));

    console.log(`📊 Directive-based widget usage report generated: ${reportPath}`);

    // Also generate a human-readable summary
    const summaryPath = path.resolve(__dirname, '../../../docs/generated/directive-widget-usage-summary.md');
    const summaryContent = generateUsageSummaryMarkdown(usageMap);
    await fs.writeFile(summaryPath, summaryContent);

    console.log(`📋 Widget usage summary generated: ${summaryPath}`);

    return usageMap;
}

/**
 * Generate a markdown summary of widget usage
 */
function generateUsageSummaryMarkdown(usageMap) {
    const widgets = Object.values(usageMap).sort((a, b) =>
        b.summary.totalUsages - a.summary.totalUsages
    );

    let markdown = '# Widget Usage Summary\n\n';
    markdown += `Generated on: ${new Date().toISOString()}\n\n`;
    markdown += `Found ${widgets.length} widgets in use across the codebase.\n\n`;

    markdown += '## Widget Usage Overview\n\n';
    markdown += '| Widget | Total Uses | Views | Apps | SQL Files | Directive Files |\n';
    markdown += '|--------|------------|-------|------|-----------|----------------|\n';

    widgets.forEach(widget => {
        const { widget: name, summary } = widget;
        markdown += `| ${name} | ${summary.totalUsages} | ${summary.views.join(', ') || 'none'} | ${summary.apps.join(', ') || 'none'} | ${summary.sqlFiles} | ${summary.directiveFiles} |\n`;
    });

    markdown += '\n## Detailed Usage by Widget\n\n';

    widgets.forEach(widget => {
        const { widget: name, usages } = widget;
        markdown += `### ${name}\n\n`;

        if (usages.length === 0) {
            markdown += 'No usage found.\n\n';
            return;
        }

        markdown += '**Usage locations:**\n\n';
        usages.forEach(usage => {
            markdown += `- **${usage.file}**`;
            if (usage.line) markdown += ` (line ${usage.line})`;
            if (usage.field) markdown += ` - field: ${usage.field}`;
            if (usage.viewName) markdown += ` - view: ${usage.viewName}`;
            markdown += `\n  - Type: ${usage.type}\n`;
            if (usage.originalEntity) markdown += `  - Original entity: ${usage.originalEntity}\n`;
            markdown += `  - Context: \`${usage.context}\`\n\n`;
        });

        markdown += '\n';
    });

    return markdown;
}
