/**
 * Page Documentation Generator
 * Integrates existing page preview generation with new template system
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { genEntityHtml } from './source/genEntityHtml.js';
import getSampleData from './source/getSampleData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate page documentation using the new template system
 */
export class PageDocGenerator {
  constructor(templateEngine) {
    this.templateEngine = templateEngine;
    this.sourceDir = path.join(__dirname, 'source');
  }

  /**
   * Generate main pages documentation index
   */
  async generatePagesIndex(outputDir, pageManifest = []) {
    console.log('📄 Generating pages documentation index...');
    
    // Generate the page list table HTML
    let pageListTable = '';
    if (pageManifest.length === 0) {
      pageListTable = '<p><em>No page previews available</em></p>';
    } else {
      const tableRows = pageManifest.map(page => `
        <tr>
          <td><code>${page.name}</code></td>
          <td>${page.title || page.name}</td>
          <td>${page.schema || 'N/A'}</td>
          <td><a href="./${page.name}.html">View Preview</a></td>
        </tr>
      `).join('');
      
      pageListTable = `
        <table>
          <thead>
            <tr>
              <th>Page</th>
              <th>Title</th>
              <th>Schema</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      `;
    }
    
    const content = `
      <h1>Page Previews</h1>
      <p>Visual previews of generated pages and layouts based on pageMap configurations.</p>
      
      <div class="card">
        <h2>Available Page Previews</h2>
        <p>Each page preview shows three views:</p>
        <ul>
          <li><strong>Table View</strong> - Data display in tabular format</li>
          <li><strong>Form View</strong> - Input form with field validation</li>
          <li><strong>DML View</strong> - Database operation preview</li>
        </ul>
      </div>
      
      <div id="page-list">
        {{pageListTable}}
      </div>
    `;
    
    const finalContent = content.replace('{{pageListTable}}', pageListTable);
    
    const html = await this.templateEngine.generatePage({
      title: 'Page Previews',
      content: finalContent,
      activeSection: 'pages',
      baseUrl: '..'
    });
    
    await fs.writeFile(path.join(outputDir, 'index.html'), html);
    console.log('✅ Pages index generated');
  }

  /**
   * Generate individual page previews
   */
  async generatePagePreviews(outputDir) {
    console.log('🎨 Generating individual page previews...');
    
    try {
      // Try different pageMap registry locations
      let entityRegistry = null;
      const possiblePaths = [
        '../../../../../../packages/shared-config/src/client/pageMapRegistry.js',
        '../../../../../../packages/shared-config/src/admin/pageMapRegistry.js',
        '../../../../../../packages/shared-config/src/pageMapRegistry.js'
      ];
      
      for (const registryPath of possiblePaths) {
        try {
          const registryModulePath = pathToFileURL(
            path.resolve(__dirname, registryPath)
          ).href;
          
          const module = await import(registryModulePath);
          entityRegistry = module.entityRegistry;
          if (entityRegistry) {
            console.log(`🔎 Loaded registry from: ${registryPath}`);
            break;
          }
        } catch (err) {
          // Try next path
          continue;
        }
      }
      
      if (!entityRegistry) {
        throw new Error('Could not find pageMapRegistry in any expected location');
      }
      console.log(`🔎 Loaded ${Object.keys(entityRegistry).length} entities`);
      
      const pageManifest = [];
      
      for (const [entityName] of Object.entries(entityRegistry)) {
        try {
          // Try different pageMap locations
          let pageMap = null;
          const possibleMapPaths = [
            `../../../../../../packages/shared-config/src/client/pageMap/${entityName}.js`,
            `../../../../../../packages/shared-config/src/admin/pageMap/${entityName}.js`,
            `../../../../../../packages/shared-config/src/pageMap/${entityName}.js`
          ];
          
          for (const mapPath of possibleMapPaths) {
            try {
              const mapModulePath = pathToFileURL(
                path.resolve(__dirname, mapPath)
              ).href;
              
              const module = await import(mapModulePath);
              pageMap = module.default;
              if (pageMap) break;
            } catch (err) {
              continue;
            }
          }
          
          if (!pageMap) {
            throw new Error(`Could not find pageMap for ${entityName}`);
          }
          
          const sampleData = await getSampleData(entityName, pageMap) || [];
          
          // Generate the enhanced HTML with our template navigation
          const entityHtml = genEntityHtml(entityName, pageMap, sampleData);
          
          // Extract the body content and wrap it with our template
          const bodyMatch = entityHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
          const bodyContent = bodyMatch ? bodyMatch[1] : entityHtml;
          
          // Add back to main pages navigation
          const enhancedContent = `
            <div class="back-link" style="margin-bottom: 1rem;">
              <a href="./index.html" style="text-decoration: none; font-size: 0.95rem;">&larr; Back to Pages</a>
            </div>
            ${bodyContent}
          `;
          
          const html = await this.templateEngine.generatePage({
            title: `${pageMap.title || entityName} Preview`,
            content: enhancedContent,
            activeSection: 'pages',
            baseUrl: '..'
          });
          
          await fs.writeFile(path.join(outputDir, `${entityName}.html`), html);
          
          // Add to manifest
          pageManifest.push({
            name: entityName,
            title: pageMap.title,
            schema: pageMap.systemConfig?.schema,
            table: pageMap.systemConfig?.table
          });
          
          console.log(`✅ ${entityName}.html`);
        } catch (err) {
          console.warn(`⚠️  Skipping ${entityName}: ${err.message}`);
        }
      }
      
      // Write page manifest for the index
      await fs.writeFile(
        path.join(outputDir, 'pages.json'),
        JSON.stringify(pageManifest, null, 2)
      );
      
      console.log('🎉 Finished page preview generation');
      return pageManifest;
      
    } catch (error) {
      console.error('❌ Error generating page previews:', error);
      return [];
    }
  }
}

export default PageDocGenerator;