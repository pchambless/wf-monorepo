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
      cssPath = '.'
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
    
    // Import and run the existing widget generator
    const { default: generateWidgetDocumentation } = await import('../sections/widgets/source/genWidgetDocs.js');
    
    // Create widgets output directory
    const widgetsOutputDir = path.join(this.outputDir, 'widgets');
    await fs.mkdir(widgetsOutputDir, { recursive: true });
    
    // Run the widget generator (we'll refactor this to use our templates)
    // For now, just create a placeholder
    const content = `
      <h1>Widget Registry</h1>
      <p>The WhatsFresh widget system provides reusable UI components across applications.</p>
      <p><em>Widget documentation is being refactored to use the new template system...</em></p>
      <p><a href="../index.html">← Back to Documentation Home</a></p>
    `;
    
    const html = await this.templateEngine.generatePage({
      title: 'Widget Registry',
      content,
      activeSection: 'widgets',
      baseUrl: '..'
    });
    
    await fs.writeFile(path.join(widgetsOutputDir, 'index.html'), html);
    console.log('✅ Widgets documentation generated');
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