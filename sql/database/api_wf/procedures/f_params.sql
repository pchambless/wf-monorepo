CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_params`(qryID INT) RETURNS text CHARSET utf8mb4 COLLATE utf8mb4_general_ci
    DETERMINISTIC
BEGIN
  DECLARE sql_text TEXT;
  DECLARE i INT DEFAULT 1;
  DECLARE param TEXT;
  DECLARE result TEXT DEFAULT '';

  -- Get the qrySQL for the given ID
  SELECT qrySQL INTO sql_text
  FROM eventSQL
  WHERE id = qryID;

  -- Named loop to allow LEAVE
  param_loop: WHILE TRUE DO
    SET param = REGEXP_SUBSTR(sql_text, ':[a-zA-Z_][a-zA-Z0-9_]*', 1, i);
    IF param IS NULL THEN
      LEAVE param_loop;
    END
