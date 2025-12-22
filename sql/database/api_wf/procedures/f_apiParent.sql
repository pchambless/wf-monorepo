CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_apiParent`(
	`iID` INT
) RETURNS text CHARSET utf8mb4
    DETERMINISTIC
BEGIN
    DECLARE o_val text;
    
    IF ISNULL(iID) THEN
        SET o_val = '-';  -- This is the default or Not Determined Value
    ELSE
        SELECT grp INTO o_val
        FROM v_apiGroupParents
        WHERE id = iID;

        IF ISNULL(o_val) THEN
            SET o_val = '-';  -- This is the default or Not Determined Value
        END
