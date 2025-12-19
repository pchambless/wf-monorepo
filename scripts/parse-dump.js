import { format as sqlFormatter } from 'sql-formatter';

/**
 * parse-dump.js
 * Extracts tables, views, and procedures from a MySQL schema dump into individual .sql files.
 * Usage: node parse-dump.js <input_dump.sql> <output_dir>
 */


import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Polyfill __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.argv.length < 4) {
  console.error('Usage: node parse-dump.js <input_dump.sql> <output_dir>');
  process.exit(1);
}

const inputFile = process.argv[2];
const outputDir = process.argv[3];

const tableDir = path.join(outputDir, 'tables');
const viewDir = path.join(outputDir, 'views');
const procDir = path.join(outputDir, 'procedures');

// Ensure output directories exist
[tableDir, viewDir, procDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const dump = fs.readFileSync(inputFile, 'utf8');

// Patterns for object extraction
const tableRegex = /CREATE TABLE `([^`]+)`[\s\S]+?ENGINE=[^;]+;/g;
// Improved view extraction: match /*!50001 CREATE ... VIEW ... */ blocks
const viewRegex = /\/\*!50001 CREATE[\s\S]+?VIEW `([^`]+)` AS ([\s\S]+?) \*\//g;
// Improved procedure/function extraction: match CREATE ... PROCEDURE ... END and CREATE ... FUNCTION ... END
const procRegex = /(CREATE\s+DEFINER=[^\n]+\s+(?:PROCEDURE|FUNCTION)\s+`?([^`\s]+)`?(?:\s*\([^)]*\))?[\s\S]+?END)/gi;

// Extract and write tables
let match;
while ((match = tableRegex.exec(dump))) {
  const [full, name] = match;
  const filePath = path.join(tableDir, `${name}.sql`);
  fs.writeFileSync(filePath, full + '\n');
}

// Extract and write views (CREATE OR REPLACE VIEW ... AS ...)
while ((match = viewRegex.exec(dump))) {
  const [, name, selectStmt] = match;
  // Try to get dbName from the SELECT statement or fallback
  let dbName = '';
  const dbMatch = selectStmt.match(/from `([^`]+)`\./);
  if (dbMatch) dbName = dbMatch[1];
  else dbName = 'api_wf'; // fallback, adjust as needed
  const filePath = path.join(viewDir, `${name}.sql`);
  // Clean up: remove DEFINER, ALGORITHM, SQL SECURITY, backticks, and lowercase keywords
  let cleaned = selectStmt
    .replace(/DEFINER=`[^`]+`@`[^`]+`/i, '')
    .replace(/ALGORITHM=\w+/i, '')
    .replace(/SQL SECURITY \w+/i, '')
    .replace(/\`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  // Format SELECT statement
  let formatted = sqlFormatter(cleaned, { language: 'mysql', keywordCase: 'lower' });
  const viewDef = `create or replace view ${name} as\n${formatted}\n`;
  fs.writeFileSync(filePath, viewDef);
}

// Extract and write procedures/functions (DBeaver-friendly, no DELIMITER)
while ((match = procRegex.exec(dump))) {
  const [full] = match;
  // Extract object name (PROCEDURE or FUNCTION)
  const nameMatch = full.match(/(?:PROCEDURE|FUNCTION)\s+`?([^`\s]+)`?/i);
  const name = nameMatch ? nameMatch[1] : 'unnamed_object';
  // Remove DELIMITER and comments
  let cleaned = full
    .replace(/DELIMITER \$\$/g, '')
    .replace(/DELIMITER ;/g, '')
    .replace(/\/\*!50003 DROP (PROCEDURE|FUNCTION) IF EXISTS[^;]+;/g, '')
    .replace(/\/\*!50003|\*\//g, '')
    .trim();
  const filePath = path.join(procDir, `${name}.sql`);
  fs.writeFileSync(filePath, cleaned + '\n');
}

console.log('Extraction complete.');
