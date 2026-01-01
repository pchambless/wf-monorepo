CREATE
    OR REPLACE VIEW `vw_module_map` AS
  SELECT
    `p`.`package` AS `pPackage`,`c`.`package` AS `cPackage`,(case when ((`p`.`active` = 1)
    AND (`c`.`active` = 1)) then 'Valid' else 'Obsolete' end) AS `status`,`p`.`fileName` AS `pFile`,`p`.`module_type` AS `pType`,`c`.`fileName` AS `cFile`,`c`.`module_type` AS `cType`,`p`.`file_path` AS `pPath`,`c`.`file_path` AS `cPath`,(case when (`p`.`package` = `c`.`package`) then 'Internal' else 'External' end) AS `crossed`,`a`.`module_id` AS `child_id`,`a`.`parent_id` AS `parent_id`,`p`.`active` AS `active_parent`,`c`.`active` AS `active_child`,`p`.`last_detected_at` AS `pDetected_at`,`c`.`last_detected_at` AS `cDetected_at`
  FROM ((`module_xref` `a`
    LEFT JOIN `modules` `p` on((`a`.`parent_id` = `p`.`id`)))
    LEFT JOIN `modules` `c` on((`a`.`module_id` = `c`.`id`)))
  ORDER BY `p`.`package`,`p`.`file_path`,`c`.`file_path`;
