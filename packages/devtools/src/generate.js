// Master script to run both generators

// First generate optimized configs
require('./adhoc-obsolete/genOptimizedConfigs').generateOptimizedConfigs()
  .then(() => {
    console.log('\n-------------------\n');
    // Then generate visual docs
    return require('./genVisualDocs').generateVisualDocumentation();
  })
  .catch(err => {
    console.error('Error running generators:', err);
    process.exit(1);
  });