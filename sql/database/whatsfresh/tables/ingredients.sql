CREATE TABLE `ingredients` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`account_id` INT UNSIGNED NOT NULL,
	`name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`ingredient_type_id` INT UNSIGNED NOT NULL,
	`description` TEXT NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`code` VARCHAR(20) NOT NULL DEFAULT '-' COLLATE 'utf8mb4_unicode_ci',
	`grams_per_ounce` INT UNSIGNED NOT NULL DEFAULT '0',
	`default_measure_unit` INT UNSIGNED NULL DEFAULT '51',
	`default_vendor` INT UNSIGNED NULL DEFAULT NULL,
	`created_at` TIMESTAMP NULL DEFAULT NULL,
	`updated_at` TIMESTAMP NULL DEFAULT NULL,
	`deleted_at` TIMESTAMP NULL DEFAULT NULL,
	`created_by` INT UNSIGNED NULL DEFAULT NULL,
	`updated_by` INT UNSIGNED NULL DEFAULT NULL,
	`deleted_by` INT UNSIGNED NULL DEFAULT NULL,
	`active` CHAR(1) AS ((case when (`deleted_at` is null) then _utf8mb4'Y' else _utf8mb4'' end)) stored,
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `ingr_usi` (`ingredient_type_id`, `name`) USING BTREE,
	INDEX `ingredients_account_id_foreign` (`account_id`) USING BTREE,
	INDEX `ingredients_ingredient_type_id_foreign` (`ingredient_type_id`) USING BTREE,
	CONSTRAINT `ingredients_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT `ingredients_ingredient_type_id_foreign` FOREIGN KEY (`ingredient_type_id`) REFERENCES `ingredient_types` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=596
;
