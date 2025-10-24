DROP PROCEDURE IF EXISTS `api_wf`.`sp_clone_component_tree`;

DELIMITER $$

CREATE DEFINER=`wf_admin`@`%` PROCEDURE `api_wf`.`sp_clone_component_tree`(
    IN p_template_xref_id INT,
    IN p_new_parent_id INT,
    IN p_new_comp_name VARCHAR(100),
    IN p_user_id VARCHAR(50)
)
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_old_id INT;
    DECLARE v_old_parent_id INT;
    DECLARE v_new_id INT;
    DECLARE v_template_comp_name VARCHAR(100);

    -- Temporary mapping table: old_id -> new_id
    CREATE TEMPORARY TABLE IF NOT EXISTS id_mapping (
        old_id INT PRIMARY KEY,
        new_id INT,
        old_parent_id INT,
        level INT
    );

    -- Clear previous mappings
    TRUNCATE TABLE id_mapping;

    -- Step 1: Get all components in the template tree
    INSERT INTO id_mapping (old_id, old_parent_id, level)
    SELECT
        xref_id,
        parent_id,
        level
    FROM (
        -- Get hierarchy starting from template
        WITH RECURSIVE component_tree AS (
            -- Root: the template component
            SELECT
                id as xref_id,
                parent_id,
                0 as level,
                CAST(id AS CHAR(200)) as path
            FROM api_wf.eventType_xref
            WHERE id = p_template_xref_id

            UNION ALL

            -- Children
            SELECT
                c.id,
                c.parent_id,
                ct.level + 1,
                CONCAT(ct.path, ',', c.id)
            FROM api_wf.eventType_xref c
            INNER JOIN component_tree ct ON c.parent_id = ct.xref_id
            WHERE ct.level < 10  -- Prevent infinite recursion
        )
        SELECT xref_id, parent_id, level
        FROM component_tree
        ORDER BY level, xref_id
    ) tree;

    -- Step 2: Clone each component in level order (parents before children)
    BEGIN
        DECLARE cur CURSOR FOR
            SELECT old_id, old_parent_id, level
            FROM id_mapping
            ORDER BY level, old_id;

        DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

        OPEN cur;

        clone_loop: LOOP
            FETCH cur INTO v_old_id, v_old_parent_id, level;

            IF v_done THEN
                LEAVE clone_loop;
            END IF;

            -- Determine new parent_id
            SET @new_parent := IF(
                v_old_id = p_template_xref_id,
                p_new_parent_id,  -- Root gets specified parent
                (SELECT new_id FROM id_mapping WHERE old_id = v_old_parent_id)  -- Children get mapped parent
            );

            -- Determine new comp_name
            SET @new_name := IF(
                v_old_id = p_template_xref_id,
                p_new_comp_name,  -- Root gets specified name
                (SELECT comp_name FROM api_wf.eventType_xref WHERE id = v_old_id)  -- Children keep original
            );

            -- Insert cloned component
            INSERT INTO api_wf.eventType_xref (
                comp_name, parent_id, container, comp_type, posOrder,
                title, description, style,
                created_at, created_by
            )
            SELECT
                @new_name,
                @new_parent,
                container,
                comp_type,
                posOrder,
                title,
                description,
                style,
                NOW(),
                p_user_id
            FROM api_wf.eventType_xref
            WHERE id = v_old_id;

            -- Store mapping
            UPDATE id_mapping
            SET new_id = LAST_INSERT_ID()
            WHERE old_id = v_old_id;

        END LOOP;

        CLOSE cur;
    END;

    -- Step 3: Clone eventProps (if any)
    INSERT INTO api_wf.eventProps (
        xref_id, propName, propType, propVal,
        created_at, created_by
    )
    SELECT
        m.new_id,
        ep.propName,
        ep.propType,
        ep.propVal,
        NOW(),
        p_user_id
    FROM api_wf.eventProps ep
    INNER JOIN id_mapping m ON ep.xref_id = m.old_id
    WHERE m.new_id IS NOT NULL;

    -- Step 4: Clone eventTriggers (if any)
    INSERT INTO api_wf.eventTrigger (
        xref_id, class, action, ordr, content, is_dom_event,
        created_at, created_by
    )
    SELECT
        m.new_id,
        et.class,
        et.action,
        et.ordr,
        et.content,
        et.is_dom_event,
        NOW(),
        p_user_id
    FROM api_wf.eventTrigger et
    INNER JOIN id_mapping m ON et.xref_id = m.old_id
    WHERE m.new_id IS NOT NULL;

    -- Return the mapping so caller knows the new IDs
    SELECT
        old_id as template_id,
        new_id as cloned_id,
        level,
        (SELECT comp_name FROM api_wf.eventType_xref WHERE id = new_id) as comp_name,
        (SELECT comp_type FROM api_wf.eventType_xref WHERE id = new_id) as comp_type
    FROM id_mapping
    ORDER BY level, old_id;

    -- Cleanup
    DROP TEMPORARY TABLE IF EXISTS id_mapping;

END$$

DELIMITER ;
