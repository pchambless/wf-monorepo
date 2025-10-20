DELIMITER $$

DROP PROCEDURE IF EXISTS sp_module_map$$

CREATE PROCEDURE sp_module_map(
    IN analysis_json JSON,
    IN firstName VARCHAR(50)
)
BEGIN
    DECLARE dependencies_mapped INT DEFAULT 0;
    DECLARE dependencies_skipped INT DEFAULT 0;
    DECLARE done INT DEFAULT FALSE;
    DECLARE current_from_path VARCHAR(500);
    DECLARE current_to_path VARCHAR(500);
    DECLARE from_module_id INT;
    DECLARE to_module_id INT;
    
    -- Variables for manual JSON parsing
    DECLARE v_idx INT DEFAULT 0;
    DECLARE v_dependency_count INT;
    DECLARE v_dependency JSON;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Soft delete existing dependencies (mark as obsolete)
    UPDATE api_wf.module_xref 
    SET 
        deleted_at = NOW(),
        deleted_by = firstName,
        updated_at = NOW(),
        updated_by = firstName
    WHERE deleted_at IS NULL;
    
    SET v_dependency_count = JSON_LENGTH(analysis_json);
    
    -- Process each dependency
    WHILE v_idx < v_dependency_count DO
        SET v_dependency = JSON_EXTRACT(analysis_json, CONCAT('$[', v_idx, ']'));
        SET current_from_path = JSON_UNQUOTE(JSON_EXTRACT(v_dependency, '$.from_path'));
        SET current_to_path = JSON_UNQUOTE(JSON_EXTRACT(v_dependency, '$.to_path'));
        
        -- Get module IDs for both paths
        SELECT id INTO from_module_id 
        FROM api_wf.modules 
        WHERE file_path = current_from_path AND deleted_at IS NULL
        LIMIT 1;
        
        SELECT id INTO to_module_id 
        FROM api_wf.modules 
        WHERE file_path = current_to_path AND deleted_at IS NULL
        LIMIT 1;
        
        -- Only create mapping if both modules exist
        IF from_module_id IS NOT NULL AND to_module_id IS NOT NULL THEN
            -- Check if dependency already exists (active or inactive)
            IF EXISTS (
                SELECT 1 FROM api_wf.module_xref 
                WHERE module_id = from_module_id 
                AND parent_id = to_module_id
            ) THEN
                -- Reactivate existing mapping
                UPDATE api_wf.module_xref
                SET 
                    deleted_at = NULL,
                    deleted_by = NULL,
                    updated_at = NOW(),
                    updated_by = firstName,
                    last_detected_at = NOW()
                WHERE module_id = from_module_id 
                AND parent_id = to_module_id;
            ELSE
                -- Insert new mapping
                INSERT INTO api_wf.module_xref (
                    module_id,
                    parent_id,
                    created_by,
                    created_at,
                    updated_by,
                    updated_at,
                    last_detected_at
                ) VALUES (
                    from_module_id,
                    to_module_id,
                    firstName,
                    NOW(),
                    firstName,
                    NOW(),
                    NOW()
                );
            END IF;
            
            SET dependencies_mapped = dependencies_mapped + 1;
        ELSE
            SET dependencies_skipped = dependencies_skipped + 1;
        END IF;
        
        -- Reset variables for next iteration
        SET from_module_id = NULL;
        SET to_module_id = NULL;
        
        SET v_idx = v_idx + 1;
    END WHILE;
    
    -- Commit transaction
    COMMIT;
    
    -- Return statistics
    SELECT 
        dependencies_mapped,
        dependencies_skipped,
        'Phase 2: Dependency mapping complete' as message;
        
END$$

DELIMITER;