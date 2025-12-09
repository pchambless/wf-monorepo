-- sp_pageStructure: Enhanced hierarchy with props and triggers
-- Returns complete page structure in one call for PageRenderer
-- Handles template system: CRUD pages use template (11), custom pages use own components

DROP PROCEDURE IF EXISTS api_wf.sp_pageStructure;

DELIMITER $$

CREATE PROCEDURE api_wf.sp_pageStructure(IN requestedPageID INT)
BEGIN
    DECLARE templateType VARCHAR(20);
    DECLARE effectivePageID INT;
    DECLARE requestedPageName VARCHAR(50);
    DECLARE requestedAppName VARCHAR(50);
    
    -- Get page info and determine if this is a CRUD page (uses template) or custom page
    SELECT 
        JSON_UNQUOTE(JSON_EXTRACT(props, '$.template_type')),
        pageName,
        appName
    INTO templateType, requestedPageName, requestedAppName
    FROM api_wf.page_registry 
    WHERE id = requestedPageID;
    
    -- If CRUD, use template components (pageID=11), else use requested page
    IF templateType = 'crud' THEN
        SET effectivePageID = 11;  -- Template
    ELSE
        SET effectivePageID = requestedPageID;  -- Own components
    END IF;
    
    -- Build component hierarchy with props and triggers
    WITH RECURSIVE component_tree AS (
        -- Anchor: Root component
        SELECT
            x.id AS xref_id,
            x.pageID,
            reg.pageName,
            reg.appName,
            x.parent_id,
            x.comp_name,
            reg.pageName AS parent_name,
            CONCAT(reg.pageName, '.', x.comp_name) AS parentCompName,
            x.title,
            x.comp_type,
            x.description,
            x.posOrder,
            x.style AS override_styles,
            0 AS level,
            CAST(x.id AS CHAR(500)) AS id_path
        FROM api_wf.eventComp_xref x
        JOIN api_wf.page_registry reg ON x.pageID = reg.id
        WHERE x.pageID = effectivePageID
          AND x.parent_id = x.id
          AND x.active = 1

        UNION ALL

        -- Recursive: Child components
        SELECT
            child.id,
            child.pageID,
            reg.pageName,
            reg.appName,
            child.parent_id,
            child.comp_name,
            parent_tree.comp_name AS parent_name,
            CONCAT(parent_tree.comp_name, '.', child.comp_name) AS parentCompName,
            child.title,
            child.comp_type,
            child.description,
            child.posOrder,
            child.style,
            parent_tree.level + 1,
            CONCAT(parent_tree.id_path, ',', child.id)
        FROM api_wf.eventComp_xref child
        JOIN component_tree parent_tree ON child.parent_id = parent_tree.xref_id
        JOIN api_wf.page_registry reg ON child.pageID = reg.id
        WHERE child.active = 1
          AND child.parent_id != child.id
          AND parent_tree.level < 20
    )
    SELECT
        ct.xref_id,
        ct.parent_id,
        requestedPageID AS pageID,
        requestedPageName AS pageName,
        requestedAppName AS appName,
        templateType AS template_type,
        ct.comp_name,
        ct.parent_name,
        ct.parentCompName,
        ct.title,
        ct.comp_type,
        ct.description,
        ct.posOrder,
        ct.override_styles,
        CASE WHEN ct.comp_type = 'Modal' THEN 0 ELSE ct.level END AS level,
        ct.id_path,
        
        -- Props: Aggregate all props for this component as JSON object
        -- Uses vw_eventProps which handles template merging
        (SELECT JSON_OBJECTAGG(p.paramName, p.paramVal)
         FROM api_wf.vw_eventProps p
         WHERE p.xref_id = ct.xref_id 
           AND p.pageID = requestedPageID
        ) AS props,
        
        -- Triggers: Aggregate all triggers for this component as JSON array
        -- For CRUD pages: get triggers from template (11)
        -- For custom pages: get triggers from requested page
        -- Note: Using CONCAT to build JSON array manually to preserve ORDER BY
        (SELECT CONCAT('[',
             GROUP_CONCAT(
                 JSON_OBJECT(
                     'trigger_id', t.trigger_id,
                     'ordr', t.ordr,
                     'class', t.class,
                     'action', t.action,
                     'is_dom_event', t.is_dom_event,
                     'content', t.content,
                     'api_id', t.api_id,
                     'wrkFlow_id', t.wrkFlow_id,
                     'controller_id', t.controller_id
                 )
                 ORDER BY t.ordr
                 SEPARATOR ','
             ),
         ']')
         FROM api_wf.vw_eventTrigger t
         WHERE t.xref_id = ct.xref_id 
           AND t.pageID = CASE 
               WHEN templateType = 'crud' THEN 11  -- Template triggers
               ELSE requestedPageID                 -- Own triggers
           END
        ) AS triggers
        
    FROM component_tree ct
    ORDER BY 
        CASE WHEN ct.comp_type = 'Modal' THEN 0 ELSE ct.level END,
        ct.posOrder;
        
END$$

DELIMITER ;

-- Example usage:
-- CALL api_wf.sp_pageStructure(1);  -- ingrType page (CRUD, uses template 11)
-- CALL api_wf.sp_pageStructure(12); -- login page (custom, uses own components)

-- Result includes:
-- - All component hierarchy columns (xref_id, comp_name, comp_type, etc.)
-- - props: JSON object with all props for that component
-- - triggers: JSON array with all triggers for that component
