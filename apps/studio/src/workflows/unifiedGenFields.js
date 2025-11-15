/**
 * Unified genFields Workflow
 * Single entry point for all field generation triggers
 * Handles smart merge logic to preserve manual customizations
 */

import { getApiBaseUrl } from '../config/api.js';

export class UnifiedGenFieldsWorkflow {
    constructor() {
        this.apiBase = getApiBaseUrl();
    }

    /**
     * W1 -> W7: Complete genFields process with smart merge logic
     * @param {Object} eventTypeData - Current eventType content
     * @returns {Object} Enhanced eventType with merged fields
     */
    async startGenFieldsProcess(eventTypeData) {
        if (!eventTypeData?.qry) {
            throw new Error('EventType missing qry property - cannot generate fields');
        }

        console.log(`🔄 W1: Starting genFields process for qry: ${eventTypeData.qry}`);
        
        try {
            // W2: Load existing fields and fieldOverrides
            const existingData = this.loadExistingFieldData(eventTypeData);
            console.log(`📋 W2: Loaded existing data - ${existingData.existingFields.length} fields, ${Object.keys(existingData.existingOverrides).length} overrides`);
            
            // W3: Generate new field definitions with smart defaults
            const newFieldDefinitions = await this.generateFieldDefinitions(eventTypeData.qry, eventTypeData);
            console.log(`🔧 W3: Generated ${newFieldDefinitions.fieldNames.length} new field definitions from ${newFieldDefinitions.dbTable}`);
            
            // W4: Apply merge logic to preserve manual customizations
            const mergeResult = this.applyMergeLogic(
                newFieldDefinitions,
                existingData.existingFields,
                existingData.existingOverrides
            );
            console.log(`🔀 W4: Merge completed -`, mergeResult.stats);
            
            // W5: Add new fields, keep overrides for existing
            const enhancedFields = this.addNewFieldsKeepOverrides(mergeResult);
            console.log(`✨ W5: Enhanced fields ready - ${enhancedFields.fields.length} total fields`);
            
            // W6: Update eventType with enhanced fields
            const updatedEventType = this.updateEventTypeWithFields(eventTypeData, enhancedFields, newFieldDefinitions);
            console.log(`💾 W6: EventType updated with enhanced fields`);
            
            // W7: Show success notification (return stats for UI)
            const notification = this.createSuccessNotification(mergeResult.stats);
            console.log(`✅ W7: Process complete -`, notification);
            
            return {
                eventType: updatedEventType,
                notification: notification,
                stats: mergeResult.stats
            };
            
        } catch (error) {
            console.error('❌ genFields process failed:', error);
            throw error;
        }
    }

    /**
     * W2: Load existing fields and fieldOverrides
     */
    loadExistingFieldData(eventTypeData) {
        return {
            existingFields: eventTypeData.fields || [],
            existingOverrides: eventTypeData.fieldOverrides || {},
            customSections: eventTypeData.customSections || []
        };
    }

    /**
     * W3: Generate new field definitions with smart defaults - context-aware
     */
    async generateFieldDefinitions(qry, eventTypeData) {
        // Call genFields API to extract schema info
        const response = await fetch(`${this.apiBase}/api/studio/genFields`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ qry })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const result = await response.json();
        const { dbTable, fieldNames, primaryKey } = result.data;
        
        // Determine if this is a grid or form context
        const isGrid = eventTypeData?.category === 'grid';
        
        // Generate clean field definitions with only truthy attributes
        const fields = fieldNames.map((fieldName, index) => {
            const baseField = {
                name: fieldName,
                label: this.formatFieldLabel(fieldName),
                type: this.inferFieldType(fieldName),
                dbColumn: fieldName
            };

            if (isGrid) {
                // Grids use width - default 100px (user will adjust)
                baseField.width = 100;
            } else {
                // Forms use grp for grouping
                baseField.grp = this.calculateGroupNumber(fieldName, index);
                
                // Add context-specific attributes - only if truthy
                const isRequired = fieldName === primaryKey || fieldName.endsWith('_id');
                if (isRequired) {
                    baseField.required = true;
                }
                
                const isReadonly = fieldName === primaryKey || fieldName.endsWith('_at');
                if (isReadonly) {
                    baseField.readonly = true;
                }
            }

            return baseField;
        });

