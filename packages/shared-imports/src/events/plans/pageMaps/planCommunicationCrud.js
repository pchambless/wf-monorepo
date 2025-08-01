// PageMap for plan_communications CRUD operations
const planCommunicationCrud = {
  id: "planCommunicationCrud",
  title: "Plan Communications",
  systemConfig: {
    schema: "api_wf",
    table: "plan_communications",
    primaryKey: "id",
    listEvent: "planCommunicationList",
    dmlEvent: "execDML",
    permissions: {
      create: true,
      edit: true,
      delete: false,
    },
  },
  uiConfig: {
    section: "PLANS",
    layout: "CrudLayout",
    actions: {
      rowActions: [
        {
          id: "edit",
          icon: "Edit",
          color: "primary",
          tooltip: "Edit",
          handler: "handleEdit",
        },
      ],
      tableActions: [
        {
          id: "create",
          icon: "Add",
          color: "primary",
          tooltip: "Create Communication",
          handler: "handleCreate",
        },
      ],
    },
  },
  tableConfig: {
    columns: [
      {
        field: "id",
        label: "ID",
        width: 80,
        type: "number",
        editable: false,
        hidden: true,
      },
      {
        field: "from_agent",
        label: "From",
        width: 80,
        type: "text",
        editable: false,
      },
      {
        field: "to_agent",
        label: "To",
        width: 80,
        type: "text",
        editable: false,
      },
      {
        field: "type",
        label: "Type",
        width: 120,
        type: "text",
        editable: true,
      },
      {
        field: "subject",
        label: "Subject",
        width: 300,
        type: "text",
        editable: true,
      },
      {
        field: "status",
        label: "Status",
        width: 100,
        type: "text",
        editable: true,
      },
      {
        field: "created_at",
        label: "Created",
        width: 120,
        type: "datetime",
        editable: false,
      },
    ],
  },
  formConfig: {
    groups: [
      {
        id: "1",
        title: "Communication Details",
        fields: [
          {
            field: "id",
            label: "ID",
            type: "number",
            required: false,
            hidden: true,
          },
          {
            field: "plan_id",
            label: "Plan ID",
            type: "number",
            required: true,
            hidden: true,
          },
          {
            field: "type",
            label: "Type",
            type: "select",
            required: true,
            options: [
              { value: "strategic-input", label: "Strategic Input" },
              { value: "priority-change", label: "Priority Change" },
              { value: "scope-modification", label: "Scope Modification" },
              { value: "issue-report", label: "Issue Report" },
              { value: "completion-notice", label: "Completion Notice" },
              { value: "guidance-request", label: "Guidance Request" },
            ],
          },
          {
            field: "from_agent",
            label: "From Agent",
            type: "select",
            required: true,
            options: [
              { value: "user", label: "User" },
              { value: "claude", label: "Claude" },
              { value: "kiro", label: "Kiro" },
            ],
          },
          {
            field: "to_agent",
            label: "To Agent",
            type: "select",
            required: true,
            options: [
              { value: "user", label: "User" },
              { value: "claude", label: "Claude" },
              { value: "kiro", label: "Kiro" },
            ],
          },
          {
            field: "subject",
            label: "Subject",
            type: "text",
            required: true,
          },
        ],
      },
      {
        id: "2",
        title: "Message",
        fields: [
          {
            field: "message",
            label: "Message",
            type: "multiLine",
            required: true,
            minRows: 8,
            maxRows: 20,
          },
        ],
      },
      {
        id: "3",
        title: "Status",
        fields: [
          {
            field: "status",
            label: "Status",
            type: "select",
            required: false,
            options: [
              { value: "sent", label: "Sent" },
              { value: "read", label: "Read" },
              { value: "acknowledged", label: "Acknowledged" },
              { value: "completed", label: "Completed" },
              { value: "archived", label: "Archived" },
            ],
          },
          {
            field: "priority",
            label: "Priority",
            type: "select",
            required: false,
            options: [
              { value: "low", label: "Low" },
              { value: "normal", label: "Normal" },
              { value: "high", label: "High" },
              { value: "urgent", label: "Urgent" },
            ],
          },
        ],
      },
    ],
  },
  dmlConfig: {
    primaryKey: "id",
    fieldMappings: {
      id: "id",
      plan_id: "plan_id",
      from_agent: "from_agent",
      to_agent: "to_agent",
      type: "type",
      subject: "subject",
      message: "message",
      status: "status",
      priority: "priority",
      created_at: "created_at",
      created_by: "created_by",
      updated_at: "updated_at",
      updated_by: "updated_by",
    },
    operations: {
      insert: {
        excludeFields: ["id"],
        defaultValues: {
          status: "sent",
          priority: "normal",
          created_at: "NOW()",
          created_by: "USER_ID",
        },
      },
      update: {
        excludeFields: ["id", "created_at", "created_by"],
        defaultValues: {
          updated_at: "NOW()",
          updated_by: "USER_ID",
        },
      },
      delete: {
        disabled: true,
      },
    },
  },
};

export default planCommunicationCrud;
