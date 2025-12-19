CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_vendor`(
	`iID` INT
) RETURNS text CHARSET utf8mb4
    DETERMINISTIC
BEGIN
	declare oVal 	VARCHAR(100);
	
	if isnull(iID) then
		set oVal = '-';  -- This is the default or Not Determined Value
	else
		select name into oVal
			from whatsfresh.vend
