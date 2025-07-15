import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go up from: packages/devtools/src/docs/graph/utils
// To:         packages/devtools/src
const DEVTOOLS_SRC = path.resolve(__dirname, '../../..');

export const DOCS_ROOT = path.join(DEVTOOLS_SRC, 'docs');

export function getDocsPath(key) {
  return path.join(DOCS_ROOT, key);
}

export function getGeneratedPath(key, type, filename) {
  return path.join(getDocsPath(key), `${filename}.${type}`);
}