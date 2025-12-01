const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const TEMPLATE_SRC = path.resolve(__dirname, '../../templates/app-boilerplate/src/rendering');
const APP_DEST = path.resolve(__dirname, '../src/rendering');
const VERSION_FILE = path.join(APP_DEST, '.template-version');

async function syncRendering() {
  const isQuiet = process.argv.includes('--quiet');

  if (!isQuiet) {
    console.log('🔄 Checking rendering components...');
  }

  if (!fsSync.existsSync(TEMPLATE_SRC)) {
    console.warn('⚠️  Template rendering source not found:', TEMPLATE_SRC);
    console.warn('   Skipping sync - template will be created later');
    return;
  }

  const templateMtime = await getLatestMtime(TEMPLATE_SRC);
  const currentVersion = await getStoredVersion(VERSION_FILE);

  if (currentVersion >= templateMtime) {
    if (!isQuiet) {
      console.log('✓ Rendering components up to date');
    }
    return;
  }

  console.log('📦 Syncing rendering components from template...');

  await copyDir(TEMPLATE_SRC, APP_DEST);

  await fs.writeFile(VERSION_FILE, templateMtime.toString());

  console.log('✓ Rendering components synced successfully');
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function getLatestMtime(dir) {
  let latest = 0;

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        const stats = await fs.stat(fullPath);
        if (stats.mtimeMs > latest) {
          latest = stats.mtimeMs;
        }
      }
    }
  }

  await walk(dir);
  return latest;
}

async function getStoredVersion(versionFile) {
  try {
    const content = await fs.readFile(versionFile, 'utf8');
    return parseInt(content) || 0;
  } catch {
    return 0;
  }
}

syncRendering().catch((err) => {
  console.error('❌ Error syncing rendering components:', err.message);
  process.exit(0);
});
