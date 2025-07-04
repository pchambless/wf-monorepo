/**
 * Master Documentation Generator
 * Orchestrates all documentation generation and creates unified output
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Template utilities for consistent HTML generation
 */
export class TemplateEngine {
  constructor() {
    this.templatesDir = path.join(__dirname, '../templates');
    this.outputDir = path.join(__dirname, '../generated');
  }

  /**
   * Load and process template files
   */
  async loadTemplate(templateName) {
    const templatePath = path.join(this.templatesDir, templateName);
    return await fs.readFile(templatePath, 'utf8');
  }

  /**
   * Replace template variables with values
   */
  processTemplate(template, variables = {}) {
    let processed = template;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value || '');
    }

    return processed;
  }

  /**
   * Generate navigation with active state
   */
  async generateNavigation(activeSection = 'home', baseUrl = '.') {
    const navTemplate = await this.loadTemplate('navigation.html');

    const variables = {
      baseUrl,
      homeActive: activeSection === 'home' ? 'class="active"' : '',
      overviewActive: activeSection === 'overview' ? 'class="active"' : '',
      widgetsActive: activeSection === 'widgets' ? 'class="active"' : '',
      pagesActive: activeSection === 'pages' ? 'class="active"' : '',
      eventsActive: activeSection === 'events' ? 'class="active"' : '',
      directivesActive: activeSection === 'directives' ? 'class="active"' : '',
      apiActive: activeSection === 'api' ? 'class="active"' : '',
      rulesActive: activeSection === 'rules' ? 'class="active"' : ''
    };

    return this.processTemplate(navTemplate, variables);
  }

  /**
   * Generate complete HTML page
   */
  async generatePage(options = {}) {
    const {
      title = 'Documentation',
      content = '',
      activeSection = 'home',
      baseUrl = '.',
      cssPath = baseUrl // Default cssPath to baseUrl
    } = options;

    const pageTemplate = await this.loadTemplate('page-template.html');
    const navigation = await this.generateNavigation(activeSection, baseUrl);

    const variables = {
      title,
      content,
      navigation,
      cssPath,
      timestamp: new Date().toLocaleDateString()
    };

    return this.processTemplate(pageTemplate, variables);
  }

  /**
   * Ensure output directory exists
   */
  async ensureOutputDir() {
    await fs.mkdir(this.outputDir, { recursive: true });
  }

  /**
   * Copy CSS to output directory
   */
  async copyStyles() {
    const srcCss = path.join(this.templatesDir, 'styles.css');
    const destCss = path.join(this.outputDir, 'styles.css');
    await fs.copyFile(srcCss, destCss);
  }
}

/**
 * Main documentation generation orchestrator
 */
export class MasterDocGenerator {
  constructor() {
    this.templateEngine = new TemplateEngine();
    this.sectionsDir = path.join(__dirname, '../sections');
    this.outputDir = path.join(__dirname, '../generated');
  }

  /**
   * Generate all documentation sections
   */
  async generateAllDocs() {
    console.log('🚀 Starting master documentation generation...');

    try {
      // Setup
      await this.templateEngine.ensureOutputDir();
      await this.templateEngine.copyStyles();

      // Generate main index
      await this.generateMainIndex();

      // Generate overview documentation
      await this.generateOverviewDocs();

      // Generate widgets documentation
      await this.generateWidgetsDocs();

      // Generate rules documentation  
      await this.generateRulesDocs();

      // Generate pages documentation
      await this.generatePagesDocs();

      // Generate eventTypes documentation
      await this.generateEventTypesDocs();

      // Future: Generate other sections
      // await this.generateDirectivesDocs();
      // await this.generateApiDocs();

      console.log('✅ Master documentation generation complete!');
      console.log(`📖 Documentation available at: ${this.outputDir}/index.html`);

      // Auto-launch documentation in browser
      await this.launchDocumentation();

    } catch (error) {
      console.error('❌ Error generating documentation:', error);
      throw error;
    }
  }

