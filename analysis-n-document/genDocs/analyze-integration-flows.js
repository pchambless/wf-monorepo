#!/usr/bin/env node

/**
 * Client-Server Integration Analysis - Full-stack flow mapping for AI agents
 * Maps React components → API calls → Server controllers → Database access
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_OUTPUT_DIR = path.join(__dirname, '..', 'output', 'json');
const CONFIG_FILE = path.join(JSON_OUTPUT_DIR, 'config-relationships.json');
const MADGE_FILE = path.join(JSON_OUTPUT_DIR, 'raw-madge.json');
const OUTPUT_FILE = path.join(JSON_OUTPUT_DIR, 'integration-flows.json');

// API bridge file location
const API_JS_PATH = path.join(__dirname, '..', '..', '..', 'apps', 'wf-client', 'src', 'api', 'api.js');

function analyzeIntegrationFlows() {
  console.log('🔗 Analyzing client-server integration flows...');
  
  // Load existing analysis data
  if (!fs.existsSync(CONFIG_FILE) || !fs.existsSync(MADGE_FILE)) {
    console.error('❌ Required analysis files not found. Run npm run analyze:all first.');
    process.exit(1);
  }

  const configData = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  const madgeData = JSON.parse(fs.readFileSync(MADGE_FILE, 'utf8'));
  
  // Parse API bridge patterns
  let apiPatterns = {};
  if (fs.existsSync(API_JS_PATH)) {
    const apiContent = fs.readFileSync(API_JS_PATH, 'utf8');
    apiPatterns = parseApiPatterns(apiContent);
  }

  const integrationFlows = {
    metadata: {
      generated: new Date().toISOString(),
      analysis_type: "client_server_integration",
      ai_optimized: true,
      purpose: "Full-stack flow mapping for AI agents"
    },
    
    // Core API patterns
    api_bridge: {
      location: "apps/wf-client/src/api/api.js",
      primary_endpoint: "/api/execEventType",
      dml_endpoint: "/api/execDML",
      pattern: "Unified API layer between React components and server controllers"
    },
    
    // Full-stack flows for each page
    client_server_flows: {},
    
    // Integration patterns
    integration_patterns: {
      standard_page_flow: [
        "React Component",
        "useApi() hook", 
        "execEventType() call",
        "POST /api/execEventType",
        "execEventType.js controller",
        "executeEventType.js processor", 
        "queryResolver.js for DB access",
        "Response back through chain"
      ],
      
      dml_flow: [
        "React Component",
        "execDmlRequest() call",
        "POST /api/execDML", 
        "execDML.js controller",
        "dmlProcessor.js",
        "[create|read|update|delete].js",
        "Direct SQL execution",
        "Response back through chain"
      ]
    },
    
    // AI investigation shortcuts
    ai_shortcuts: {
      find_full_flow: "integration-flows.json.client_server_flows[eventType]",
      trace_api_call: "Check api.js execEventType() → server controller → processor",
      debug_endpoint: "POST /api/execEventType with {eventType, params}",
      server_entry_point: "apps/wf-server/server/controller/execEventType.js"
    }
  };

  // Map each page to its full-stack flow
  const pageFlows = configData.page_flows || {};
  
  Object.entries(pageFlows).forEach(([eventType, pageData]) => {
    if (pageData.category?.startsWith('page:')) {
      integrationFlows.client_server_flows[eventType] = buildFlowMapping(
        eventType, 
        pageData, 
        madgeData,
        apiPatterns
      );
    }
  });

  // Add special UI selector flows
  if (pageFlows.userAcctList) {
    integrationFlows.client_server_flows.userAcctList = {
      client_component: "UI Selector Component",
      api_call: "execEventType('userAcctList', params)",
      server_endpoint: "/api/execEventType",
      server_controller: "apps/wf-server/server/controller/execEventType.js",
      processor: "apps/wf-server/server/utils/executeEventType.js",
      database_access: "via queryResolver.js",
      special_purpose: "Feeds :acctID parameter to other pages",
      full_flow: "UI Selector → api.js → execEventType.js → executeEventType.js → DB → Parameter cascade"
    };
  }

  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(integrationFlows, null, 2));
  console.log(`✅ Integration flows analysis written to: ${OUTPUT_FILE}`);
  console.log(`📊 Mapped ${Object.keys(integrationFlows.client_server_flows).length} client-server flows`);
  
  return integrationFlows;
}

function buildFlowMapping(eventType, pageData, madgeData, apiPatterns) {
  // Determine server processor from madge data
  const execEventTypeDeps = madgeData["apps/wf-server/server/controller/execEventType.js"] || [];
  const processor = execEventTypeDeps.find(dep => dep.includes('executeEventType')) || 
                   "apps/wf-server/server/utils/executeEventType.js";

  return {
    client_component: pageData.component,
    api_call: `execEventType('${eventType}', params)`,
    server_endpoint: "/api/execEventType", 
    server_controller: "apps/wf-server/server/controller/execEventType.js",
    processor: processor,
    database_access: "via queryResolver.js",
    database_table: pageData.dbTable || null,
    layout_type: pageData.category,
    navigation_route: pageData.route,
    full_flow: `${pageData.component} → api.js → execEventType.js → ${processor} → DB`
  };
}

function parseApiPatterns(content) {
  // Extract API patterns from api.js content
  const patterns = {
    endpoints: [],
    functions: []
  };
  
  // Look for API endpoint calls
  const endpointMatches = content.match(/['"`]\/api\/\w+['"`]/g) || [];
  patterns.endpoints = [...new Set(endpointMatches.map(m => m.replace(/['"`]/g, '')))];
  
  // Look for exported functions
  const functionMatches = content.match(/export\s+const\s+(\w+)/g) || [];
  patterns.functions = functionMatches.map(m => m.replace('export const ', ''));
  
  return patterns;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeIntegrationFlows();
}

export { analyzeIntegrationFlows };