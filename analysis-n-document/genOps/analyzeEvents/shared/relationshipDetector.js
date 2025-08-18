export class RelationshipDetector {
    constructor(constraintMapper) {
        this.constraintMapper = constraintMapper;
        this.relationships = new Map();
        this.cardinalities = new Map();
    }

    analyzeRelationships() {
        const dependencies = this.constraintMapper.getDependencies();
        const constraints = this.constraintMapper.getConstraints();

        for (const [childTable, deps] of dependencies) {
            for (const dep of deps) {
                if (dep.type === 'FOREIGN_KEY') {
                    const relationship = {
                        childTable,
                        parentTable: dep.dependsOn,
                        childColumn: dep.column,
                        parentColumn: dep.referencesColumn,
                        cardinality: this.determineCardinality(childTable, dep.dependsOn, dep.column)
                    };

                    const key = `${childTable}->${dep.dependsOn}`;
                    this.relationships.set(key, relationship);
                }
            }
        }

        console.log(`🔄 Analyzed ${this.relationships.size} relationships`);
        return this.relationships;
    }

    determineCardinality(childTable, parentTable, foreignKeyColumn) {
        const constraints = this.constraintMapper.getConstraints();
        const childConstraints = constraints.get(childTable);

        // Check if FK column is also primary key (1:1 relationship)
        if (childConstraints.primaryKey === foreignKeyColumn) {
            return 'ONE_TO_ONE';
        }

        // Check for unique constraint on FK column (1:1 relationship)
        const fkField = childConstraints.fieldConstraints.find(f => f.name === foreignKeyColumn);
        if (fkField && fkField.validationRules.includes('unique')) {
            return 'ONE_TO_ONE';
        }

        // Default assumption is 1:many (parent can have multiple children)
        return 'ONE_TO_MANY';
    }

    getRelationshipChains() {
        const chains = new Map();

        for (const [key, relationship] of this.relationships) {
            const parentTable = relationship.parentTable;

            if (!chains.has(parentTable)) {
                chains.set(parentTable, {
                    table: parentTable,
                    children: [],
                    depth: 0
                });
            }

            chains.get(parentTable).children.push({
                table: relationship.childTable,
                column: relationship.childColumn,
                cardinality: relationship.cardinality
            });
        }

        // Calculate relationship depths
        for (const [tableName, chain] of chains) {
            chain.depth = this.calculateDepth(tableName, new Set());
        }

        console.log(`⛓️ Built ${chains.size} relationship chains`);
        return chains;
    }

    calculateDepth(tableName, visited) {
        if (visited.has(tableName)) return 0;

        visited.add(tableName);
        let maxDepth = 0;

        for (const [key, relationship] of this.relationships) {
            if (relationship.childTable === tableName) {
                const parentDepth = this.calculateDepth(relationship.parentTable, new Set(visited));
                maxDepth = Math.max(maxDepth, parentDepth + 1);
            }
        }

        return maxDepth;
    }

    getTableHierarchy() {
        const hierarchy = {
            roots: [], // Tables with no parents
            leaves: [], // Tables with no children
            intermediates: [] // Tables with both parents and children
        };

        const schemas = this.constraintMapper.getSchemas();
        const dependencies = this.constraintMapper.getDependencies();

        for (const tableName of schemas.keys()) {
            const hasParents = (dependencies.get(tableName) || []).some(d => d.type === 'FOREIGN_KEY');
            const hasChildren = Array.from(this.relationships.values())
                .some(r => r.parentTable === tableName);

            if (!hasParents && !hasChildren) {
                hierarchy.roots.push({ table: tableName, type: 'ISOLATED' });
            } else if (!hasParents && hasChildren) {
                hierarchy.roots.push({ table: tableName, type: 'ROOT' });
            } else if (hasParents && !hasChildren) {
                hierarchy.leaves.push(tableName);
            } else {
                hierarchy.intermediates.push(tableName);
            }
        }

        return hierarchy;
    }

    getRelationships() { return this.relationships; }
}