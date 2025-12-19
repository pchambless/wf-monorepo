CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_json_to_com_delim`(
	`i_json` varchar(1000)
) RETURNS varchar(1000) CHARSET latin1
    READS SQL DATA
    COMMENT 'IN: JSON OUT: measure_unit'
BEGIN
	declare o_val 	VARCHAR(1000);if isnull(i_json) then
		set o_val = '';	-- This is the default or Not Determined Value
	else
		set o_val = replace(i_json,'[','');
		set o_val = replace(o_val,']','');
		set o_val = replace(o_val,'"','');
		set o_val = replace(o_val,',',', ');
	end
