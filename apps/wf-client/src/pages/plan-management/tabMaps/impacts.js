/**
 * Impacts Tab Map - Phase 4: Complete Configuration
 * Read-only impact display with tracking information
 */

export const impactsTabMap = {
  tabId: "impacts",
  title: "Impacted Files",
  eventType: "planImpactList",

  // Table configuration for displaying impact data
  tableConfig: {
    columns: [
      {
        field: "id",
        header: "ID",
        type: "text",
        width: "60px",
        sortable: true,
      },
      {
        field: "file_path",
        header: "File Path",
        type: "text",
        width: "300px",
        sortable: true,
        truncate: true,
      },
      {
        field: "change_type",
        header: "Change Type",
        type: "select",
        width: "120px",
        sortable: true,
        selectOptions: "workflowImpactTypes",
      },
      {
        field: "status",
        header: "Status",
        type: "select",
        width: "100px",
        sortable: true,
        selectOptions: "impactStatus",
      },
      {
        field: "description",
        header: "Description",
        type: "textarea",
        width: "250px",
        sortable: false,
        truncate: true,
      },
      {
        field: "lines_added",
        header: "Lines +",
        type: "number",
        width: "80px",
        sortable: true,
      },
      {
        field: "lines_removed",
        header: "Lines -",
        type: "number",
        width: "80px",
        sortable: true,
      },
      {
        field: "created_by",
        header: "Tracked By",
        type: "text",
        width: "120px",
        sortable: true,
        readonly: true,
      },
      {
        field: "created_at",
        header: "Tracked At",
        type: "datetime",
        width: "140px",
        sortable: true,
        readonly: true,
      },
    ],
    primaryKey: "id",
    sortBy: "created_at",
    sortOrder: "desc",
  },

  // No form configuration - this is read-only
  formConfig: null,

  // DML configuration - read-only, no create/update/delete
  dmlConfig: {
    table: "api_wf.plan_impacts",
    primaryKey: "id",

    // No create/update/delete operations - impacts are tracked automatically
    // by workflows when files are modified

    // Read operation only
    read: {
      eventType: "planImpactList",
      filters: {
        plan_id: "context.planId",
      },
      orderBy: "created_at DESC",
    },
  },

  // No validation rules needed for read-only
  validation: null,

  // UI configuration for read-only display
  ui: {
    mode: "readonly",
    showCreateButton: false,
    showEditButton: false,
    showDeleteButton: false,
    emptyStateMessage: "No file impacts tracked for this plan yet",
    refreshButton: true,
    exportButton: true,

    // Custom display options
    showSummary: true,
    summaryFields: [
      {
        label: "Total Files Impacted",
        value: "count",
        type: "number",
      },
      {
        label: "Files Created",
        value: "created_count",
        type: "number",
        filter: { change_type: "CREATE" },
      },
      {
        label: "Files Modified",
        value: "modified_count",
        type: "number",
        filter: { change_type: "MODIFY" },
      },
      {
        label: "Files Deleted",
        value: "deleted_count",
        type: "number",
        filter: { change_type: "DELETE" },
      },
      {
        label: "Total Lines Added",
        value: "total_lines_added",
        type: "number",
        aggregate: "sum",
        field: "lines_added",
      },
      {
        label: "Total Lines Removed",
        value: "total_lines_removed",
        type: "number",
        aggregate: "sum",
        field: "lines_removed",
      },
    ],

    // File type grouping
    groupBy: {
      enabled: true,
      field: "file_extension",
      showCounts: true,
    },

    // Status filtering
    statusFilter: {
      enabled: true,
      field: "status",
      options: "impactStatus",
    },
  },

  // UI permissions - read-only
  permissions: {
    create: false,
    read: true,
    update: false,
    delete: false,
    export: true,
    refresh: true,
  },

  // Custom actions for impact management
  actions: [
    {
      id: "view-file",
      label: "View File",
      icon: "eye",
      type: "row",
      action: "viewFile",
      condition: "file_exists",
    },
    {
      id: "open-in-editor",
      label: "Open in Editor",
      icon: "edit",
      type: "row",
      action: "openInEditor",
      condition: "file_exists",
    },
    {
      id: "view-diff",
      label: "View Changes",
      icon: "diff",
      type: "row",
      action: "viewDiff",
      condition: "has_changes",
    },
    {
      id: "refresh-impacts",
      label: "Refresh Impact Data",
      icon: "refresh",
      type: "toolbar",
      action: "refreshImpacts",
    },
    {
      id: "export-impacts",
      label: "Export Impact Report",
      icon: "download",
      type: "toolbar",
      action: "exportImpacts",
    },
  ],
};

export default impactsTabMap;
