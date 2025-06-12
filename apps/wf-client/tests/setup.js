const fs = require('fs');
const path = require('path');
require('@testing-library/jest-dom');

// Create test directories
const dirs = ['migrations/fixtures', 'migrations/__snapshots__'];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Global test utilities
global.testUtils = {
  fixturesPath: path.join(__dirname, 'migrations/fixtures'),
  createTestFile: (name, content) => {
    fs.writeFileSync(path.join(global.testUtils.fixturesPath, name), content);
  },
  readTestFile: (name) => {
    return fs.readFileSync(path.join(global.testUtils.fixturesPath, name), 'utf8');
  },
  cleanup: () => {
    fs.rmSync(global.testUtils.fixturesPath, { recursive: true, force: true });
    fs.mkdirSync(global.testUtils.fixturesPath);
  }
};
