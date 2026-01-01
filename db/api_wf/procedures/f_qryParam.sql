CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_qryParam`(
	`iParam` VARCHAR(50),
	`iEmail` VARCHAR(50)
) RETURNS text CHARSET utf8mb4 COLLATE utf8mb4_general_ci
    DETERMINISTIC
BEGIN
	DECLARE oVal VARCHAR(100);
	
	IF ISNULL(iParam) THEN
    SET oVal = 'Invalid Param';
  ELSE
    SELECT a.paramVal INTO oVal
    FROM context_store a
    WHERE a.paramName = iParam
      AND a.email = iEmail
    LIMIT 1;

    SET oVal = COALESCE(oVal, 'Param Not Found');
  END
