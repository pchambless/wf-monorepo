class PageConfigBuilder {
  constructor(entityName) {
    this.config = {
      idField: 'id',
      pageTitle: entityName || 'Entity'
    };
  }

  // Page-level configuration methods
  setIdField(idField, dbCol) {
    if (!dbCol) {
      throw new Error(`Database column name is required when setting ID field ${idField}`);
    }
    
    this.config.idField = idField;
    this.config.idFieldDbCol = dbCol;
    return this;
  }

  setTable(tableName) {
    this.config.dbTable = tableName;
    return this;
  }

  setPageTitle(title) {
    this.config.pageTitle = title;
    return this;
  }

  setListEvent(event) {
    this.config.listEvent = event;
    return this;
  }

  setNavigateTo(path) {
    this.config.navigateTo = path;
    return this;
  }

  setParentIdField(field, dbCol) {
    if (!dbCol) {
      throw new Error(`Database column name is required when setting parent ID field ${field}`);
    }
    
    this.config.parentIdField = field;
    this.config.parentIdDbCol = dbCol;
    return this;
  }

  setEntityType(type) {
    this.config.entityType = type;
    return this;
  }

  // Hierarchy and select configuration
  setSelects(selectsConfig) {
    this.config.selects = this.config.selects || {
      sel1: { visible: false },
      sel2: { visible: false },
      sel3: { visible: false }
    };
    
    Object.keys(selectsConfig).forEach(key => {
      this.config.selects[key] = {
        ...this.config.selects[key],
        ...selectsConfig[key]
      };
    });
    
    return this;
  }

  setHierarchy(levelConfig) {
    this.config.hierarchy = levelConfig;
    
    const selectsConfig = {};
    Object.keys(levelConfig).forEach(key => {
      selectsConfig[key] = { visible: true };
    });
    
    return this.setSelects(selectsConfig);
  }
  
  // Debug only config information
  debugConfig() {
    console.log('Page Configuration:', this.config);
  }

  build() {
    return this.config;
  }
}

export default PageConfigBuilder;
