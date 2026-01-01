CREATE
    OR REPLACE VIEW `vw_AISql` AS
  SELECT
    `AISql`.`id` AS `id`,`AISql`.`category` AS `category`,`AISql`.`qryName` AS `qryName`,`AISql`.`qrySQL` AS `qrySQL`,`AISql`.`description` AS `description`,`api_wf`.`f_aiParams`(`AISql`.`id`) AS `params`,`AISql`.`usage_count` AS `usage_count`,`AISql`.`created_at` AS `created_at`,`AISql`.`created_by` AS `created_by`,`AISql`.`updated_at` AS `updated_at`,`AISql`.`updated_by` AS `updated_by`,`AISql`.`deleted_at` AS `deleted_at`,`AISql`.`deleted_by` AS `deleted_by`,`AISql`.`active` AS `active`
  FROM `AISql`
  WHERE (`AISql`.`active` = 1);
