CREATE
    OR REPLACE VIEW `vw_routePath` AS
  SELECT
    `b`.`id` AS `pageID`,`b`.`appID` AS `appID`,`a`.`mono_name` AS `appName`,`b`.`pageName` AS `pageName`,`a`.`name` AS `Name`,concat('/',`a`.`mono_name`,'/',`b`.`pageName`) AS `routePath`
  FROM (`app` `a`
    JOIN `page_registry` `b` on((`a`.`id` = `b`.`appID`)));
