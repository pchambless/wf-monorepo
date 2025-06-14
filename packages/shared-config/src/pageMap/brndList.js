export default {
  "id": "brndList",
  "title": "Brands",
  "schema": "whatsfresh",
  "table": "brands",
  "section": "reference",
  "icon": "Branding",
  "color": "gray",
  "parentIdField": "acctID",
  "keyField": "brndID",
  "actions": {
    "rowActions": [],
    "tableActions": []
  },
  "columns": {
    "brndID": {
      "id": 1,
      "field": "brndID",
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
    "brndName": {
      "id": 2,
      "field": "brndName",
      "db_column": "name",
      "headerName": "Brand Name",
      "width": 200,
      "type": "text",
      "group": 1,
      "hidden": false,
      "required": true,
      "primaryKey": false,
      "editable": true,
      "searchable": false
    },
    "brndComments": {
      "id": 3,
      "field": "brndComments",
      "db_column": "comments",
      "headerName": "Comments",
      "width": 150,
      "type": "text",
      "group": 1,
      "hidden": false,
      "required": false,
      "primaryKey": false,
      "editable": true,
      "searchable": false
    },
    "brndURL": {
      "id": 4,
      "field": "brndURL",
      "db_column": "url",
      "headerName": "Website",
      "width": 200,
      "type": "text",
      "group": 1,
      "hidden": false,
      "required": false,
      "primaryKey": false,
      "editable": true,
      "searchable": false
    },
    "acctID": {
      "id": 5,
      "field": "acctID",
      "db_column": "account_id",
      "headerName": "ID",
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