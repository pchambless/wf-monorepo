import sectionConfig from './sectionConfig.js';
import fs from 'fs/promises';
import path from 'path';

// Use absolute path instead of relative path
const DOCS_DIR = 'C:\\Users\\pc790\\whatsfresh\\Projects\\wf-monorepo-new\\Docs';

const genAllSections = async () => {
  const docParts = [];

  try {
    for (const { title, generator } of sectionConfig) {
      console.log(`Generating section: ${title}`);
      const gen = await import(generator);
      const content = await gen.genSection(); 
      docParts.push(`# ${title}\n\n${content}`);
    }

    const fullDoc = docParts.join('\n\n---\n\n');
    
    // Ensure directory exists
    await fs.mkdir(DOCS_DIR, { recursive: true });
    
    // Write to the correct path
    const outputPath = path.join(DOCS_DIR, 'onboarding.md');
    await fs.writeFile(outputPath, fullDoc);
    
    console.log(`Documentation generated at: ${outputPath}`);
  } catch (err) {
    console.error('Error generating documentation:', err);
    throw err;
  }
};

genAllSections().catch(err => {
  console.error('Doc generation failed:', err);
  process.exit(1);
});