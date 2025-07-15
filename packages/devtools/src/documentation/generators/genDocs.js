import { sections } from './sections/index.js';
import { DOCS_ROOT } from './graph/utils/paths.js';
import fs from 'fs/promises';
import path from 'path';

console.log(`[genDocs] Initializing WhatsFresh Docs...`);
const onboardingParts = [
  '# WhatsFresh Onboarding',
  '',
  '## Table of Contents'
];

const activeSections = sections.filter(s => s.active);

for (const { key, config } of activeSections) {
  console.log(`[genDocs] Building "${key}"...`);

  // Let the section handle all its outputs internally
  if (typeof config.buildDocs === 'function') {
    console.log(`[genDocs] Directing to "${key}"...`);
    await config.buildDocs();
  }

  // Just track the ToC for onboarding summary
  console.log(`[genDocs] Adding TOC summary for "${key}" to onboarding...`);
  onboardingParts.push(`- [${config.title}](./sections/${key}/${key}.md)`);
}

// Write onboarding summary
const onboardingMd = onboardingParts.join('\n') + '\n\n---\n\n_More details coming soon..._';
await fs.writeFile(path.join(DOCS_ROOT, 'onboarding.md'), onboardingMd);