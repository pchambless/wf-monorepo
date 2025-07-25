// Auto-generated by genPageMaps.js
const pageMap = {
  "id": "wrkrList",
  "title": "Workers",
  "systemConfig": {
    "schema": "whatsfresh",
    "table": "workers",
    "primaryKey": "wrkrID",
    "listEvent": "wrkrList",
    "dmlEvent": "execDML"
  },
  "uiConfig": {
    "section": "REFERENCE",
    "layout": "CrudLayout",
    "actions": {
      "rowActions": [
        {
          "id": "delete",
          "icon": "Delete",
          "color": "error",
          "tooltip": "Delete",
          "handler": "handleDelete"
        }
      ],
      "tableActions": []
    }
  },
  "tableConfig": {
    "columns": [
      {
        "field": "wrkrID",
        "label": "wrkrID",
        "width": 80,
        "type": "number",
        "editable": false,
        "hidden": true
      },
      {
        "field": "wrkrName",
        "label": "Worker Name",
        "width": "200",
        "type": "text",
        "editable": true,
        "hidden": false
      },
      {
        "field": "acctID",
        "label": "acctID",
        "width": 120,
        "type": "select",
        "editable": false,
        "hidden": true
      }
    ]
  },
  "formConfig": {
    "groups": [
      {
        "id": "1",
        "title": "Group 1",
        "fields": [
          {
            "field": "wrkrID",
            "label": "wrkrID",
            "type": "number",
            "required": false,
            "hidden": true
          },
          {
            "field": "wrkrName",
            "label": "Worker Name",
            "type": "text",
            "required": true,
            "hidden": false
          },
          {
            "field": "acctID",
            "label": "acctID",
            "type": "select",
            "required": false,
            "hidden": true
          }
        ]
      }
    ]
  },
  "dmlConfig": {
    "primaryKey": "id",
    "fieldMappings": {
      "wrkrID": "id",
      "wrkrName": "name",
      "acctID": "account_id"
    },
    "operations": {
      "insert": {
        "excludeFields": [
          "wrkrID"
        ]
      },
      "update": {},
      "delete": {}
    }
  }
};

export default pageMap;