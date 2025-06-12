import PageConfigBuilder from './PageConfigBuilder';
import ColumnMapBuilder from './ColumnMapBuilder';
import accountStore from '../../stores/accountStore';
import { execEvent } from '../../stores';
import createLogger from '../../utils/logger';

const log = createLogger('PageMapBuilder');

class PageMapBuilder {
  constructor(entityName) {
    this.pageConfigBuilder = new PageConfigBuilder(entityName);
    this.columnMapBuilder = new ColumnMapBuilder();
    this.routeParams = {};
    this.fetchConfig = null;
  }

  // ***** ROUTE PARAMETERS HANDLING *****
  
  /**
   * Set route parameters from React Router's useParams hook
   * @param {Object} params - Parameters from useParams hook
   */
  withRouteParams(params = {}) {
    this.routeParams = params;
    return this;
  }
  
  /**
   * Resolve a parameter from all available sources
   */
  resolveParam(param) {
    // Normalize parameter name
    const normalizedName = param.startsWith(':') ? param.substring(1) : param;
    
    // Add DEBUG logging for acctID resolution
    if (normalizedName === 'acctID') {
      console.log('🔍 Resolving acctID with:', {
        fromRouteParams: this.routeParams?.acctID,
        fromAccountStore: accountStore.currentAcctID,
        fromSelectedEntity: accountStore.getSelectedEntity('acctID')
      });
      
      // DEVELOPMENT FALLBACK - add a default account ID if none is found
      const value = this.routeParams?.acctID || 
                   accountStore.getSelectedEntity('acctID') ||
                   accountStore.currentAcctID;
                   
      if (value === undefined && process.env.NODE_ENV === 'development') {
        console.log('⚠️ Using default acctID=1 for development');
        return 1; // Default account ID for testing
      }
      
      return value;
    }
    
    // Check route params (URL parameters)
    if (this.routeParams && normalizedName in this.routeParams) {
      return this.routeParams[normalizedName];
    }
    
    // Check selected entities (from row clicks)
    const selectedValue = accountStore.getSelectedEntity(normalizedName);
    if (selectedValue !== undefined) {
      return selectedValue;
    }
    
    // Check common values from accountStore
    if (normalizedName === 'acctID' && accountStore.currentAcctID) {
      return accountStore.currentAcctID;
    }
    
    // Add fallback for testing
    if (normalizedName === 'acctID' && process.env.NODE_ENV === 'development') {
      this.log.warn('Using fallback acctID for development');
      return 1; // Default account ID for testing
    }
    
    return undefined;
  }
  
  /**
   * Build parameters object for API calls from route params
   * @param {Array} requiredParams - List of parameters the API needs
   */
  buildParams(requiredParams = []) {
    const params = {};
    
    for (const param of requiredParams) {
      const value = this.resolveParam(param);
      if (value !== undefined) {
        params[param] = value;
      }
    }
    
    log.debug('Built params:', { required: requiredParams, resolved: params });
    return params;
  }
  
  /**
   * Configure data fetching using route parameters
   * @param {string} eventType - API event type to execute
   * @param {Array} requiredParams - Required parameters for the event
   */
  withFetch(eventType, requiredParams = []) {
    this.fetchConfig = {
      eventType,
      requiredParams
    };
    
    // Create the fetch function that uses our parameters
    this.fetch = async () => {
      const params = this.buildParams(requiredParams);
      
      // Check if all required params are resolved
      const missing = requiredParams.filter(p => !(p in params));
      if (missing.length > 0) {
        log.error('Missing required parameters:', { 
          event: eventType, 
          missing,
          available: { routeParams: this.routeParams }
        });
        throw new Error(`Missing required parameters for ${eventType}: ${missing.join(', ')}`);
      }
      
      log.debug('Executing event with params:', { event: eventType, params });
      return execEvent(eventType, params);
    };
    
    // Set list event in page config
    this.pageConfigBuilder.setListEvent(eventType);
    
    return this;
  }

  // ***** CROSS-POLLINATION METHODS *****
  
  setIdField(idField, dbCol, options = {}) {
    // Set in page config
    this.pageConfigBuilder.setIdField(idField, dbCol);
    
    // Also add as a column
    this.columnMapBuilder.addIdColumn(idField, dbCol, options);
    
    return this;
  }
  
  setParentIdField(field, dbCol, options = {}) {
    // Set in page config
    this.pageConfigBuilder.setParentIdField(field, dbCol);
    
    // Add as column if not already exists
    const columns = this.columnMapBuilder.build();
    const existingColumn = columns.find(col => col.field === field);
    
    if (!existingColumn) {
      this.columnMapBuilder.addParentIdColumn(field, dbCol, {
        hideInTable: true,
        hideInForm: true,
        ...options
      });
    }
    
    return this;
  }

