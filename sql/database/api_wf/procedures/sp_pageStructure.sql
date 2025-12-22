CREATE DEFINER=`wf_admin`@`%` PROCEDURE `sp_pageStructure`(IN requestedPageID INT)
BEGIN
      DECLARE requestedPageName VARCHAR(50);
      DECLARE requestedAppName VARCHAR(50);

      -- Get page metadata
      SELECT pageName, appName
      INTO requestedPageName, requestedAppName
      FROM api_wf.page_registry
      WHERE id = requestedPageID;

      -- Build component list with merged overrides
      WITH component_data AS (
          SELECT
              pc.id AS pageComponent_id,
              pc.pageID,
              pc.comp_name,
              pc.composite_id,
              pc.parent_id,
              pc.posOrder,
              pc.title AS instance_title,
              pc.description AS instance_description,
              ec.name AS composite_name,
              ec.title AS composite_title,
              ec.components AS composite_components,
              -- Parse position into object parts
              SUBSTRING_INDEX(pc.posOrder, ',', 1) AS row_pos,
              SUBSTRING_INDEX(SUBSTRING_INDEX(pc.posOrder, ',', 2), ',', -1) AS col_pos,
              SUBSTRING_INDEX(SUBSTRING_INDEX(pc.posOrder, ',', 3), ',', -1) AS width_pos,
              SUBSTRING_INDEX(pc.posOrder, ',', -1) AS align_pos,
              -- Get page-specific overrides
              epc.props AS override_props,
              epc.triggers AS override_triggers,
              epc.eventSQL AS override_eventSQL
          FROM api_wf.pageComponents pc
          JOIN api_wf.composites ec ON pc.composite_id = ec.id
          LEFT JOIN api_wf.pageConfig epc ON pc.id = epc.pageComponent_id AND pc.pageID = epc.pageID
          WHERE pc.pageID = requestedPageID
            AND pc.active = 1
            AND ec.active = 1
            AND pc.parent_id IS NULL  -- Only root components (no nested hierarchy for now)
      )

      -- Return structured JSON
      SELECT
          requestedPageID AS pageID,
          requestedPageName AS pageName,
          requestedAppName AS appName,
          JSON_OBJECT(
              'components', JSON_ARRAYAGG(
                  JSON_OBJECT(
                      'id', comp_name,
                      'pageComponent_id', pageComponent_id,
                      'composite_id', composite_id,
                      'composite_name', composite_name,
                      'comp_type', composite_name,
                      'title', COALESCE(instance_title, composite_title),
                      'position', JSON_OBJECT(
                          'row', CAST(row_pos AS UNSIGNED),
                          'col', CAST(col_pos AS UNSIGNED),
                          'width', width_pos,
                          'align', align_pos
                      ),
                      'components', CAST(composite_components AS JSON),
                      'props', COALESCE(CAST(override_props AS JSON), JSON_OBJECT()),
                      'triggers', COALESCE(CAST(override_triggers AS JSON), JSON_ARRAY()),
                      'eventSQL', override_eventSQL
                  )
              )
          ) AS pageConfig
      FROM component_data
      ORDER BY row_pos, col_pos;

  END
