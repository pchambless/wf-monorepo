DELIMITER $

DROP PROCEDURE IF EXISTS sp_module_load$

CREATE PROCEDURE sp_module_load(
    IN p_modules JSON,
    IN firstName VARCHAR(50)
)
BEGIN
    DECLARE v_idx INT DEFAULT 0;
    DECLARE v_module_count INT;
    DECLARE v_file_path VARCHAR(500);
    DECLARE v_module_id INT;
    DECLARE v_upserted_count INT DEFAULT 0;
    DECLARE v_module JSON;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    SET v_module_count = JSON_LENGTH(p_modules);
    
    -- Process each module
    WHILE v_idx < v_module_count DO
        SET v_module = JSON_EXTRACT(p_modules, CONCAT('$[', v_idx, ']'));
        SET v_file_path = JSON_UNQUOTE(JSON_EXTRACT(v_module, '$.file_path'));
        
        -- Reset module_id for each iteration
        SET v_module_id = NULL;
        
        -- Check if module exists
        SELECT id INTO v_module_id
        FROM api_wf.modules
        WHERE file_path = v_file_path;
        
        IF v_module_id IS NOT NULL THEN
            -- Update existing module (reactivate if soft deleted)
            UPDATE api_wf.modules
            SET 
                deleted_at = NULL,
                deleted_by = NULL,
                updated_at = NOW(),
                updated_by = firstName,
                last_detected_at = NOW()
            WHERE id = v_module_id;
        ELSE
            -- Insert new module
            INSERT INTO api_wf.modules (file_path, created_by, created_at, last_detected_at)
            VALUES (v_file_path, firstName, NOW(), NOW());
        END IF;
        
        SET v_upserted_count = v_upserted_count + 1;
        SET v_idx = v_idx + 1;
    END WHILE;
    
    COMMIT;
    
    -- Return summary
    SELECT v_upserted_count AS modules_processed;
    
END$

DELIMITER;