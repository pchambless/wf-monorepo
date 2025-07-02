import { genGraph } from './graphData.js';
import { genPageHtmlPreviews } from './source/genHtmlPreviews.js';
import { ensureGraphStub } from '../../graph/utils/ensureGraphStub.js';

export async function genSection() {
  await ensureGraphStub(sectionConfig);
  await genPageHtmlPreviews(); // Generates HTML previews into Docs/pagePreviews
  return '_Generated WhatsFresh page HTML previews._';
}

