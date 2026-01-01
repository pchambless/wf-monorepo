CREATE
    OR REPLACE VIEW `vw_userAppList` AS
  SELECT
    `u`.`email` AS `email`,`u`.`role` AS `ROLE`,`u`.`first_name` AS `first_name`,`u`.`last_name` AS `last_name`,`u`.`last_login` AS `last_login`,`app`.`mono_name` AS `app_name`,`app`.`name` AS `display_name`,`app`.`base_url` AS `routePath`
  FROM (`app`
    JOIN `whatsfresh`.`users` `u`)
  WHERE ((`u`.`active` = 1)
    AND (`app`.`base_url` is not null)
    AND json_contains(cast(`app`.`roles` as json),cast(`u`.`role` as json)))
  ORDER BY `u`.`email`,`app`.`name`;
