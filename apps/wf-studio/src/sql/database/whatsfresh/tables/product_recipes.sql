CREATE TABLE `product_recipes` (
	`id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Non-Intelligent ID',
	`product_id` INT UNSIGNED NOT NULL,
	`ingredient_id` INT UNSIGNED NOT NULL,
	`global_measure_unit_id` INT UNSIGNED NULL DEFAULT '51',
	`measure_id` INT UNSIGNED NULL DEFAULT NULL,
	`ingredient_order` INT NOT NULL DEFAULT '0',
	`quantity` DOUBLE NOT NULL DEFAULT '0',
	`comments` VARCHAR(1000) NOT NULL DEFAULT '' COLLATE 'utf8mb4_unicode_ci',
	`created_at` TIMESTAMP NULL DEFAULT (CURRENT_TIMESTAMP),
	`created_by` VARCHAR(50) NULL DEFAULT '-' COLLATE 'utf8mb4_unicode_ci',
	`updated_at` TIMESTAMP NULL DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` VARCHAR(50) NULL DEFAULT '-' COLLATE 'utf8mb4_unicode_ci',
	`deleted_at` TIMESTAMP NULL DEFAULT NULL,
	`deleted_by` VARCHAR(50) NULL DEFAULT '-' COLLATE 'utf8mb4_unicode_ci',
	`oldUUID` BINARY(16) NULL DEFAULT NULL COMMENT 'old UUID',
	`active` CHAR(1) AS ((case when (`deleted_at` is null) then _utf8mb4'Y' else _utf8mb4'' end)) stored,
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `id` (`id`, `ingredient_id`) USING BTREE,
	INDEX `pr_prodRcpe_idx` (`id`) USING BTREE,
	INDEX `pr_prod_idx` (`product_id`) USING BTREE,
	INDEX `pr_ingr_idx` (`ingredient_id`) USING BTREE
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=2048
;
