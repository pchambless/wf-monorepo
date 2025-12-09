import React, { useState, useEffect } from 'react';
import { execEvent } from '../utils/api';

/**
 * CRUD Template Merge Component
 * 
 * Merges generic CRUD template (page 11) with page-specific data
 * to render a complete CRUD page at runtime.
 * 
 * Strategy:
 * 1. Load template structure from page 11 (components, triggers, layout)
 * 2. Use page-specific props (tableName, contextKey, columns, etc.)
 * 3. Replace {{pageConfig}} placeholders in template triggers
 * 4. Render merged result using existing ComponentRenderer
 */
export default function CrudTemplateMerge({ pageConfig, ComponentRenderer }) {
  const [mergedConfig, setMergedConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAndMergeTemplate();
  }, [pageConfig]);

  /**
   * Load CRUD template from page 11 and merge with current page data
   */
  const loadAndMergeTemplate = async () => {
    try {
      console.log('🔧 CrudTemplateMerge: Loading template for page:', pageConfig.pageName);

      // Load template structure from page 11 using stored procedure
      const structureResult = await execEvent('storedProc', { 
        spName: 'sp_hier_structure',
        pageID: 11 
      });
      
      if (!structureResult.success || !structureResult.data?.[0]) {
        throw new Error('Failed to load CRUD template structure (page 11)');
      }

      // sp_hier_structure returns [components_array, mysql_metadata]
      const templateComponents = structureResult.data[0];
      console.log('📋 Template structure loaded:', templateComponents.length, 'components');

      // Load page-specific props from vw_eventProps (views handle template component join)
      const propsResult = await execEvent('viewData', {
        viewName: 'vw_eventProps',
        pageID: pageConfig.pageID
      });

      const pageProps = propsResult?.success ? propsResult.data : [];
      console.log('📦 Page-specific props loaded:', pageProps.length, 'props');

      // Load page-specific triggers from vw_eventTrigger (views handle template component join)
      const triggersResult = await execEvent('viewData', {
        viewName: 'vw_eventTrigger',
        pageID: pageConfig.pageID
      });

      const pageTriggers = triggersResult?.success ? triggersResult.data : [];
      console.log('⚡ Page-specific triggers loaded:', pageTriggers.length, 'triggers');

      // Load page-specific props from vw_page_analysis
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
        console.log('📊 Enhanced with props from vw_page_analysis:', pageProps);
      }

      // Merge template structure with page-specific props/triggers
      const mergedComponents = mergeTemplateWithPageData(
        templateComponents, 
        pageProps,
        pageTriggers,
        enhancedPageConfig
      );
      console.log('✅ Merged components:', mergedComponents.length);

      setMergedConfig(mergedComponents);
      setLoading(false);

    } catch (err) {
      console.error('❌ CrudTemplateMerge error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  /**
   * Merge template components with page-specific props and triggers
   */
  const mergeTemplateWithPageData = (templateComponents, pageProps, pageTriggers, pageData) => {
    console.log('🔀 Merging template structure with page-specific data...');

    // Replace placeholders in components
    const replacedComponents = templateComponents.map(comp => {
      let compStr = JSON.stringify(comp);

      // Replace placeholders
      compStr = compStr
        .replace(/\{\{pageConfig\.props\.tableName\}\}/g, pageData.props.tableName || '')
        .replace(/\{\{pageConfig\.props\.contextKey\}\}/g, pageData.props.contextKey || '')
        .replace(/\{\{pageConfig\.props\.tableID\}\}/g, pageData.props.tableID || 'id')
        .replace(/\{\{pageConfig\.props\.title\}\}/g, pageData.props.title || pageData.pageName)
        .replace(/\{\{pageConfig\.pageName\}\}/g, pageData.pageName)
        .replace(/\{title\}/g, pageData.props.title || pageData.pageName)
        .replace(/\{pageName\}/g, pageData.pageName);

      const mergedComp = JSON.parse(compStr);

      // Update page-specific fields
      mergedComp.pageID = pageData.props.pageID;
      mergedComp.pageName = pageData.pageName;
      mergedComp.appName = pageData.props.appName || 'whatsfresh';

      return mergedComp;
    });

    // Replace placeholders in props (already have correct pageID from query)
    const replacedProps = pageProps.map(prop => {
      let propStr = JSON.stringify(prop);
      
      propStr = propStr
        .replace(/\{\{pageConfig\.props\.tableName\}\}/g, pageData.props.tableName || '')
        .replace(/\{\{pageConfig\.props\.contextKey\}\}/g, pageData.props.contextKey || '')
        .replace(/\{\{pageConfig\.props\.tableID\}\}/g, pageData.props.tableID || 'id')
        .replace(/\{\{pageConfig\.pageName\}\}/g, pageData.pageName)
        .replace(/\{pageName\}/g, pageData.pageName);

      return JSON.parse(propStr);
    });

    // Replace placeholders in triggers (already have correct pageID from query)
    const replacedTriggers = pageTriggers.map(trigger => {
      let triggerStr = JSON.stringify(trigger);
      
      triggerStr = triggerStr
        .replace(/\{\{pageConfig\.props\.tableName\}\}/g, pageData.props.tableName || '')
        .replace(/\{\{pageConfig\.props\.contextKey\}\}/g, pageData.props.contextKey || '')
        .replace(/\{\{pageConfig\.props\.tableID\}\}/g, pageData.props.tableID || 'id')
        .replace(/\{\{pageConfig\.pageName\}\}/g, pageData.pageName)
        .replace(/\{pageName\}/g, pageData.pageName);

      return JSON.parse(triggerStr);
    });

    // Attach props and triggers to their components
    const componentsWithData = attachPropsAndTriggers(
      replacedComponents, 
      replacedProps, 
      replacedTriggers
    );

    // Build hierarchy from flat array
    const hierarchy = buildHierarchy(componentsWithData);
    console.log('✓ Built hierarchical structure:', hierarchy.length, 'root components');
    
    return hierarchy;
  };

  /**
   * Attach props and triggers to their respective components by xref_id
   */
  const attachPropsAndTriggers = (components, props, triggers) => {
    return components.map(comp => {
      // Find props for this component
      const compProps = props.filter(p => p.xref_id === comp.id);
      
      // Convert props array to object { paramName: paramVal }
      const propsObj = {};
      compProps.forEach(p => {
        try {
          // Try to parse JSON values
          propsObj[p.paramName] = JSON.parse(p.paramVal);
        } catch {
          // Use as string if not JSON
          propsObj[p.paramName] = p.paramVal;
        }
      });

      // Find triggers for this component
      const compTriggers = triggers.filter(t => t.xref_id === comp.id);
      
      // Group triggers by class (event type)
      const triggersObj = {};
      compTriggers.forEach(t => {
        if (!triggersObj[t.class]) {
          triggersObj[t.class] = [];
        }
        try {
          triggersObj[t.class].push({
            action: t.action,
            content: JSON.parse(t.content),
            ordr: t.ordr
          });
        } catch {
          triggersObj[t.class].push({
            action: t.action,
            content: t.content,
            ordr: t.ordr
          });
        }
      });

      return {
        ...comp,
        props: { ...comp.props, ...propsObj },
        workflowTriggers: Object.keys(triggersObj).length > 0 ? triggersObj : comp.workflowTriggers
      };
    });
  };

  /**
   * Build hierarchical component structure from flat array with parent_id relationships
   */
  const buildHierarchy = (flatComponents) => {
    // Create a map for quick lookups
    const componentMap = {};
    flatComponents.forEach(comp => {
      componentMap[comp.id] = { ...comp, components: [] };
    });

    // Build hierarchy
    const rootComponents = [];
    flatComponents.forEach(comp => {
      const component = componentMap[comp.id];
      
      if (comp.parent_id === comp.id) {
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
          🔧 Loading CRUD template...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#d32f2f', marginBottom: '10px' }}>
          ❌ Template Merge Error
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          {error}
        </div>
        <div style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
          Falling back to standard rendering...
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
