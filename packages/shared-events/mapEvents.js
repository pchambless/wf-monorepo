/**
 * WhatsFresh Batch Mapping Event Types
 * Specialized events for complex batch mapping workflows
 */

/**
 * Batch mapping specialized events
 */
const MAP_EVENTS = [
  // Batch mapping root
  {
    eventID: 100,
    eventType: "btchMapList",
    parent: "acctRoot",
    children: ["btchMapIngrList", "btchMapBtchMapped", "btchMapBtchUnmapped"],
    method: "GET",
    params: [":acctID"],
    purpose: "Main batch mapping page"
  },

  // Recipe ingredients list for a product
  {
    eventID: 101,
    eventType: "btchMapIngrList",
    parent: "btchMapList",
    method: "GET",
    qrySQL: `
      SELECT a.ingr_ordr, a.ingr_name, a.ingr_id, a.prd_rcpe_id
      FROM api_wf.v_prd_rcpe_dtl a
      WHERE prd_id = :prodID
      AND a.prd_rcpe_actv = 'Y'
      ORDER BY a.ingr_ordr
    `,
    params: [":prodID"],
    purpose: "Get recipe ingredients for a product"
  },

  // Mapped ingredient batches for a specific ingredient in a product batch
  {
    eventID: 102,
    eventType: "btchMapMappedBatches",
    parent: "btchMapPage",
    method: "GET",
    qrySQL: `
      SELECT a.ingr_btch_nbr, a.purch_date, a.vndr_name, a.prd_btch_ingr_id
      FROM api_wf.v_prd_btch_ingr_dtl a
      WHERE a.ingr_id = :ingrID
      AND prd_btch_id = :prodBtchID
      ORDER BY purch_date DESC
    `,
    params: [":acctID", ":prodBtchID", ":ingrID"],
    purpose: "Get ingredient batches already mapped to a product batch"
  },

  // Available ingredient batches for mapping
  {
    eventID: 103,
    eventType: "btchMapAvailableBatches",
    parent: "btchMapPage",
    method: "GET",
    qrySQL: `
      SELECT ingr_name, a.ingr_btch_nbr, a.purch_date, a.vndr_name, a.ingr_btch_id, ingr_id
      FROM api_wf.v_ingr_btch_dtl a
      WHERE a.ingr_id = :ingrID
      AND a.ingr_btch_id NOT IN (
        SELECT ingr_btch_id
        FROM api_wf.v_prd_btch_ingr_dtl
        WHERE prd_btch_id = :prodBtchID
        AND ingr_id = :ingrID
      )
      ORDER BY ingr_btch_id DESC
    `,
    params: [":acctID", ":prodBtchID", ":ingrID"],
    purpose: "Get available ingredient batches for mapping"
  },

  // Map an ingredient batch to a product batch
  {
    eventID: 104,
    eventType: "btchMapCreate",
    parent: "btchMapPage",
    method: "POST",
    qrySQL: `
      INSERT INTO api_wf.product_batch_ingredients
        (product_batch_id, product_recipe_id, ingredient_batch_id, comments, created_at, created_by)
      VALUES
        (
          :prodBtchID,
          :prdRcpeID,
          :ingrBtchID,
          :comments,
          CURRENT_TIMESTAMP(),
          :userID
        )
    `,
    params: [":acctID", ":prodBtchID", ":prdRcpeID", ":ingrBtchID", ":comments", ":userID"],
    purpose: "Map an ingredient batch to a product batch"
  },

  // Delete a batch mapping
  {
    eventID: 105,
    eventType: "btchMapDelete",
    parent: "btchMapPage",
    method: "DELETE",
    qrySQL: `
      DELETE FROM api_wf.product_batch_ingredients
      WHERE id = :btchMapID
    `,
    params: [":acctID", ":btchMapID"],
    purpose: "Delete a batch mapping"
  },

  // Product batch tasks
  {
    eventID: 110,
    eventType: "prodBtchTaskList",
    parent: "btchMapPage",
    method: "GET",
    qrySQL: `
      SELECT ordr task_ordr, task_name, measure_value value, comments, taskWrkrs, task_id, prd_task_id
      FROM api_wf.v_prd_btch_task_dtl
      WHERE prd_btch_id = :prodBtchID
      ORDER BY ordr
    `,
    params: [":acctID", ":prodBtchID"],
    purpose: "Get tasks for a product batch"
  },

  // Update a product batch task
  {
    eventID: 111,
    eventType: "prodBtchTaskUpdate",
    parent: "btchMapPage",
    method: "PUT",
    qrySQL: `
      UPDATE api_wf.product_batch_tasks  
      SET workers = :workers, 
          comments = :comments,
          measure_value = :measureValue,
          updated_at = CURRENT_TIMESTAMP(),
          updated_by = :userID
      WHERE id = :prodTaskID
    `,
    params: [":acctID", ":prodTaskID", ":workers", ":comments", ":measureValue", ":userID"],
    purpose: "Update task information for a product batch"
  },

  // Full batch mapping info for PDF
  {
    eventID: 120,
    eventType: "btchMapPdfIngr",
    parent: "btchMapPage",
    method: "GET",
    qrySQL: `
      SELECT ingr_ordr Ordr, ingr_name Ingredient, ingrMaps 'Ingr Batch(es): Vendor', prd_ingr_desc Description
      FROM api_wf.v_prdBtchIngr_Map
      WHERE prd_btch_id = :prodBtchID
      ORDER BY ingr_ordr
    `,
    params: [":acctID", ":prodBtchID"],
    purpose: "Get ingredient mapping information for PDF worksheet"
  },

  // Full task info for PDF
  {
    eventID: 121,
    eventType: "btchMapPdfTask",
    parent: "btchMapPage",
    method: "GET",
    qrySQL: `
      SELECT ordr Ordr, task_name Task, taskWrkrs Workers, measure_value Measure, comments Comments
      FROM api_wf.v_prd_btch_task_dtl
      WHERE prd_btch_id = :prodBtchID
      ORDER BY ordr
    `,
    params: [":acctID", ":prodBtchID"],
    purpose: "Get task information for PDF worksheet"
  }
];

module.exports = {
  MAP_EVENTS
};