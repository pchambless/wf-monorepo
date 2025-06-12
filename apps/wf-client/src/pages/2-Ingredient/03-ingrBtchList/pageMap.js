/**
 * PageMap for ingrBtchList
 * Generated on 2025-05-16T17:17:10.276Z
 */
import accountStore from '@stores/accountStore';

// Direct object export - no builder pattern
export const pageMap = {
  "id": "ingrBtch",
  "pageConfig": {
    "id": "ingrBtch",
    "idField": "id",
    "table": "global_measure_units",
    "listEvent": "ingrBtchList",
    "title": "Ingredient Btch",
    "navigateTo": "/ingrbtch",
    "parentIdField": "ingrID"
  },
  "columnMap": [
    {
      "field": "btchID",
      "label": "Btch ID",
      "displayType": "number",
      "dataType": "INT",
      "width": 80,
      "editable": false,
      "hideInTable": true,
      "hideInForm": true
    },
    {
      "field": "btchNbr",
      "label": "Btch Nbr",
      "displayType": "text",
      "dataType": "VARCHAR",
      "width": 150,
      "editable": true,
      "group": 2
    },
    {
      "field": "vndrID",
      "label": "Vndr ID",
      "displayType": "number",
      "dataType": "INT",
      "width": 80,
      "editable": false,
      "hideInTable": true,
      "hideInForm": true
    },
    {
      "field": "brndID",
      "label": "Brnd ID",
      "displayType": "number",
      "dataType": "INT",
      "width": 80,
      "editable": false,
      "hideInTable": true,
      "hideInForm": true
    },
    {
      "field": "purchDate",
      "label": "Purch Date",
      "displayType": "date",
      "dataType": "DATE",
      "width": 150,
      "editable": true,
      "group": 3
    },
    {
      "field": "unitQty",
      "label": "Unit Qty",
      "displayType": "number",
      "dataType": "INT",
      "width": 150,
      "editable": true,
      "group": 2
    },
    {
      "field": "unitPrice",
      "label": "Unit Price",
      "displayType": "text",
      "dataType": "VARCHAR",
      "width": 150,
      "editable": true,
      "group": 2
    },
    {
      "field": "purchQty",
      "label": "Purch Qty",
      "displayType": "number",
      "dataType": "INT",
      "width": 150,
      "editable": true,
      "group": 2
    },
    {
      "field": "measID",
      "label": "Meas ID",
      "displayType": "number",
      "dataType": "INT",
      "width": 80,
      "editable": false,
      "hideInTable": true,
      "hideInForm": true
    },
    {
      "field": "lotNbr",
      "label": "Lot Nbr",
      "displayType": "text",
      "dataType": "VARCHAR",
      "width": 150,
      "editable": true,
      "group": 2
    },
    {
      "field": "bestByDate",
      "label": "Best By Date",
      "displayType": "date",
      "dataType": "DATE",
      "width": 150,
      "editable": true,
      "group": 3
    },
    {
      "field": "purch_dtl",
      "label": "Purch_dtl",
      "displayType": "text",
      "dataType": "VARCHAR",
      "width": 150,
      "editable": true,
      "group": 2
    },
    {
      "field": "comments",
      "label": "Comments",
      "displayType": "multiLine",
      "dataType": "VARCHAR",
      "width": 240,
      "editable": true,
      "multiLine": true,
      "group": 2,
      "hideInTable": true
    },
    {
      "field": "ingrID",
      "label": "Ingr ID",
      "displayType": "number",
      "dataType": "INT",
      "width": 80,
      "editable": false,
      "hideInTable": true,
      "hideInForm": true
    }
  ],
  "fetch": {
    "listEvent": "ingrBtchList",
    "params": {
      ":ingrID": 1
    }
  }
};

// Function that resolves route parameters
export const getPageMap = (routeParams = {}) => {
  const resolvedParams = {
    ...routeParams,
    ingrID: routeParams.ingrID || 1 // Parent ID
  };
  
  // Create a new pageMap with resolved parameters
  return {
    ...pageMap,
    fetch: {
      ...pageMap.fetch,
      params: {
        ...pageMap.fetch.params,
        ':ingrID': resolvedParams.ingrID
      }
    }
  };
};

export default getPageMap;
