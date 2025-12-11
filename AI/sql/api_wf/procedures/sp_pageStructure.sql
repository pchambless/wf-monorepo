CREATE DEFINER=`wf_admin`@`%` PROCEDURE `api_wf`.`sp_pageStructure`(IN requestedPageID INT)
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
        
        (SELECT JSON_OBJECTAGG(p.paramName,
                      api_wf.f_resolvePageTokens(p.paramVal, requestedPageID))
               FROM (
                   -- For CRUD: Get page-specific props first (higher priority)
                   SELECT paramName, paramVal
                   FROM api_wf.vw_eventProps
                   WHERE xref_id = ct.xref_id
                     AND pageID = requestedPageID
                     AND templateType = 'crud'

                   UNION

                   -- For CRUD: Get template props that don't exist in page-specific
                   SELECT t.paramName, t.paramVal
                   FROM api_wf.vw_eventProps t
                   WHERE t.xref_id = ct.xref_id
                     AND t.pageID = 11
                     AND templateType = 'crud'
                     AND NOT EXISTS (
                         SELECT 1 FROM api_wf.vw_eventProps ps
                         WHERE ps.xref_id = ct.xref_id
                           AND ps.pageID = requestedPageID
                           AND ps.paramName = t.paramName
                     )

                   UNION

                   -- For custom pages: Just get own props
                   SELECT paramName, paramVal
                   FROM api_wf.vw_eventProps
                   WHERE xref_id = ct.xref_id
                     AND pageID = requestedPageID
                     AND (templateType IS NULL OR templateType != 'crud')
               ) p
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
                     'content', api_wf.f_resolvePageTokens(t.content, requestedPageID)
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
        
END