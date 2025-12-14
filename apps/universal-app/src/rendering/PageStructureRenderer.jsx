import React, { useState, useEffect } from 'react';
import { execEvent } from '../utils/api';
import { createLogger } from '../utils/logger.js';

const log = createLogger('PageStructureRenderer', 'info');

/**
 * PageStructureRenderer Component
 * 
 * Loads complete page structure using sp_pageStructure stored procedure.
 * Works for both CRUD pages (template-based) and custom pages (own components).
 * 
 * Strategy:
 * 1. Call sp_pageStructure(pageID) - gets components + props + triggers in one call
 * 2. Stored procedure handles template merging via dual-join pattern (template vs own components)
 * 3. Parse JSON strings for props and triggers
 * 4. Replace {{pageConfig}} placeholders with page-specific values
 * 5. Build hierarchical component structure
 * 6. Render using existing ComponentRenderer
 */
export default function PageStructureRenderer({ pageConfig, ComponentRenderer }) {
  const [mergedConfig, setMergedConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAndMergeTemplate();
  }, [pageConfig]);

  /**
   * Load complete page structure from sp_pageStructure
   */
  const loadAndMergeTemplate = async () => {
    try {
      log.info('Loading page structure for:', pageConfig.pageName);

      // Load complete page structure (components + props + triggers) in one call
      const structureResult = await execEvent('storedProc', { 
        spName: 'sp_pageStructure',
        pageID: pageConfig.pageID
      });
      
      if (!structureResult.success || !structureResult.data?.[0]) {
        throw new Error('Failed to load page structure');
      }

      // sp_pageStructure returns [components_array_with_props_and_triggers, mysql_metadata]
      const pageComponents = structureResult.data[0];
      log.info('Page structure loaded:', pageComponents.length, 'components with props/triggers');

      // Load page-specific metadata from vw_page_analysis
      const pageAnalysisResult = await execEvent('viewData', {
        viewName: 'vw_page_analysis',
        pageID: pageConfig.pageID
      });

      // Merge props into pageConfig if available
      let enhancedPageConfig = pageConfig;
      if (pageAnalysisResult?.success && pageAnalysisResult?.data?.[0]) {
        const pageProps = pageAnalysisResult.data[0];
        enhancedPageConfig = {
          ...pageConfig,
          props: {
            ...pageConfig.props,
            ...pageProps
          }
        };
        log.debug('Enhanced with props from vw_page_analysis:', pageProps);
      }

      // Process and build hierarchy
      const mergedComponents = processPageStructure(pageComponents, enhancedPageConfig);
      log.info('Processed components:', mergedComponents.length);

      setMergedConfig(mergedComponents);
      setLoading(false);

    } catch (err) {
      log.error('PageStructureRenderer error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  /**
   * Process page structure from sp_pageStructure (already has props and triggers attached)
   */
  const processPageStructure = (components, pageData) => {
    log.debug('Processing page structure...');

    // Parse and replace placeholders in each component
    const processedComponents = components.map(comp => {
      // Parse props if it's a JSON string
      let parsedProps = comp.props;
      if (typeof comp.props === 'string') {
        try {
          parsedProps = JSON.parse(comp.props);
        } catch (e) {
          log.warn('Failed to parse props for', comp.comp_name, e);
        }
      }

      // Parse triggers if it's a JSON string
      let parsedTriggers = comp.triggers;
      if (typeof comp.triggers === 'string') {
        try {
          parsedTriggers = JSON.parse(comp.triggers);
        } catch (e) {
          log.warn('Failed to parse triggers for', comp.comp_name, e);
        }
      }

      // Convert entire component to string for placeholder replacement
      let compStr = JSON.stringify({
        ...comp,
        props: parsedProps,
        triggers: parsedTriggers
      });

      // Replace placeholders
      compStr = compStr
        .replace(/\{\{pageConfig\.props\.tableName\}\}/g, pageData.props.tableName || '')
        .replace(/\{\{pageConfig\.props\.contextKey\}\}/g, pageData.props.contextKey || '')
        .replace(/\{\{pageConfig\.props\.tableID\}\}/g, pageData.props.tableID || 'id')
        .replace(/\{\{pageConfig\.props\.title\}\}/g, pageData.props.title || pageData.pageName)
        .replace(/\{\{pageConfig\.pageName\}\}/g, pageData.pageName)
        .replace(/\{title\}/g, pageData.props.title || pageData.pageName)
        .replace(/\{pageName\}/g, pageData.pageName);

      const processedComp = JSON.parse(compStr);

      // Convert triggers array to workflowTriggers object grouped by class
      if (Array.isArray(processedComp.triggers)) {
        const triggersObj = {};
        processedComp.triggers.forEach(t => {
          if (!triggersObj[t.class]) {
            triggersObj[t.class] = [];
          }
          triggersObj[t.class].push({
            action: t.action,
            content: t.content,
            ordr: t.ordr
          });
        });
        processedComp.workflowTriggers = triggersObj;
        delete processedComp.triggers;
      }

      log.debug(`  ✓ Processed ${processedComp.comp_type} (${processedComp.comp_name})`);
      return processedComp;
    });

    // Build hierarchy from flat array
    const hierarchy = buildHierarchy(processedComponents);
    log.info('Built hierarchical structure:', hierarchy.length, 'root components');
    
    return hierarchy;
  };

  /**
   * Build hierarchical component structure from flat array with parent_id relationships
   */
  const buildHierarchy = (flatComponents) => {
    // Create a map for quick lookups (use xref_id as the key)
    const componentMap = {};
    flatComponents.forEach(comp => {
      componentMap[comp.xref_id] = { ...comp, id: comp.xref_id, components: [] };
    });

    // Build hierarchy
    const rootComponents = [];
    flatComponents.forEach(comp => {
      const component = componentMap[comp.xref_id];
      
      if (comp.parent_id === comp.xref_id) {
        // Root component (self-referencing parent_id)
        rootComponents.push(component);
      } else if (componentMap[comp.parent_id]) {
        // Child component
        componentMap[comp.parent_id].components.push(component);
      }
    });

    return rootComponents;
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>
          🔧 Loading page structure...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#d32f2f', marginBottom: '10px' }}>
          ❌ Page Structure Error
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          {error}
        </div>
        <div style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
          Check console for details...
        </div>
      </div>
    );
  }

  if (!mergedConfig || mergedConfig.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#ff9800' }}>
          ⚠️ No merged config available
        </div>
      </div>
    );
  }

  // Render merged components using ComponentRenderer
  // mergedConfig is now an array of root components with nested children
  return (
    <div>
      {mergedConfig.map((component, index) => (
        <ComponentRenderer 
          key={component.id || index}
          component={component}
        />
      ))}
    </div>
  );
}
