CREATE
    OR REPLACE VIEW `vw_module_audit` AS
  SELECT
    `m`.`id` AS `module_id`,`m`.`package` AS `package`,`m`.`fileFolder` AS `fileFolder`,`m`.`fileName` AS `fileName`,`m`.`file_path` AS `file_path`,`m`.`active` AS `is_active`,`m`.`deleted_at` AS `deleted_at`,`m`.`last_detected_at` AS `last_detected_at`,(to_days(now()) - to_days(`m`.`last_detected_at`)) AS `days_since_detected`,`m`.`created_at` AS `module_created`,`m`.`created_by` AS `module_creator`,(select count(0)
  FROM `module_xref`
  WHERE ((`module_xref`.`parent_id` = `m`.`id`)
    AND (`module_xref`.`deleted_at` is null))) AS `depends_on_count`,(select count(0) from `module_xref` where ((`module_xref`.`module_id` = `m`.`id`)
    AND (`module_xref`.`deleted_at` is null))) AS `depended_by_count`,`t`.`id` AS `impact_id`,`t`.`plan_id` AS `plan_id`,`t`.`change_type` AS `change_type`,`t`.`phase` AS `phase`,`t`.`description` AS `impact_description`,`t`.`status` AS `impact_status`,`t`.`created_at` AS `impact_date`,`t`.`created_by` AS `changed_by`,`t`.`affected_apps` AS `affected_apps`,`p`.`name` AS `plan_name`,`p`.`status` AS `plan_status`,`p`.`priority` AS `plan_priority`,(case when ((`m`.`active` = 0)
    AND (`t`.`change_type` = 'DELETE')) then 'Intentionally deleted' when ((`m`.`active` = 0)
    AND (`t`.`change_type` is null)) then 'Missing (no impact logged)' when (`m`.`active` = 0) then 'Deleted (impact logged)' when ((`m`.`active` = 1)
    AND (`t`.`id` is null)) then 'Active (undocumented)' else 'Active (documented)' end) AS `audit_status`,(case when `m`.`package` in (select distinct `modules`.`package` from `modules` where (`modules`.`active` = 1)) then 0 else 1 end) AS `orphan_package` from ((`modules` `m`
    LEFT JOIN `plan_impacts` `t` on((`m`.`file_path` = `t`.`file_path`)))
    LEFT JOIN `plans` `p` on((`t`.`plan_id` = `p`.`id`)));
