import { ensureGraphStub } from '../../graph/utils/ensureGraphStub.js';
import generateWidgetDocumentation from './source/index.js';

export async function genSection() {
  await ensureGraphStub(sectionConfig);
  await generateWidgetDocumentation();
  return '_Generated HTML documentation for all WhatsFresh widgets._';
}

