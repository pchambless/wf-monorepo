CREATE
    OR REPLACE VIEW `vw_HTMXRegistry` AS
  SELECT
    `c`.`name` AS `name`,`c`.`renderer` AS `renderer`,`c`.`props` AS `props`
  FROM `composites` `c`
  WHERE (`c`.`category` = 'base-component')
  ORDER BY `c`.`name`;
