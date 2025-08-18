export class DataFlowAnalyzer {
    constructor(constraintMapper, relationshipDetector) {
        this.constraintMapper = constraintMapper;
        this.relationshipDetector = relationshipDetector;
        this.flowPaths = new Map();
        this.criticalPaths = [];
        this.cascadeEffects = new Map();
    }

    analyzeDataFlow() {
        this.buildFlowPaths();
        this.identifyCriticalPaths();
        this.analyzeCascadeEffects();

        const report = {
            totalFlowPaths: this.flowPaths.size,
            criticalPathCount: this.criticalPaths.length,
            cascadeRiskTables: Array.from(this.cascadeEffects.keys()).length
        };

        console.log(`🌊 Data flow analysis complete: ${report.totalFlowPaths} flow paths, ${report.criticalPathCount} critical paths`);
        return report;
    }

    buildFlowPaths() {
        const relationships = this.relationshipDetector.getRelationships();
        const schemas = this.constraintMapper.getSchemas();

        for (const tableName of schemas.keys()) {
            const paths = this.traceDataPaths(tableName, new Set(), []);
            this.flowPaths.set(tableName, paths);
        }
    }

    traceDataPaths(tableName, visited, currentPath) {
        if (visited.has(tableName)) {
            return [{ path: [...currentPath], circular: true }];
        }

        visited.add(tableName);
        currentPath.push(tableName);
        const paths = [];

        // Find all tables that depend on this one (children)
        const children = Array.from(this.relationshipDetector.getRelationships().values())
            .filter(r => r.parentTable === tableName);

        if (children.length === 0) {
            // Leaf node - end of path
            paths.push({ path: [...currentPath], circular: false });
        } else {
            // Continue tracing through children
            for (const child of children) {
                const childPaths = this.traceDataPaths(
                    child.childTable,
                    new Set(visited),
                    [...currentPath]
                );
                paths.push(...childPaths);
            }
        }

        return paths;
    }

    identifyCriticalPaths() {
        const pathLengths = new Map();
        const dependencyCount = new Map();

        // Count how many tables depend on each table
        for (const [tableName, paths] of this.flowPaths) {
            const totalDependents = paths.reduce((sum, pathGroup) =>
                sum + pathGroup.path.length - 1, 0);
            dependencyCount.set(tableName, totalDependents);

            // Track longest paths
            const maxPathLength = Math.max(...paths.map(p => p.path.length));
            pathLengths.set(tableName, maxPathLength);
        }

        // Identify critical tables (high dependency count or long paths)
        this.criticalPaths = Array.from(dependencyCount.entries())
            .filter(([table, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([table, count]) => ({
                table,
                dependentCount: count,
                maxPathLength: pathLengths.get(table),
                criticality: this.calculateCriticality(count, pathLengths.get(table))
            }));
    }

    calculateCriticality(dependentCount, maxPathLength) {
        // Higher score = more critical
        const dependencyWeight = dependentCount * 2;
        const pathWeight = maxPathLength * 1.5;
        return dependencyWeight + pathWeight;
    }

    analyzeCascadeEffects() {
        const relationships = this.relationshipDetector.getRelationships();

        for (const [key, relationship] of relationships) {
            const parentTable = relationship.parentTable;

            if (!this.cascadeEffects.has(parentTable)) {
                this.cascadeEffects.set(parentTable, {
                    table: parentTable,
                    directChildren: [],
                    cascadeChain: [],
                    riskLevel: 'LOW'
                });
            }

            const effect = this.cascadeEffects.get(parentTable);
            effect.directChildren.push({
                table: relationship.childTable,
                column: relationship.childColumn,
                cardinality: relationship.cardinality
            });

            // Build full cascade chain
            effect.cascadeChain = this.buildCascadeChain(parentTable, new Set());
            effect.riskLevel = this.assessCascadeRisk(effect);
        }
    }

    buildCascadeChain(tableName, visited) {
        if (visited.has(tableName)) return [];

        visited.add(tableName);
        const chain = [tableName];

        const relationships = this.relationshipDetector.getRelationships();
        const children = Array.from(relationships.values())
            .filter(r => r.parentTable === tableName);

        for (const child of children) {
            const subChain = this.buildCascadeChain(child.childTable, new Set(visited));
            chain.push(...subChain);
        }

        return chain;
    }

    assessCascadeRisk(effect) {
        const chainLength = effect.cascadeChain.length;
        const directChildren = effect.directChildren.length;

        if (chainLength > 5 || directChildren > 3) return 'HIGH';
        if (chainLength > 3 || directChildren > 1) return 'MEDIUM';
        return 'LOW';
    }

    getDataFlowReport() {
        return {
            flowPaths: Object.fromEntries(this.flowPaths),
            criticalPaths: this.criticalPaths,
            cascadeEffects: Object.fromEntries(this.cascadeEffects),
            summary: {
                totalTables: this.flowPaths.size,
                criticalTables: this.criticalPaths.length,
                highRiskCascades: Array.from(this.cascadeEffects.values())
                    .filter(e => e.riskLevel === 'HIGH').length
            }
        };
    }

    getFlowPaths() { return this.flowPaths; }
    getCriticalPaths() { return this.criticalPaths; }
    getCascadeEffects() { return this.cascadeEffects; }
}