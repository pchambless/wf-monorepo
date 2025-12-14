/**
 * Universal App Page Registry Cache
 * Loads all page metadata at startup for fast navigation and routing
 */

import { execEvent } from '@whatsfresh/shared-imports';

class PageRegistryCache {
  constructor() {
    this.pages = new Map(); // pageID -> page data
    this.routes = new Map(); // routePath -> page data
    this.apps = new Map(); // appName -> array of pages
    this.loaded = false;
    this.loading = false;
  }

  async initialize() {
    if (this.loaded || this.loading) {
      return this.waitForLoad();
    }

    this.loading = true;
    console.log('📚 Loading page registry cache...');

    try {
      // Load comprehensive page data from vw_page_analysis
      const response = await execEvent('fetchPageAnalysis');
      
      if (!response.data || response.data.length === 0) {
        throw new Error('No page data returned from vw_page_analysis');
      }

      // Clear existing caches
      this.pages.clear();
      this.routes.clear();
      this.apps.clear();

      // Build lookup maps
      response.data.forEach(page => {
        // Add to pages map (by pageID)
        this.pages.set(page.pageID, {
          ...page,
          // Parse JSON fields safely
          parentID: this.parseJSON(page.parentID),
          tableID: this.parseJSON(page.tableID),
          dmlConfig: this.parseJSON(page.dmlConfig)
        });

        // Add to routes map (by routePath if it exists)
        if (page.routePath) {
          this.routes.set(page.routePath, page);
        }

        // Add to apps map (group by appName)
        if (!this.apps.has(page.appName)) {
          this.apps.set(page.appName, []);
        }
        this.apps.get(page.appName).push(page);
      });

      this.loaded = true;
      this.loading = false;

      console.log(`✅ Page registry loaded: ${this.pages.size} pages, ${this.apps.size} apps`);
      console.log(`📊 Apps: ${Array.from(this.apps.keys()).join(', ')}`);
      
      return true;
    } catch (error) {
      this.loading = false;
      console.error('❌ Failed to load page registry:', error);
      throw error;
    }
  }

  async waitForLoad() {
    while (this.loading) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return this.loaded;
  }

  parseJSON(value) {
    if (!value || typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch (e) {
      return value; // Return as-is if not valid JSON
    }
  }

  // Get page by ID
  getPageByID(pageID) {
    return this.pages.get(parseInt(pageID));
  }

  // Get page by route path
  getPageByRoute(routePath) {
    return this.routes.get(routePath);
  }

  // Get page by app and page name
  getPageByAppAndName(appName, pageName) {
    const appPages = this.apps.get(appName) || [];
    return appPages.find(page => page.pageName === pageName);
  }

  // Get all pages for an app
  getAppPages(appName) {
    return this.apps.get(appName) || [];
  }

  // Get all CRUD pages
  getCrudPages() {
    return Array.from(this.pages.values()).filter(page => page.template_type === 'crud');
  }

  // Get all custom pages
  getCustomPages() {
    return Array.from(this.pages.values()).filter(page => page.template_type !== 'crud');
  }

  // Check if page exists
  pageExists(pageID) {
    return this.pages.has(parseInt(pageID));
  }

  // Get page metadata for navigation
  getNavigationData() {
    const navData = {};
    
    this.apps.forEach((pages, appName) => {
      navData[appName] = pages.map(page => ({
        pageID: page.pageID,
        pageName: page.pageName,
        pageTitle: page.pageTitle || page.pageName,
        routePath: page.routePath,
        template_type: page.template_type
      }));
    });

    return navData;
  }

  // Search pages by title or name
  searchPages(query) {
    const searchTerm = query.toLowerCase();
    return Array.from(this.pages.values()).filter(page => 
      page.pageName.toLowerCase().includes(searchTerm) ||
      (page.pageTitle && page.pageTitle.toLowerCase().includes(searchTerm))
    );
  }

  // Get page hierarchy (parent-child relationships)
  getPageHierarchy() {
    const hierarchy = {};
    
    Array.from(this.pages.values()).forEach(page => {
      if (!hierarchy[page.appName]) {
        hierarchy[page.appName] = [];
      }
      
      hierarchy[page.appName].push({
        pageID: page.pageID,
        pageName: page.pageName,
        pageTitle: page.pageTitle,
        tableName: page.tableName,
        parentID: page.parentID,
        contextKey: page.contextKey
      });
    });

    return hierarchy;
  }

  // Validate cache integrity
  validateCache() {
    const issues = [];
    
    if (this.pages.size === 0) {
      issues.push('No pages loaded in cache');
    }

    // Check for missing route paths
    const pagesWithoutRoutes = Array.from(this.pages.values())
      .filter(page => !page.routePath);
    
    if (pagesWithoutRoutes.length > 0) {
      issues.push(`${pagesWithoutRoutes.length} pages missing routePath`);
    }

    // Check for CRUD pages without table names
    const crudWithoutTables = this.getCrudPages()
      .filter(page => !page.tableName);
    
    if (crudWithoutTables.length > 0) {
      issues.push(`${crudWithoutTables.length} CRUD pages missing tableName`);
    }

    return issues;
  }

  // Get cache statistics
  getStats() {
    return {
      totalPages: this.pages.size,
      totalApps: this.apps.size,
      crudPages: this.getCrudPages().length,
      customPages: this.getCustomPages().length,
      pagesWithRoutes: Array.from(this.pages.values()).filter(p => p.routePath).length,
      loaded: this.loaded,
      loading: this.loading
    };
  }
}

// Create singleton instance
export const pageRegistry = new PageRegistryCache();

// Convenience functions
export const getPageByID = (pageID) => pageRegistry.getPageByID(pageID);
export const getPageByRoute = (routePath) => pageRegistry.getPageByRoute(routePath);
export const getPageByAppAndName = (appName, pageName) => pageRegistry.getPageByAppAndName(appName, pageName);
export const initializePageRegistry = () => pageRegistry.initialize();

export default pageRegistry;