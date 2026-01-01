CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_shop_event`(
	`iID` INT
) RETURNS text CHARSET utf8mb4
    DETERMINISTIC
BEGIN
	declare oVal 	VARCHAR(100);
	
	if isnull(iID) then
		set oVal = '-';  -- This is the default or Not Determined Value
	else
		select concat(b.`name`,': ',date_format(a.shop_date,'%Y-%m-%d')) into oVal
			from shop_event a
			join vend
