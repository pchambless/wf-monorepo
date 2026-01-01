CREATE
    OR REPLACE VIEW `vw_pageComponents` AS
  SELECT
    `pc`.`id` AS `pageComponent_id`,`pc`.`pageID` AS `pageID`,`pc`.`comp_name` AS `comp_name`,`pc`.`composite_id` AS `composite_id`,`pc`.`parent_id` AS `parent_id`,`pc`.`posOrder` AS `posOrder`,substring_index(`pc`.`posOrder`,',',1) AS `row_pos`,substring_index(substring_index(`pc`.`posOrder`,',',2),',',-(1)) AS `col_pos`,substring_index(substring_index(`pc`.`posOrder`,',',3),',',-(1)) AS `width_pos`,substring_index(`pc`.`posOrder`,',',-(1)) AS `align_pos`,`pc`.`title` AS `instance_title`,`pc`.`description` AS `instance_description`,`c`.`name` AS `composite_name`,`c`.`category` AS `composite_category`,`c`.`title` AS `composite_title`,`c`.`components` AS `composite_components`,`ve`.`qryName` AS `qryName`,`ve`.`qrySQL` AS `qrySQL`,`ve`.`props` AS `props`,`ve`.`triggers` AS `triggers`,(case when (`c`.`name` in ('Form','ModalForm')) then 'form' when (`c`.`name` = 'Grid') then 'grid' else NULL end) AS `field_generator_type`
  FROM ((`pageComponents` `pc`
    JOIN `composites` `c` on((`pc`.`composite_id` = `c`.`id`)))
    LEFT JOIN `vw_execEvents` `ve` on(((`pc`.`comp_name` = `ve`.`component_name`)
    AND (`pc`.`pageID` = `ve`.`pageID`))))
  WHERE ((`pc`.`active` = 1)
    AND (`c`.`active` = 1));
