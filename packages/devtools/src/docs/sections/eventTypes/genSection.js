import { genAnyGraph } from '../../graph/genAnyGraph.js';
import { toMermaid } from '../../graph/toMermaid.js';
import path from 'path';
import fs from 'fs/promises';

export async function genSection(options = {}) {
  const title = options.title || 'Event Model';
  const graph = await genAnyGraph('eventGraph', { writeToFile: true });
  const diagram = toMermaid(graph, { layout: 'TD' });

  // Optional image output logic if using Mermaid CLI
  const outputDir = path.resolve(options.outputDir || './docs/assets');
  const imageName = 'event-diagram.png';
  const imagePath = path.join(outputDir, imageName);

  let imageTag = '';
  try {
    await fs.mkdir(outputDir, { recursive: true });
    const { execSync } = await import('child_process');
    const tmpFile = path.join(outputDir, 'temp.mmd');
    await fs.writeFile(tmpFile, `flowchart TD\n\n${diagram}`);
    execSync(`mmdc -i "${tmpFile}" -o "${imagePath}" -w 1200 -H 800`);
    imageTag = `![Event Diagram](${path.relative('docs', imagePath)})`;
  } catch (err) {
    console.warn('Mermaid CLI image generation failed (optional)', err.message);
  }

  return [
    `## ${title}`,
    ``,
    `This section documents the WhatsFresh event types and their relationships.`,
    ``,
    '```mermaid',
    diagram.trim(),
    '```',
    ``,
    imageTag || '> You can also use GitHub’s Markdown preview or a Mermaid plugin to view the diagram.',
    ``,
    `More details coming soon, including descriptions and examples for each event category.`
  ].join('\n');
}