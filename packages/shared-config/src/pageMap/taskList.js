export default {
  "id": "taskList",
  "title": "Product Type Tasks",
  "schema": "whatsfresh",
  "table": "tasks",
  "section": "maps",
  "icon": "Assignment",
  "color": "green",
  "parentIdField": "prodTypeID",
  "keyField": "taskID",
  "actions": {
    "rowActions": [],
    "tableActions": []
  },
  "columns": {
    "taskID": {
      "id": 1,
      "field": "taskID",
      "db_column": "id",
      "headerName": "ID",
      "width": 150,
      "type": "text",
      "group": 1,
      "hidden": true,
      "required": false,
      "primaryKey": true,
      "editable": false,
      "searchable": false
    },
    "taskName": {
      "id": 2,
      "field": "taskName",
      "db_column": "name",
      "headerName": "Task Name",
      "width": 200,
      "type": "text",
      "group": 1,
      "hidden": false,
      "required": true,
      "primaryKey": false,
      "editable": true,
      "searchable": false
    },
    "taskDesc": {
      "id": 3,
      "field": "taskDesc",
      "db_column": "description",
      "headerName": "Description",
      "width": 150,
      "type": "text",
      "group": 1,
      "hidden": false,
      "required": false,
      "primaryKey": false,
      "editable": true,
      "searchable": false
    },
    "taskOrder": {
      "id": 4,
      "field": "taskOrder",
      "db_column": "ordr",
      "headerName": "Order",
      "width": 80,
      "type": "text",
      "group": 1,
      "hidden": false,
      "required": false,
      "primaryKey": false,
      "editable": true,
      "searchable": false
    },
    "prodTypeID": {
      "id": 5,
      "field": "prodTypeID",
      "db_column": "product_type_id",
      "headerName": "Type I D",
      "width": 150,
      "type": "text",
      "group": 1,
      "hidden": true,
      "required": false,
      "primaryKey": false,
      "editable": false,
      "searchable": false
    }
  }
};