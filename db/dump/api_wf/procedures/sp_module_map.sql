CREATE DEFINER=`wf_admin`@`%` PROCEDURE `sp_module_map`(
IN p_dependencies JSON,
IN firstName VARCHAR(50)
)
BEGIN
    DECLARE depend
