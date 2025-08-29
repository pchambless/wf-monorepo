import fs from 'fs';
import path from 'path';
import { normalizeSQL } from '../../../../apps/wf-studio/src/utils/normalizeSQL.js';
import { parseSQLFile } from '../../../../apps/wf-studio/src/utils/parseTableSchema.js';
import { addFieldAttributes } from '../../../../apps/wf-studio/src/utils/addFieldAttributes.js';
import { writeSchema } from '../../../../apps/wf-studio/src/utils/writeSchema.js';
import { appSchemaMapping } from './configDB.js';

const app = process.argv[2]?.trim();
const showJSON = process.argv.includes('--json');

async function main() {
    if (!app) {
        console.error('❌ Usage: node genSchemas.js <app> [--json]');
        console.error('Available apps:', Object.keys(appSchemaMapping).filter(k => k !== 'basePath').join(', '));
        process.exit(1);
    }

    const config = appSchemaMapping[app];
    if (!config) {
        console.error(`❌ Unknown app: ${app}`);
        console.error('Available apps:', Object.keys(appSchemaMapping).filter(k => k !== 'basePath').join(', '));
        process.exit(1);
    }

    console.log(`🚀 Processing schemas for app: ${app}`);

    // Create output directory
    const outputDir = config.outputDir;
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`📁 Created output directory: ${outputDir}`);
    }

    // Process each schema file
    for (const schemaPath of config.schemas) {
        const fullPath = path.join(appSchemaMapping.basePath, schemaPath);

        if (!fs.existsSync(fullPath)) {
            console.warn(`⚠️ Schema file not found: ${fullPath}`);
            continue;
        }

        console.log(`📋 Processing: ${schemaPath}`);

        try {
            const rawSQL = fs.readFileSync(fullPath, 'utf8');
            const sql = normalizeSQL(rawSQL);

            const parsed = parseSQLFile(sql);
            if (!parsed) {
                console.warn(`⚠️ Could not parse: ${schemaPath}`);
                continue;
            }

            const enriched = addFieldAttributes(parsed);
            await writeSchema(enriched, outputDir);

            console.log(`✅ Generated schema: ${enriched.name}.json`);

            if (showJSON) {
                console.log(JSON.stringify(enriched, null, 2));
            }
        } catch (error) {
            console.error(`❌ Error processing ${schemaPath}:`, error.message);
        }
    }

    console.log(`🎉 Schema generation complete for app: ${app}`);
    console.log(`📄 Output location: ${outputDir}/`);
}

main().catch(err => {
    console.error('❌ Pipeline failed:', err);
    process.exit(1);
});