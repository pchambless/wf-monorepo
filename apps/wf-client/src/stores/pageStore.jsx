import { makeAutoObservable } from 'mobx';
import React from 'react';
import createLogger from '../utils/logger';

const log = createLogger('PageStore');

class PageStore {
  // Page state - only the essentials
  currentPage = '';
  title = 'WhatsFresh';
  breadcrumbs = [];
  
  constructor() {
    makeAutoObservable(this);
  }
  
  // Core page functions
  setCurrentPage(pageName, options = {}) {
    this.currentPage = pageName;
    
    // Set title if provided in options
    if (options.title) {
      this.setPageTitle(options.title);
    } else if (pageName) {
      // Create title from page name if not provided
      this.setPageTitle(`${pageName.charAt(0).toUpperCase()}${pageName.slice(1)}`);
    }
    
    log.info(`Current page set: ${pageName}`);
  }
  
  setPageTitle(title) {
    const newTitle = title || 'WhatsFresh';
    this.title = newTitle;
    document.title = `WhatsFresh - ${newTitle}`;
    log.info(`Page title set: ${newTitle}`);
  }
  
  setBreadcrumbs(crumbs) {
    this.breadcrumbs = Array.isArray(crumbs) ? crumbs : [];
    log.debug('Breadcrumbs updated', { count: this.breadcrumbs.length });
  }
  
  initialize() {
    log.info('PageStore initialized');
    return this;
  }
}

const pageStore = new PageStore();

// Create context for React components
export const PageContext = React.createContext(pageStore);

// Hook for functional components
export const usePageStore = () => React.useContext(PageContext);

// Export singleton for direct import
export default pageStore;

// Export individual methods for backward compatibility
export const setCurrentPage = (pageName, options) => pageStore.setCurrentPage(pageName, options);
export const getCurrentPage = () => pageStore.currentPage;
export const setPageTitle = (title) => pageStore.setPageTitle(title);
export const getPageTitle = () => pageStore.title;
export const setBreadcrumbs = (crumbs) => pageStore.setBreadcrumbs(crumbs);
export const getBreadcrumbs = () => pageStore.breadcrumbs;
export const initPageStore = () => pageStore.initialize();
