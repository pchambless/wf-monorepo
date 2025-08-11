import fs from 'fs';
import path from 'path';
import { normalizeSQL } from './normalizeSQL.js';
import { parseSQLFile } from './parseTableSchema.js';
import { addFieldAttributes } from './addFieldAttributes.js';
// import { validateSchema } from './validateSchema.js'; // optional
import { writeSchema } from './writeSchema.js';

const baseDir = '/home/paul/wf-monorepo-new/sql/database';
const inputArg = process.argv[2]?.trim();
const showJSON = process.argv.includes('--json');

const outputDir = './jsonSchemas';

async function main() {
    if (!inputArg) {
        console.error('❌ Usage: node genSchemas.js <file|directory> [--json]');
        process.exit(1);
    }

    const fullPath = path.resolve(baseDir, inputArg);
    const isFile = fullPath.endsWith('.sql');

    let files;
    if (isFile) {
        if (!fs.existsSync(fullPath)) {
            console.error(`❌ File not found: ${fullPath}`);
            process.exit(1);
        }
        files = [inputArg];
    } else {
        const dirPath = fullPath;
        if (!fs.existsSync(dirPath)) {
            console.error(`❌ Directory not found: ${dirPath}`);
            process.exit(1);
        }
        files = fs.readdirSync(dirPath).filter(f => f.endsWith('.sql'));
    }

    for (const file of files) {
        console.log(`[genSchemas] Processing: ${file}`);
        const filePath = isFile ? fullPath : path.join(fullPath, file);
        const rawSQL = fs.readFileSync(filePath, 'utf8');
        const sql = normalizeSQL(rawSQL);

        const parsed = parseSQLFile(sql);
        if (!parsed) {
            console.warn(`⚠️ Could not parse: ${file}`);
            continue;
        }

        const enriched = addFieldAttributes(parsed);

        // const isValid = validateSchema(enriched); // optional
        // if (!isValid) {
        //   console.warn(`⚠️ Skipping invalid schema: ${enriched.name}`);
        //   continue;
        // }

        await writeSchema(enriched, outputDir);
        console.log(`✅ Saved schema for ${enriched.name}`);
    }
}

main().catch(err => {
    console.error('❌ Pipeline failed:', err);
});