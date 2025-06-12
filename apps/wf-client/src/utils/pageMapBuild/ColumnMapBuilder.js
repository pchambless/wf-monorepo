class ColumnMapBuilder {
  constructor() {
    this.columns = [];
    this.groupOrders = {};
  }
  
  // Helper methods
  getNextOrder(group) {
    if (!group) return 1;
    
    if (!this.groupOrders[group]) {
      this.groupOrders[group] = 0;
    }
    
    return ++this.groupOrders[group];
  }

  getDefaultHideInTable(displayType) {
    return ['select', 'multiLine', 'multiline'].includes(displayType);
  }

  getDefaultHideInForm(displayType, isIdField) {
    if (isIdField) {
      return true;
    }
    return false;
  }

  // Column methods
  addIdColumn(field, dbCol, options = {}) {
    const displayType = options.displayType || 'text';
    
    this.columns.push({
      field,
      dbCol: dbCol || field,
      label: options.label || field,
      dataType: "INT",
      displayType,
      hideInTable: options.hideInTable !== undefined ? 
        options.hideInTable : true,
      hideInForm: options.hideInForm !== undefined ? 
        options.hideInForm : this.getDefaultHideInForm(displayType, true),
      ...options
    });
    return this;
  }
  
  addParentIdColumn(field, dbCol, options = {}) {
    const parentOptions = {
      ...options,
      hideInTable: options.hideInTable !== undefined ? options.hideInTable : true,
      hideInForm: options.hideInForm !== undefined ? options.hideInForm : true
    };
    
    return this.addIdColumn(field, dbCol, parentOptions);
  }
  
  addOrderColumn(field, dbCol, label, options = {}) {
    const group = options.group || 2;
    const order = options.ordr || 1;
    
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
      hideInTable: options.hideInTable !== undefined ? options.hideInTable : false,
      hideInForm: options.hideInForm !== undefined ? options.hideInForm : false,
      ...options
    });
    return this;
  }
  
  addTextColumn(field, dbCol, label, options = {}) {
    const displayType = options.multiLine ? 'multiLine' : 'text';
    
    this.addColumn(field, dbCol, label, {
      dataType: 'STRING',
      displayType: displayType,
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
      hideInTable: options.hideInTable !== undefined ? 
        options.hideInTable : true,
      hideInForm: options.hideInForm !== undefined ? 
        options.hideInForm : false,
      ...options
    });
    return this;
  }
  
  addDependentSelectColumn(field, dbCol, label, selList, dependsOn, filterBy, options = {}) {
    const group = options.group || 2;
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
      hideInTable: options.hideInTable !== undefined ? 
        options.hideInTable : true,
      hideInForm: options.hideInForm !== undefined ? 
        options.hideInForm : false,
      ...options
    });
    return this;
  }
  
  addDerivedDisplayColumn(field, label, options = {}) {
    const order = options.ordr || this.getNextOrder(null);
    
    this.columns.push({
      ordr: order,
      field,
      dbCol: options.dbCol || "",
      label,
      width: options.width || 200,
      dataType: options.dataType || "STRING",
      hideInTable: options.hideInTable !== undefined ? 
        options.hideInTable : false,
      hideInForm: options.hideInForm !== undefined ? 
        options.hideInForm : true,
      ...options
    });
    return this;
  }
  
  addTrackedNumberColumn(field, dbCol, label, options = {}) {
    const group = options.group || 3;
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
  
  addRawColumn(column) {
    this.columns.push(column);
    return this;
  }

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

  addRealTimeCalculatedColumn(field, label, dependencies, calculateFn, options = {}) {
    const colDef = {
      field,
      dbCol: options.dbCol || "",
      label,
      width: options.width || 120,
      dataType: options.dataType || "NUMBER", 
      displayType: options.displayType || "text",
      dependencies,
      calculateFn,
      calculated: true,
      realTimeCalculation: true,
      formattingFn: options.formattingFn,
      hideInTable: options.hideInTable !== undefined ? 
        options.hideInTable : true,
      hideInForm: options.hideInForm !== undefined ? 
        options.hideInForm : false,
      ...options
    };
    
    if (options.group) {
      colDef.group = options.group;
      colDef.ordr = options.ordr || this.getNextOrder(options.group);
    } else if (options.ordr) {
      colDef.ordr = options.ordr;
    }
    
    this.columns.push(colDef);
    return this;
  }
  
  addNumberColumn(field, dbCol, label, options = {}) {
    this.addColumn(field, dbCol, label, {
      dataType: 'NUMBER',
      displayType: 'number',
      ...options
    });
    
    return this;
  }

  // Debug only column-related information
  debugColumns() {
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
  }
  
  build() {
    return this.columns;
  }
}

export default ColumnMapBuilder;
