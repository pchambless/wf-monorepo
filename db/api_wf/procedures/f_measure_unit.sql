CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_measure_unit`(	i_id INT ) RETURNS varchar(100) CHARSET latin1
    READS SQL DATA
    COMMENT 'IN: measure_id OUT: measure_unit'
BEGIN
	declare o_val 	VARCHAR(100);
	
	if isnull(i_id) then
		set o_val = '-';  -- This is the default or Not Determined Value
	else
		select name into o_val
		from whatsfresh.measures
		where id = i_id;

		if isnull(o_val) then
			set o_val = '-';  -- This is the default or Not Determined Value
		end
