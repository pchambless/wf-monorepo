CREATE FUNCTION api_wf.f_resolvePageTokens(
content text,
pageID int)
RETURNS text
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
 END