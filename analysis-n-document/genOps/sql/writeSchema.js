// writeSchema.js
import fs from 'fs';
import path from 'path';

export function writeSchema(schema, outputDir) {
    if (!schema?.name) {
        throw new Error('Schema must have a name');
    }

    const fileName = `${schema.name}.json`;
    const filePath = path.join(outputDir, fileName);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(schema, null, 2), 'utf8');
}