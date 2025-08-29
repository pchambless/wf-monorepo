import fs from 'fs';
import path from 'path';
import { parseSQLFile } from '../../../../apps/wf-studio/src/utils/parseTableSchema.js';
import { normalizeSQL } from '../../../../apps/wf-studio/src/utils/normalizeSQL.js';

const baseDir = '/home/paul/wf-monorepo-new/sql/database';
const inputArg = process.argv[2]?.trim();
const showJSON = process.argv.includes('--json');

if (!inputArg) {
    console.error('❌ No input provided. Use: node parseTablesInDir.js <schema> or <schema/tables/file.sql> [--json]');
    process.exit(1);
}

const fullPath = path.resolve(baseDir, inputArg);
const isFile = fullPath.endsWith('.sql');

function parseSingleFile(filePath, showJSON = false) {
    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        return;
    }

    const rawSQL = fs.readFileSync(filePath, 'utf8');
    const sql = normalizeSQL(rawSQL);
    const schema = parseSQLFile(sql);

    if (!schema) {
        console.warn(`⚠️ Could not parse: ${filePath}`);
        return;
    }

    if (showJSON) {
        console.log(JSON.stringify(schema, null, 2));
        return;
    }

    console.log(`✅ ${schema.name}`);
    console.log(`   PK: ${schema.primaryKey || 'None'} | FK: ${schema.parentKey || 'None'}`);
    schema.fields.forEach(f => {
        const flags = [];
        if (f.isPrimary) flags.push('PK');
        if (f.isForeign) flags.push('FK');
        if (f.isIndexed) flags.push('IDX');
        console.log(`   - ${f.name}: ${f.type}${flags.length ? ` [${flags.join(', ')}]` : ''}`);
    });
}

function parseAllTablesInDir(dirPath, showJSON = false) {
    if (!fs.existsSync(dirPath)) {
        console.error(`❌ Directory not found: ${dirPath}`);
        process.exit(1);
    }

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.sql'));
    if (files.length === 0) {
        console.warn(`⚠️ No .sql files found in ${dirPath}`);
        return;
    }

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        parseSingleFile(filePath, showJSON);
    });
}

// Dispatch
if (isFile) {
    parseSingleFile(fullPath, showJSON);
} else {
    const tablesDir = path.join(fullPath, 'tables');
    parseAllTablesInDir(tablesDir, showJSON);
}