import { ConstraintMapper } from './constraintMapper.js';
import { RelationshipDetector } from './relationshipDetector.js';
import { SchemaValidator } from './schemaValidator.js';
import { DataFlowAnalyzer } from './dataFlowAnalyzer.js';
import { FormEventTypeAnalyzer } from './analyzeForms.js';
import { GridEventTypeAnalyzer } from './analyzeGrids.js';
import { SelectEventTypeAnalyzer } from './analyzeSelects.js';
import fs from 'fs';
import path from 'path';

export class CombinedAnalyzer {
    constructor(app) {
        if (!app) {
            throw new Error('App parameter required: plans, admin, or client');
        }

        this.app = app;
        this.schemaDir = `../../analyzeSchemas/apps/${app}`;
        this.outputDir = `../apps/${app}/output`;

        this.constraintMapper = new ConstraintMapper(this.schemaDir);
        this.relationshipDetector = null;
        this.schemaValidator = null;
        this.dataFlowAnalyzer = null;
        this.formEventTypeAnalyzer = new FormEventTypeAnalyzer(app);
        this.gridEventTypeAnalyzer = new GridEventTypeAnalyzer(app);
        this.selectEventTypeAnalyzer = new SelectEventTypeAnalyzer(app);

        this.analysisResults = {};
    }

    async runCompleteAnalysis() {
        console.log(`🚀 Starting combined analysis for app: ${this.app}`);

        try {
            // Step 1: Load schemas and map constraints
            await this.constraintMapper.loadSchemas();
            this.constraintMapper.mapConstraints();
            this.constraintMapper.buildDependencyGraph();

            // Step 2: Initialize other analyzers
            this.relationshipDetector = new RelationshipDetector(this.constraintMapper);
            this.schemaValidator = new SchemaValidator(this.constraintMapper, this.relationshipDetector);
            this.dataFlowAnalyzer = new DataFlowAnalyzer(this.constraintMapper, this.relationshipDetector);

            // Step 3: Run all analyses
            const constraintResults = this.analyzeConstraints();
            const relationshipResults = this.analyzeRelationships();
            const validationResults = this.validateSchemas();
            const dataFlowResults = this.analyzeDataFlow();
            const formEventResults = await this.analyzeFormEventTypes();
            const gridEventResults = await this.analyzeGridEventTypes();
            const selectEventResults = await this.analyzeSelectEventTypes();

            // Step 4: Combine results
            this.analysisResults = {
                app: this.app,
                timestamp: new Date().toISOString(),
                summary: this.generateSummary(),
                constraints: constraintResults,
                relationships: relationshipResults,
                validation: validationResults,
                dataFlow: dataFlowResults,
                formEventTypes: formEventResults,
                gridEventTypes: gridEventResults,
                selectEventTypes: selectEventResults,
                mergedEntities: this.createMergedEntities(constraintResults, formEventResults, gridEventResults, selectEventResults),
                insights: this.generateInsights()
            };

            // Step 5: Generate outputs
            await this.generateReports();

            console.log(`✅ Combined analysis complete for app: ${this.app}!`);
            return this.analysisResults;

        } catch (error) {
            console.error(`❌ Analysis failed for app ${this.app}:`, error);
            throw error;
        }
    }

    analyzeConstraints() {
        console.log('📋 Analyzing constraints...');

        return {
            constraintMap: Object.fromEntries(this.constraintMapper.getConstraints()),
            dependencyGraph: Object.fromEntries(this.constraintMapper.getDependencies()),
            circularDependencies: this.constraintMapper.detectCircularDependencies()
        };
    }

    analyzeRelationships() {
        console.log('🔄 Analyzing relationships...');

        this.relationshipDetector.analyzeRelationships();
        const chains = this.relationshipDetector.getRelationshipChains();
        const hierarchy = this.relationshipDetector.getTableHierarchy();

        return {
            relationships: Object.fromEntries(this.relationshipDetector.getRelationships()),
            relationshipChains: Object.fromEntries(chains),
            tableHierarchy: hierarchy
        };
    }

    validateSchemas() {
        console.log('✅ Validating schemas...');

        return this.schemaValidator.validateSchemas();
    }

