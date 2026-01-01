CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_EventStatus`(
	`iEventType` VARCHAR(50)
) RETURNS varchar(20) CHARSET utf8mb4
    DETERMINISTIC
BEGIN
DECLARE o_val text;

    IF ISNULL(iEventType) THEN
        SET o_val = '-';  -- This is the default or Not Determined Value
    ELSE
        SELECT status INTO o_val
        FROM apiTests
        WHERE eventType COLLATE utf8mb4_unicode_ci = iEventType COLLATE utf8mb4_unicode_ci;

        IF ISNULL(o_val) THEN
            SET o_val = '-';  -- This is the default or Not Determined Value
        END
