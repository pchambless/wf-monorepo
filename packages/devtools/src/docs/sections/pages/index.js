import { genPageHtmlPreviews } from './source/genHtmlPreviews.js';

export const sectionConfig = {
  key: 'pages',
  title: 'Pages',
  description: 'Samples of WhatsFresh page - Table, Form and DML logic.',
  format: 'html',
  outputDir: '../../../Docs/pagePreviews',
  graphHint: {
    rootNode: 'pages',
    label: 'Section: Pages'
  },
  graph: 'html',
  html: genPageHtmlPreviews,
  genSection
};