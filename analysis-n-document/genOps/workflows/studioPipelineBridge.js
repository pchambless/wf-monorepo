/**
 * Studio Pipeline Integration Bridge
 * Connects wf-studio UI workflow to our targeted analysis pipeline
 * 
 * Flow: Studio Save → EventType Change Handler → Targeted Analysis → Regenerate Assets
 */

import { eventTypeHandler } from './eventTypeChangeHandler.js';
import { regeneratePageConfigForApp } from './regeneratePageConfig.js';
import { updateMermaidDiagrams } from './updateMermaidDiagrams.js';

/**
 * Studio Pipeline Bridge - Main integration point
 */
class StudioPipelineBridge {
  constructor() {
    this.isProcessing = false;
    this.pendingChanges = new Set();
  }

  /**
   * Handle Studio save action - integrates with Studio workflow H→I→J
   * @param {Object} studioChange - Change data from Studio UI
   * @param {string} studioChange.eventType - EventType being edited
   * @param {string} studioChange.app - App name (plans, admin, client)
   * @param {Object} studioChange.properties - Updated properties from Studio form
   * @param {string} studioChange.source - 'studio-ui' 
   */
  async handleStudioSave(studioChange) {
    const { eventType, app, properties, source = 'studio-ui' } = studioChange;
    
    console.log(`🎨 Studio Save: ${eventType} in ${app} app`);
    console.log(`📝 Properties updated:`, Object.keys(properties));

    // Prevent duplicate processing
    const changeKey = `${app}-${eventType}`;
    if (this.pendingChanges.has(changeKey)) {
      console.log(`⏳ Change ${changeKey} already processing, skipping`);
      return { success: true, status: 'pending' };
    }

    this.pendingChanges.add(changeKey);
    this.isProcessing = true;

    try {
      // Step H: Update EventType File (via our pipeline)
      const changeInfo = {
        source: 'client', // Studio edits client-side eventTypes
        eventType: eventType,
        app: app,
        filePath: this.getEventTypeFilePath(eventType, app),
        properties: properties,
        triggeredBy: 'studio-ui'
      };

      console.log(`🔄 Triggering pipeline for: ${changeInfo.filePath}`);
      
      // Step I & J: Regenerate pageConfig & Update Analysis (via our handler)
      const analysisResult = await eventTypeHandler.handleEventTypeChange(changeInfo);
      
      // Generate live preview assets for Studio
      const previewAssets = await this.generateStudioPreviewAssets(app, eventType, analysisResult);
      
      // Success response for Studio UI
      const result = {
        success: true,
        status: 'completed',
        eventType: eventType,
        app: app,
        analysis: {
          affectedSchemas: analysisResult.affectedSchemas || [],
          updatedComponents: analysisResult.updatedComponents || [],
          generatedFiles: analysisResult.generatedFiles || []
        },
        preview: previewAssets,
        timestamp: new Date().toISOString()
      };

      console.log(`✅ Studio pipeline complete for ${eventType}`);
      return result;

    } catch (error) {
      console.error(`❌ Studio pipeline failed for ${eventType}:`, error);
      return {
        success: false,
        status: 'error',
        error: error.message,
        eventType: eventType,
        app: app
      };
    } finally {
      this.pendingChanges.delete(changeKey);
      this.isProcessing = false;
    }
  }

  /**
   * Generate preview assets for Studio live preview
   * @param {string} app - App name
   * @param {string} eventType - EventType name
   * @param {Object} analysisResult - Result from targeted analysis
   */
  async generateStudioPreviewAssets(app, eventType, analysisResult) {
    console.log(`🔍 Generating preview assets for ${eventType}`);

    try {
      // Generate fresh pageConfig for preview
      const pageConfigPath = await regeneratePageConfigForApp(app, {
        reason: 'studio-preview',
        eventType: eventType
      });

      // Generate updated Mermaid diagrams
      const mermaidFiles = await updateMermaidDiagrams(app, {
        triggeredBy: 'studio-preview',
        eventType: eventType,
        components: analysisResult.updatedComponents
      });

      return {
        pageConfig: {
          path: pageConfigPath,
          updated: true
        },
        mermaidDiagrams: mermaidFiles,
        previewUrl: `/studio/preview/${app}/${eventType}`,
        lastGenerated: new Date().toISOString()
      };
    } catch (error) {
      console.error(`⚠️  Preview generation failed:`, error);
      return {
        error: 'Preview generation failed',
        message: error.message
      };
    }
  }

  /**
   * Get file path for eventType based on app and category
   * @param {string} eventType - EventType name 
   * @param {string} app - App name
   */
  getEventTypeFilePath(eventType, app) {
    // Map eventType to likely file path
    const eventTypeCategories = {
      form: 'forms',
      grid: 'grids', 
      tab: 'tabs',
      page: 'pages',
      select: 'selects',
      button: 'buttons'
    };

    // Try to determine category from eventType name
    let category = 'components';
    for (const [cat, folder] of Object.entries(eventTypeCategories)) {
      if (eventType.toLowerCase().includes(cat)) {
        category = folder;
        break;
      }
    }

    return `/apps/wf-${app}-management/src/pages/${app.charAt(0).toUpperCase() + app.slice(1)}Manager/${category}/${eventType}.js`;
  }

  /**
   * Get current processing status
   */
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      pendingChanges: Array.from(this.pendingChanges),
      queueLength: this.pendingChanges.size
    };
  }

  /**
   * API endpoint wrapper for Studio integration
   */
  async apiHandler(req, res) {
    try {
      const { action, ...changeData } = req.body;

      switch (action) {
        case 'save':
          const result = await this.handleStudioSave(changeData);
          res.json(result);
          break;
          
        case 'status':
          const status = this.getStatus();
          res.json({ success: true, ...status });
          break;
          
        default:
          res.status(400).json({ 
            success: false, 
            error: `Unknown action: ${action}` 
          });
      }
    } catch (error) {
      console.error('Studio API error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

// Singleton instance for use across the app
export const studioPipelineBridge = new StudioPipelineBridge();

/**
 * Express.js route handler for Studio API integration
 */
export const studioApiHandler = async (req, res) => {
  return studioPipelineBridge.apiHandler(req, res);
};

/**
 * Direct method exports for programmatic use
 */
export const handleStudioSave = (changeData) => studioPipelineBridge.handleStudioSave(changeData);
export const getStudioStatus = () => studioPipelineBridge.getStatus();

export default studioPipelineBridge;