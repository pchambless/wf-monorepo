
export const sectionConfig = {
  key: 'widgets',
  title: 'Widgets',
  description: 'Documents the WhatsFresh reusable widgets.',
  format: 'mermaid', // or 'html' if you switch to previews
  graphHint: {
    rootNode: 'widgets',
    label: 'Section: Widgets'
  },
  graph: () => genAnyGraph('widgets'),
  genSection
};