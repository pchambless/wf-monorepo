import { buildComponentConfig } from './componentBuilder.js';
import { buildWorkflowTriggers } from './triggersBuilder.js';
import { getComponent, getComponentProps, getComponentTriggers, getChildComponents } from './dataFetcher.js';
import { generateMermaid } from './genMermaid.js';
import { db } from '../../db/studioDb';
import { getVal } from '../api';

export const buildPageConfig = async (pageID) => {
  try {
    const contextPageIDResult = await getVal('pageID');
    const contextPageID = contextPageIDResult?.resolvedValue || contextPageIDResult;
    const effectivePageID = contextPageID || pageID;
    console.log('🔍 buildPageConfig - param pageID:', pageID, 'context pageID:', contextPageID, 'using:', effectivePageID);

    const allComponents = await db.eventComp_xref.toArray();
    console.log('📦 All components in IndexedDB:', allComponents.map(c => ({
      id: c.id,
      name: c.comp_name,
      level: c.level,
      pageID: c.pageID
    })));

    // Debug: Check all page_registry entries
    const allPages = await db.page_registry.toArray();
    console.log('📋 All page_registry entries:', allPages.map(p => ({id: p.id, pageName: p.pageName})));

    const pageRegistry = await db.page_registry.where('id').equals(parseInt(effectivePageID)).first();
    console.log('📋 Looking for pageID:', effectivePageID, 'Found page registry entry:', pageRegistry);

    if (!pageRegistry) {
      throw new Error(`Page registry entry not found for pageID: ${effectivePageID}`);
    }

    const containerComponent = allComponents.find(c =>
      c.pageID === parseInt(effectivePageID) && c.level === 0
    );
    console.log('📦 Found Container component:', containerComponent);

    if (!containerComponent) {
      throw new Error(`Container component not found for pageID: ${effectivePageID}. Available components: ${allComponents.map(c => `${c.comp_name}(${c.id})`).join(', ')}`);
    }

    const childComponents = await getChildComponents(containerComponent.id);

    const components = [];
    for (const child of childComponents) {
      const childConfig = await buildComponentConfig(child, 1);
      components.push(childConfig);
    }

    const containerProps = await getComponentProps(containerComponent.id);
    const containerTriggers = await getComponentTriggers(containerComponent.id);
    const workflowTriggers = await buildWorkflowTriggers(containerTriggers);

    const pageConfig = {
      pageName: pageRegistry.pageName,
      layout: 'flex',
      props: {
        pageID: effectivePageID,
        title: pageRegistry.pageTitle,
        routePath: pageRegistry.routePath,
        tableName: pageRegistry.tableName,
        tableID: pageRegistry.tableID,
        contextKey: pageRegistry.contextKey,
        parentID: pageRegistry.parentID,
        ...containerProps
      },
      ...(workflowTriggers && { workflowTriggers }),
      components
    };
    console.log('📦 Final pageConfig.props:', pageConfig.props);

    const mermaidText = generateMermaid(pageConfig);

    return {
      success: true,
      pageConfig,
      mermaidText,
      meta: {
        pageID: effectivePageID,
        pageName: pageRegistry.pageName,
        appName: pageRegistry.appName,
        componentsCount: components.length,
        generatedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Error building pageConfig:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default buildPageConfig;
