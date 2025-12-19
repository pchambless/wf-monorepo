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
     END
