CREATE
    OR REPLACE VIEW `vw_plan45` AS
  SELECT
    `plan_communications`.`plan_id` AS `plan_id`,('communication' collate utf8mb4_general_ci) AS `source`,(`plan_communications`.`from_agent` collate utf8mb4_general_ci) AS `agent`,(`plan_communications`.`type` collate utf8mb4_general_ci) AS `change_type`,(`plan_communications`.`subject` collate utf8mb4_general_ci) AS `subject/path`,(`plan_communications`.`message` collate utf8mb4_general_ci) AS `message`,`plan_communications`.`created_at` AS `created_at`
  FROM `plan_communications`
  WHERE (`plan_communications`.`plan_id` = 45)

UNION

select `plan_impacts`.`plan_id` AS `plan_id`,('impacts' collate utf8mb4_general_ci) AS `source`,(`plan_impacts`.`created_by` collate utf8mb4_general_ci) AS `agent`,(`plan_impacts`.`change_type` collate utf8mb4_general_ci) AS `change_type COLLATE utf8mb4_general_ci`,(`plan_impacts`.`file_path` collate utf8mb4_general_ci) AS `subject`,(`plan_impacts`.`description` collate utf8mb4_general_ci) AS `message`,`plan_impacts`.`created_at` AS `created_at` from `plan_impacts` where (`plan_impacts`.`plan_id` = 45)
  ORDER BY `created_at` desc;
