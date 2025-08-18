import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GridEventTypeAnalyzer {
    constructor(app) {
        this.app = app;
        this.eventTypesPath = path.resolve(__dirname, `../../../../packages/shared-imports/src/events/${app}/eventTypes`);
        this.gridEventTypes = [];
        this.fieldMappings = {};
    }

    async analyzeGridEventTypes() {
        console.log(`📋 Analyzing grid eventTypes for ${this.app}...`);

        try {
            // Find all grid eventType files
            await this.loadGridEventTypes();
            
            // Extract qrySQL fields from each grid
            this.extractFieldsFromQueries();
            
            console.log(`✅ Found ${Object.keys(this.fieldMappings).length} grid entities with field mappings`);
            
            return this.fieldMappings;
        } catch (error) {
            console.error(`❌ Failed to analyze grid eventTypes:`, error);
            return {};
        }
    }

    async loadGridEventTypes() {
        const eventTypesDir = path.resolve(this.eventTypesPath);
        console.log(`🔍 Looking for grid eventTypes at: ${eventTypesDir}`);
        
        if (!fs.existsSync(eventTypesDir)) {
            console.warn(`⚠️  EventTypes directory not found: ${eventTypesDir}`);
            console.log(`🔍 Current working directory: ${process.cwd()}`);
            return;
        }

        const files = fs.readdirSync(eventTypesDir);
        
        for (const file of files) {
            if (file.startsWith('grid') && file.endsWith('.js')) {
                try {
                    const filePath = path.join(eventTypesDir, file);
                    const eventTypeModule = await import(`file://${filePath}`);
                    
                    // Get the exported eventType (assuming single export per file)
                    const eventTypeExports = Object.values(eventTypeModule);
                    const eventType = eventTypeExports.find(exp => exp && typeof exp === 'object' && exp.eventType);
                    
                    if (eventType) {
                        console.log(`📄 Loaded grid eventType: ${eventType.eventType}`);
                        this.gridEventTypes.push({
                            ...eventType,
                            filename: file
                        });
                    }
                } catch (error) {
                    console.warn(`⚠️  Failed to load grid eventType ${file}:`, error.message);
                }
            }
        }
    }

    extractFieldsFromQueries() {
        for (const gridEvent of this.gridEventTypes) {
            if (gridEvent && gridEvent.category === 'grid' && gridEvent.qrySQL) {
                console.log(`\n🔍 Processing ${gridEvent.eventType}:`);
                console.log(`📄 SQL:${gridEvent.qrySQL}`);
                
                try {
                    const fields = this.parseSelectFields(gridEvent.qrySQL);
                    const operations = this.analyzeSupportedOperations(gridEvent.workflows || []);
                    
                    // Map to table name (remove 'grid' prefix and make plural/singular as needed)
                    const tableName = this.getTableNameFromEventType(gridEvent.eventType, gridEvent.dbTable);
                    
                    this.fieldMappings[tableName] = {
                        fields: fields,
                        eventType: gridEvent.eventType,
                        category: gridEvent.category,
                        dbTable: gridEvent.dbTable,
                        supportedOperations: operations,
                        workflows: gridEvent.workflows || [],
                        navChildren: gridEvent.navChildren || [],
                        selWidget: gridEvent.selWidget || null,
                        parentKey: gridEvent.parentKey || null,
                        primaryKey: gridEvent.primaryKey || 'id'
                    };
                    
                    console.log(`✅ Extracted ${fields.length} fields: ${fields.join(', ')}`);
                    console.log(`🔧 Available workflows: ${(gridEvent.workflows || []).join(', ')}`);
                    
                } catch (error) {
                    console.error(`❌ Failed to parse SQL for ${gridEvent.eventType}:`, error.message);
                }
            }
        }
    }

    parseSelectFields(qrySQL) {
        // Clean up the SQL but preserve structure for parsing
        let cleanSQL = qrySQL.trim();
        
        // Find SELECT...FROM pattern (case insensitive, handle line breaks)
        // Use word boundary to avoid matching field names containing "from"
        const selectMatch = cleanSQL.match(/SELECT\s+([\s\S]*?)\s+FROM\b/i);
        if (!selectMatch) {
            throw new Error('No SELECT statement found');
        }
        
        let selectClause = selectMatch[1];
        console.log(`🔍 Raw SELECT clause: "${selectClause}"`);
        
        // Split by comma and clean each field
        const fields = selectClause.split(',')
            .map(field => field.trim())
            .filter(field => field && field !== '*' && field !== '')
            .map(field => {
                // Remove any aliases, comments, or table prefixes
                let cleanField = field.replace(/--.*$/m, '').trim(); // Remove comments
                const parts = cleanField.split(/\s+/);
                const fieldName = parts[0];
                
                // Remove table prefix if exists (e.g., "t.field_name" -> "field_name")
                return fieldName.includes('.') ? fieldName.split('.')[1] : fieldName;
            })
            .filter(field => field && !field.includes('(') && !field.includes(')')); // Remove functions
        
        console.log(`🔍 Parsed fields: [${fields.join(', ')}]`);
        return fields;
    }

    analyzeSupportedOperations(workflows) {
        const operations = {
            CREATE: workflows.some(w => w.includes('create') || w.includes('add')),
            READ: true, // All grids support read
            UPDATE: workflows.some(w => w.includes('update') || w.includes('edit')),
            DELETE: workflows.some(w => w.includes('delete') || w.includes('remove'))
        };
        
        return Object.keys(operations).filter(op => operations[op]);
    }

    getTableNameFromEventType(eventType, dbTable) {
        // If dbTable is specified, use the table part
        if (dbTable) {
            return dbTable.includes('.') ? dbTable.split('.')[1] : dbTable;
        }
        
        // Otherwise derive from eventType (remove 'grid' prefix)
        return eventType.replace(/^grid/, '').toLowerCase();
    }
}

export default GridEventTypeAnalyzer;