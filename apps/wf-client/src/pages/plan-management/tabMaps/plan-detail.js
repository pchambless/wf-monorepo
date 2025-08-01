/**
 * Plan Detail Tab Map - Phase 4: Complete Configuration
 * Full tableConfig, formConfig, and dmlConfig for plan management
 */

export const planDetailTabMap = {
  tabId: "plan-detail",
  title: "Plan Detail",
  eventType: "planDetailList",

  // Table configuration for displaying plan data
  tableConfig: {
    columns: [
      {
        field: "id",
        header: "Plan ID",
        type: "text",
        width: "80px",
        sortable: true,
      },
      {
        field: "name",
        header: "Plan Name",
        type: "text",
        width: "200px",
        sortable: true,
        required: true,
      },
      {
        field: "status",
        header: "Status",
        type: "select",
        width: "120px",
        sortable: true,
        selectOptions: "planStatus", // References selectVals.json
      },
      {
        field: "priority",
        header: "Priority",
        type: "select",
        width: "100px",
        sortable: true,
        selectOptions: "priority",
      },
      {
        field: "cluster",
        header: "Cluster",
        type: "select",
        width: "120px",
        sortable: true,
        selectOptions: "cluster",
      },
      {
        field: "description",
        header: "Description",
        type: "textarea",
        width: "300px",
        sortable: false,
      },
      {
        field: "assigned_to",
        header: "Assigned To",
        type: "text",
        width: "120px",
        sortable: true,
      },
      {
        field: "created_by",
        header: "Created By",
        type: "text",
        width: "120px",
        sortable: true,
        readonly: true,
      },
      {
        field: "created_at",
        header: "Created",
        type: "datetime",
        width: "140px",
        sortable: true,
        readonly: true,
      },
    ],
    primaryKey: "id",
    sortBy: "id",
    sortOrder: "desc",
  },

  // Form configuration for editing plan data
  formConfig: {
    layout: "vertical",
    sections: [
      {
        title: "Basic Information",
        fields: [
          {
            field: "name",
            label: "Plan Name",
            type: "text",
            required: true,
            maxLength: 255,
            placeholder: "Enter plan name",
          },
          {
            field: "status",
            label: "Status",
            type: "select",
            required: true,
            selectOptions: "planStatus",
            defaultValue: "new",
          },
          {
            field: "priority",
            label: "Priority",
            type: "select",
            required: true,
            selectOptions: "priority",
            defaultValue: "medium",
          },
          {
            field: "cluster",
            label: "Cluster",
            type: "select",
            required: true,
            selectOptions: "cluster",
          },
        ],
      },
      {
        title: "Details",
        fields: [
          {
            field: "description",
            label: "Description",
            type: "textarea",
            rows: 4,
            maxLength: 1000,
            placeholder: "Enter plan description",
          },
          {
            field: "assigned_to",
            label: "Assigned To",
            type: "text",
            maxLength: 50,
            placeholder: "Enter assignee",
          },
        ],
      },
      {
        title: "Audit Information",
        readonly: true,
        fields: [
          {
            field: "created_by",
            label: "Created By",
            type: "text",
            readonly: true,
          },
          {
            field: "created_at",
            label: "Created At",
            type: "datetime",
            readonly: true,
          },
          {
            field: "updated_by",
            label: "Updated By",
            type: "text",
            readonly: true,
          },
          {
            field: "updated_at",
            label: "Updated At",
            type: "datetime",
            readonly: true,
          },
        ],
      },
    ],
  },

  // DML configuration for CRUD operations
  dmlConfig: {
    table: "api_wf.plans",
    primaryKey: "id",

    // Create operation
    create: {
      eventType: "createPlan",
      requiredFields: ["name", "status", "priority", "cluster"],
      defaultValues: {
        status: "new",
        priority: "medium",
        created_by: "current-user",
        created_at: "NOW()",
      },
      validation: {
        name: {
          required: true,
          minLength: 3,
          maxLength: 255,
        },
        description: {
          maxLength: 1000,
        },
      },
      workflows: {
        onSuccess: ["trackImpact", "refreshContext"],
        onError: ["logError", "notifyUser"],
      },
    },

    // Update operation
    update: {
      eventType: "updatePlan",
      requiredFields: ["id"],
      auditFields: {
        updated_by: "current-user",
        updated_at: "NOW()",
      },
      validation: {
        name: {
          required: true,
          minLength: 3,
          maxLength: 255,
        },
        description: {
          maxLength: 1000,
        },
      },
      workflows: {
        onSuccess: ["trackImpact", "refreshContext"],
        onError: ["logError", "notifyUser"],
      },
    },

    // Delete operation (soft delete)
    delete: {
      eventType: "archivePlan",
      softDelete: true,
      deleteFields: {
        deleted_at: "NOW()",
        deleted_by: "current-user",
      },
      workflows: {
        onSuccess: ["trackImpact", "refreshContext"],
        onError: ["logError", "notifyUser"],
      },
    },
  },

  // Validation rules
  validation: {
    rules: {
      name: {
        required: "Plan name is required",
        minLength: "Plan name must be at least 3 characters",
        maxLength: "Plan name cannot exceed 255 characters",
      },
      status: {
        required: "Status is required",
      },
      priority: {
        required: "Priority is required",
      },
      cluster: {
        required: "Cluster is required",
      },
      description: {
        maxLength: "Description cannot exceed 1000 characters",
      },
    },
  },

  // UI permissions
  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
    export: true,
  },
};

export default planDetailTabMap;
