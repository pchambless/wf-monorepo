// Multi-grid pageMap for batch mapping - Custom structure for 3-grid layout
const pageMap = {
  "id": "btchMapping",
  "title": "Batch Mapping",
  "systemConfig": {
    "schema": "whatsfresh",
    "listEvent": "btchMapping",
    "dmlEvent": "execDML"
  },
  "uiConfig": {
    "section": "MAPPING",
    "layout": "MappingLayout",
    "gridLayout": "three-panel",
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
  "grids": {
    "gridRcpe": {
      "title": "Recipe Ingredients",
      "eventType": "gridRcpe",
      "position": "left",
      "selectable": true,
      "columns": [
        { "field": "prodRcpeID", "title": "Recipe ID", "width": 80, "hidden": true },
        { "field": "ingrOrdr", "title": "Order", "width": 80 },
        { "field": "ingrName", "title": "Ingredient", "width": 200 },
        { "field": "ingrID", "title": "Ingredient ID", "width": 80, "hidden": true },
        { "field": "prodID", "title": "Product ID", "width": 80, "hidden": true }
      ]
    },
    "gridAvailable": {
      "title": "Available Batches",
      "eventType": "gridAvailable",
      "position": "top-right",
      "draggable": true,
      "params": [":ingrID", ":prodBtchID"],
      "columns": [
        { "field": "ingrBtchID", "title": "Batch ID", "width": 80, "hidden": true },
        { "field": "ingrName", "title": "Ingredient", "width": 150, "hidden": true },
        { "field": "ingrBtchNbr", "title": "Batch #", "width": 120 },
        { "field": "purchDate", "title": "Purchase Date", "width": 120 },
        { "field": "vndrName", "title": "Vendor", "width": 150 },
        { "field": "ingrID", "title": "Ingredient ID", "width": 80, "hidden": true }
      ]
    },
    "gridMapped": {
      "title": "Mapped Batches",
      "eventType": "gridMapped",
      "position": "bottom-right",
      "draggable": true,
      "editable": true,
      "params": [":prodBtchID", ":ingrID"],
      "columns": [
        { "field": "mapID", "title": "Map ID", "width": 80, "hidden": true },
        { "field": "ingrBtchNbr", "title": "Batch #", "width": 120 },
        { "field": "purchDate", "title": "Purchase Date", "width": 120 },
        { "field": "vndrName", "title": "Vendor", "width": 150, "hidden": true },
        { "field": "prodRcpeID", "title": "Recipe ID", "width": 80, "hidden": true },
        { "field": "ingrID", "title": "Ingredient ID", "width": 80, "hidden": true },
        { "field": "prodBtchID", "title": "Product Batch ID", "width": 80, "hidden": true }
      ]
    }
  },
  "tableConfig": {
    "columns": []
  },
  "formConfig": {
    "groups": []
  },
  "dmlConfig": {
    "fieldMappings": {},
    "operations": {
      "insert": {
        "excludeFields": []
      },
      "update": {},
      "delete": {}
    }
  }
};

export default pageMap;