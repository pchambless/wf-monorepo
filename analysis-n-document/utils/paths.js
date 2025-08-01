import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getGeneratedPath(key, extension, fileName = key) {
  const outputDir = path.resolve(__dirname, '../output');
  return path.join(outputDir, `${fileName}.${extension}`);
}