/*!50003 DROP FUNCTION IF EXISTS `f_acctActive` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_aiParams` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_aiParams`(qryID INT) RETURNS text CHARSET utf8mb4 COLLATE utf8mb4_general_ci
    DETERMINISTIC
BEGIN
  DECLARE sql_text TEXT;
  DECLARE i INT DEFAULT 1;
  DECLARE param TEXT;
  DECLARE result TEXT DEFAULT '';

  SELECT qrySQL INTO sql_text
  FROM AISql
  WHERE id = qryID;

  param_loop: WHILE TRUE DO
    SET param = REGEXP_SUBSTR(sql_text, ':[a-zA-Z_][a-zA-Z0-9_]*', 1, i);
    IF param IS NULL THEN
      LEAVE param_loop;
    END IF;
    SET result = CONCAT(result, IF(result = '', '', ', '), param);
    SET i = i + 1;
  END WHILE param_loop;

  RETURN CONCAT('[', result, ']');
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_apiParent` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_apiParent`(
	`iID` INT
) RETURNS text CHARSET utf8mb4
    DETERMINISTIC
BEGIN
    DECLARE o_val text;
    
    IF ISNULL(iID) THEN
        SET o_val = '-';  -- This is the default or Not Determined Value
    ELSE
        SELECT grp INTO o_val
        FROM v_apiGroupParents
        WHERE id = iID;

        IF ISNULL(o_val) THEN
            SET o_val = '-';  -- This is the default or Not Determined Value
        END IF;
    END IF;

    RETURN o_val;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_brand` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_brand`(
	`iID` INT
) RETURNS text CHARSET utf8mb4
    DETERMINISTIC
BEGIN
	declare oVal 	VARCHAR(100);
	
	if isnull(iID) then
		set oVal = '-';  -- This is the default or Not Determined Value
	else
		select name into oVal
			from brands a
		where a.id = iID;

		if isnull(oVal) then
			set oVal = '-';  -- This is the default or Not Determined Value
		end if;
	end if;

	return oVal;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_EventStatus` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_EventStatus`(
	`iEventType` VARCHAR(50)
) RETURNS varchar(20) CHARSET utf8mb4
    DETERMINISTIC
BEGIN
DECLARE o_val text;

    IF ISNULL(iEventType) THEN
        SET o_val = '-';  -- This is the default or Not Determined Value
    ELSE
        SELECT status INTO o_val
        FROM apiTests
        WHERE eventType COLLATE utf8mb4_unicode_ci = iEventType COLLATE utf8mb4_unicode_ci;

        IF ISNULL(o_val) THEN
            SET o_val = '-';  -- This is the default or Not Determined Value
        END IF;
    END IF;

    RETURN o_val;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_json_to_com_delim` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
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
	end if;
	return o_val;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_measure_unit` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
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
		end if;
	end if;

	return o_val;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_params` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
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
    END IF;
    SET result = CONCAT(result, IF(result = '', '', ', '), param);
    SET i = i + 1;
  END WHILE param_loop;

  RETURN CONCAT('[', result, ']');
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_qryParam` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
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
  END IF;
  return oVal;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_recipeCnt` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_resolvePageTokens` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_resolvePageTokens`(
content text,
pageID int) RETURNS text CHARSET utf8mb3 COLLATE utf8mb3_unicode_ci
    DETERMINISTIC
BEGIN                                                                                                                                
     DECLARE resolved TEXT;                                                                                                                                              
     DECLARE pageName VARCHAR(50);          
	 DECLARE appName VARCHAR(50);     
     DECLARE templateType VARCHAR(20);                                                                                                                                     
     DECLARE propsJson JSON;                                                                                                                                               
                                                                                                                                                                           
     -- Return NULL if content is NULL                                                                                                                                     
     IF content IS NULL THEN                                                                                                                                               
         RETURN NULL;                                                                                                                                                      
     END IF;                                                                                                                                                               
                                                                                                                                                                           
     -- Lookup page metadata                                                                                                                                               
     SELECT                                                                                                                                                                
         reg.pageName,                                                                                                                                                     
         reg.appName,                                                                                                                                                      
         JSON_UNQUOTE(JSON_EXTRACT(reg.props, '$.template_type')),                                                                                                         
         reg.props                                                                                                                                                         
     INTO pageName, appName, templateType, propsJson                                                                                                                       
     FROM api_wf.page_registry reg                                                                                                                                         
     WHERE reg.id = pageID;                                                                                                                                                
                                                                                                                                                                           
     -- Start with original content                                                                                                                                        
     SET resolved = content;                                                                                                                                               
                                                                                                                                                                           
     -- Replace top-level pageConfig tokens                                                                                                                                
     SET resolved = REPLACE(resolved, '{{pageConfig.pageName}}', IFNULL(pageName, ''));                                                                                    
     SET resolved = REPLACE(resolved, '{{pageConfig.appName}}', IFNULL(appName, ''));                                                                                      
                                                                                                                                                                              
     -- Replace pageConfig.props.* tokens if propsJson exists                                                                                                              
     IF propsJson IS NOT NULL THEN                                                                                                                                         
         -- tableName                                                                                                                                                      
         IF JSON_CONTAINS_PATH(propsJson, 'one', '$.tableName') THEN                                                                                                       
             SET resolved = REPLACE(resolved,                                                                                                                              
                 '{{pageConfig.props.tableName}}',                                                                                                                         
                 JSON_UNQUOTE(JSON_EXTRACT(propsJson, '$.tableName'))                                                                                                      
             );                                                                                                                                                            
         END IF;                                                                                                                                                           
                                                                                                                                                                           
         -- tableID                                                                                                                                                        
         IF JSON_CONTAINS_PATH(propsJson, 'one', '$.tableID') THEN                                                                                                         
             SET resolved = REPLACE(resolved,                                                                                                                              
                 '{{pageConfig.props.tableID}}',                                                                                                                           
                 JSON_UNQUOTE(JSON_EXTRACT(propsJson, '$.tableID'))                                                                                                        
             );                                                                                                                                                            
         END IF;                                                                                                                                                           
                                                                                                                                                                           
         -- contextKey                                                                                                                                                     
         IF JSON_CONTAINS_PATH(propsJson, 'one', '$.contextKey') THEN                                                                                                      
             SET resolved = REPLACE(resolved,                                                                                                                              
                 '{{pageConfig.props.contextKey}}',                                                                                                                        
                 JSON_UNQUOTE(JSON_EXTRACT(propsJson, '$.contextKey'))                                                                                                     
             );                                                                                                                                                            
         END IF;                                                                                                                                                           
                                                                                                                                                                           
         -- pageTitle                                                                                                                                                      
         IF JSON_CONTAINS_PATH(propsJson, 'one', '$.pageTitle') THEN                                                                                                       
             SET resolved = REPLACE(resolved,                                                                                                                              
                 '{{pageConfig.props.pageTitle}}',                                                                                                                         
                 JSON_UNQUOTE(JSON_EXTRACT(propsJson, '$.pageTitle'))                                                                                                      
             );                                                                                                                                                            
         END IF;                                                                                                                                                           
                                                                                                                                                                           
         -- formHeadCol                                                                                                                                                    
         IF JSON_CONTAINS_PATH(propsJson, 'one', '$.formHeadCol') THEN                                                                                                     
             SET resolved = REPLACE(resolved,                                                                                                                              
                 '{{pageConfig.props.formHeadCol}}',                                                                                                                       
                 JSON_UNQUOTE(JSON_EXTRACT(propsJson, '$.formHeadCol'))                                                                                                    
             );                                                                                                                                                            
         END IF;                                                                                                                                                           
                                                                                                                                                                           
         -- parentID (may contain [context] reference, but we resolve the prop name itself)                                                                                
         IF JSON_CONTAINS_PATH(propsJson, 'one', '$.parentID') THEN                                                                                                        
             SET resolved = REPLACE(resolved,                                                                                                                              
                 '{{pageConfig.props.parentID}}',                                                                                                                          
                 JSON_UNQUOTE(JSON_EXTRACT(propsJson, '$.parentID'))                                                                                                       
             );                                                                                                                                                            
         END IF;                                                                                                                                                           
     END IF;                                                                                                                                                               
                                                                                                                                                                           
     RETURN resolved;                                                                                                                                                      
 END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_shop_event` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
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
			join vendors b
			on a.vendor_id = b.id
		where a.id = iID;

		if isnull(oVal) then
			set oVal = '-';  -- This is the default or Not Determined Value
		end if;
	end if;

	return oVal;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_vendor` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
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
			from whatsfresh.vendors a
		where a.id = iID;

		if isnull(oVal) then
			set oVal = '-';  -- This is the default or Not Determined Value
		end if;
	end if;

	return oVal;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_xrefParent` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
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
        END IF;
    END IF;

    RETURN o_val;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GenColumnJSON` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` PROCEDURE `GenColumnJSON`(
	IN `iListEvent` VARCHAR(50)
)
    DETERMINISTIC
BEGIN
    DECLARE columns_json LONGTEXT DEFAULT '';

    -- Set the character set and collation for the session
    SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci';
    SET collation_connection = 'utf8mb4_unicode_ci';

    -- Convert iListEvent to the same collation
    SET iListEvent = CONVERT(iListEvent USING utf8mb4);

    -- Generate JSON for the specified listEvent
    SELECT 
        JSON_ARRAYAGG(
            CONCAT(
                '{"field": "', COLUMN_NAME, '",',
                '"label": "",',
                '"hidden": 0,',
                '"dbCol": "",',
                '"setVar": "', ':', COLUMN_NAME, '",',
                '"style": null,',
                '"required": null}'
            )
        )
    INTO columns_json
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'api_wf' COLLATE utf8mb4_unicode_ci
      AND TABLE_NAME = iListEvent COLLATE utf8mb4_unicode_ci
      AND TABLE_NAME NOT LIKE '%api%' COLLATE utf8mb4_unicode_ci;

    -- Ensure the target table column is set to the correct character set and collation
    UPDATE apiPages
    SET colmns = CONCAT('[', columns_json, ']')
    WHERE listEvent = iListEvent COLLATE utf8mb4_unicode_ci;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_genFields` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` PROCEDURE `sp_genFields`(
    IN p_xref_id INT
)
BEGIN
    DECLARE v_table_name VARCHAR(100);
    DECLARE v_schema_name VARCHAR(100);
    DECLARE v_component_type VARCHAR(20);
    DECLARE v_qry_sql TEXT;
    DECLARE v_full_table_name VARCHAR(200);
    DECLARE v_select_clause TEXT;

    -- Get component details from vw_eventSQL
    SELECT a.comp_type, a.qrySQL
    INTO v_component_type, v_qry_sql
    FROM vw_eventSQL a
    WHERE a.xref_id = p_xref_id;

    -- Extract SELECT clause (between SELECT and FROM)
    SET v_select_clause = SUBSTRING_INDEX(SUBSTRING_INDEX(LOWER(v_qry_sql), 'from ', 1), 'select ', -1);
    SET v_select_clause = REPLACE(REPLACE(REPLACE(v_select_clause, '\r\n', ' '), '\n', ' '), '\t', ' ');
    SET v_select_clause = TRIM(v_select_clause);

    -- Extract FROM clause for table name
    SET @from_pos = LOCATE('from ', LOWER(v_qry_sql));
    IF @from_pos > 0 THEN
        SET v_full_table_name = SUBSTRING(v_qry_sql, @from_pos + 5);
        SET v_full_table_name = REPLACE(REPLACE(REPLACE(v_full_table_name, '\r\n', ' '), '\n', ' '), '\t', ' ');
        SET v_full_table_name = TRIM(SUBSTRING_INDEX(v_full_table_name, ' ', 1));
    END IF;
    SET v_full_table_name = TRIM(BOTH ', ' FROM v_full_table_name);

    -- Extract schema and table name
    IF LOCATE('.', v_full_table_name) > 0 THEN
        SET v_schema_name = SUBSTRING_INDEX(v_full_table_name, '.', 1);
        SET v_table_name = SUBSTRING_INDEX(v_full_table_name, '.', -1);
    ELSE
        SET v_schema_name = 'api_wf';
        SET v_table_name = v_full_table_name;
    END IF;

    -- RESULT SET 1: Metadata
    SELECT
        p_xref_id as xref_id,
        v_table_name as table_name,
        v_schema_name as schema_name,
        v_component_type as component_type,
        v_select_clause as selected_columns;

    -- RESULT SET 2: Field configurations (only columns in SELECT)
    SELECT
        column_name as name,
        data_type as dataType,
        is_nullable as nullable,
        column_default as defaultValue,
        CASE
            WHEN data_type IN ('text', 'longtext') THEN 'textarea'
            WHEN data_type IN ('datetime', 'timestamp') THEN 'datetime-local'
            WHEN data_type = 'date' THEN 'date'
            WHEN data_type IN ('int', 'bigint', 'decimal', 'float', 'double') THEN 'number'
            WHEN data_type = 'tinyint' THEN 'checkbox'
            ELSE 'text'
        END as inputType
    FROM information_schema.columns
    WHERE table_schema = v_schema_name
      AND table_name = v_table_name
      AND FIND_IN_SET(column_name, REPLACE(v_select_clause, ' ', '')) > 0
    ORDER BY FIND_IN_SET(column_name, REPLACE(v_select_clause, ' ', ''));

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_hier_structure` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` PROCEDURE `sp_hier_structure`(IN pageID INT)
BEGIN
    WITH RECURSIVE component_tree AS (
        -- Anchor
        SELECT
            x.id AS xref_id,
            x.pageID,
            reg.pageName,
            reg.appName,
            x.parent_id,
            x.comp_name,
            reg.pageName AS parent_name,
            CONCAT(reg.pageName, '.', x.comp_name) AS parentCompName,
            x.title,
            x.comp_type,
            x.description,
            x.posOrder,
            x.style AS override_styles,
            0 AS level,
            CAST(x.id AS CHAR(500)) AS id_path
        FROM api_wf.eventComp_xref x
        JOIN api_wf.page_registry reg ON x.pageID = reg.id
        WHERE x.pageID = pageID
          AND x.parent_id = x.id
          AND x.active = 1

        UNION ALL

        -- Recursive
        SELECT
            child.id,
            child.pageID,
            reg.pageName,
            reg.appName,
            child.parent_id,
            child.comp_name,
            parent_tree.comp_name AS parent_name,
            CONCAT(parent_tree.comp_name, '.', child.comp_name) AS parentCompName,
            child.title,
            child.comp_type,
            child.description,
            child.posOrder,
            child.style,
            parent_tree.level + 1,
            CONCAT(parent_tree.id_path, ',', child.id)
        FROM api_wf.eventComp_xref child
        JOIN component_tree parent_tree ON child.parent_id = parent_tree.xref_id
        JOIN api_wf.page_registry reg ON child.pageID = reg.id
        WHERE child.active = 1
          AND child.parent_id != child.id
          AND parent_tree.level < 20
    )
    SELECT
        ct.xref_id AS id,
        ct.parent_id,
        ct.pageID,
        ct.pageName,
        ct.appName,
        ct.comp_name,
        ct.parent_name,
        ct.parentCompName,
        ct.title,
        ct.comp_type,
        ct.description,
        ct.posOrder,
        ct.override_styles,
        CASE WHEN ct.comp_type = 'Modal' THEN 0 ELSE ct.level END AS level,
        ct.id_path
    FROM component_tree ct
    ORDER BY 
        CASE WHEN ct.comp_type = 'Modal' THEN 0 ELSE ct.level END,
        ct.posOrder;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_module_load` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` PROCEDURE `sp_module_load`(
IN p_modules JSON,
IN p_user_id VARCHAR(50)
)
BEGIN
      DECLARE v_idx INT DEFAULT 0;
      DECLARE v_module_count INT;
      DECLARE v_file_path VARCHAR(500);
      DECLARE v_module_id INT;
      DECLARE v_upserted_count INT DEFAULT 0;
      DECLARE v_module JSON;
      DECLARE v_run_timestamp DATETIME;

      DECLARE EXIT HANDLER FOR SQLEXCEPTION
      BEGIN
          ROLLBACK;
          RESIGNAL;
      END;

      START TRANSACTION;

      -- Capture run timestamp at the beginning
      SET v_run_timestamp = NOW();
      SET v_module_count = JSON_LENGTH(p_modules);

      -- Mark ALL active modules with the run timestamp (but don't update last_detected_at yet)
      UPDATE api_wf.modules
      SET updated_at = v_run_timestamp,
          updated_by = p_user_id
      WHERE deleted_at IS NULL;

      -- Process each module detected in this run
      WHILE v_idx < v_module_count DO
          SET v_module = JSON_EXTRACT(p_modules, CONCAT('$[', v_idx, ']'));
          SET v_file_path = JSON_UNQUOTE(JSON_EXTRACT(v_module, '$.file_path'));

          SET v_module_id = NULL;

          -- Check if module exists
          SELECT id INTO v_module_id
          FROM api_wf.modules
          WHERE file_path = v_file_path;

          IF v_module_id IS NOT NULL THEN
              -- Update: reactivate if soft deleted, mark as detected
              UPDATE api_wf.modules
              SET
                  deleted_at = NULL,
                  deleted_by = NULL,
                  updated_at = v_run_timestamp,
                  updated_by = p_user_id,
                  last_detected_at = v_run_timestamp
              WHERE id = v_module_id;
          ELSE
              -- Insert new module
              INSERT INTO api_wf.modules (file_path, created_by, created_at, updated_at, last_detected_at)
              VALUES (v_file_path, p_user_id, v_run_timestamp, v_run_timestamp, v_run_timestamp);
          END IF;

          SET v_upserted_count = v_upserted_count + 1;
          SET v_idx = v_idx + 1;
      END WHILE;

      -- Soft delete modules that weren't detected in this run
      -- (updated_at = v_run_timestamp but last_detected_at < v_run_timestamp)
      UPDATE api_wf.modules
      SET
          deleted_at = v_run_timestamp,
          deleted_by = p_user_id
      WHERE deleted_at IS NULL
        AND updated_at = v_run_timestamp
        AND last_detected_at < v_run_timestamp;

      COMMIT;

      -- Return summary
      SELECT
          v_upserted_count AS modules_processed,
          (SELECT COUNT(*) FROM api_wf.modules WHERE deleted_at = v_run_timestamp) AS modules_soft_deleted,
          (SELECT COUNT(*) FROM api_wf.modules WHERE deleted_at IS NULL) AS active_modules;

  END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_module_map` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` PROCEDURE `sp_module_map`(
IN p_dependencies JSON,
IN firstName VARCHAR(50)
)
BEGIN
    DECLARE dependencies_mapped INT DEFAULT 0;
    DECLARE dependencies_skipped INT DEFAULT 0;
    DECLARE done INT DEFAULT FALSE;
    DECLARE current_from_path VARCHAR(500);
    DECLARE current_to_path VARCHAR(500);
    DECLARE from_module_id INT;
    DECLARE to_module_id INT;
    
    -- Variables for manual JSON parsing
    DECLARE v_idx INT DEFAULT 0;
    DECLARE v_dependency_count INT;
    DECLARE v_dependency JSON;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Soft delete existing dependencies (mark as obsolete)
    UPDATE api_wf.module_xref 
    SET 
        deleted_at = NOW(),
        deleted_by = firstName,
        updated_at = NOW(),
        updated_by = firstName
    WHERE deleted_at IS NULL;
    
    SET v_dependency_count = JSON_LENGTH(p_dependencies);
    
    -- Process each dependency
    WHILE v_idx < v_dependency_count DO
        SET v_dependency = JSON_EXTRACT(p_dependencies, CONCAT('$[', v_idx, ']'));
        SET current_from_path = JSON_UNQUOTE(JSON_EXTRACT(v_dependency, '$.from_path'));
        SET current_to_path = JSON_UNQUOTE(JSON_EXTRACT(v_dependency, '$.to_path'));
        
        -- Get module IDs for both paths
        SELECT id INTO from_module_id 
        FROM api_wf.modules 
        WHERE file_path = current_from_path AND deleted_at IS NULL
        LIMIT 1;
        
        SELECT id INTO to_module_id 
        FROM api_wf.modules 
        WHERE file_path = current_to_path AND deleted_at IS NULL
        LIMIT 1;
        
        -- Only create mapping if both modules exist
        IF from_module_id IS NOT NULL AND to_module_id IS NOT NULL THEN
            -- Check if dependency already exists (active or inactive)
            IF EXISTS (
                SELECT 1 FROM api_wf.module_xref 
                WHERE module_id = from_module_id 
                AND parent_id = to_module_id
            ) THEN
                -- Reactivate existing mapping
                UPDATE api_wf.module_xref
                SET 
                    deleted_at = NULL,
                    deleted_by = NULL,
                    updated_at = NOW(),
                    updated_by = firstName,
                    last_detected_at = NOW()
                WHERE module_id = from_module_id 
                AND parent_id = to_module_id;
            ELSE
                -- Insert new mapping
                INSERT INTO api_wf.module_xref (
                    module_id,
                    parent_id,
                    created_by,
                    created_at,
                    updated_by,
                    updated_at,
                    last_detected_at
                ) VALUES (
                    from_module_id,
                    to_module_id,
                    firstName,
                    NOW(),
                    firstName,
                    NOW(),
                    NOW()
                );
            END IF;
            
            SET dependencies_mapped = dependencies_mapped + 1;
        ELSE
            SET dependencies_skipped = dependencies_skipped + 1;
        END IF;
        
        -- Reset variables for next iteration
        SET from_module_id = NULL;
        SET to_module_id = NULL;
        
        SET dependencies_mapped = dependencies_mapped + 1;
        SET v_idx = v_idx + 1;
    END WHILE;
    
    -- Commit transaction
    COMMIT;
    
    -- Return statistics
    SELECT 
        dependencies_mapped,
        dependencies_skipped,
        'Phase 2: Dependency mapping complete' as message;
        
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_pageStructure` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` PROCEDURE `sp_pageStructure`(IN requestedPageID INT)
BEGIN
    DECLARE templateType VARCHAR(20);
    DECLARE effectivePageID INT;
    DECLARE requestedPageName VARCHAR(50);
    DECLARE requestedAppName VARCHAR(50);
    
    -- Get page info and determine if this is a CRUD page (uses template) or custom page
    SELECT 
        JSON_UNQUOTE(JSON_EXTRACT(props, '$.template_type')),
        pageName,
        appName
    INTO templateType, requestedPageName, requestedAppName
    FROM api_wf.page_registry 
    WHERE id = requestedPageID;
    
    -- If CRUD, use template components (pageID=11), else use requested page
    IF templateType = 'crud' THEN
        SET effectivePageID = 11;  -- Template
    ELSE
        SET effectivePageID = requestedPageID;  -- Own components
    END IF;
    
    -- Build component hierarchy with props and triggers
    WITH RECURSIVE component_tree AS (
        -- Anchor: Root component
        SELECT
            x.id AS xref_id,
            x.pageID,
            reg.pageName,
            reg.appName,
            x.parent_id,
            x.comp_name,
            reg.pageName AS parent_name,
            CONCAT(reg.pageName, '.', x.comp_name) AS parentCompName,
            x.title,
            x.comp_type,
            x.description,
            x.posOrder,
            x.style AS override_styles,
            0 AS level,
            CAST(x.id AS CHAR(500)) AS id_path
        FROM api_wf.eventComp_xref x
        JOIN api_wf.page_registry reg ON x.pageID = reg.id
        WHERE x.pageID = effectivePageID
          AND x.parent_id = x.id
          AND x.active = 1

        UNION ALL

        -- Recursive: Child components
        SELECT
            child.id,
            child.pageID,
            reg.pageName,
            reg.appName,
            child.parent_id,
            child.comp_name,
            parent_tree.comp_name AS parent_name,
            CONCAT(parent_tree.comp_name, '.', child.comp_name) AS parentCompName,
            child.title,
            child.comp_type,
            child.description,
            child.posOrder,
            child.style,
            parent_tree.level + 1,
            CONCAT(parent_tree.id_path, ',', child.id)
        FROM api_wf.eventComp_xref child
        JOIN component_tree parent_tree ON child.parent_id = parent_tree.xref_id
        JOIN api_wf.page_registry reg ON child.pageID = reg.id
        WHERE child.active = 1
          AND child.parent_id != child.id
          AND parent_tree.level < 20
    )
    SELECT
        ct.xref_id,
        ct.parent_id,
        requestedPageID AS pageID,
        requestedPageName AS pageName,
        requestedAppName AS appName,
        templateType AS template_type,
        ct.comp_name,
        ct.parent_name,
        ct.parentCompName,
        ct.title,
        ct.comp_type,
        ct.description,
        ct.posOrder,
        ct.override_styles,
        CASE WHEN ct.comp_type = 'Modal' THEN 0 ELSE ct.level END AS level,
        ct.id_path,
        
        -- Props and triggers from vw_pageComponents view
        vc.props,
        vc.triggers
        
    FROM component_tree ct
    LEFT JOIN api_wf.vw_pageComponents vc ON ct.xref_id = vc.xref_id 
        AND vc.pageID = requestedPageID
    ORDER BY 
        CASE WHEN ct.comp_type = 'Modal' THEN 0 ELSE ct.level END,
        ct.posOrder;
        
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-16 12:30:09
