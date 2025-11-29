const fs = require('fs-extra');
const path = require('path');

const TEMPLATE_SRC = path.resolve(__dirname, '../../../templates/app-boilerplate/src/rendering');
const APP_DEST = path.resolve(__dirname, '../src/rendering');

let isWatching = false;

async function copyFiles() {
  if (!await fs.pathExists(TEMPLATE_SRC)) {
    console.log('⚠️  Template rendering source not found - waiting for creation...');
    return;
  }

  console.log('📦 Syncing rendering components...');
  await fs.copy(TEMPLATE_SRC, APP_DEST, { overwrite: true });
  console.log('✓ Synced at', new Date().toLocaleTimeString());
}

async function watchTemplate() {
  console.log('👀 Watching template for changes:', TEMPLATE_SRC);
  console.log('   Target:', APP_DEST);
  console.log('');

  if (await fs.pathExists(TEMPLATE_SRC)) {
    await copyFiles();
  }

  if (await fs.pathExists(TEMPLATE_SRC)) {
    const watcher = fs.watch(TEMPLATE_SRC, { recursive: true }, async (eventType, filename) => {
      if (isWatching) return;

      isWatching = true;
      setTimeout(async () => {
        await copyFiles();
        isWatching = false;
      }, 500);
    });

    process.on('SIGINT', () => {
      console.log('\n\n👋 Stopping watch...');
      watcher.close();
      process.exit(0);
    });
  } else {
    console.log('⏳ Waiting for template directory to be created...');
    const checkInterval = setInterval(async () => {
      if (await fs.pathExists(TEMPLATE_SRC)) {
        clearInterval(checkInterval);
        watchTemplate();
      }
    }, 2000);
  }
}

watchTemplate().catch((err) => {
  console.error('❌ Watch error:', err.message);
  process.exit(1);
});
