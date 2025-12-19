CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_xrefParent`(
	`parentID` INT
) RETURNS text CHARSET utf8mb4
    DETERMINISTIC
BEGIN
    DECLARE o_val text;
    
    IF ISNULL(parentID) THEN
        SET o_val = '-';  -- This is the default or Not Determined Value
    ELSE
        SELECT comp_name INTO o_val
        FROM eventComp_xref
        WHERE id = parentID;

        IF ISNULL(o_val) THEN
            SET o_val = '-';  -- This is the default or Not Determined Value
        END
