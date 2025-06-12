const fs = require('fs');
const path = require('path');

function createTestComponent(dir, name, contextImport) {
  const content = `
    import React from 'react';
    import { ${contextImport} } from '../context/${name}Context';

    function Test${name}Component() {
      const context = ${contextImport}();
      return <div>{context.data}</div>;
    }

    export default Test${name}Component;
  `;

  fs.writeFileSync(path.join(dir, `Test${name}Component.js`), content);
}

function verifyMigration(componentPath, oldImport, newImport) {
  const content = fs.readFileSync(componentPath, 'utf8');
  return {
    hasOldImport: content.includes(oldImport),
    hasNewImport: content.includes(newImport),
    hasBackup: fs.existsSync(`${componentPath}.bak`)
  };
}

module.exports = {
  createTestComponent,
  verifyMigration
};
