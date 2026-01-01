CREATE
    OR REPLACE VIEW `vw_page_analysis` AS
  SELECT
    `page_registry`.`id` AS `pageID`,`page_registry`.`pageName` AS `pageName`,`page_registry`.`appName` AS `appName`,`page_registry`.`appID` AS `appID`,`page_registry`.`status` AS `status`,json_unquote(json_extract(`page_registry`.`props`,'$.tableName')) AS `tableName`,json_unquote(json_extract(`page_registry`.`props`,'$.template_type')) AS `template_type`,json_extract(`page_registry`.`props`,'$.parentID') AS `parentID`,json_extract(`page_registry`.`props`,'$.tableID') AS `tableID`,json_unquote(json_extract(`page_registry`.`props`,'$.contextKey')) AS `contextKey`,json_unquote(json_extract(`page_registry`.`props`,'$.pageTitle')) AS `pageTitle`,json_unquote(json_extract(`page_registry`.`props`,'$.formHeadCol')) AS `formHeadCol`
  FROM `page_registry`
  WHERE (`page_registry`.`active` = 1);