    analyzeDataFlow() {
        console.log('🌊 Analyzing data flow...');

        this.dataFlowAnalyzer.analyzeDataFlow();
        return this.dataFlowAnalyzer.getDataFlowReport();
    }

    generateSummary() {
        const schemas = this.constraintMapper.getSchemas();
        const constraints = this.constraintMapper.getConstraints();

        let totalFields = 0;
        let totalForeignKeys = 0;

        for (const [tableName, schema] of schemas) {
            totalFields += schema.fields.length;
            const tableConstraints = constraints.get(tableName);
            if (tableConstraints) {
                totalForeignKeys += tableConstraints.foreignKeys.length;
            }
        }

        return {
            app: this.app,
            totalTables: schemas.size,
            totalFields,
            totalForeignKeys,
            analysisModules: ['constraints', 'relationships', 'validation', 'dataFlow']
        };
    }

    generateInsights() {
        const insights = [];
        const validation = this.analysisResults?.validation;
        const dataFlow = this.analysisResults?.dataFlow;
        const relationships = this.analysisResults?.relationships;

        // Validation insights
        if (validation?.errorCount > 0) {
            insights.push({
                type: 'ERROR',
                category: 'VALIDATION',
                message: `Found ${validation.errorCount} schema validation errors that need attention`,
                priority: 'HIGH'
            });
        }

        // Critical path insights
        if (dataFlow?.criticalPaths?.length > 0) {
            const topCritical = dataFlow.criticalPaths[0];
            insights.push({
                type: 'INFO',
                category: 'PERFORMANCE',
                message: `Table '${topCritical.table}' is highly critical with ${topCritical.dependentCount} dependents`,
                priority: 'MEDIUM'
            });
        }

        // Cascade risk insights
        if (dataFlow?.summary?.highRiskCascades > 0) {
            insights.push({
                type: 'WARNING',
                category: 'RISK',
                message: `${dataFlow.summary.highRiskCascades} tables have high cascade risk - changes may affect many related tables`,
                priority: 'HIGH'
            });
        }

        // App-specific insights
        insights.push({
            type: 'INFO',
            category: 'ARCHITECTURE',
            message: `Analysis completed for ${this.app} app domain`,
            priority: 'LOW'
        });

        return insights;
    }

    async generateReports() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        // Main analysis report
        const mainReport = path.join(this.outputDir, `${this.app}-analysis.json`);
        fs.writeFileSync(mainReport, JSON.stringify(this.analysisResults, null, 2));

        // Summary report
        const summaryReport = path.join(this.outputDir, `${this.app}-summary.json`);
        fs.writeFileSync(summaryReport, JSON.stringify({
            app: this.app,
            summary: this.analysisResults.summary,
            insights: this.analysisResults.insights,
            validation: {
                isValid: this.analysisResults.validation.isValid,
                errorCount: this.analysisResults.validation.errorCount,
                warningCount: this.analysisResults.validation.warningCount
            }
        }, null, 2));

