import { fieldPatterns, directiveMap, processDirectives } from '../../configDirectives.js';

export class BaseForeignKeyMapper {
    constructor() {
        this.patterns = this.initializePatterns();
    }

    initializePatterns() {
        return {
            // ID field patterns → select widgets
            idFields: /(?:^|_)(id|ID)$/,
            parentKeys: /^.*_id$/,

            // Text field patterns → textArea
            textAreas: /^(comments?|descriptions?|notes?)$/i,

            // Status/lookup patterns → select
            statusFields: /^(status|priority|type|state)$/i,

            // System fields → hidden
            systemFields: /^(created_at|updated_at|deleted_at|created_by|updated_by|deleted_by|active)$/i,

            // Measurement/quantity fields → number
            quantityFields: /^(quantity|amount|count|total|sum|qty)$/i
        };
    }

    analyzeField(field, tableName, relationships = []) {
        const directives = {};
        const fieldName = field.name;
        const fieldType = field.type;

        // 1. Detect field category and base type
        const category = this.categorizeField(fieldName, fieldType);
        directives.type = this.mapToUIType(category, fieldType);

        // 2. Apply pattern-based rules
        this.applyPatternRules(directives, fieldName, category);

        // 3. Apply relationship-based rules
        this.applyRelationshipRules(directives, field, relationships);

        // 4. Apply business rules from configDirectives
        return processDirectives(directives);
    }

    categorizeField(fieldName, fieldType) {
        if (this.patterns.systemFields.test(fieldName)) return 'system';
        if (this.patterns.parentKeys.test(fieldName)) return 'parentKey';
        if (this.patterns.idFields.test(fieldName)) return 'lookup';
        if (this.patterns.textAreas.test(fieldName)) return 'textArea';
        if (this.patterns.statusFields.test(fieldName)) return 'status';
        if (this.patterns.quantityFields.test(fieldName)) return 'quantity';

        // Fallback to type-based detection
        if (fieldType.toUpperCase().includes('INT')) return 'number';
        if (fieldType.toUpperCase().includes('TEXT')) return 'text';
        if (fieldType.toUpperCase().includes('VARCHAR')) return 'text';
        if (fieldType.toUpperCase().includes('TIMESTAMP')) return 'datetime';
        if (fieldType.toUpperCase().includes('TINYINT(1)')) return 'boolean';

        return 'text'; // Default
    }

    mapToUIType(category, fieldType) {
        const typeMap = {
            'system': 'hidden',
            'parentKey': 'select',
            'lookup': 'select',
            'textArea': 'multiLine',
            'status': 'select',
            'quantity': 'number',
            'number': 'number',
            'text': 'text',
            'datetime': 'date',
            'boolean': 'boolean'
        };

        return typeMap[category] || 'text';
    }

    applyPatternRules(directives, fieldName, category) {
        switch (category) {
            case 'system':
                directives.sys = true;
                break;

            case 'parentKey':
                directives.parentKey = true;
                directives.widget = this.generateWidgetName(fieldName);
                break;

            case 'lookup':
                directives.widget = this.generateWidgetName(fieldName);
                break;

            case 'textArea':
                directives.tableHide = true;
                break;

            case 'status':
                directives.widget = this.generateWidgetName(fieldName);
                break;
        }

        // Required field detection
        if (directives.type !== 'hidden' && !fieldName.includes('deleted_')) {
            // Add logic for required detection based on nullable
        }
    }

    applyRelationshipRules(directives, field, relationships) {
        // Find if this field is part of a foreign key relationship
        const fkRelation = relationships.find(rel => rel.column === field.name);

        if (fkRelation) {
            directives.parentKey = true;
            directives.entity = fkRelation.refTable;
            directives.valField = fkRelation.refColumn;
            directives.dispField = this.guessDisplayField(fkRelation.refTable);
        }
    }

    generateWidgetName(fieldName) {
        // Convert field names to widget names
        // measID → selMeas, vndrID → selVndr, status → selStatus

        if (fieldName.endsWith('ID') || fieldName.endsWith('Id')) {
            const base = fieldName.replace(/ID$|Id$/, '');
            return `sel${this.capitalize(base)}`;
        }

        if (fieldName === 'status') return 'selStatus';
        if (fieldName === 'priority') return 'selPriority';
        if (fieldName === 'type') return 'selType';

        return `sel${this.capitalize(fieldName)}`;
    }

    guessDisplayField(tableName) {
        // Common display field patterns
        const commonNames = ['name', 'title', 'description', 'label'];
        return commonNames[0]; // Default to 'name'
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Process entire schema with relationship context
    processSchema(schema, relationships = []) {
        const enrichedFields = schema.fields.map(field => ({
            ...field,
            directives: this.analyzeField(field, schema.name, relationships)
        }));

        return {
            ...schema,
            fields: enrichedFields
        };
    }
}