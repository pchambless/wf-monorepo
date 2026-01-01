CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_acctActive`(
	`iID` INT
) RETURNS char(1) CHARSET utf8mb4
    DETERMINISTIC
BEGIN
	declare oVal text;
	
	select active into oVal
	from accounts
	where id = iID;
	
	return oVal;
END
