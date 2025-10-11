// Current development schema - update this as needed during development
// Production: Copy to v02.js before making breaking changes
export const v01 = {
  // Working tables (CRUD operations, sync to MySQL)
  eventComp_xref: '++idbID, id, pageID, comp_name, parent_id, _dmlMethod',
  eventTriggers: '++idbID, id, xref_id, class, action, _dmlMethod',
  eventProps: '++idbID, id, xref_id, paramName, _dmlMethod',

  // Master data tables (editable, less frequent changes)
  eventTypes: '++idbID, id, name, category, _dmlMethod',
  eventSQL: '++idbID, id, &qryName, _dmlMethod',
  triggers: '++idbID, id, &name, trigType, is_dom_event, description, param_schema, example, _dmlMethod',

  // Dropdown reference tables (read-only caches from master tables)
  refContainers: '&name',     // FROM eventTypes WHERE category='container'
  refComponents: '&name',     // FROM eventTypes WHERE category='component'
  refTriggerActions: '&name', // FROM triggers WHERE trigType='action'
  refTriggerClasses: '&name', // FROM triggers WHERE trigType='class'
  refSQL: '&qryName'          // FROM eventSQL (for query dropdowns)
};
