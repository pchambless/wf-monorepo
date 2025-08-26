/**
 * Auto-generated using require.context
 */
import React from 'react';
import EventOrchestrator from '../../components/EventOrchestrator';

// Dynamically import all eventTypes from subdirectories
function importAll(r) {
  const modules = {};
  r.keys().forEach((key) => {
    const moduleName = key.replace(/^\.\//, '').replace(/\.js$/, '').replace(/.*\//, '');
    const module = r(key);
    // Get the first export (assuming single export per file)
    const exportName = Object.keys(module)[0];
    if (exportName) {
      modules[exportName] = module[exportName];
    }
  });
  return modules;
}

// Import all .js files from subdirectories
const requireContext = require.context('./', true, /\.(js)$/);
const allModules = importAll(requireContext);

// Convert to the expected format
const allEventTypes = Object.entries(allModules).map(([name, config]) => ({
  name,
  config
}));

export default function PlanManager() {
  return (
    <EventOrchestrator 
      eventTypes={allEventTypes}
      primaryEventType="pagePlanManager"
    />
  );
};