  /**
   * Generate main documentation index
   */
  async generateMainIndex() {
    console.log('📝 Generating main index...');

    const content = `
      <h1>WhatsFresh Development Documentation</h1>
      <p>Welcome to the WhatsFresh development documentation. This documentation is automatically generated from the codebase and provides comprehensive information about the system architecture, components, and development standards.</p>
      
      <div class="card">
        <h2>Documentation Sections</h2>
        <table>
          <thead>
            <tr>
              <th>Section</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><a href="./overview/index.html">Developer Overview</a></td>
              <td>Architecture improvements, Docker setup, development guide</td>
              <td>✅ Available</td>
            </tr>
            <tr>
              <td><a href="./widgets/index.html">Widget Registry</a></td>
              <td>Complete catalog of UI widgets and components</td>
              <td>✅ Available</td>
            </tr>
            <tr>
              <td><a href="./rules/index.html">Architecture Rules</a></td>
              <td>Development standards and architectural decisions</td>
              <td>✅ Available</td>
            </tr>
            <tr>
              <td><a href="./pages/index.html">Page Previews</a></td>
              <td>Visual previews of generated pages and layouts</td>
              <td>✅ Available</td>
            </tr>
            <tr>
              <td><a href="./events/index.html">Event Types Flow</a></td>
              <td>Complete event system flow and relationships</td>
              <td>✅ Available</td>
            </tr>
            <tr>
              <td><a href="./directives/index.html">Directive System</a></td>
              <td>Field directives and form generation documentation</td>
              <td>🔄 Coming Soon</td>
            </tr>
            <tr>
              <td><a href="./api/index.html">API Documentation</a></td>
              <td>REST API endpoints and data contracts</td>
              <td>🔄 Coming Soon</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="card">
        <h2>Quick Start</h2>
        <p>New to WhatsFresh development? Start here:</p>
        <ol>
          <li><a href="./rules/index.html">Read the Architecture Rules</a> - Understand our development standards</li>
          <li><a href="./widgets/index.html">Explore the Widget Registry</a> - See available UI components</li>
          <li>Check out the directive system for form generation</li>
          <li>Review API documentation for backend integration</li>
        </ol>
      </div>
    `;

    const html = await this.templateEngine.generatePage({
      title: 'Home',
      content,
      activeSection: 'home'
    });

    await fs.writeFile(path.join(this.outputDir, 'index.html'), html);
    console.log('✅ Main index generated');
  }

  /**
   * Generate overview documentation section
   */
  async generateOverviewDocs() {
    console.log('📋 Generating overview documentation...');

    const { OverviewDocGenerator } = await import('../sections/overview/genOverviewDocs.js');
    const overviewGenerator = new OverviewDocGenerator(this.templateEngine);

    await overviewGenerator.generateDocs(this.outputDir);
    console.log('✅ Overview documentation generated');
  }

