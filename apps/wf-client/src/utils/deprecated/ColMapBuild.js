class ColMapBuild {
  constructor(entityName) {
    this.columns = [];
    this.config = {
      idField: 'id',
      pageTitle: entityName || 'Entity'
    };
    
    this.groupOrders = {};
  }
  
  // Configuration methods remain the same...
  /**
   * Sets the ID field and automatically creates a column for it
   * @param {string} idField - The ID field name
   * @param {string} dbCol - The database column name
   * @param {Object} options - Optional column configuration
   */
  setIdField(idField, dbCol, options = {}) {
    if (!dbCol) {
      throw new Error(`Database column name is required when setting ID field ${idField}`);
    }
    
    // Set in config
    this.config.idField = idField;
    
    // Automatically create the ID column
    this.addIdColumn(idField, dbCol, options);
    
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
  
  /**
   * Sets the parent ID field and automatically creates a column for it
   * @param {string} field - The parent ID field name
   * @param {string} dbCol - The database column name
   * @param {Object} options - Optional column configuration
   */
  setParentIdField(field, dbCol, options = {}) {
    if (!dbCol) {
      throw new Error(`Database column name is required when setting parent ID field ${field}`);
    }
    
    // Set in config
    this.config.parentIdField = field;
    this.config.parentIdDbCol = dbCol;
    
    // Automatically create the parent ID column (but don't add it twice)
    const existingColumn = this.columns.find(col => col.field === field);
    if (!existingColumn) {
      this.addIdColumn(field, dbCol, {
        hideInTable: true,
        hideInForm: true,
        ...options
      });
    }
    
    return this;
  }
  
  setEntityType(type) {
    this.config.entityType = type;
    return this;
  }
  
  // Helper methods for visibility logic
  getDefaultHideInTable(displayType) {
    // Hide these types in tables by default
    return ['select', 'multiLine', 'multiline'].includes(displayType);
  }
  
  getDefaultHideInForm(displayType, isIdField) {
    // All ID fields are hidden in forms by default, regardless of display type
    if (isIdField) {
      return true;
    }
    // Regular fields are shown in forms by default
    return false;
  }
  
  // Helper for group ordering
  getNextOrder(group) {
    if (!group) return 1;
    
    if (!this.groupOrders[group]) {
      this.groupOrders[group] = 0;
    }
    
    return ++this.groupOrders[group];
  }
  
  // Column methods with smart defaults
  addIdColumn(field, dbCol, options = {}) {
    const displayType = options.displayType || 'text';
    
    this.columns.push({
      field,
      dbCol: dbCol || field,
      label: options.label || field,
      dataType: "INT",
      displayType,
      // Smart defaults with override option
      hideInTable: options.hideInTable !== undefined ? 
        options.hideInTable : true,
      hideInForm: options.hideInForm !== undefined ? 
        options.hideInForm : this.getDefaultHideInForm(displayType, true),
      ...options
    });
    return this;
  }
  
  // Parent ID column (common in your hierarchy)
  addParentIdColumn(field, dbCol, options = {}) {
    // Set the parent ID field relationship
    this.setParentIdField(field, dbCol);
    
    // Force hiding in both table and form unless explicitly overridden
    const parentOptions = {
      ...options,
      hideInTable: options.hideInTable !== undefined ? options.hideInTable : true,
      hideInForm: options.hideInForm !== undefined ? options.hideInForm : true
    };
    
    // Add the column definition with parent-specific options
    return this.addIdColumn(field, dbCol, parentOptions);
  }
  
  // Order column (like ingrOrdr)
  addOrderColumn(field, dbCol, label, options = {}) {
    const group = options.group || 2; // Typically in group 2 based on your pattern
    const order = options.ordr || 1;  // Usually first in its group
    
    this.columns.push({
      group,
      ordr: order,
      field,
      dbCol: dbCol || field,
      label,
      width: options.width || 80,
      dataType: "INT",
      displayType: "number",
      required: options.required !== false,
      // Usually visible in table for ordering
      hideInTable: options.hideInTable !== undefined ? options.hideInTable : false,
      hideInForm: options.hideInForm !== undefined ? options.hideInForm : false,
      ...options
    });
    return this;
  }
  
  addTextColumn(field, dbCol, label, options = {}) {
    // Default to 'text' displayType unless multiLine is true
    const displayType = options.multiLine ? 'multiLine' : 'text';
    
    this.addColumn(field, dbCol, label, {
      dataType: 'STRING',
      displayType, // Use the calculated displayType
      ...options
    });
    
    return this;
  }
  
  addSelectColumn(field, dbCol, label, selList, options = {}) {
    const group = options.group || 1;
    const order = options.ordr || this.getNextOrder(group);
    
    this.columns.push({
      group,
      ordr: order,
      field,
      dbCol: dbCol || field,
      label,
      width: options.width || 150,
      dataType: options.dataType || "INT",
      displayType: 'select',
      selList,
      required: options.required || false,
      // Selection fields typically hidden in table, shown in form
      hideInTable: options.hideInTable !== undefined ? 
        options.hideInTable : true,
      hideInForm: options.hideInForm !== undefined ? 
        options.hideInForm : false,
      ...options
    });
    return this;
  }
  
  // For fields like ingrSel that depend on another selection
  addDependentSelectColumn(field, dbCol, label, selList, dependsOn, filterBy, options = {}) {
    const group = options.group || 2; // Typically in group 2 in your pattern
    const order = options.ordr || this.getNextOrder(group);
    
    this.columns.push({
      group,
      ordr: order,
      field, 
      dbCol: dbCol || field,
      label,
      width: options.width || 150,
      dataType: options.dataType || "INT", 
      displayType: 'select',
      selList,
      dependsOn,
      filterBy,
      clearOnParentChange: options.clearOnParentChange !== false,
      required: options.required || false,
      // Dependent selects hidden in table, shown in form
      hideInTable: options.hideInTable !== undefined ? 
        options.hideInTable : true,
      hideInForm: options.hideInForm !== undefined ? 
        options.hideInForm : false,
      ...options
    });
    return this;
  }
  
  // For display fields like ingrName and qtyMeas
  addDerivedDisplayColumn(field, label, options = {}) {
    const order = options.ordr || this.getNextOrder(null);
    
    this.columns.push({
      ordr: order,
      field,
      dbCol: options.dbCol || "",  // Usually empty for derived fields
      label,
      width: options.width || 200,
      dataType: options.dataType || "STRING",
      // Display fields usually shown in table, hidden in form
      hideInTable: options.hideInTable !== undefined ? 
        options.hideInTable : false,
      hideInForm: options.hideInForm !== undefined ? 
        options.hideInForm : true,
      ...options
    });
    return this;
  }
  
  // For value fields with tracked state
  addTrackedNumberColumn(field, dbCol, label, options = {}) {
    const group = options.group || 3; // Typically in group 3 in your pattern
    const order = options.ordr || this.getNextOrder(group);
    const setVar = options.setVar || `:${field}`;
    
    this.columns.push({
      group,
      ordr: order,
      field,
      dbCol: dbCol || field,
      label,
      width: options.width || 100,
      dataType: "NUMBER",
      displayType: "number",
      required: options.required !== false,
      setVar,
      hideInTable: options.hideInTable !== undefined ? 
        options.hideInTable : false,
      hideInForm: options.hideInForm !== undefined ? 
        options.hideInForm : false,
      ...options
    });
    return this;
  }
  
  // Rename the current addColumn method to be clear about its purpose
  addRawColumn(column) {
    this.columns.push(column);
    return this;
  }

  // Add a proper addColumn method that takes full parameters
  addColumn(field, dbCol, label, options = {}) {
    const group = options.group || 1;
    const order = options.ordr || this.getNextOrder(group);
    
    this.columns.push({
      group,
      ordr: order,
      field,
      dbCol: dbCol || field,
      label,
      width: options.width || 150,
      dataType: options.dataType || "STRING",
      displayType: options.displayType || "text",
      required: options.required || false,
      hideInTable: options.hideInTable !== undefined ? 
        options.hideInTable : this.getDefaultHideInTable(options.displayType || "text"),
      hideInForm: options.hideInForm !== undefined ? 
        options.hideInForm : false,
      ...options
    });
    
    return this;
  }

  // Add this method to your class
  addRealTimeCalculatedColumn(field, label, dependencies, calculateFn, options = {}) {
    const colDef = {
      field,
      dbCol: options.dbCol || "",
      label,
      width: options.width || 120,
      dataType: options.dataType || "NUMBER", 
      displayType: options.displayType || "text",
      dependencies, // Array of fields this calculation depends on
      calculateFn, // Function that calculates the value
      calculated: true,
      realTimeCalculation: true, // Flag for form component to know it should update on field changes
      formattingFn: options.formattingFn, // Optional formatting function
      // Default to shown in form but hidden in table
      hideInTable: options.hideInTable !== undefined ? 
        options.hideInTable : true,
      hideInForm: options.hideInForm !== undefined ? 
        options.hideInForm : false,
      ...options
    };
    
    // Only add group/order if explicitly provided
    if (options.group) {
      colDef.group = options.group;
      colDef.ordr = options.ordr || this.getNextOrder(options.group);
    } else if (options.ordr) {
      colDef.ordr = options.ordr;
    }
    
    this.columns.push(colDef);
    return this;
  }
  
  /**
   * Adds a number column to the column map
   * @param {string} field - The field name
   * @param {string} dbCol - The database column name
   * @param {string} label - The display label
   * @param {Object} options - Additional column options
   */
  addNumberColumn(field, dbCol, label, options = {}) {
    this.addColumn(field, dbCol, label, {
      dataType: 'NUMBER',
      displayType: 'number',
      ...options
    });
    
    return this;
  }

  // Update your setSelects method to be more complete:

  setSelects(selectsConfig) {
    // Initialize select configurations if not already done
    this.config.selects = this.config.selects || {
      sel1: { visible: false },
      sel2: { visible: false },
      sel3: { visible: false }
    };
    
    // Apply the provided configurations
    Object.keys(selectsConfig).forEach(key => {
      this.config.selects[key] = {
        ...this.config.selects[key],
        ...selectsConfig[key]
      };
    });
    
    return this;
  }

  // Add a convenience method for setting up parent-child relationships
  setHierarchy(levelConfig) {
    // Example: 
    // .setHierarchy({
    //   sel1: { listEvent: 'ingrTypeList', valueField: 'id', labelField: 'name' },
    //   sel2: { listEvent: 'ingrList', parentField: 'ingredient_type_id' }
    // })
    
    this.config.hierarchy = levelConfig;
    
    // Automatically set up selects based on hierarchy
    const selectsConfig = {};
    Object.keys(levelConfig).forEach(key => {
      selectsConfig[key] = { visible: true };
    });
    
    return this.setSelects(selectsConfig);
  }
  
  build() {
    return {
      ...this.config,
      columns: this.columns
    };
  }
  
  // Debug method to visualize the output
  debug() {
    console.log('=== Column Map Builder Debug ===');
    console.log('Configuration:', this.config);
    console.log(`Total columns: ${this.columns.length}`);
    
    const grouped = {};
    this.columns.forEach(col => {
      const group = col.group || 0;
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(col);
    });
    
    Object.keys(grouped).forEach(group => {
      console.log(`\nGroup ${group} (${grouped[group].length} columns):`);
      grouped[group].forEach(col => {
        console.log(`  - ${col.field}: ${col.label} (${col.dataType}, order: ${col.ordr || 'N/A'})`);
        console.log(`    Display: ${col.displayType || 'default'}, Table: ${col.hideInTable ? 'Hidden' : 'Shown'}, Form: ${col.hideInForm ? 'Hidden' : 'Shown'}`);
      });
    });
    
    return this;
  }
}

export default ColMapBuild;
