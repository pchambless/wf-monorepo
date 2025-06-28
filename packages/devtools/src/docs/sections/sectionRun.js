import minimist from 'minimist';

const args = minimist(process.argv.slice(2));
const [sectionKey] = args._;

if (!sectionKey) {
  console.error('❌ Usage: yarn run:section eventTypes');
  process.exit(1);
}

try {
  const modulePath = `./${sectionKey}/index.js`;
  const { sectionConfig } = await import(modulePath);
  console.log(`[sectionRun]🚀 Running buildDocs() for section "${sectionKey}"...\n`);
  await sectionConfig.buildDocs();
  console.log(`[sectionRun]✅ Section "${sectionKey}" built successfully.`);
} catch (err) {
  console.error(`[sectionRun]❌ Failed to run section "${sectionKey}":`, err.message);
  process.exit(1);
}