import { scaffoldSection } from './scaffoldSection.js';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2));
const [key] = args._;
const title = args.title || capitalize(key);
const description = args.desc || `Documents the ${title} domain.`;

if (!key) {
  console.error('[scaffoldRun] ❌ Usage: yarn scaffold:section no key');
  process.exit(1);
}

scaffoldSection(key, title, description).catch(err => {
  console.error('[scaffoldRun] ❌ Scaffolding failed:', err);
  process.exit(1);
});

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}