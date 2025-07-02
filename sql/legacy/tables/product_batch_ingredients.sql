CREATE TABLE `product_batch_ingredients` (
	`id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Non-Intelligent ID',
	`product_batch_id` BIGINT NOT NULL,
	`product_recipe_id` BIGINT NOT NULL,
	`ingredient_batch_id` BIGINT NULL DEFAULT NULL,
	`comments` VARCHAR(1000) NOT NULL DEFAULT '' COLLATE 'utf8mb4_unicode_ci',
	`ingredient_quantity` DECIMAL(10,3) NOT NULL DEFAULT '0.000',
	`global_measure_unit_id` INT UNSIGNED NOT NULL DEFAULT '51',
	`measure_id` INT UNSIGNED NULL DEFAULT NULL,
	`created_at` TIMESTAMP NULL DEFAULT (CURRENT_TIMESTAMP),
	`created_by` VARCHAR(50) NOT NULL DEFAULT '-' COLLATE 'utf8mb4_unicode_ci',
	`updated_at` TIMESTAMP NULL DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` VARCHAR(50) NULL DEFAULT '-' COLLATE 'utf8mb4_unicode_ci',
	`deleted_at` TIMESTAMP NULL DEFAULT NULL,
	`deleted_by` VARCHAR(50) NULL DEFAULT '-' COLLATE 'utf8mb4_unicode_ci',
	`oldUUID` BINARY(16) NULL DEFAULT NULL COMMENT 'oldUUID',
	`active` CHAR(1) AS ((case when (`deleted_at` is null) then _utf8mb4'Y' else _utf8mb4'' end)) stored,
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `prodIngrRcpe_idx` (`product_batch_id`, `product_recipe_id`, `ingredient_batch_id`) USING BTREE,
	INDEX `pbi_prodBtch_idx` (`product_batch_id`) USING BTREE,
	INDEX `pbi_ingrBtch_idx` (`ingredient_batch_id`) USING BTREE,
	INDEX `pbi_rcpe_idx` (`product_recipe_id`) USING BTREE
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=32768
;