        console.log(`📄 Reports generated in ${this.outputDir}/`);
    }

    async analyzeFormEventTypes() {
        console.log('📋 Analyzing form eventTypes...');
        return await this.formEventTypeAnalyzer.analyzeFormEventTypes();
    }

    async analyzeGridEventTypes() {
        console.log('📋 Analyzing grid eventTypes...');
        return await this.gridEventTypeAnalyzer.analyzeGridEventTypes();
    }

    async analyzeSelectEventTypes() {
        console.log('📋 Analyzing select eventTypes...');
        return await this.selectEventTypeAnalyzer.analyzeSelectEventTypes();
    }

    createMergedEntities(constraintResults, formEventResults, gridEventResults = {}, selectEventResults = {}) {
        console.log('🔄 Creating merged entity configurations...');
        
        const mergedEntities = {};
        
        // Helper function to create merged entity from any eventType data
        const createMergedEntity = (entityName, eventData, category) => {
            const schemaData = constraintResults.constraintMap[entityName];
            
            if (schemaData) {
                // Filter schema fields to only include those used in this eventType
                const filteredFields = schemaData.fieldConstraints.filter(field =>
                    eventData.fields.includes(field.name)
                );
                
                const merged = {
                    // Event metadata
                    eventType: eventData.eventType,
                    category: category,
                    dbTable: eventData.dbTable,
                    primaryKey: eventData.primaryKey || "id",
                    
                    // Filtered field list with full metadata
                    fields: filteredFields,
                    
                    // Field order (important for UI)
                    fieldOrder: eventData.fields,
                    
                    // Schema metadata
                    foreignKeys: schemaData.foreignKeys || [],
                    
                    // Supported CRUD operations
                    supportedOperations: eventData.supportedOperations || {
                        create: true, read: true, update: true, delete: true
                    },
                    
                    // Additional event-specific metadata
                    workflows: eventData.workflows || [],
                    navChildren: eventData.navChildren || [],
                    
                    // Counts
                    totalSchemaFields: schemaData.fieldConstraints.length,
                    totalEventFields: eventData.fields.length,
                    filteredFields: filteredFields.length
                };
                
                console.log(`✅ Merged ${category} ${entityName}: ${filteredFields.length}/${schemaData.fieldConstraints.length} fields (${eventData.fields.length} from ${category})`);
                return merged;
            } else {
                console.warn(`⚠️  No schema data found for ${category} entity: ${entityName}`);
                return null;
            }
        };
        
        // Process form eventTypes
        for (const [entityName, formData] of Object.entries(formEventResults)) {
            const merged = createMergedEntity(entityName, formData, 'form');
            if (merged) {
                mergedEntities[`${entityName}_form`] = merged;
            }
        }
        
        // Process grid eventTypes  
        for (const [entityName, gridData] of Object.entries(gridEventResults)) {
            const merged = createMergedEntity(entityName, gridData, 'grid');
            if (merged) {
                mergedEntities[`${entityName}_grid`] = merged;
            }
        }
        
        // Process select eventTypes
        for (const [entityName, selectData] of Object.entries(selectEventResults)) {
            // Select eventTypes have a different structure - handle specially
            mergedEntities[`${entityName}_select`] = {
                eventType: selectData.eventType,
                category: 'select',
                method: selectData.method,
                configSource: selectData.configSource,
                
                // Select fields are predefined (value, label)
                fields: selectData.fields || [
                    { name: 'value', type: 'VARCHAR', nullable: false },
                    { name: 'label', type: 'VARCHAR', nullable: false }
                ],
                
                fieldOrder: ['value', 'label'],
                
                // Counts
                totalEventFields: selectData.fields?.length || 2,
                filteredFields: selectData.fields?.length || 2
            };
            
            console.log(`✅ Merged select ${entityName}: ${selectData.fields?.length || 2} fields (from config)`);
        }
        
        const totalEntities = Object.keys(mergedEntities).length;
        const formCount = Object.keys(formEventResults).length;
        const gridCount = Object.keys(gridEventResults).length; 
        const selectCount = Object.keys(selectEventResults).length;
        
        console.log(`📊 Created ${totalEntities} merged entities: ${formCount} form, ${gridCount} grid, ${selectCount} select`);
        
        return mergedEntities;
    }

    getResults() { return this.analysisResults; }
}

// CLI runner
if (import.meta.url === `file://${process.argv[1]}`) {
    const app = process.argv[2];

    if (!app) {
        console.error('❌ Usage: node combinedAnalyzer.js <app>');
        console.error('Available apps: plans, admin, client');
        process.exit(1);
    }

    const analyzer = new CombinedAnalyzer(app);
    analyzer.runCompleteAnalysis()
        .then(results => {
            console.log(`\n📊 Analysis Summary for ${app}:`);
            console.log(`- Tables: ${results.summary.totalTables}`);
            console.log(`- Fields: ${results.summary.totalFields}`);
            console.log(`- Foreign Keys: ${results.summary.totalForeignKeys}`);
            console.log(`- Validation Errors: ${results.validation.errorCount}`);
            console.log(`- Critical Paths: ${results.dataFlow.criticalPaths.length}`);
        })
        .catch(error => {
            console.error('Analysis failed:', error);
            process.exit(1);
        });
}