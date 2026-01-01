CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_recipeCnt`(
	`iID` INT
) RETURNS int
    DETERMINISTIC
BEGIN
	declare oVal int;
	
	select ingredient_id, ifnull(count(*),0) into oVal
		from   product_recipes
		where active = 'Y'
		and ingredient_id = iID
		group by 1;
	
		
	return oVal;
END
