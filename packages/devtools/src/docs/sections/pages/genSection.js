// docs/pages/genSection.js
import { genGraph } from './graphData.js';
import { genPageHtmlPreviews } from './source/genHtmlPreviews.js';

export const sectionConfig = {
  title: 'Pages',
  format: 'html', // or 'mermaid', 'dot', 'json'
  graph: genGraph,
  html: genPageHtmlPreviews,
  outputDir: '../../../Docs/pagePreviews'
};
