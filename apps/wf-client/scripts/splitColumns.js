const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '../src/pages/Product/columns.js');
const destDir = path.join(__dirname, '../src/pages/Product/columns');

try {
  // Create backup
  const backupPath = sourcePath + '.backup';
  fs.copyFileSync(sourcePath, backupPath);
  console.log('Created backup at:', backupPath);

  // Create columns directory
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
    console.log('Created directory:', destDir);
  }

  // Read source file
  const sourceContent = fs.readFileSync(sourcePath, 'utf8');
  console.log('Read source file');

  // Extract each column map section
  const sections = sourceContent.match(/(\w+):\s*\[([\s\S]*?)\](?=,\s*\w+:|}\s*$)/g);
  
  if (!sections) {
    throw new Error('No column map sections found');
  }

  // Process each section
  sections.forEach(section => {
    const nameMatch = section.match(/^(\w+):/);
    if (!nameMatch) return;

    const name = nameMatch[1];
    const content = section.substring(section.indexOf('[') + 1, section.lastIndexOf(']'));

    const fileContent = `// filepath: ${path.join(destDir, name.toLowerCase())}.js
import createLogger from '../../../utils/logger';
const log = createLogger('${name}Columns');

export const ${name} = [${content}];
`;

    const filePath = path.join(destDir, `${name.toLowerCase()}.js`);
    fs.writeFileSync(filePath, fileContent);
    console.log(`Created ${name} file`);
  });

  // Create index.js
  const names = sections.map(s => s.match(/^(\w+):/)[1]);
  const indexContent = `// filepath: ${path.join(destDir, 'index.js')}
${names.map(name => `import { ${name} } from './${name.toLowerCase()}';`).join('\n')}

export const columnMap = {
${names.map(name => `  ${name},`).join('\n')}
};
`;

  fs.writeFileSync(path.join(destDir, 'index.js'), indexContent);
  console.log('Created index.js');

} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}