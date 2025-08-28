CREATE TABLE `products` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`account_id` INT UNSIGNED NOT NULL,
	`name` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`code` VARCHAR(5) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`product_type_id` INT UNSIGNED NOT NULL,
	`description` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`recipe_quantity` INT UNSIGNED NOT NULL DEFAULT '0',
	`global_measure_unit_id` INT UNSIGNED NOT NULL,
	`measure_id` INT UNSIGNED NULL DEFAULT NULL,
	`best_by_days` INT UNSIGNED NOT NULL DEFAULT '365',
	`location` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`upc_item_reference` VARCHAR(2) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`upc_check_digit` VARCHAR(1) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`created_at` TIMESTAMP NULL DEFAULT NULL,
	`updated_at` TIMESTAMP NULL DEFAULT NULL,
	`deleted_at` TIMESTAMP NULL DEFAULT NULL,
	`created_by` INT UNSIGNED NULL DEFAULT NULL,
	`deleted_by` INT UNSIGNED NULL DEFAULT NULL,
	`updated_by` INT UNSIGNED NULL DEFAULT NULL,
	`active` CHAR(1) AS ((case when (`deleted_at` is null) then _utf8mb4'Y' else _utf8mb4'' end)) stored,
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `prd_usi` (`product_type_id`, `name`) USING BTREE,
	INDEX `products_account_id_foreign` (`account_id`) USING BTREE,
	INDEX `products_product_type_id_foreign` (`product_type_id`) USING BTREE,
	INDEX `products_global_measure_unit_id_foreign` (`global_measure_unit_id`) USING BTREE,
	CONSTRAINT `products_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT `products_global_measure_unit_id_foreign` FOREIGN KEY (`global_measure_unit_id`) REFERENCES `global_measure_units` (`id`) ON UPDATE NO ACTION ON DELETE CASCADE,
	CONSTRAINT `products_product_type_id_foreign` FOREIGN KEY (`product_type_id`) REFERENCES `product_types` (`id`) ON UPDATE NO ACTION ON DELETE CASCADE
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=208
;