  /**
   * Generate widgets documentation section
   */
  async generateWidgetsDocs() {
    console.log('🔧 Generating widgets documentation...');

    try {
      // Create widgets output directory
      const widgetsOutputDir = path.join(this.outputDir, 'widgets');
      await fs.mkdir(widgetsOutputDir, { recursive: true });

      // Import widget registry directly
      const { WIDGET_REGISTRY } = await import('../../../../shared-ui/src/widgets/index.js');

      // Generate widget content
      let content = `
        <h1>Widget Registry</h1>
        <p>The WhatsFresh widget system provides ${Object.keys(WIDGET_REGISTRY).length} reusable UI components across applications.</p>
        
        <div class="widget-categories">
      `;

      // Group widgets by category
      const categories = {};
      Object.entries(WIDGET_REGISTRY).forEach(([key, widget]) => {
        const category = widget.category || 'Other';
        if (!categories[category]) categories[category] = [];
        categories[category].push({ key, ...widget });
      });

      // Generate category sections
      Object.entries(categories).forEach(([category, widgets]) => {
        content += `
          <div class="category-section">
            <h2>${category} Widgets</h2>
            <div class="widget-grid">
        `;

        widgets.forEach(widget => {
          content += `
            <div class="widget-card">
              <h3>${widget.displayName || widget.key}</h3>
              <p><strong>Type:</strong> ${widget.type}</p>
              <p><strong>Size:</strong> ${widget.size?.default || 'medium'}</p>
              <p><strong>Apps:</strong> ${widget.targetApps?.join(', ') || 'All'}</p>
              ${widget.description ? `<p>${widget.description}</p>` : ''}
              <div class="widget-actions">
                <a href="./detail/${widget.key}.html" class="detail-link">View Details</a>
              </div>
            </div>
          `;
        });

        content += `
            </div>
          </div>
        `;
      });

      content += `
        </div>
        
        <style>
          .widget-categories { margin: 2rem 0; }
          .category-section { margin-bottom: 3rem; }
          .widget-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 1rem; 
            margin: 1rem 0; 
          }
          .widget-card { 
            border: 1px solid #ddd; 
            padding: 1rem; 
            border-radius: 8px; 
            background: #f9f9f9; 
          }
          .widget-card h3 { margin: 0 0 0.5rem 0; color: #2c3e50; }
          .widget-card p { margin: 0.25rem 0; font-size: 0.9rem; }
          .widget-actions { 
            margin-top: 1rem; 
            padding-top: 0.5rem; 
            border-top: 1px solid #eee; 
          }
          .detail-link { 
            display: inline-block;
            padding: 0.5rem 1rem;
            background: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 0.85rem;
            transition: background-color 0.2s;
          }
          .detail-link:hover { 
            background: #2980b9; 
          }
        </style>
      `;

      const html = await this.templateEngine.generatePage({
        title: 'Widget Registry',
        content,
        activeSection: 'widgets',
        baseUrl: '..'
      });

      await fs.writeFile(path.join(widgetsOutputDir, 'index.html'), html);

      // Generate individual widget detail pages
      await this.generateWidgetDetailPages(widgetsOutputDir);

      console.log(`✅ Widgets documentation generated (${Object.keys(WIDGET_REGISTRY).length} widgets)`);

    } catch (error) {
      console.log('⚠️ Widget generation failed, creating placeholder:', error.message);

      // Fallback to placeholder
      const content = `
        <h1>Widget Registry</h1>
        <p>Widget documentation is currently unavailable.</p>
        <p>Error: ${error.message}</p>
        <p><a href="../index.html">← Back to Documentation Home</a></p>
      `;

      const html = await this.templateEngine.generatePage({
        title: 'Widget Registry',
        content,
        activeSection: 'widgets',
        baseUrl: '..'
      });

      const widgetsOutputDir = path.join(this.outputDir, 'widgets');
      await fs.mkdir(widgetsOutputDir, { recursive: true });
      await fs.writeFile(path.join(widgetsOutputDir, 'index.html'), html);
      console.log('✅ Widgets placeholder generated');
    }
  }

