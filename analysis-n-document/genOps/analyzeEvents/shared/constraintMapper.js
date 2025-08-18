import fs from 'fs';
import path from 'path';

export class ConstraintMapper {
    constructor(schemaDir = '../sql/jsonSchemas') {
        this.schemaDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), schemaDir);
        this.schemas = new Map();
        this.constraints = new Map();
        this.dependencies = new Map();
    }

    async loadSchemas() {
        const files = fs.readdirSync(this.schemaDir).filter(f => f.endsWith('.json'));

        for (const file of files) {
            const filePath = path.join(this.schemaDir, file);
            const schema = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            this.schemas.set(schema.name, schema);
        }

        console.log(`📋 Loaded ${this.schemas.size} schemas`);
        return this.schemas;
    }

    mapConstraints() {
        for (const [tableName, schema] of this.schemas) {
            const tableConstraints = {
                primaryKey: schema.primaryKey,
                foreignKeys: schema.parentKeys || [],
                fieldConstraints: this.extractFieldConstraints(schema.fields)
            };

            this.constraints.set(tableName, tableConstraints);
        }

        console.log(`🔗 Mapped constraints for ${this.constraints.size} tables`);
        return this.constraints;
    }

    extractFieldConstraints(fields) {
        const constraints = [];

        for (const field of fields) {
            const fieldConstraints = {
                name: field.name,
                nullable: field.nullable,
                type: field.type,
                validationRules: field.validationRules || []
            };
            constraints.push(fieldConstraints);
        }

        return constraints;
    }

    buildDependencyGraph() {
        for (const [tableName, tableConstraints] of this.constraints) {
            const deps = [];

            for (const fk of tableConstraints.foreignKeys) {
                deps.push({
                    type: 'FOREIGN_KEY',
                    dependsOn: fk.refTable,
                    column: fk.column,
                    referencesColumn: fk.refColumn
                });
            }

            this.dependencies.set(tableName, deps);
        }

        console.log(`📊 Built dependency graph for ${this.dependencies.size} tables`);
        return this.dependencies;
    }

    detectCircularDependencies() {
        const circular = [];
        const visited = new Set();
        const recStack = new Set();

        const hasCycle = (tableName) => {
            if (recStack.has(tableName)) return true;
            if (visited.has(tableName)) return false;

            visited.add(tableName);
            recStack.add(tableName);

            const deps = this.dependencies.get(tableName) || [];
            for (const dep of deps) {
                if (dep.type === 'FOREIGN_KEY' && hasCycle(dep.dependsOn)) {
                    circular.push({ from: tableName, to: dep.dependsOn });
                    return true;
                }
            }

            recStack.delete(tableName);
            return false;
        };

        for (const tableName of this.dependencies.keys()) {
            if (!visited.has(tableName)) {
                hasCycle(tableName);
            }
        }

        return circular;
    }

    getConstraints() { return this.constraints; }
    getDependencies() { return this.dependencies; }
    getSchemas() { return this.schemas; }
}