#!/usr/bin/env node
/**
 * Populate modules and module_xref tables from analysis JSON files
 * Usage: node populate-modules-db.js [server|studio|all]
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_URL = process.env.API_URL || "http://localhost:3001";
const USER_ID = "analyze-script";

// Always read from the same analysis.json file (analyze-app.js overwrites it)
const ANALYSIS_FILE = "./output/monorepo/analysis.json";

function transformAnalysisToLeanFormat(analysis, scope) {
  const modules = [];
  const dependencies = [];

  for (const [filePath, metadata] of Object.entries(analysis.files)) {
    // Phase 1: Module list (simplified - blast_radius will be derived)
    modules.push({
      file_path: filePath,
    });

    // Phase 2: Dependency mappings (simplified - type will be derived)
    for (const depPath of metadata.dependencies || []) {
      dependencies.push({
        from_path: filePath,
        to_path: depPath,
      });
    }
  }

  return {
    modules,
    dependencies,
  };
}

async function callModuleLoad(modules, userId) {
  // Phase 1: Load modules only
  const jsonString = JSON.stringify(modules);
  console.log(`   📦 Phase 1: Loading ${modules.length} modules...`);
  console.log(`   📊 JSON size: ${jsonString.length} characters`);
  console.log(`   🚀 Starting modules load...`);

  const requestBody = {
    eventSQLId: 27, // spModuleLoad
    params: {
      p_modules: jsonString,
      firstName: userId,
    },
  };

  const execResponse = await fetch(`${API_URL}/api/execEvent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!execResponse.ok) {
    const error = await execResponse.json();
    throw new Error(
      `Module load failed: ${error.message || execResponse.statusText}`
    );
  }

  const result = await execResponse.json();
  console.log(`   ✅ Completed modules load successfully`);
  return result;
}

async function callModuleMap(dependencies, userId) {
  // Phase 2: Map dependencies
  const jsonString = JSON.stringify(dependencies);
  console.log(`   🔗 Phase 2: Mapping ${dependencies.length} dependencies...`);
  console.log(`   📊 JSON size: ${jsonString.length} characters`);
  console.log(`   🚀 Starting modules map...`);

  const requestBody = {
    eventSQLId: 29, // spModuleMap
    params: {
      analysis_json: jsonString,
      firstName: userId,
    },
  };

  const response = await fetch(`${API_URL}/api/execEvent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Module mapping failed: ${error.message || response.statusText}`
    );
  }

  const result = await response.json();
  console.log(`   ✅ Completed modules map successfully`);
  return result;
}

async function processAnalysisFile() {
  const analysisPath = path.join(__dirname, ANALYSIS_FILE);

  if (!fs.existsSync(analysisPath)) {
    throw new Error(`Analysis file not found: ${ANALYSIS_FILE}. Run analyze-app.js first.`);
  }

  const analysis = JSON.parse(fs.readFileSync(analysisPath, "utf8"));
  const scope = analysis.metadata.scope;

  console.log(`\n📊 Processing ${scope}...`);
  console.log(`   📁 Files in analysis: ${Object.keys(analysis.files).length}`);

  console.log(`   🔄 Transforming to lean format...`);
  const { modules, dependencies } = transformAnalysisToLeanFormat(
    analysis,
    scope
  );

  // Save the actual JSON payload for debugging
  const payloadFile = path.join(
    __dirname,
    `${scope.replace("/", "-")}_modules.json`
  );
  fs.writeFileSync(
    payloadFile,
    JSON.stringify({ modules, dependencies }, null, 2)
  );
  console.log(`   📄 Saved JSON payload to ${payloadFile}`);
  console.log(
    `   📦 Modules: ${modules.length}, Dependencies: ${dependencies.length}`
  );

  // Two-phase execution
  console.log(`   📤 Executing two-phase population...`);

  const moduleResult = await callModuleLoad(modules, USER_ID);
  console.log(
    `   ✅ Phase 1 complete: ${
      moduleResult.data?.[0]?.modules_processed || "N/A"
    } modules processed`
  );

  const dependencyResult = await callModuleMap(dependencies, USER_ID);
  console.log(
    `   ✅ Phase 2 complete: ${
      dependencyResult.data?.[0]?.dependencies_mapped || "N/A"
    } dependencies mapped`
  );

  return {
    modules_processed: moduleResult.data?.[0]?.modules_processed || 0,
    dependencies_mapped: dependencyResult.data?.[0]?.dependencies_mapped || 0,
    modules_deleted: moduleResult.data?.[0]?.modules_deleted || 0,
  };
}

async function main() {
  console.log("🚀 Starting module database population...");
  console.log(`🔌 API: ${API_URL}`);
  console.log(`📂 Reading from: ${ANALYSIS_FILE}`);

  const result = await processAnalysisFile();

  console.log("\n✅ Population complete!");
  console.log("\n📊 Summary:");
  console.log(
    `     • Modules processed: ${
      result.modules_processed || result.data?.[0]?.modules_processed || "N/A"
    }`
  );
  console.log(
    `     • Dependencies mapped: ${
      result.dependencies_mapped ||
      result.data?.[0]?.dependencies_mapped ||
      "N/A"
    }`
  );
}

main().catch((error) => {
  console.error("❌ Fatal error:", error.message);
  console.error(error.stack);
  process.exit(1);
});
