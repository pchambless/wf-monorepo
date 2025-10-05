/**
 * genFields Workflow - Generate field definitions for eventTypes from SQL schema
 * Follows AUTO-GENERATED + MANUAL CUSTOMIZATION pattern
 */

export class GenFieldsWorkflow {
    constructor() {
        // Schema analyzer will be imported dynamically
        this.schemaAnalyzer = null;
    }

    /**
     * Generate/refresh fields for an eventType based on its qry property
     * @param {string} eventTypePath - Path to eventType file
     * @param {Object} eventTypeData - Current eventType content
     * @returns {Object} Enhanced eventType with generated fields
     */
    async generateFields(eventTypePath, eventTypeData) {
        console.log(`🔄 Generating fields for ${eventTypeData.category} eventType: ${eventTypeData.title}`);
        
        if (!eventTypeData.qry) {
            throw new Error(`EventType ${eventTypePath} missing 'qry' property - cannot generate fields`);
        }

        try {
            // 1. Analyze SQL schema from qry (mock for now)
            const schemaData = await this.mockAnalyzeQuery(eventTypeData.qry);
            
            // 2. Generate fields from schema
            const generatedFields = this.generateFieldsFromSchema(schemaData);
            
            // 3. Merge with existing customizations
            const enhancedFields = this.mergeWithCustomizations(generatedFields, eventTypeData.fieldOverrides || {});
            
            // 4. Create enhanced eventType structure
            const enhancedEventType = {
                ...eventTypeData,
                
                // 🤖 AUTO-GENERATED ZONE - Safe to regenerate
                fields: generatedFields,
                schemaMetadata: {
                    generatedFrom: eventTypeData.qry,
                    generatedAt: new Date().toISOString(),
                    tableName: schemaData.tableName,
                    primaryKey: schemaData.primaryKey
                },
                
                // ✋ MANUAL CUSTOMIZATION ZONE - Preserve existing
                fieldOverrides: eventTypeData.fieldOverrides || {},
                customSections: eventTypeData.customSections || []
            };

            // 5. Track impact (mock for now)
            await this.mockTrackImpact(eventTypePath, eventTypeData.qry);

            console.log(`✅ Generated ${generatedFields.length} fields for ${eventTypeData.title}`);
            return enhancedEventType;

        } catch (error) {
            console.error(`❌ Field generation failed for ${eventTypePath}:`, error.message);
            throw error;
        }
    }

    /**
     * Generate field definitions from SQL schema data
     * @param {Object} schemaData - Parsed SQL schema information
     * @returns {Array} Array of field definitions
     */
    generateFieldsFromSchema(schemaData) {
        return schemaData.columns.map(column => ({
            // Core field properties from SQL
            name: column.name,
            label: this.prettifyColumnName(column.name),
            type: this.mapSqlTypeToFormType(column.dataType),
            required: !column.nullable, // SQL NOT NULL → required
            
            // SQL metadata for reference
            sqlType: column.dataType,
            maxLength: column.maxLength,
            nullable: column.nullable,
            isPrimaryKey: column.isPrimaryKey,
            isForeignKey: column.isForeignKey,
            
            // Default UI properties (can be overridden)
            readonly: column.isPrimaryKey || column.name.endsWith('_at'), // Auto-generated fields
            grp: this.inferDefaultGroup(column.name) // Smart grouping defaults
        }));
    }

    /**
     * Merge generated fields with user customizations
     * @param {Array} generatedFields - Auto-generated field definitions
     * @param {Object} fieldOverrides - User customizations by field name
     * @returns {Array} Enhanced fields with customizations applied
     */
    mergeWithCustomizations(generatedFields, fieldOverrides) {
        return generatedFields.map(field => ({
            ...field,
            ...(fieldOverrides[field.name] || {}) // Apply user overrides
        }));
    }

    /**
     * Convert SQL column names to user-friendly labels
     * @param {string} columnName - SQL column name
     * @returns {string} Prettified label
     */
    prettifyColumnName(columnName) {
        return columnName
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Map SQL data types to form field types
     * @param {string} sqlType - SQL data type
     * @returns {string} Form field type
     */
    mapSqlTypeToFormType(sqlType) {
        const type = sqlType.toUpperCase();
        
        if (type.includes('INT')) return 'number';
        if (type.includes('VARCHAR') && type.includes('255')) return 'text';
        if (type.includes('VARCHAR') && type.includes('50')) return 'text';
        if (type.includes('TEXT')) return 'textarea';
        if (type.includes('BOOLEAN')) return 'boolean';
        if (type.includes('TIMESTAMP') || type.includes('DATETIME')) return 'datetime';
        if (type.includes('DATE')) return 'date';
        
        return 'text'; // Default fallback
    }

    /**
     * Infer smart default grouping based on field name patterns
     * @param {string} fieldName - Field name
     * @returns {number} Default group number
     */
    inferDefaultGroup(fieldName) {
        // Basic info fields
        if (['name', 'title', 'cluster'].includes(fieldName)) return 1;
        
        // Status/priority fields  
        if (['status', 'priority', 'type'].includes(fieldName)) return 2;
        
        // Description fields
        if (['description', 'purpose', 'comments'].includes(fieldName)) return 3;
        
        // Assignment fields
        if (fieldName.includes('assigned')) return 4;
        
        // Audit fields
        if (fieldName.includes('created_') || fieldName.includes('updated_')) return 9;
        
        return 5; // Default group for other fields
    }
}

// Export workflow instance
export const genFieldsWorkflow = new GenFieldsWorkflow();