/**
 * Communications Tab Map - Phase 4: Complete Configuration
 * Communication creation form and history display
 */

export const communicationsTabMap = {
  tabId: "communications",
  title: "Communications",
  eventType: "planCommunicationList",

  // Table configuration for displaying communication history
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
        field: "communication_type",
        header: "Type",
        type: "select",
        width: "100px",
        sortable: true,
        selectOptions: "communicationType",
      },
      {
        field: "subject",
        header: "Subject",
        type: "text",
        width: "200px",
        sortable: true,
      },
      {
        field: "message",
        header: "Message",
        type: "textarea",
        width: "300px",
        sortable: false,
      },
      {
        field: "recipient",
        header: "Recipient",
        type: "text",
        width: "120px",
        sortable: true,
      },
      {
        field: "status",
        header: "Status",
        type: "select",
        width: "100px",
        sortable: true,
        selectOptions: "communicationStatus",
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
    sortBy: "created_at",
    sortOrder: "desc",
  },

  // Form configuration for creating communications
  formConfig: {
    layout: "vertical",
    mode: "create", // This tab is primarily for creating new communications
    sections: [
      {
        title: "Communication Details",
        fields: [
          {
            field: "communication_type",
            label: "Communication Type",
            type: "select",
            required: true,
            selectOptions: "communicationType",
            defaultValue: "email",
          },
          {
            field: "subject",
            label: "Subject",
            type: "text",
            required: true,
            maxLength: 255,
            placeholder: "Enter communication subject",
          },
          {
            field: "recipient",
            label: "Recipient",
            type: "text",
            required: true,
            maxLength: 255,
            placeholder: "Enter recipient email or name",
          },
        ],
      },
      {
        title: "Message",
        fields: [
          {
            field: "message",
            label: "Message Content",
            type: "textarea",
            required: true,
            rows: 6,
            maxLength: 2000,
            placeholder: "Enter your message here...",
          },
        ],
      },
      {
        title: "Options",
        fields: [
          {
            field: "priority",
            label: "Priority",
            type: "select",
            selectOptions: "priority",
            defaultValue: "medium",
          },
          {
            field: "send_immediately",
            label: "Send Immediately",
            type: "checkbox",
            defaultValue: true,
          },
        ],
      },
    ],
  },

  // DML configuration for communication operations
  dmlConfig: {
    table: "api_wf.plan_communications",
    primaryKey: "id",

    // Create operation
    create: {
      eventType: "createCommunication",
      requiredFields: [
        "plan_id",
        "communication_type",
        "subject",
        "message",
        "recipient",
      ],
      defaultValues: {
        status: "draft",
        created_by: "current-user",
        created_at: "NOW()",
        plan_id: "context.planId", // Will be populated from selected plan
      },
      validation: {
        subject: {
          required: true,
          minLength: 3,
          maxLength: 255,
        },
        message: {
          required: true,
          minLength: 10,
          maxLength: 2000,
        },
        recipient: {
          required: true,
          pattern: "email", // Basic email validation
        },
      },
      workflows: {
        onSuccess: ["sendCommunication", "refreshContext", "trackImpact"],
        onError: ["logError", "notifyUser"],
      },
    },

    // Update operation (for editing drafts)
    update: {
      eventType: "updateCommunication",
      requiredFields: ["id"],
      auditFields: {
        updated_by: "current-user",
        updated_at: "NOW()",
      },
      validation: {
        subject: {
          required: true,
          minLength: 3,
          maxLength: 255,
        },
        message: {
          required: true,
          minLength: 10,
          maxLength: 2000,
        },
      },
      workflows: {
        onSuccess: ["refreshContext", "trackImpact"],
        onError: ["logError", "notifyUser"],
      },
    },

    // Delete operation (soft delete)
    delete: {
      eventType: "deleteCommunication",
      softDelete: true,
      deleteFields: {
        deleted_at: "NOW()",
        deleted_by: "current-user",
      },
      workflows: {
        onSuccess: ["refreshContext", "trackImpact"],
        onError: ["logError", "notifyUser"],
      },
    },
  },

  // Validation rules
  validation: {
    rules: {
      communication_type: {
        required: "Communication type is required",
      },
      subject: {
        required: "Subject is required",
        minLength: "Subject must be at least 3 characters",
        maxLength: "Subject cannot exceed 255 characters",
      },
      message: {
        required: "Message is required",
        minLength: "Message must be at least 10 characters",
        maxLength: "Message cannot exceed 2000 characters",
      },
      recipient: {
        required: "Recipient is required",
        pattern: "Please enter a valid email address",
      },
    },
  },

  // UI configuration
  ui: {
    showCreateForm: true,
    showHistory: true,
    createButtonText: "Send Communication",
    emptyStateMessage: "No communications found for this plan",
    confirmDelete: true,
  },

  // UI permissions
  permissions: {
    create: true,
    read: true,
    update: true, // Only for draft communications
    delete: true, // Only for draft communications
    send: true,
  },
};

export default communicationsTabMap;