        return { dbTable, fieldNames, primaryKey, fields };
    }

    /**
     * W4: Apply merge logic to preserve manual customizations
     */
    applyMergeLogic(newFieldDefinitions, existingFields, existingOverrides) {
        const stats = {
            newFields: 0,
            preservedFields: 0,
            removedFields: 0,
            preservedOverrides: 0
        };

        // Create field name sets for comparison
        const newFieldNames = new Set(newFieldDefinitions.fieldNames);
        const existingFieldNames = new Set(existingFields.map(f => f.name));
        
        // Identify changes
        const addedFieldNames = newFieldDefinitions.fieldNames.filter(name => !existingFieldNames.has(name));
        const removedFieldNames = [...existingFieldNames].filter(name => !newFieldNames.has(name));
        const commonFieldNames = newFieldDefinitions.fieldNames.filter(name => existingFieldNames.has(name));
        
        stats.newFields = addedFieldNames.length;
        stats.removedFields = removedFieldNames.length;
        stats.preservedFields = commonFieldNames.length;

        // Merge field definitions
        const mergedFields = newFieldDefinitions.fields.map(newField => {
            const existingField = existingFields.find(f => f.name === newField.name);
            const fieldOverride = existingOverrides[newField.name];
            
            if (fieldOverride) {
                stats.preservedOverrides++;
                // Apply overrides to new field definition
                return { ...newField, ...fieldOverride };
            } else if (existingField) {
                // No override but field exists - preserve manually changed properties
                const preservableProps = ['label', 'type', 'required', 'grp', 'readonly', 'hint', 'placeholder'];
                const preservedProps = {};
                
                preservableProps.forEach(prop => {
                    if (existingField[prop] !== undefined) {
                        preservedProps[prop] = existingField[prop];
                    }
                });
                
                return { ...newField, ...preservedProps };
            }
            
            // New field - use generated defaults
            return newField;
        });

        // Clean up fieldOverrides - remove overrides for deleted fields
        const cleanedOverrides = {};
        Object.keys(existingOverrides).forEach(fieldName => {
            if (newFieldNames.has(fieldName)) {
                cleanedOverrides[fieldName] = existingOverrides[fieldName];
            }
        });

        return {
            fields: mergedFields,
            fieldOverrides: cleanedOverrides,
            stats
        };
    }

    /**
     * W5: Add new fields, keep overrides for existing
     */
    addNewFieldsKeepOverrides(mergeResult) {
        // This step is already handled in W4, but we can add any final processing here
        return {
            fields: mergeResult.fields,
            fieldOverrides: mergeResult.fieldOverrides
        };
    }

    /**
     * W6: Update eventType with enhanced fields
     */
    updateEventTypeWithFields(originalEventType, enhancedFields, schemaInfo) {
        return {
            ...originalEventType,
            
            // 🤖 AUTO-GENERATED ZONE - Safe to regenerate
            fields: enhancedFields.fields,
            schemaMetadata: {
                generatedFrom: originalEventType.qry,
                generatedAt: new Date().toISOString(),
                tableName: schemaInfo.dbTable,
                primaryKey: schemaInfo.primaryKey,
                totalFields: enhancedFields.fields.length
            },
            
            // ✋ MANUAL CUSTOMIZATION ZONE - Preserve existing + cleaned
            fieldOverrides: enhancedFields.fieldOverrides,
            customSections: originalEventType.customSections || []
        };
    }

    /**
     * W7: Create success notification with field count
     */
    createSuccessNotification(stats) {
        const parts = [];
        
        if (stats.newFields > 0) parts.push(`${stats.newFields} new fields added`);
        if (stats.preservedFields > 0) parts.push(`${stats.preservedFields} existing fields updated`);
        if (stats.preservedOverrides > 0) parts.push(`${stats.preservedOverrides} manual customizations preserved`);
        if (stats.removedFields > 0) parts.push(`${stats.removedFields} obsolete fields removed`);
        
        return {
            title: "Fields Generated Successfully!",
            message: parts.join(', ') || 'Field generation completed',
            type: 'success'
        };
    }

    /**
     * Helper functions for field generation
     */
    formatFieldLabel(fieldName) {
        return fieldName
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/\b(id|at|by)\b/gi, match => match.toUpperCase())
            .trim();
    }

    inferFieldType(fieldName) {
        const name = fieldName.toLowerCase();
        
        if (name === 'id' || name.endsWith('_id')) return 'number';
        if (name.includes('email')) return 'email';
        if (name.includes('password')) return 'password';
        if (name.includes('phone')) return 'tel';
        if (name.includes('url') || name.includes('link')) return 'url';
        if (name.includes('date') || name.endsWith('_at')) return 'datetime-local';
        if (name.includes('description') || name.includes('comment')) return 'textarea';
        if (name.includes('status') || name.includes('priority')) return 'select';
        if (name.includes('active') || name.includes('enabled')) return 'checkbox';
        
        return 'text';
    }

    calculateGroupNumber(fieldName, index) {
        const name = fieldName.toLowerCase();
        
        // Primary fields (ID, name, title) in group 1
        if (name === 'id' || name === 'name' || name === 'title') return 1;
        
        // Status/priority fields in group 2  
        if (name.includes('status') || name.includes('priority') || name.includes('cluster')) return 2;
        
        // Description/content fields in group 3
        if (name.includes('description') || name.includes('comment')) return 3;
        
        // Assignment fields in group 4
        if (name.includes('assigned') || name.includes('_by')) return 4;
        
        // Date fields in group 5
        if (name.includes('date') || name.endsWith('_at')) return 5;
        
        // Everything else based on position
        return Math.floor(index / 3) + 6;
    }
}

// Export singleton instance
export const unifiedGenFieldsWorkflow = new UnifiedGenFieldsWorkflow();