/**
 * PageMap for prodBtchList
 * Generated on 2025-05-16T17:17:10.291Z
 */
import accountStore from '../../../stores/accountStore';

// Direct object export - no builder pattern
export const pageMap = {
  "id": "prodBtch",
  "pageConfig": {
    "id": "prodBtch",
    "idField": "prodBtchID",
    "table": "product_batches",
    "listEvent": "prodBtchList",
    "title": "Product Btch",
    "navigateTo": "/prodbtch",
    "parentIdField": "prodID"
  },
  "columnMap": [
    {
      "field": "prodBtchID",
      "label": "Prod Btch ID",
      "displayType": "number",
      "dataType": "INT",
      "width": 80,
      "editable": false,
      "primary": true,
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
      "field": "btchStart",
      "label": "Btch Start",
      "displayType": "text",
      "dataType": "VARCHAR",
      "width": 150,
      "editable": true,
      "group": 2
    },
    {
      "field": "btchLoc",
      "label": "Btch Loc",
      "displayType": "text",
      "dataType": "VARCHAR",
      "width": 150,
      "editable": true,
      "group": 2
    },
    {
      "field": "btchQty",
      "label": "Btch Qty",
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
      "field": "bestByDate",
      "label": "Best By Date",
      "displayType": "date",
      "dataType": "DATE",
      "width": 150,
      "editable": true,
      "group": 3
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
      "field": "prodID",
      "label": "Prod ID",
      "displayType": "number",
      "dataType": "INT",
      "width": 80,
      "editable": false,
      "hideInTable": true,
      "hideInForm": true
    }
  ],
  "fetch": {
    "listEvent": "prodBtchList",
    "params": {
      ":prodID": 1
    }
  }
};

// Function that resolves route parameters
export const getPageMap = (routeParams = {}) => {
  const resolvedParams = {
    ...routeParams,
    prodID: routeParams.prodID || 1 // Parent ID
  };
  
  // Create a new pageMap with resolved parameters
  return {
    ...pageMap,
    fetch: {
      ...pageMap.fetch,
      params: {
        ...pageMap.fetch.params,
        ':prodID': resolvedParams.prodID
      }
    }
  };
};

export default getPageMap;
