#!/usr/bin/env node
/**
 * Test script to generate JSON files and examine the data structure
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function transformAnalysisToLeanFormat(analysis, scope) {
  const modules = [];
  const dependencies = [];

  for (const [filePath, metadata] of Object.entries(analysis.files)) {
    // Phase 1: Module list (simple)
    modules.push({
      file_path: filePath,
      blast_radius: metadata.blast_radius,
    });

    // Phase 2: Dependency mappings
    for (const depPath of metadata.dependencies || []) {
      const isInternal = (metadata.internal_dependencies || []).includes(
        depPath
      );
      dependencies.push({
        from_path: filePath,
        to_path: depPath,
        type: isInternal ? "internal" : "external",
      });
    }
  }

  return {
    modules,
    dependencies,
  };
}

// Test with server analysis
const serverAnalysisPath = path.join(
  __dirname,
  "./output/monorepo/server-analysis.json"
);
if (fs.existsSync(serverAnalysisPath)) {
  console.log("🔄 Processing server analysis...");

  const analysis = JSON.parse(fs.readFileSync(serverAnalysisPath, "utf8"));
  console.log(
    `📁 Total files in analysis: ${Object.keys(analysis.files).length}`
  );

  const { modules, dependencies } = transformAnalysisToLeanFormat(
    analysis,
    "server"
  );

  console.log(`📦 Modules extracted: ${modules.length}`);
  console.log(`🔗 Dependencies extracted: ${dependencies.length}`);

  // Save sample files
  const modulesFile = path.join(__dirname, "sample-modules.json");
  const dependenciesFile = path.join(__dirname, "sample-dependencies.json");

  fs.writeFileSync(modulesFile, JSON.stringify(modules.slice(0, 5), null, 2));
  fs.writeFileSync(
    dependenciesFile,
    JSON.stringify(dependencies.slice(0, 10), null, 2)
  );

  console.log(`📄 Sample modules saved to: ${modulesFile}`);
  console.log(`📄 Sample dependencies saved to: ${dependenciesFile}`);

  // Show samples
  console.log("\n📋 Sample modules:");
  console.log(JSON.stringify(modules.slice(0, 3), null, 2));

  console.log("\n🔗 Sample dependencies:");
  console.log(JSON.stringify(dependencies.slice(0, 5), null, 2));

  // Show size analysis
  const modulesJson = JSON.stringify(modules);
  const dependenciesJson = JSON.stringify(dependencies);

  console.log(`\n📊 JSON Sizes:`);
  console.log(`   Modules: ${modulesJson.length} characters`);
  console.log(`   Dependencies: ${dependenciesJson.length} characters`);
  console.log(
    `   Total: ${modulesJson.length + dependenciesJson.length} characters`
  );
} else {
  console.log("❌ Server analysis file not found");
}