  /**
   * Generate individual widget detail pages
   */
  async generateWidgetDetailPages(widgetsOutputDir) {
    const { WIDGET_REGISTRY } = await import('@whatsfresh/shared-ui/src/widgets/index.js');
    const detailDir = path.join(widgetsOutputDir, 'detail');
    await fs.mkdir(detailDir, { recursive: true });

    // Process each widget
    for (const [key, widget] of Object.entries(WIDGET_REGISTRY)) {
      const content = `
        <h1>${widget.displayName || key} Widget</h1>
        
        <div class="widget-detail-header">
          <div class="widget-meta">
            <span class="widget-type">${widget.type}</span>
            <span class="widget-size">${widget.size?.default || 'medium'}</span>
            <span class="widget-apps">${widget.targetApps?.join(', ') || 'All Apps'}</span>
          </div>
        </div>
        
        <div class="detail-sections">
          <div class="card">
            <h2>Description</h2>
            <p>${widget.description || 'No description available.'}</p>
          </div>
          
          <div class="card">
            <h2>Widget Properties</h2>
            <table>
              <tr><td><strong>ID:</strong></td><td>${key}</td></tr>
              <tr><td><strong>Component:</strong></td><td>${widget.component || 'N/A'}</td></tr>
              <tr><td><strong>Type:</strong></td><td>${widget.type}</td></tr>
              <tr><td><strong>Default Size:</strong></td><td>${widget.size?.default || 'medium'}</td></tr>
              <tr><td><strong>Data Source:</strong></td><td>${widget.dataSource || 'None'}</td></tr>
              <tr><td><strong>Target Apps:</strong></td><td>${widget.targetApps?.join(', ') || 'All'}</td></tr>
            </table>
          </div>
          
          ${widget.dataSource ? `
          <div class="card">
            <h2>Data Integration</h2>
            <p><strong>Data Source:</strong> ${widget.dataSource}</p>
            <p>This widget automatically fetches data from the <code>${widget.dataSource}</code> endpoint.</p>
          </div>
          ` : ''}
          
          <div class="card">
            <h2>Usage Example</h2>
            <pre><code>import { ${widget.displayName || key} } from '@whatsfresh/shared-ui';

// Basic usage
&lt;${widget.displayName || key} 
  ${widget.dataSource ? `dataSource="${widget.dataSource}"` : ''}
  size="${widget.size?.default || 'medium'}"
/&gt;</code></pre>
          </div>
          
          <div class="card">
            <h2>Navigation</h2>
            <p><a href="../index.html">← Back to Widget Registry</a></p>
          </div>
        </div>
        
        <style>
          .widget-detail-header { margin: 2rem 0; }
          .widget-meta { display: flex; gap: 1rem; flex-wrap: wrap; }
          .widget-meta span { 
            padding: 0.25rem 0.5rem; 
            background: #f0f0f0; 
            border-radius: 4px; 
            font-size: 0.85rem; 
          }
          .widget-type { background: #e3f2fd; }
          .widget-size { background: #f3e5f5; }
          .widget-apps { background: #e8f5e8; }
          .detail-sections { display: grid; gap: 1.5rem; }
          pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; }
          code { font-family: 'Monaco', 'Menlo', monospace; }
          table { border-collapse: collapse; width: 100%; }
          table td { padding: 0.5rem; border-bottom: 1px solid #eee; }
        </style>
      `;

      const html = await this.templateEngine.generatePage({
        title: `${widget.displayName || key} Widget`,
        content,
        activeSection: 'widgets',
        baseUrl: '../..',
        cssPath: '../..'
      });

      await fs.writeFile(path.join(detailDir, `${key}.html`), html);
    }

    console.log(`✅ Generated detail pages for ${Object.keys(WIDGET_REGISTRY).length} widgets`);
  }

  /**
   * Generate rules documentation section
   */
  async generateRulesDocs() {
    console.log('📋 Generating rules documentation...');

    const rulesOutputDir = path.join(this.outputDir, 'rules');
    await fs.mkdir(rulesOutputDir, { recursive: true });

    // Read the architecture rules markdown
    const rulesPath = path.join(__dirname, '../rules/ARCHITECTURE-RULES.md');
    const rulesMarkdown = await fs.readFile(rulesPath, 'utf8');

    // Convert markdown to HTML (basic conversion for now)
    const rulesHtml = this.markdownToHtml(rulesMarkdown);

    const html = await this.templateEngine.generatePage({
      title: 'Architecture Rules',
      content: rulesHtml,
      activeSection: 'rules',
      baseUrl: '..'
    });

    await fs.writeFile(path.join(rulesOutputDir, 'index.html'), html);
    console.log('✅ Rules documentation generated');
  }

