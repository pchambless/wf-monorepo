export function normalizeSQL(sql) {
    return sql
        .replace(/`/g, '') // Remove backticks
        .replace(/--.*$/gm, '') // Strip single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Strip multi-line comments
        .replace(/COLLATE\s*=\s*['"][^'"]+['"]/gi, '')
        .replace(/COLLATE\s*['"][^'"]+['"]/gi, '')
        .replace(/ENGINE\s*=\s*\w+/gi, '')
        .replace(/AUTO_INCREMENT\s*=\s*\d+/gi, '')
        .replace(/AUTO_INCREMENT/gi, '')
        .replace(/USING\s+BTREE/gi, '')
        .replace(/COMMENT\s+'[^']*'/gi, '')
        .replace(/AS\s*\([^)]+\)\s*STORED/gi, '')
        .replace(/DEFAULT\s*\(([^)]+)\)/gi, 'DEFAULT $1')
        .replace(/CREATE TABLE IF NOT EXISTS/gi, 'CREATE TABLE')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n'); // Preserve line breaks
}