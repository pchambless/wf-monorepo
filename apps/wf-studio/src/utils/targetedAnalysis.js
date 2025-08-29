// /analysis-n-document/genOps/analyzeSchemas/shared/targetedAnalysis.js

import fs from 'fs';
import path from 'path';
import { normalizeSQL } from './normalizeSQL.js';
import { parseSQLFile } from './parseTableSchema.js';
import { addFieldAttributes } from './addFieldAttributes.js';
import { writeSchema } from './writeSchema.js';

/**
 * Targeted Schema Analysis - Only analyze schemas that impact specific eventTypes
 */
export async function runTargetedAnalysis(config) {
    const { eventType, qryName, app, showJSON = false } = config;

    console.log(`🎯 Starting targeted analysis for: ${eventType} (qry: ${qryName})`);

    try {
        // Step 1: Map qry to actual database tables
        const affectedTables = await mapQryToTables(qryName, app);

        if (affectedTables.length === 0) {
            console.warn(`⚠️ No tables found for qry: ${qryName}`);
            return { success: false, reason: 'No tables found' };
        }

        console.log(`📋 Found ${affectedTables.length} tables to analyze:`, affectedTables);

        // Step 2: Run targeted schema analysis only on affected tables
        const analysisResults = await analyzeAffectedTables(affectedTables, app);

        // Step 3: Update only the affected schema files
        const updatedSchemas = await updateTargetedSchemas(analysisResults, app);

        console.log(`✅ Targeted analysis complete. Updated ${updatedSchemas.length} schemas.`);

        if (showJSON) {
            updatedSchemas.forEach(schema => {
                console.log(`\n📄 ${schema.name}.json:`);
                console.log(JSON.stringify(schema, null, 2));
            });
        }

        return {
            success: true,
            updatedSchemas: updatedSchemas.map(s => s.name),
            affectedTables
        };

    } catch (error) {
        console.error(`❌ Targeted analysis failed:`, error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Map a qry name to the actual database tables it affects
 */
async function mapQryToTables(qryName, app) {
    const serverEventsPath = `./apps/wf-server/server/events/${app}/${qryName}.js`;

    if (!fs.existsSync(serverEventsPath)) {
        console.warn(`⚠️ Server eventType not found: ${serverEventsPath}`);
        return [];
    }

    try {
        // Read the file content and extract SQL
        const fileContent = fs.readFileSync(serverEventsPath, 'utf8');

        // Simple extraction of qrySQL from export
        const sqlMatch = fileContent.match(/qrySQL:\s*`([\s\S]*?)`/);
        if (!sqlMatch) {
            console.warn(`⚠️ No qrySQL found in: ${qryName}`);
            return [];
        }

        const sql = sqlMatch[1];

        // Extract table names from SQL
        const tables = extractTablesFromSQL(sql);

        return tables;

    } catch (error) {
        console.error(`❌ Error loading server eventType ${qryName}:`, error.message);
        return [];
    }
}

/**
 * Extract table names from SQL query
 */
function extractTablesFromSQL(sql) {
    const tables = new Set();

    // Normalize SQL
    const normalizedSQL = sql
        .replace(/--.*$/gm, '') // Remove line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/\s+/g, ' ') // Normalize whitespace
        .toLowerCase();

    // Patterns to match table references
    const patterns = [
        /from\s+(?:api_wf\.)?(\w+)/g,           // FROM api_wf.plans or FROM plans
        /join\s+(?:api_wf\.)?(\w+)/g,          // JOIN api_wf.plans or JOIN plans  
        /update\s+(?:api_wf\.)?(\w+)/g,        // UPDATE api_wf.plans
        /insert\s+into\s+(?:api_wf\.)?(\w+)/g, // INSERT INTO api_wf.plans
        /delete\s+from\s+(?:api_wf\.)?(\w+)/g  // DELETE FROM api_wf.plans
    ];

    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(normalizedSQL)) !== null) {
            tables.add(match[1]);
        }
    });

    return Array.from(tables);
}

/**
 * Run schema analysis only on affected tables
 */
async function analyzeAffectedTables(tableNames, app) {
    const results = [];
    const schemaBasePath = `./analysis-n-document/genOps/analyzeSchemas/apps/${app}`;

    for (const tableName of tableNames) {
        const schemaFile = `${schemaBasePath}/${tableName}.json`; // Use existing JSON schema

        if (!fs.existsSync(schemaFile)) {
            console.warn(`⚠️ Schema file not found: ${schemaFile}`);
            continue;
        }

        console.log(`🔍 Analyzing table: ${tableName}`);

        try {
            // Read existing JSON schema instead of parsing SQL
            const existingSchema = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
            existingSchema.appName = app;

            results.push(existingSchema);

        } catch (error) {
            console.error(`❌ Error analyzing ${tableName}:`, error.message);
        }
    }

    return results;
}

/**
 * Update only the targeted schema files
 */
async function updateTargetedSchemas(analysisResults, app) {
    const outputDir = `./analysis-n-document/genOps/analyzeSchemas/apps/${app}`;

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const updatedSchemas = [];

    for (const schema of analysisResults) {
        try {
            await writeSchema(schema, outputDir);
            updatedSchemas.push(schema);
            console.log(`📝 Updated schema: ${schema.name}.json`);
        } catch (error) {
            console.error(`❌ Error writing schema ${schema.name}:`, error.message);
        }
    }

    return updatedSchemas;
}

/**
 * Find client eventTypes that use a specific qry
 */
export async function findClientEventTypesUsingQry(qryName, app) {
    const clientEventsPath = `./apps/wf-plan-management/src/pages/PlanManager`; // Fixed path
    const eventTypeDirs = ['forms', 'grids', 'tabs', 'widgets'];

    const affectedEventTypes = [];

    for (const dir of eventTypeDirs) {
        const dirPath = `${clientEventsPath}/${dir}`;

        if (!fs.existsSync(dirPath)) continue;

        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.js'));

        for (const file of files) {
            const filePath = `${dirPath}/${file}`;
            const content = fs.readFileSync(filePath, 'utf8');

            // Check if this eventType references the qry
            if (content.includes(`qry: "${qryName}"`)) {
                const eventTypeName = file.replace('.js', '');
                affectedEventTypes.push({
                    name: eventTypeName,
                    path: filePath,
                    category: dir.slice(0, -1) // Remove 's' from 'forms' -> 'form'
                });
            }
        }
    }

    return affectedEventTypes;
}