  /**
   * Generate pages documentation section
   */
  async generatePagesDocs() {
    console.log('📄 Generating pages documentation...');

    const { default: PageDocGenerator } = await import('../sections/pages/genPageDocs.js');
    const pageDocGen = new PageDocGenerator(this.templateEngine);

    const pagesOutputDir = path.join(this.outputDir, 'pages');
    await fs.mkdir(pagesOutputDir, { recursive: true });

    // Generate individual page previews first to get the manifest
    const pageManifest = await pageDocGen.generatePagePreviews(pagesOutputDir);

    // Generate pages index with the manifest data
    await pageDocGen.generatePagesIndex(pagesOutputDir, pageManifest);

    console.log(`✅ Pages documentation generated (${pageManifest.length} pages)`);
  }

  /**
   * Generate eventTypes documentation section
   */
  async generateEventTypesDocs() {
    console.log('🔄 Generating eventTypes documentation...');

    const { default: EventTypeDocGenerator } = await import('../sections/eventTypes/genEventTypeDocs.js');
    const eventDocGen = new EventTypeDocGenerator(this.templateEngine);

    const eventsOutputDir = path.join(this.outputDir, 'events');
    await fs.mkdir(eventsOutputDir, { recursive: true });

    // Generate events index
    await eventDocGen.generateEventTypesIndex(eventsOutputDir);

    // Generate event data for frontend
    const eventCount = await eventDocGen.generateEventData(eventsOutputDir);

    console.log(`✅ EventTypes documentation generated (${eventCount} events)`);
  }

  /**
   * Basic markdown to HTML conversion
   */
  markdownToHtml(markdown) {
    return markdown
      .replace(/^# (.*)/gm, '<h1>$1</h1>')
      .replace(/^## (.*)/gm, '<h2>$1</h2>')
      .replace(/^### (.*)/gm, '<h3>$1</h3>')
      .replace(/^\*\*(.*?)\*\*/gm, '<strong>$1</strong>')
      .replace(/^\*(.*?)\*/gm, '<em>$1</em>')
      .replace(/^- (.*)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.*)$/gm, '<p>$1</p>')
      .replace(/<p><h/g, '<h')
      .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
      .replace(/<p><ul>/g, '<ul>')
      .replace(/<\/ul><\/p>/g, '</ul>');
  }

  /**
   * Auto-launch documentation in browser
   */
  async launchDocumentation() {
    try {
      const { exec } = await import('child_process');
      const path = await import('path');
      const fs = await import('fs');

      const docsPath = path.join(this.outputDir, 'index.html');

      // Check if docs were generated successfully
      if (!fs.existsSync(docsPath)) {
        console.log('⚠️  Documentation file not found, skipping auto-launch');
        return;
      }

      console.log('🚀 Launching documentation in browser...');

      // Detect environment and use appropriate command
      const platform = process.platform;
      let command;

      if (platform === 'linux') {
        // Check if we're in WSL
        try {
          const { execSync } = await import('child_process');
          execSync('which wslview', { stdio: 'ignore' });
          command = `wslview "${docsPath}"`;
        } catch {
          // Not in WSL, use regular Linux browser
          command = `xdg-open "${docsPath}"`;
        }
      } else if (platform === 'darwin') {
        command = `open "${docsPath}"`;
      } else if (platform === 'win32') {
        command = `start "" "${docsPath}"`;
      } else {
        console.log('ℹ️  Platform not recognized, skipping auto-launch');
        console.log(`   You can manually open: ${docsPath}`);
        return;
      }

      exec(command, (error) => {
        if (error) {
          console.log('ℹ️  Could not auto-launch browser');
          console.log(`   You can manually open: ${docsPath}`);
        } else {
          console.log('✅ Documentation opened in browser');
        }
      });

    } catch (error) {
      console.log('ℹ️  Auto-launch unavailable');
      console.log(`   You can manually open: ${this.outputDir}/index.html`);
    }
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new MasterDocGenerator();
  generator.generateAllDocs().catch(console.error);
}

export default MasterDocGenerator;