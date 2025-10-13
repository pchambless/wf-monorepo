// Current development schema - update this as needed during development
// Production: Copy to v02.js before making breaking changes
export const v01 = {
  // Working tables (CRUD operations, sync to MySQL)
  // Note: pageID removed - redundant since clearWorkingData() ensures only one page loaded
  // Note: container field REMOVED per issue #5 - parent determines container
  eventComp_xref: '++idbID, id, comp_name, parent_id, _dmlMethod',
  eventTriggers: '++idbID, id, xref_id, class, action, _dmlMethod',
  eventProps: '++idbID, id, xref_id, paramName, _dmlMethod',

  // Master data tables (templates - editable, less frequent changes)
  // Query these directly for dropdowns instead of maintaining separate ref* tables
  eventTypes: '++idbID, id, &name, category, _dmlMethod',
  eventSQL: '++idbID, id, &qryName, _dmlMethod',
  triggers: '++idbID, id, &name, trigType, is_dom_event, description, param_schema, example, _dmlMethod'
};
