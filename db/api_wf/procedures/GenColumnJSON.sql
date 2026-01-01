CREATE DEFINER=`wf_admin`@`%` PROCEDURE `GenColumnJSON`(
	IN `iListEvent` VARCHAR(50)
)
    DETERMINISTIC
BEGIN
    DECLARE columns_json LONGTEXT DEFAULT '';

    -- Set the character set and collation for the session
    SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci';
    SET collation_connection = 'utf8mb4_unicode_ci';

    -- Convert iListEvent to the same collation
    SET iListEvent = CONVERT(iListEvent USING utf8mb4);

    -- Generate JSON for the specified listEvent
    SELECT 
        JSON_ARRAYAGG(
            CONCAT(
                '{"field": "', COLUMN_NAME, '",',
                '"label": "",',
                '"hidden": 0,',
                '"dbCol": "",',
                '"setVar": "', ':', COLUMN_NAME, '",',
                '"style": null,',
                '"required": null}'
            )
        )
    INTO columns_json
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'api_wf' COLLATE utf8mb4_unicode_ci
      AND TABLE_NAME = iListEvent COLLATE utf8mb4_unicode_ci
      AND TABLE_NAME NOT LIKE '%api%' COLLATE utf8mb4_unicode_ci;

    -- Ensure the target table column is set to the correct character set and collation
    UPDATE apiPages
    SET colmns = CONCAT('[', columns_json, ']')
    WHERE listEvent = iListEvent COLLATE utf8mb4_unicode_ci;
END
