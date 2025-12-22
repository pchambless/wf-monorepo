#!/usr/bin/env node

/**
 * n8n Development Sync
 * Watches workflow JSON files and syncs them with n8n via API
 * Enables edit-in-IDE → auto-sync → test workflow
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const chokidar = require('chokidar');

// Load environment variables from .env file if it exists
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed, that's ok
}

const N8N_URL = process.env.N8N_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY || '';
const WORKFLOW_DIR = path.join(__dirname, '../workflows'); // Point to workflows folder

class N8nDevSync {
  constructor() {
    this.workflowMap = new Map(); // filename -> workflow ID
    this.isInitialized = false;
  }

  async init() {
    console.log('🚀 Initializing n8n development sync...');
    console.log(`📁 Watching: ${WORKFLOW_DIR}`);
    
    // Load existing workflows from n8n
    await this.loadExistingWorkflows();
    
    // Start file watcher
    this.startFileWatcher();
    
    this.isInitialized = true;
    console.log('✅ n8n dev sync ready!');
  }

  async loadExistingWorkflows() {
    try {
      const workflows = await this.apiCall('GET', '/workflows');
      
      workflows.data?.forEach(workflow => {
        // Convert workflow name to expected filename using our naming convention
        const expectedFilename = this.workflowNameToFilename(workflow.name);
        
        if (fs.existsSync(path.join(WORKFLOW_DIR, expectedFilename))) {
          this.workflowMap.set(expectedFilename, workflow.id);
          console.log(`📋 Mapped: ${expectedFilename} → ${workflow.name} (${workflow.id})`);
        }
      });
      
    } catch (error) {
      console.error('❌ Failed to load existing workflows:', error.message);
    }
  }

  filenameToWorkflowName(filename) {
    // Convert kebab-case filename to Title Case workflow name
    // e.g., "agent-session-startup.json" → "Agent Session Startup"
    return filename
      .replace('.json', '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  workflowNameToFilename(name) {
    // Convert Title Case workflow name to kebab-case filename
    // e.g., "Agent Session Startup" → "agent-session-startup.json"
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') + '.json';
  }

  startFileWatcher() {
    const watcher = chokidar.watch('*.json', {
      cwd: WORKFLOW_DIR,
      ignored: [
        'package.json', 
        'package-lock.json'
      ],
      persistent: true
    });

    watcher
      .on('change', (filename) => {
        console.log(`📝 File changed: ${filename}`);
        this.syncWorkflow(filename);
      })
      .on('add', (filename) => {
        console.log(`➕ File added: ${filename}`);
        this.syncWorkflow(filename);
      })
      .on('ready', () => {
        console.log('👀 Watching workflow files for changes...');
      });
  }

  async syncWorkflow(filename) {
    try {
      const filePath = path.join(WORKFLOW_DIR, filename);
      const workflowData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      const existingId = this.workflowMap.get(filename);

      if (existingId) {
        // Update existing workflow
        await this.apiCall('PUT', `/workflows/${existingId}`, workflowData);
        console.log(`✅ Updated: ${workflowData.name}`);

        // Activate the workflow
        await this.apiCall('POST', `/workflows/${existingId}/activate`);
        console.log(`🟢 Activated: ${workflowData.name}`);

      } else {
        // Create new workflow
        const response = await this.apiCall('POST', '/workflows', workflowData);
        const newId = response.id;

        this.workflowMap.set(filename, newId);
        console.log(`✅ Created: ${workflowData.name} (${newId})`);

        // Activate the new workflow
        await this.apiCall('POST', `/workflows/${newId}/activate`);
        console.log(`🟢 Activated: ${workflowData.name}`);
      }

      // Test the webhook endpoint if it exists
      await this.testWebhook(workflowData);

      // Regenerate workflow registry
      await this.regenerateWorkflowRegistry();

    } catch (error) {
      console.error(`❌ Error syncing ${filename}:`, error.message);
    }
  }

  async regenerateWorkflowRegistry() {
    try {
      const { execSync } = require('child_process');
      execSync('node generate-workflow-registry.js', { cwd: __dirname });
      console.log('📋 Workflow registry updated');
    } catch (error) {
      console.error('⚠️  Failed to update workflow registry:', error.message);
    }
  }

  async testWebhook(workflowData) {
    // Find webhook nodes
    const webhookNodes = workflowData.nodes?.filter(node => 
      node.type === 'n8n-nodes-base.webhook'
    );
    
    if (webhookNodes?.length > 0) {
      const webhookPath = webhookNodes[0].parameters?.path;
      if (webhookPath) {
        const testUrl = `${N8N_URL}/webhook/${webhookPath}`;
        console.log(`🔗 Webhook available: ${testUrl}`);
        
        // Quick health check for GET endpoints
        if (!webhookNodes[0].parameters?.httpMethod || webhookNodes[0].parameters?.httpMethod === 'GET') {
          try {
            await this.apiCall('GET', `/webhook/${webhookPath}`, null, true);
            console.log(`✅ Webhook responding: ${webhookPath}`);
          } catch (error) {
            console.log(`⚠️  Webhook test failed: ${error.message}`);
          }
        }
      }
    }
  }

  async apiCall(method, endpoint, data = null, isWebhook = false) {
    return new Promise((resolve, reject) => {
      const baseUrl = isWebhook ? N8N_URL : `${N8N_URL}/api/v1`;
      const url = new URL(baseUrl + endpoint);
      
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(N8N_API_KEY && { 'X-N8N-API-KEY': N8N_API_KEY })
        },
        timeout: 5000
      };

      const req = http.request(url, options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const result = body ? JSON.parse(body) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(result);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${result.message || body}`));
            }
          } catch (error) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(body);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${body}`));
            }
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }
}

// Start the dev sync
const devSync = new N8nDevSync();
devSync.init().catch(console.error);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down n8n dev sync...');
  process.exit(0);
});