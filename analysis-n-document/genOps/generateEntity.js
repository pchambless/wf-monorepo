#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { getForeignKeyMapping } from './configForeignKeys.js';

const APPS = ['plans']; // Add more apps later

class EntityGenerator {
    constructor() {
        this.basePath = '/home/paul/wf-monorepo-new/analysis-n-document/genOps';
    }

    async generateEntities() {
        for (const app of APPS) {
            console.log(`\n=== Generating entity.json for ${app} ===`);
            await this.generateEntityForApp(app);
        }
    }

    async generateEntityForApp(appName) {
        // 1. Load analyzeSchemas output
        const schemaPath = `${this.basePath}/analyzeSchemas/apps/${appName}`;
        const schemaFiles = fs.readdirSync(schemaPath).filter(f => f.endsWith('.json'));

        // 2. Load analyzeEvents output
        const eventsPath = `${this.basePath}/analyzeEvents/apps/${appName}/output/combined-analysis.json`;
        const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

        // 3. Process each schema file
        for (const schemaFile of schemaFiles) {
            const entityName = path.basename(schemaFile, '.json');
            const schemaData = JSON.parse(fs.readFileSync(`${schemaPath}/${schemaFile}`, 'utf8'));

            const entity = this.consolidateEntity(entityName, schemaData, eventsData, appName);

            // 4. Write entity.json
            const outputPath = `${schemaPath}/${entityName}.json`;
            fs.writeFileSync(outputPath, JSON.stringify(entity, null, 2));
            console.log(`  ✓ Generated: ${entityName}.json`);
        }
    }

    consolidateEntity(entityName, schemaData, eventsData, appName) {
        // Enrich fields with role attributes and FK mappings
        const enrichedFields = schemaData.fields.map(field => {
            let enrichedField = { ...field };

            // Add primaryKey attribute if this is the primary key
            if (field.name === schemaData.primaryKey) {
                enrichedField.primaryKey = true;
            }

            // Add parentKey attribute if this field ends with _id (and isn't the primary key)
            if (field.name.endsWith('_id') && field.name !== schemaData.primaryKey) {
                enrichedField.parentKey = true;
            }

            // Add FK mapping if exists
            const fkMapping = getForeignKeyMapping(appName, field.name);
            if (fkMapping) {
                enrichedField.foreignKey = {
                    type: fkMapping.type,
                    mapping: fkMapping.mapping,
                    widget: this.generateWidgetName(field.name),
                    uiType: 'select'
                };
            }

            return enrichedField;
        });

        // Extract relevant constraints for this entity
        const entityConstraints = eventsData.constraints?.constraintMap?.[entityName] || {};
        const entityRelationships = eventsData.relationships?.relationships?.[entityName] || [];

        return {
            name: entityName,
            appName: appName,
            fields: enrichedFields,
            primaryKey: schemaData.primaryKey,
            parentKeys: schemaData.parentKeys || [],
            constraints: entityConstraints,
            relationships: entityRelationships,
            metadata: {
                generatedAt: new Date().toISOString(),
                sources: ['analyzeSchemas', 'analyzeEvents', 'configForeignKeys']
            }
        };
    }

    generateWidgetName(fieldName) {
        if (fieldName.endsWith('ID') || fieldName.endsWith('Id')) {
            const base = fieldName.replace(/ID$|Id$/, '');
            return `sel${base.charAt(0).toUpperCase() + base.slice(1)}`;
        }
        return `sel${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`;
    }
}

// Run generator
const generator = new EntityGenerator();
generator.generateEntities().catch(console.error);