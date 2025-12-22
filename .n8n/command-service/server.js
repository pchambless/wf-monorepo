const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Execute shell command (secure wrapper)
app.post('/api/execute', async (req, res) => {
  try {
    const { command, cwd, timeout = 30000 } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    // Basic security check
    const dangerousCommands = ['rm -rf /', 'dd if=', 'mkfs', 'fdisk'];
    if (dangerousCommands.some(dangerous => command.includes(dangerous))) {
      return res.status(403).json({ error: 'Command not allowed' });
    }

    console.log(`Executing: ${command}`);
    
    exec(command, { 
      cwd: cwd || process.cwd(),
      timeout: timeout,
      maxBuffer: 1024 * 1024 // 1MB buffer
    }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return res.status(500).json({
          success: false,
          error: error.message,
          stderr: stderr,
          command: command
        });
      }

      res.json({
        success: true,
        stdout: stdout,
        stderr: stderr,
        command: command,
        timestamp: new Date().toISOString()
      });
    });

  } catch (error) {
    console.error('Execute error:', error);
    res.status(500).json({ error: error.message });
  }
});

// File operations
app.post('/api/file/write', async (req, res) => {
  try {
    const { filePath, content, encoding = 'utf8' } = req.body;
    
    if (!filePath || content === undefined) {
      return res.status(400).json({ error: 'filePath and content are required' });
    }

    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(filePath, content, encoding);
    
    res.json({
      success: true,
      filePath: filePath,
      size: Buffer.byteLength(content, encoding),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('File write error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/file/append', async (req, res) => {
  try {
    const { filePath, content, encoding = 'utf8' } = req.body;
    
    if (!filePath || content === undefined) {
      return res.status(400).json({ error: 'filePath and content are required' });
    }

    await fs.appendFile(filePath, content, encoding);
    
    res.json({
      success: true,
      filePath: filePath,
      appended: Buffer.byteLength(content, encoding),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('File append error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Git operations
app.post('/api/git/commit-push', async (req, res) => {
  try {
    const { 
      repoPath = '/workspace',
      message = 'Automated commit',
      addPaths = ['sql/database']
    } = req.body;

    // Fix git permissions and ownership issues in Docker
    const commands = [
      `cd ${repoPath}`,
      `git config --global --add safe.directory ${repoPath}`,
      `git config --global user.name "n8n-automation"`,
      `git config --global user.email "automation@localhost"`,
      `chown -R $(whoami):$(whoami) .git || true`,
      `chmod -R 755 .git || true`,
      `git add ${addPaths.join(' ')}`,
      `git commit -m "${message}" || echo "No changes to commit"`
    ];

    const fullCommand = commands.join(' && ');
    
    console.log(`Executing git commands: ${fullCommand}`);
    
    exec(fullCommand, { 
      timeout: 60000,
      cwd: repoPath 
    }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Git error: ${error.message}`);
        console.error(`Git stderr: ${stderr}`);
        return res.status(500).json({
          success: false,
          error: error.message,
          stderr: stderr,
          command: fullCommand
        });
      }

      res.json({
        success: true,
        message: message,
        stdout: stdout,
        stderr: stderr,
        repoPath: repoPath,
        timestamp: new Date().toISOString()
      });
    });

  } catch (error) {
    console.error('Git operation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// MySQL dump operation using existing script
app.post('/api/mysqldump', async (req, res) => {
  try {
    const { 
      schema = 'api_wf'
    } = req.body;

    // Use the existing working script (no copy needed - parse script will read from original location)
    const command = `SCHEMA=${schema} /workspace/scripts/dump_api_wf_schema.sh`;
    
    exec(command, { 
      timeout: 120000,
      cwd: '/workspace'
    }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Mysqldump error: ${error.message}`);
        return res.status(500).json({
          success: false,
          error: error.message,
          stderr: stderr
        });
      }

      res.json({
        success: true,
        schema: schema,
        outputPath: `/workspace/db/dump/${schema}/schema_complete.sql`,
        stdout: stdout,
        stderr: stderr,
        timestamp: new Date().toISOString()
      });
    });

  } catch (error) {
    console.error('Mysqldump error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Command service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});