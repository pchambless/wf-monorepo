import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go up from: packages/devtools/src/docs/graph/utils
// To:         <monorepo-root>
const MONOREPO_ROOT = path.resolve(__dirname, '../../../../..');

export const DOCS_ROOT = path.join(MONOREPO_ROOT, '/devtools/src/docs');
export const SECTION_DOCS_ROOT = path.join(DOCS_ROOT, 'sections');

export function getSectionDocsPath(key) {
  return path.join(SECTION_DOCS_ROOT, key);
}

export function getGeneratedPath(key, type, filename) {
  return path.join(getSectionDocsPath(key), 'generated', `${filename}.${type}`);
}