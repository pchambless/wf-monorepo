import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SelectEventTypeAnalyzer {
    constructor(app) {
        this.app = app;
        this.eventTypesPath = path.resolve(__dirname, `../../../../packages/shared-imports/src/events/${app}/eventTypes`);
        this.selectEventTypes = [];
        this.fieldMappings = {};
    }

    async analyzeSelectEventTypes() {
        console.log(`📋 Analyzing select eventTypes for ${this.app}...`);

        try {
            // Find all select eventType files
            await this.loadSelectEventTypes();
            
            // Extract fields from selects (either SQL or config-based)
            this.extractFieldsFromSelects();
            
            console.log(`✅ Found ${Object.keys(this.fieldMappings).length} select entities with field mappings`);
            
            return this.fieldMappings;
        } catch (error) {
            console.error(`❌ Failed to analyze select eventTypes:`, error);
            return {};
        }
    }

    async loadSelectEventTypes() {
        const eventTypesDir = path.resolve(this.eventTypesPath);
        console.log(`🔍 Looking for select eventTypes at: ${eventTypesDir}`);
        
        if (!fs.existsSync(eventTypesDir)) {
            console.warn(`⚠️  EventTypes directory not found: ${eventTypesDir}`);
            console.log(`🔍 Current working directory: ${process.cwd()}`);
            return;
        }

        const files = fs.readdirSync(eventTypesDir);
        
        for (const file of files) {
            if (file.startsWith('select') && file.endsWith('.js')) {
                try {
                    const filePath = path.join(eventTypesDir, file);
                    const eventTypeModule = await import(`file://${filePath}`);
                    
                    // Get the exported eventType (assuming single export per file)
                    const eventTypeExports = Object.values(eventTypeModule);
                    const eventType = eventTypeExports.find(exp => exp && typeof exp === 'object' && exp.eventType);
                    
                    if (eventType) {
                        console.log(`📄 Loaded select eventType: ${eventType.eventType}`);
                        this.selectEventTypes.push({
                            ...eventType,
                            filename: file
                        });
                    }
                } catch (error) {
                    console.warn(`⚠️  Failed to load select eventType ${file}:`, error.message);
                }
            }
        }
    }

    extractFieldsFromSelects() {
        for (const selectEvent of this.selectEventTypes) {
            if (selectEvent && (selectEvent.category === 'ui:Select' || selectEvent.category === 'select')) {
                console.log(`\n🔍 Processing ${selectEvent.eventType}:`);
                
                try {
                    let fields = [];
                    let method = 'UNKNOWN';
                    
                    // Handle different select types
                    if (selectEvent.qrySQL) {
                        // SQL-based select
                        console.log(`📄 SQL:${selectEvent.qrySQL}`);
                        fields = this.parseSelectFields(selectEvent.qrySQL);
                        method = 'SQL';
                    } else if (selectEvent.method === 'CONFIG' && selectEvent.configKey) {
                        // Config-based select
                        console.log(`📄 Config-based: ${selectEvent.configKey}`);
                        fields = ['value', 'label']; // Standard config select fields
                        method = 'CONFIG';
                    } else if (selectEvent.options) {
                        // Static options select
                        console.log(`📄 Static options provided`);
                        fields = ['value', 'label']; // Standard options fields
                        method = 'STATIC';
                    }
                    
                    // Map to table/config name
                    const entityName = this.getEntityNameFromEventType(selectEvent.eventType, selectEvent.configKey);
                    
                    this.fieldMappings[entityName] = {
                        fields: fields,
                        eventType: selectEvent.eventType,
                        category: selectEvent.category,
                        method: method,
                        configKey: selectEvent.configKey || null,
                        dbTable: selectEvent.dbTable || null,
                        options: selectEvent.options || null,
                        primaryKey: selectEvent.primaryKey || 'value'
                    };
                    
                    console.log(`✅ Extracted ${fields.length} fields: ${fields.join(', ')}`);
                    console.log(`🔧 Method: ${method}`);
                    
                } catch (error) {
                    console.error(`❌ Failed to parse select for ${selectEvent.eventType}:`, error.message);
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
                
                // Handle AS aliases (e.g., "field_name AS label")
                if (cleanField.includes(' AS ')) {
                    const parts = cleanField.split(' AS ');
                    return parts[1].trim(); // Use the alias
                }
                
                const parts = cleanField.split(/\s+/);
                const fieldName = parts[0];
                
                // Remove table prefix if exists (e.g., "t.field_name" -> "field_name")
                return fieldName.includes('.') ? fieldName.split('.')[1] : fieldName;
            })
            .filter(field => field && !field.includes('(') && !field.includes(')')); // Remove functions
        
        console.log(`🔍 Parsed fields: [${fields.join(', ')}]`);
        return fields;
    }

    getEntityNameFromEventType(eventType, configKey) {
        // Use configKey if available (e.g., "planStatus")
        if (configKey) {
            return configKey;
        }
        
        // Otherwise derive from eventType (remove 'select' prefix)
        return eventType.replace(/^select/, '').toLowerCase();
    }
}

export default SelectEventTypeAnalyzer;