  // ***** PAGE CONFIG DELEGATION METHODS *****
  
  setTable(tableName) {
    this.pageConfigBuilder.setTable(tableName);
    return this;
  }
  
  setPageTitle(title) {
    this.pageConfigBuilder.setPageTitle(title);
    return this;
  }
  
  setListEvent(event) {
    this.pageConfigBuilder.setListEvent(event);
    return this;
  }
  
  setNavigateTo(path) {
    this.pageConfigBuilder.setNavigateTo(path);
    return this;
  }
  
  setEntityType(type) {
    this.pageConfigBuilder.setEntityType(type);
    return this;
  }
  
  setSelects(selectsConfig) {
    this.pageConfigBuilder.setSelects(selectsConfig);
    return this;
  }
  
  setHierarchy(levelConfig) {
    this.pageConfigBuilder.setHierarchy(levelConfig);
    return this;
  }

  // ***** COLUMN MAP DELEGATION METHODS *****
  
  addTextColumn(field, dbCol, label, options = {}) {
    this.columnMapBuilder.addTextColumn(field, dbCol, label, options);
    return this;
  }
  
  addOrderColumn(field, dbCol, label, options = {}) {
    this.columnMapBuilder.addOrderColumn(field, dbCol, label, options);
    return this;
  }
  
  addSelectColumn(field, dbCol, label, selList, options = {}) {
    this.columnMapBuilder.addSelectColumn(field, dbCol, label, selList, options);
    return this;
  }
  
  addDependentSelectColumn(field, dbCol, label, selList, dependsOn, filterBy, options = {}) {
    this.columnMapBuilder.addDependentSelectColumn(field, dbCol, label, selList, dependsOn, filterBy, options);
    return this;
  }
  
  addDerivedDisplayColumn(field, label, options = {}) {
    this.columnMapBuilder.addDerivedDisplayColumn(field, label, options);
    return this;
  }
  
  addTrackedNumberColumn(field, dbCol, label, options = {}) {
    this.columnMapBuilder.addTrackedNumberColumn(field, dbCol, label, options);
    return this;
  }
  
  addRawColumn(column) {
    this.columnMapBuilder.addRawColumn(column);
    return this;
  }
  
  addColumn(field, dbCol, label, options = {}) {
    this.columnMapBuilder.addColumn(field, dbCol, label, options);
    return this;
  }
  
  addRealTimeCalculatedColumn(field, label, dependencies, calculateFn, options = {}) {
    this.columnMapBuilder.addRealTimeCalculatedColumn(field, label, dependencies, calculateFn, options);
    return this;
  }
  
  addNumberColumn(field, dbCol, label, options = {}) {
    this.columnMapBuilder.addNumberColumn(field, dbCol, label, options);
    return this;
  }

  // ***** COMBINED METHODS *****
  
  build() {
    // Add fetch function to the returned object if configured
    const result = {
      pageConfig: this.pageConfigBuilder.build(),
      columnMap: this.columnMapBuilder.build()
    };
    
    if (this.fetchConfig) {
      result.fetch = this.fetch;
    }
    
    return result;
  }
  
  debug() {
    console.log('=== Page Map Builder Debug ===');
    this.pageConfigBuilder.debugConfig();
    this.columnMapBuilder.debugColumns();
    if (this.routeParams) {
      console.log('Route Parameters:', this.routeParams);
    }
    if (this.fetchConfig) {
      console.log('Fetch Configuration:', this.fetchConfig);
    }
    return this;
  }
  
  /**
   * Configure row selection to store entity ID in accountStore
   * @param {Function} customHandler - Optional callback after selection
   */
  withRowSelection(customHandler) {
    // Get entity type and ID field from page config
    const entityType = this.pageConfigBuilder.config.entityType;
    const idField = this.pageConfigBuilder.config.idField;
    
    if (!entityType || !idField) {
      log.warn('Cannot configure row selection without entityType and idField');
      return this;
    }
    
    // Create selection handler for the page config
    this.pageConfigBuilder.config.onRowSelect = (row) => {
      if (!row) return;
      
      const idValue = row[idField];
      log.debug(`Selected ${entityType}: ${idValue}`);
      
      // REPLACEMENT FOR setVar: Store entity selection in accountStore
      accountStore.setSelectedEntity(entityType, idValue);
      
      // Also store by ID field name for parent-child relationships
      // This is equivalent to setVar(':ingrTypeID', value)
      accountStore.setSelectedEntity(idField, idValue);
      
      // Store with colon prefix for backward compatibility
      accountStore.setSelectedEntity(`:${idField}`, idValue);
      
      // Call custom handler if provided
      if (typeof customHandler === 'function') {
        customHandler(row);
      }
    };
    
    return this;
  }
}

export default PageMapBuilder;
