CREATE TABLE `ingredient_types` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`account_id` INT UNSIGNED NOT NULL,
	`name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`description` TEXT NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`created_at` TIMESTAMP NULL DEFAULT NULL,
	`updated_at` TIMESTAMP NULL DEFAULT NULL,
	`deleted_at` TIMESTAMP NULL DEFAULT NULL,
	`created_by` INT UNSIGNED NULL DEFAULT NULL,
	`updated_by` INT UNSIGNED NULL DEFAULT NULL,
	`deleted_by` INT UNSIGNED NULL DEFAULT NULL,
	`active` CHAR(1) AS ((case when (`deleted_at` is null) then _utf8mb4'Y' else _utf8mb4'' end)) stored,
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `ingr_type_usi` (`account_id`, `name`) USING BTREE,
	INDEX `ingredient_types_account_id_foreign` (`account_id`) USING BTREE,
	CONSTRAINT `ingredient_types_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=272
;
