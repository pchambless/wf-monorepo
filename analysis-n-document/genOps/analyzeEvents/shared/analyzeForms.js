import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FormEventTypeAnalyzer {
    constructor(app) {
        this.app = app;
        this.eventTypesPath = path.resolve(__dirname, `../../../../packages/shared-imports/src/events/${app}/eventTypes`);
        this.formEventTypes = [];
        this.fieldMappings = {};
    }

    async analyzeFormEventTypes() {
        console.log(`📋 Analyzing form eventTypes for ${this.app}...`);

        try {
            // Find all form eventType files
            await this.loadFormEventTypes();
            
            // Extract qrySQL fields from each form
            this.extractFieldsFromQueries();
            
            console.log(`✅ Found ${Object.keys(this.fieldMappings).length} form entities with field mappings`);
            
            return this.fieldMappings;
        } catch (error) {
            console.error(`❌ Failed to analyze form eventTypes:`, error);
            return {};
        }
    }

    async loadFormEventTypes() {
        const eventTypesDir = path.resolve(this.eventTypesPath);
        console.log(`🔍 Looking for eventTypes at: ${eventTypesDir}`);
        
        if (!fs.existsSync(eventTypesDir)) {
            console.warn(`⚠️  EventTypes directory not found: ${eventTypesDir}`);
            console.log(`🔍 Current working directory: ${process.cwd()}`);
            return;
        }

        const files = fs.readdirSync(eventTypesDir);
        
        for (const file of files) {
            if (file.startsWith('form') && file.endsWith('.js')) {
                try {
                    const filePath = path.join(eventTypesDir, file);
                    const module = await import(filePath);
                    
                    // Extract the eventType object
                    const eventTypeKey = Object.keys(module)[0];
                    const eventType = module[eventTypeKey];
                    
                    if (eventType && eventType.category === 'form' && eventType.qrySQL) {
                        this.formEventTypes.push({
                            filename: file,
                            eventType: eventType.eventType,
                            dbTable: eventType.dbTable,
                            qrySQL: eventType.qrySQL,
                            primaryKey: eventType.primaryKey || 'id',
                            workflowTriggers: eventType.workflowTriggers || {}
                        });
                        
                        console.log(`📄 Loaded form eventType: ${eventType.eventType}`);
                    }
                } catch (error) {
                    console.warn(`⚠️  Failed to load ${file}:`, error.message);
                }
            }
        }
    }

    extractFieldsFromQueries() {
        for (const formEvent of this.formEventTypes) {
            try {
                console.log(`\n🔍 Processing ${formEvent.eventType}:`);
                console.log(`📄 SQL:\n${formEvent.qrySQL}`);
                
                const fields = this.parseSelectFields(formEvent.qrySQL);
                const entityName = this.deriveEntityName(formEvent.dbTable);
                
                // Analyze supported CRUD operations from workflowTriggers
                const supportedOperations = this.analyzeSupportedOperations(formEvent.workflowTriggers);
                
                this.fieldMappings[entityName] = {
                    eventType: formEvent.eventType,
                    dbTable: formEvent.dbTable,
                    primaryKey: formEvent.primaryKey,
                    fields: fields,
                    originalQuery: formEvent.qrySQL.trim(),
                    workflowTriggers: formEvent.workflowTriggers,
                    supportedOperations: supportedOperations
                };
                
                const opsList = Object.entries(supportedOperations)
                    .filter(([op, supported]) => supported)
                    .map(([op, supported]) => op.toUpperCase());
                    
                console.log(`✅ Extracted ${fields.length} fields: ${fields.join(', ')}`);
                console.log(`🔧 Supported operations: ${opsList.join(', ')}`);
                
            } catch (error) {
                console.warn(`⚠️  Failed to parse SQL for ${formEvent.eventType}:`, error.message);
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

    analyzeSupportedOperations(workflowTriggers) {
        const operations = {
            create: false,
            read: false,
            update: false,
            delete: false
        };
        
        // Check for create operations
        if (workflowTriggers.onCreate || workflowTriggers.onInsert) {
            operations.create = true;
        }
        
        // Check for read operations  
        if (workflowTriggers.onSelect || workflowTriggers.onLoad || workflowTriggers.onRead) {
            operations.read = true;
        }
        
        // Check for update operations
        if (workflowTriggers.onUpdate || workflowTriggers.onModify || workflowTriggers.onEdit) {
            operations.update = true;
        }
        
        // Check for delete operations
        if (workflowTriggers.onDelete || workflowTriggers.onRemove || workflowTriggers.onDestroy) {
            operations.delete = true;
        }
        
        return operations;
    }

    deriveEntityName(dbTable) {
        // Convert "api_wf.plan_communications" -> "plan_communications"
        // Convert "api_wf.plans" -> "plans"
        let entityName = dbTable.split('.').pop();
        
        // Handle inconsistent naming between schema and form eventTypes
        if (entityName === 'plans_communications') {
            entityName = 'plan_communications';
        } else if (entityName === 'plans_impacts') {
            entityName = 'plan_impacts';
        }
        
        return entityName;
    }

    generateSummary() {
        const entities = Object.keys(this.fieldMappings);
        const totalFields = Object.values(this.fieldMappings).reduce((sum, entity) => sum + entity.fields.length, 0);
        
        return {
            app: this.app,
            totalFormEventTypes: this.formEventTypes.length,
            totalEntities: entities.length,
            totalFieldsUsedInForms: totalFields,
            entities: entities,
            timestamp: new Date().toISOString()
        };
    }

    async writeOutput() {
        const outputDir = `../apps/${this.app}/output`;
        
        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Write field mappings
        const outputPath = path.join(outputDir, 'form-field-mappings.json');
        fs.writeFileSync(outputPath, JSON.stringify({
            summary: this.generateSummary(),
            fieldMappings: this.fieldMappings
        }, null, 2));
        
        console.log(`📁 Wrote form field mappings to: ${outputPath}`);
    }
}