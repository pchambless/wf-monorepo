/**
 * Database Query Card
 * Handles query setup, field generation, and execEvent workflow pattern
 */

export const dbQuery = {
  category: "card",
  title: "Database Query & Fields",
  cluster: "Database",
  purpose: "Configure database query and generate base fields from schema",

  fields: [
    {
      name: "queryName",
      type: "text",
      label: "Query Name",
      placeholder: "e.g., planList, appList, pageList",
      required: true,
      helpText: "Name of the database query to execute on refresh"
    },
    {
      name: "fields",
      type: "fieldArray",
      label: "Generated Fields",
      readonly: true,
      helpText: "Auto-generated from query schema - customize in Form/Grid Override cards"
    }
  ],

  actions: [
    {
      label: "Generate Fields",
      action: "generateFields",
      type: "primary",
      helpText: "Analyze query schema and generate field definitions"
    },
    {
      label: "Test Query",
      action: "testQuery",
      type: "tertiary",
      helpText: "Execute query to verify it works"
    },
    {
      label: "Save Changes",
      action: "saveChanges",
      type: "secondary"
    }
  ],

  // Auto-generates this workflow trigger when queryName is set
  generatedWorkflowTriggers: {
    onRefresh: ["execEvent:{queryName}"]
  },

  validation: {
    queryName: {
      required: true,
      pattern: "^[a-zA-Z][a-zA-Z0-9]*$",
      message: "Query name must be alphanumeric, starting with letter"
    }
  }
};