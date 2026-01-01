const chokidar = require('chokidar');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const http = require('http');

const WORKFLOW_DIR = '/workspace/.n8n/workflows';
const N8N_URL = process.env.N8N_URL || 'http://n8n-whatsfresh:5678';
const N8N_MCP_TOKEN = process.env.N8N_MCP_TOKEN || '';
const MAPPING_FILE = '/workspace/.n8n/workflow-id-map.json';
const POLL_INTERVAL = 5000;

class N8nWorkflowSync {
  constructor() {
    this.idToNameMap = new Map();
    this.nameToIdMap = new Map();
    this.lastDbCheck = new Date();
    this.db = null;
  }

  async init() {
    console.log('🔄 Starting n8n workflow bidirectional sync...');
    console.log(`📁 Workflow dir: ${WORKFLOW_DIR}`);
    console.log(`🔗 n8n URL: ${N8N_URL}`);

    await this.loadOrCreateMapping();
    await this.buildInitialMapping();
    await this.cleanupIdBasedFiles();

    this.startFilesystemWatcher();
    this.startApiPoller();

    console.log('✅ Bidirectional sync ready!');
  }

  async loadOrCreateMapping() {
    try {
      if (fsSync.existsSync(MAPPING_FILE)) {
        const data = await fs.readFile(MAPPING_FILE, 'utf8');
        const mapping = JSON.parse(data);

        Object.entries(mapping).forEach(([name, id]) => {
          this.idToNameMap.set(id, name);
          this.nameToIdMap.set(name, id);
        });

        console.log(`📋 Loaded ${this.idToNameMap.size} workflow mappings`);
      } else {
        console.log('📋 No mapping file found, will create from existing workflows');
      }
    } catch (error) {
      console.error('⚠️  Error loading mapping:', error.message);
    }
  }

  async saveMapping() {
    try {
      const mapping = {};
      this.nameToIdMap.forEach((id, name) => {
        mapping[name] = id;
      });

      await fs.writeFile(MAPPING_FILE, JSON.stringify(mapping, null, 2));
      console.log(`💾 Saved ${Object.keys(mapping).length} mappings`);
    } catch (error) {
      console.error('❌ Error saving mapping:', error.message);
    }
  }

  async buildInitialMapping() {
    try {
      const workflows = await this.n8nApi('GET', '/workflows');

      let updated = false;

      for (const wf of workflows.data || []) {
        const humanName = this.workflowNameToFilename(wf.name);

        if (!this.nameToIdMap.has(humanName)) {
          this.idToNameMap.set(wf.id, humanName);
          this.nameToIdMap.set(humanName, wf.id);
          updated = true;
          console.log(`🆕 Mapped: ${humanName} → ${wf.id}`);
        }
      }

      if (updated) {
        await this.saveMapping();
      }

      console.log(`✅ Loaded ${this.idToNameMap.size} workflows from n8n`);
    } catch (error) {
      console.error('❌ Error building mapping:', error.message);
    }
  }

  async n8nApi(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${N8N_URL}/api/v1${endpoint}`);

      const options = {
        method,
        headers: {
          'Authorization': `Bearer ${N8N_MCP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
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
            reject(error);
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

  async cleanupIdBasedFiles() {
    try {
      const files = await fs.readdir(WORKFLOW_DIR);
      const idBasedFiles = files.filter(f =>
        f.endsWith('.json') &&
        f.match(/^[a-zA-Z0-9]{16}\.json$/)
      );

      if (idBasedFiles.length > 0) {
        console.log(`🧹 Found ${idBasedFiles.length} ID-based files to clean up`);

        for (const file of idBasedFiles) {
          const id = file.replace('.json', '');
          const humanName = this.idToNameMap.get(id);

          if (humanName && fsSync.existsSync(path.join(WORKFLOW_DIR, humanName))) {
            await fs.unlink(path.join(WORKFLOW_DIR, file));
            console.log(`🗑️  Removed: ${file} (duplicate of ${humanName})`);
          }
        }
      }
    } catch (error) {
      console.error('⚠️  Error cleaning up files:', error.message);
    }
  }

  workflowNameToFilename(name) {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') + '.json';
  }

  filenameToWorkflowName(filename) {
    return filename
      .replace('.json', '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  startFilesystemWatcher() {
    const watcher = chokidar.watch('*.json', {
      cwd: WORKFLOW_DIR,
      ignored: ['package.json', 'workflow-id-map.json'],
      persistent: true,
      ignoreInitial: true
    });

    watcher
      .on('change', (filename) => {
        console.log(`📝 File changed: ${filename}`);
        this.handleFileChange(filename);
      })
      .on('add', (filename) => {
        console.log(`➕ File added: ${filename}`);
        this.handleFileChange(filename);
      })
      .on('ready', () => {
        console.log('👀 Watching workflow files for changes...');
      });
  }

  async handleFileChange(filename) {
    try {
      const filePath = path.join(WORKFLOW_DIR, filename);
      const content = await fs.readFile(filePath, 'utf8');
      const workflow = JSON.parse(content);

      const workflowId = this.nameToIdMap.get(filename);

      if (workflowId) {
        console.log(`🔄 Syncing to n8n: ${workflow.name}`);
      } else {
        console.log(`🆕 New workflow detected: ${filename}`);
        await this.buildInitialMapping();
      }

    } catch (error) {
      console.error(`❌ Error handling file change ${filename}:`, error.message);
    }
  }

  startApiPoller() {
    setInterval(() => {
      this.pollApiChanges();
    }, POLL_INTERVAL);

    console.log(`⏱️  Polling n8n API every ${POLL_INTERVAL}ms`);
  }

  async pollApiChanges() {
    try {
      const workflows = await this.n8nApi('GET', '/workflows');

      for (const wf of workflows.data || []) {
        const lastUpdate = new Date(wf.updatedAt);

        if (lastUpdate > this.lastDbCheck) {
          await this.exportWorkflow(wf);
        }
      }

      this.lastDbCheck = new Date();
    } catch (error) {
      console.error('❌ API poll error:', error.message);
    }
  }

  async exportWorkflow(wf) {
    try {
      const humanName = this.idToNameMap.get(wf.id) || this.workflowNameToFilename(wf.name);
      const filePath = path.join(WORKFLOW_DIR, humanName);

      if (!this.idToNameMap.has(wf.id)) {
        this.idToNameMap.set(wf.id, humanName);
        this.nameToIdMap.set(humanName, wf.id);
        await this.saveMapping();
      }

      let shouldUpdate = true;

      if (fsSync.existsSync(filePath)) {
        const stats = fsSync.statSync(filePath);
        const fileModTime = stats.mtime;
        const dbModTime = new Date(wf.updatedAt);

        if (fileModTime >= dbModTime) {
          shouldUpdate = false;
        }
      }

      if (shouldUpdate) {
        const workflowJson = {
          id: wf.id,
          name: wf.name,
          description: wf.description,
          active: wf.active,
          nodes: wf.nodes || [],
          connections: wf.connections || {},
          settings: wf.settings || {},
          staticData: wf.staticData || null,
          pinData: wf.pinData || null,
          versionId: wf.versionId,
          createdAt: wf.createdAt,
          updatedAt: wf.updatedAt
        };

        await fs.writeFile(filePath, JSON.stringify(workflowJson, null, 2), 'utf8');
        console.log(`✅ Exported: ${humanName}`);
      }

    } catch (error) {
      console.error(`❌ Error exporting workflow:`, error.message);
    }
  }

  close() {
    console.log('👋 Shutting down workflow sync');
  }
}

module.exports = N8nWorkflowSync;
