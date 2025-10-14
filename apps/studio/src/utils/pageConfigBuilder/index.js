import { buildComponentConfig } from './componentBuilder.js';
import { buildWorkflowTriggers } from './triggersBuilder.js';
import { getComponent, getComponentProps, getComponentTriggers, getChildComponents } from './dataFetcher.js';
import { db } from '../../db/studioDb';

export const buildPageConfig = async (pageID) => {
  try {
    console.log('🔍 buildPageConfig called with pageID:', pageID, typeof pageID);

    const allComponents = await db.eventComp_xref.toArray();
    console.log('📦 All components in IndexedDB:', allComponents.map(c => ({
      idbID: c.idbID,
      id: c.id,
      idType: typeof c.id,
      name: c.comp_name,
      level: c.level
    })));

    const pageComponent = await getComponent(pageID);
    console.log('📄 Found page component:', pageComponent);

    // Debug: Try to find it manually
    const manualFind = allComponents.find(c => c.id == pageID);
    console.log('🔍 Manual find with == :', manualFind);
    const strictFind = allComponents.find(c => c.id === pageID);
    console.log('🔍 Manual find with === :', strictFind);

    if (!pageComponent) {
      throw new Error(`Page component not found: ${pageID}. Available IDs: ${allComponents.map(c => c.id).join(', ')}`);
    }

    const childComponents = await getChildComponents(pageID);

    const components = [];
    for (const child of childComponents) {
      const childConfig = await buildComponentConfig(child, 1);
      components.push(childConfig);
    }

    const pageProps = await getComponentProps(pageID);
    const pageTriggers = await getComponentTriggers(pageID);
    const workflowTriggers = buildWorkflowTriggers(pageTriggers);

    const appComponent = await getComponent(pageComponent.parent_id);
    const appName = appComponent ? appComponent.comp_name : '';
    const defaultRoutePath = appName ? `/${appName}/${pageComponent.comp_name}` : `/${pageComponent.comp_name}`;

    const pageConfig = {
      layout: 'flex',
      ...(workflowTriggers && { workflowTriggers }),
      components,
      title: pageProps.title || pageComponent.comp_name,
      routePath: pageProps.routePath || defaultRoutePath,
      purpose: 'Database-generated page configuration',
      cluster: 'Page'
    };

    return {
      success: true,
      pageConfig,
      meta: {
        pageID,
        pageName: pageComponent.comp_name,
        appName,
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
