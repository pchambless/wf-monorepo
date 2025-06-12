/**
 * PageMap for prodList
 * Generated on 2025-05-16T17:17:10.295Z
 */
import accountStore from '../../../stores/accountStore';

// Direct object export - no builder pattern
export const pageMap = {
  "id": "prod",
  "pageConfig": {
    "id": "prod",
    "idField": "prodID",
    "table": "products",
    "listEvent": "prodList",
    "title": "Product",
    "navigateTo": "/prod",
    "parentIdField": "prodTypeID"
  },
  "columnMap": [
    {
      "field": "prodID",
      "label": "Prod ID",
      "displayType": "number",
      "dataType": "INT",
      "width": 80,
      "editable": false,
      "primary": true,
      "hideInTable": true,
      "hideInForm": true
    },
    {
      "field": "prodName",
      "label": "Prod Name",
      "displayType": "text",
      "dataType": "VARCHAR",
      "width": 180,
      "editable": true,
      "searchable": true,
      "group": 1
    },
    {
      "field": "prodCode",
      "label": "Prod Code",
      "displayType": "text",
      "dataType": "VARCHAR",
      "width": 120,
      "editable": true,
      "group": 1
    },
    {
      "field": "prodDfltLoc",
      "label": "Prod Dflt Loc",
      "displayType": "text",
      "dataType": "VARCHAR",
      "width": 150,
      "editable": true,
      "group": 2
    },
    {
      "field": "prodDfltBestBy",
      "label": "Prod Dflt Best By",
      "displayType": "number",
      "dataType": "INT",
      "width": 150,
      "editable": true,
      "group": 2
    },
    {
      "field": "prodDesc",
      "label": "Prod Desc",
      "displayType": "multiLine",
      "dataType": "VARCHAR",
      "width": 240,
      "editable": true,
      "multiLine": true,
      "group": 2,
      "hideInTable": true
    },
    {
      "field": "prodUpcItemRef",
      "label": "Prod Upc Item Ref",
      "displayType": "text",
      "dataType": "VARCHAR",
      "width": 150,
      "editable": true,
      "group": 2
    },
    {
      "field": "prodUpcChkDgt",
      "label": "Prod Upc Chk Dgt",
      "displayType": "text",
      "dataType": "VARCHAR",
      "width": 150,
      "editable": true,
      "group": 2
    },
    {
      "field": "prodTypeID",
      "label": "Prod Type ID",
      "displayType": "number",
      "dataType": "INT",
      "width": 80,
      "editable": false,
      "hideInTable": true,
      "hideInForm": true
    }
  ],
  "fetch": {
    "listEvent": "prodList",
    "params": {
      ":prodTypeID": 1
    }
  }
};

// Function that resolves route parameters
export const getPageMap = (routeParams = {}) => {
  const resolvedParams = {
    ...routeParams,
    prodTypeID: routeParams.prodTypeID || 1 // Parent ID
  };
  
  // Create a new pageMap with resolved parameters
  return {
    ...pageMap,
    fetch: {
      ...pageMap.fetch,
      params: {
        ...pageMap.fetch.params,
        ':prodTypeID': resolvedParams.prodTypeID
      }
    }
  };
};

export default getPageMap;
