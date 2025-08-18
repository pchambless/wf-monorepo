export class SchemaValidator {
    constructor(constraintMapper, relationshipDetector) {
        this.constraintMapper = constraintMapper;
        this.relationshipDetector = relationshipDetector;
        this.validationErrors = [];
        this.warnings = [];
    }

    validateSchemas() {
        this.validationErrors = [];
        this.warnings = [];

        this.validateForeignKeyReferences();
        this.validateDataTypeConsistency();
        this.validateNamingConventions();
        this.validateCircularDependencies();

        const report = {
            isValid: this.validationErrors.length === 0,
            errors: this.validationErrors,
            warnings: this.warnings,
            errorCount: this.validationErrors.length,
            warningCount: this.warnings.length
        };

        console.log(`✅ Validation complete: ${report.errorCount} errors, ${report.warningCount} warnings`);
        return report;
    }

    validateForeignKeyReferences() {
        const schemas = this.constraintMapper.getSchemas();
        const constraints = this.constraintMapper.getConstraints();

        for (const [tableName, tableConstraints] of constraints) {
            for (const fk of tableConstraints.foreignKeys) {
                // Check if referenced table exists
                if (!schemas.has(fk.refTable)) {
                    this.validationErrors.push({
                        type: 'MISSING_REFERENCED_TABLE',
                        table: tableName,
                        column: fk.column,
                        referencedTable: fk.refTable,
                        message: `Foreign key ${fk.column} references non-existent table ${fk.refTable}`
                    });
                    continue;
                }

                // Check if referenced column exists
                const referencedSchema = schemas.get(fk.refTable);
                const referencedColumn = referencedSchema.fields.find(f => f.name === fk.refColumn);

                if (!referencedColumn) {
                    this.validationErrors.push({
                        type: 'MISSING_REFERENCED_COLUMN',
                        table: tableName,
                        column: fk.column,
                        referencedTable: fk.refTable,
                        referencedColumn: fk.refColumn,
                        message: `Foreign key ${fk.column} references non-existent column ${fk.refTable}.${fk.refColumn}`
                    });
                }
            }
        }
    }

    validateDataTypeConsistency() {
        const relationships = this.relationshipDetector.getRelationships();
        const schemas = this.constraintMapper.getSchemas();

        for (const [key, relationship] of relationships) {
            const childSchema = schemas.get(relationship.childTable);
            const parentSchema = schemas.get(relationship.parentTable);

            if (!childSchema || !parentSchema) continue;

            const childField = childSchema.fields.find(f => f.name === relationship.childColumn);
            const parentField = parentSchema.fields.find(f => f.name === relationship.parentColumn);

            if (childField && parentField) {
                if (this.normalizeType(childField.type) !== this.normalizeType(parentField.type)) {
                    this.warnings.push({
                        type: 'TYPE_MISMATCH',
                        relationship: key,
                        childType: childField.type,
                        parentType: parentField.type,
                        message: `Type mismatch in relationship ${key}: ${childField.type} vs ${parentField.type}`
                    });
                }
            }
        }
    }

    normalizeType(type) {
        // Normalize similar types for comparison
        const normalized = type.toUpperCase();
        if (normalized.startsWith('INT')) return 'INTEGER';
        if (normalized.startsWith('VARCHAR')) return 'VARCHAR';
        if (normalized.startsWith('TEXT')) return 'TEXT';
        if (normalized.startsWith('TIMESTAMP')) return 'TIMESTAMP';
        return normalized;
    }

    validateNamingConventions() {
        const schemas = this.constraintMapper.getSchemas();

        for (const [tableName, schema] of schemas) {
            // Check table naming convention
            if (!tableName.match(/^[a-z_]+$/)) {
                this.warnings.push({
                    type: 'NAMING_CONVENTION',
                    table: tableName,
                    message: `Table name ${tableName} doesn't follow snake_case convention`
                });
            }

            // Check field naming conventions
            for (const field of schema.fields) {
                if (!field.name.match(/^[a-z_]+$/)) {
                    this.warnings.push({
                        type: 'NAMING_CONVENTION',
                        table: tableName,
                        field: field.name,
                        message: `Field ${field.name} doesn't follow snake_case convention`
                    });
                }
            }
        }
    }

    validateCircularDependencies() {
        const circular = this.constraintMapper.detectCircularDependencies();

        for (const cycle of circular) {
            this.validationErrors.push({
                type: 'CIRCULAR_DEPENDENCY',
                from: cycle.from,
                to: cycle.to,
                message: `Circular dependency detected: ${cycle.from} -> ${cycle.to}`
            });
        }
    }

    getValidationResults() {
        return {
            errors: this.validationErrors,
            warnings: this.warnings
        };
    }
}