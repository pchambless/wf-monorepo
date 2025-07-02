/**
 * EventType Documentation Generator
 * Integrates eventTypes visualization with new template system
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate eventTypes documentation using the new template system
 */
export class EventTypeDocGenerator {
  constructor(templateEngine) {
    this.templateEngine = templateEngine;
    this.sourceDir = path.join(__dirname, 'generated');
  }

  /**
   * Generate main eventTypes documentation index
   */
  async generateEventTypesIndex(outputDir) {
    console.log('🔄 Generating eventTypes documentation index...');
    
    const content = `
      <h1>Event Types Flow</h1>
      <p>The WhatsFresh event system is the core glue that connects all data flow throughout the application. This documents the complete event hierarchy and relationships.</p>
      
      <div class="card">
        <h2>System Overview</h2>
        <p>The event system connects:</p>
        <ul>
          <li><strong>SQL Views</strong> → <strong>EventTypes</strong> → <strong>PageMaps</strong> → <strong>UI Components</strong></li>
          <li><strong>Authentication Flow</strong> - User login and account selection</li>
          <li><strong>CRUD Operations</strong> - Create, Read, Update, Delete for all entities</li>
          <li><strong>Data Relationships</strong> - Parent-child hierarchies and mappings</li>
          <li><strong>Widget Integration</strong> - Select widgets and form components</li>
        </ul>
      </div>
      
      <div class="card">
        <h2>Event Flow Diagram</h2>
        <p>Interactive Mermaid diagram showing the complete event relationship flow:</p>
        <div class="mermaid-container" style="text-align: center; margin: 2rem 0;">
          <div id="mermaid-diagram" style="background: white; padding: 1rem; border-radius: 8px; border: 1px solid #ddd;">
            <div class="mermaid">
{{mermaidContent}}
            </div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <h2>Event Categories</h2>
        <div id="event-categories">
          <p><em>Loading event categories...</em></p>
        </div>
      </div>
      
      <div class="card">
        <h2>Event Details</h2>
        <div id="event-details">
          <p><em>Loading event details...</em></p>
        </div>
      </div>
      
      <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
      <script>
        // Initialize Mermaid
        mermaid.initialize({ 
          startOnLoad: true,
          theme: 'default',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true
          }
        });
        
        // Load and display event data
        async function loadEventData() {
          try {
            const response = await fetch('./events.json');
            const data = await response.json();
            
            // Generate categories summary
            const categories = {};
            data.nodes.forEach(node => {
              const category = node.category;
              if (!categories[category]) {
                categories[category] = [];
              }
              categories[category].push(node);
            });
            
            const categoriesContainer = document.getElementById('event-categories');
            const categoryTable = Object.entries(categories).map(([category, nodes]) => 
              \`<tr>
                <td><strong>\${category}</strong></td>
                <td>\${nodes.length} events</td>
                <td>\${nodes.map(n => \`<code>\${n.id}</code>\`).join(', ')}</td>
              </tr>\`
            ).join('');
            
            categoriesContainer.innerHTML = \`
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Count</th>
                    <th>Events</th>
                  </tr>
                </thead>
                <tbody>
                  \${categoryTable}
                </tbody>
              </table>
            \`;
            
            // Generate event details table
            const detailsContainer = document.getElementById('event-details');
            const detailsTable = data.nodes.map(node => \`
              <tr>
                <td><code>\${node.id}</code></td>
                <td>\${node.category}</td>
                <td>\${node.meta.cluster || 'N/A'}</td>
                <td>\${node.meta.dbTable || 'N/A'}</td>
                <td>\${node.meta.selWidget || 'N/A'}</td>
                <td>\${node.meta.primaryKey || 'N/A'}</td>
                <td>\${node.meta.purpose || 'N/A'}</td>
              </tr>
            \`).join('');
            
            detailsContainer.innerHTML = \`
              <table>
                <thead>
                  <tr>
                    <th>Event ID</th>
                    <th>Category</th>
                    <th>Cluster</th>
                    <th>DB Table</th>
                    <th>Widget</th>
                    <th>Primary Key</th>
                    <th>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  \${detailsTable}
                </tbody>
              </table>
            \`;
            
          } catch (error) {
            console.error('Error loading event data:', error);
            document.getElementById('event-categories').innerHTML = 
              '<p><em>Error loading event categories</em></p>';
            document.getElementById('event-details').innerHTML = 
              '<p><em>Error loading event details</em></p>';
          }
        }
        
        // Load event data when DOM is ready
        document.addEventListener('DOMContentLoaded', loadEventData);
      </script>
    `;
    
    // Load the mermaid content
    const mermaidPath = path.join(this.sourceDir, 'eventTypes.mmd');
    let mermaidContent = '';
    try {
      mermaidContent = await fs.readFile(mermaidPath, 'utf8');
    } catch (error) {
      console.warn('Could not load mermaid file:', error.message);
      // Use a simple fallback diagram
      mermaidContent = `flowchart LR
        A[Event Types] --> B[Documentation]
        B --> C[Interactive Flow]
        C --> D[System Integration]
        
        classDef error fill:#ffcccc,stroke:#ff6666
        class A,B,C,D error;`;
    }
    
    const finalContent = content.replace('{{mermaidContent}}', mermaidContent);
    
    const html = await this.templateEngine.generatePage({
      title: 'Event Types Flow',
      content: finalContent,
      activeSection: 'events',
      baseUrl: '..'
    });
    
    await fs.writeFile(path.join(outputDir, 'index.html'), html);
    console.log('✅ EventTypes index generated');
  }

  /**
   * Copy event data for the frontend
   */
  async generateEventData(outputDir) {
    console.log('📊 Copying event data...');
    
    // Try to use existing generated event data first
    const graphDataPath = path.join(this.sourceDir, 'graphData.json');
    let graphData;
    
    try {
      graphData = await fs.readFile(graphDataPath, 'utf8');
      console.log('Using existing event data');
    } catch (error) {
      console.warn('No existing event data found at:', graphDataPath);
      // Create minimal fallback data
      graphData = JSON.stringify({
        nodes: [
          {
            id: "eventData",
            label: "Event data not available<br>Run event generation first",
            category: "error",
            meta: { cluster: "ERROR", purpose: "Fallback - no generated data found" }
          }
        ],
        edges: []
      }, null, 2);
    }
    
    // Copy the graph data as events.json for the frontend
    await fs.writeFile(path.join(outputDir, 'events.json'), graphData);
    
    const data = JSON.parse(graphData);
    console.log(`✅ Event data copied (${data.nodes.length} events, ${data.edges.length} relationships)`);
    
    return data.nodes.length;
  }
}

export default EventTypeDocGenerator;