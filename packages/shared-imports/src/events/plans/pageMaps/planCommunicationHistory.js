// PageMap for plan_communications read-only history display
const planCommunicationHistory = {
  "id": "planCommunicationHistory",
  "title": "Plan Communication History",
  "systemConfig": {
    "schema": "api_wf",
    "table": "plan_communications", 
    "primaryKey": "id",
    "listEvent": "planCommunicationList",
    "dmlEvent": "execDML",
    "permissions": { 
      "create": false, 
      "edit": false, 
      "delete": false 
    }
  },
  "uiConfig": {
    "section": "PLANS",
    "layout": "CrudLayout",
    "actions": {
      "rowActions": [],
      "tableActions": []
    }
  },
  "tableConfig": {
    "columns": [
      {
        "field": "from_agent",
        "label": "From",
        "width": 80,
        "type": "text",
        "editable": false
      },
      {
        "field": "to_agent", 
        "label": "To",
        "width": 80,
        "type": "text",
        "editable": false
      },
      {
        "field": "subject",
        "label": "Subject", 
        "width": 300,
        "type": "text",
        "editable": false
      },
      {
        "field": "created_at",
        "label": "Created",
        "width": 120,
        "type": "text",
        "editable": false
      }
    ]
  },
  "formConfig": {
    "groups": [
      {
        "id": "1",
        "title": "Subject",
        "fields": [
          {
            "field": "subject",
            "label": "Subject",
            "type": "text",
            "readOnly": true
          }
        ]
      },
      {
        "id": "2",
        "title": "Message",
        "fields": [
          {
            "field": "message",
            "label": "Message",
            "type": "multiLine",
            "readOnly": true,
            "minRows": 10,
            "maxRows": 25
          }
        ]
      }
    ]
  },
  "dmlConfig": {
    "primaryKey": "id",
    "fieldMappings": {
      "id": "id",
      "plan_id": "plan_id", 
      "from_agent": "from_agent",
      "to_agent": "to_agent", 
      "type": "type",
      "subject": "subject",
      "message": "message",
      "status": "status"
    },
    "operations": {
      "insert": { "disabled": true },
      "update": { "disabled": true }, 
      "delete": { "disabled": true }
    }
  }
};

export default planCommunicationHistory;