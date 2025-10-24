CREATE TABLE `product_types` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`account_id` INT UNSIGNED NOT NULL,
	`name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`bestByDateType` VARCHAR(100) NOT NULL DEFAULT 'Year' COMMENT 'Day, Month, Year' COLLATE 'utf8mb4_unicode_ci',
	`bestByLength` INT NOT NULL DEFAULT '1',
	`created_at` TIMESTAMP NULL DEFAULT NULL,
	`updated_at` TIMESTAMP NULL DEFAULT NULL,
	`deleted_at` TIMESTAMP NULL DEFAULT NULL,
	`created_by` INT UNSIGNED NULL DEFAULT NULL,
	`deleted_by` INT UNSIGNED NULL DEFAULT NULL,
	`updated_by` INT UNSIGNED NULL DEFAULT NULL,
	`active` CHAR(1) AS ((case when (`deleted_at` is null) then _utf8mb4'Y' else _utf8mb4'' end)) stored,
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `prd_type_usi` (`account_id`, `name`) USING BTREE,
	INDEX `product_types_account_id_foreign` (`account_id`) USING BTREE,
	CONSTRAINT `product_types_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=199
;
