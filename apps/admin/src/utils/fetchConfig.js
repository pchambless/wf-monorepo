import { execEvent, setVals } from './api';

export const fetchPageConfig = async (pageName) => {
  try {
    await setVals([{ paramName: 'pageName', paramVal: pageName }]);
    const response = await execEvent('getPageConfig');

    if (response.data && response.data.length > 0) {
      const pageConfig = response.data[0].pageConfig;
      return typeof pageConfig === 'string' ? JSON.parse(pageConfig) : pageConfig;
    }

    throw new Error(`Page config not found for: ${pageName}`);
  } catch (error) {
    console.error(`Error fetching page config for ${pageName}:`, error);
    throw error;
  }
};

export const fetchLayoutConfig = async (appName) => {
  try {
    await setVals([{ paramName: 'appName', paramVal: appName }]);
    const response = await execEvent('getLayoutConfig');

    if (response.data && response.data.length > 0) {
      const app = response.data[0];
      return {
        appbar: app.appbarConfig ? JSON.parse(app.appbarConfig) : null,
        sidebar: app.sidebarConfig ? JSON.parse(app.sidebarConfig) : null,
        footer: app.footerConfig ? JSON.parse(app.footerConfig) : null,
      };
    }

    throw new Error(`Layout config not found for app: ${appName}`);
  } catch (error) {
    console.error(`Error fetching layout config for ${appName}:`, error);
    throw error;
  }
};
