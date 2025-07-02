CREATE TABLE `product_batches` (
	`id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Non-Intelligent ID',
	`product_id` INT UNSIGNED NOT NULL,
	`batch_start` TIMESTAMP NULL DEFAULT NULL,
	`batch_number` VARCHAR(50) NOT NULL DEFAULT '-' COLLATE 'utf8mb4_unicode_ci',
	`location` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`batch_quantity` DOUBLE NULL DEFAULT NULL,
	`global_measure_unit_id` INT UNSIGNED NOT NULL DEFAULT '51',
	`measure_id` INT UNSIGNED NULL DEFAULT NULL,
	`best_by_date` DATE NULL DEFAULT NULL,
	`comments` TEXT NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`recipe_multiply_factor` DOUBLE NULL DEFAULT NULL,
	`created_at` TIMESTAMP NULL DEFAULT (CURRENT_TIMESTAMP),
	`created_by` VARCHAR(50) NOT NULL DEFAULT '-' COLLATE 'utf8mb4_unicode_ci',
	`updated_at` TIMESTAMP NULL DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` VARCHAR(50) NULL DEFAULT '-' COLLATE 'utf8mb4_unicode_ci',
	`deleted_at` TIMESTAMP NULL DEFAULT NULL,
	`deleted_by` VARCHAR(50) NULL DEFAULT '-' COLLATE 'utf8mb4_unicode_ci',
	`oldUUID` BINARY(16) NULL DEFAULT NULL COMMENT 'Non-Intelligent binary UUID.',
	`active` CHAR(1) AS ((case when (`deleted_at` is null) then _utf8mb4'Y' else _utf8mb4'' end)) stored,
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `product_id` (`product_id`, `batch_number`) USING BTREE,
	INDEX `pb_prodBtch_idx` (`id`) USING BTREE,
	INDEX `pb_prod_idx` (`product_id`) USING BTREE,
	INDEX `pb_measure_idx` (`global_measure_unit_id`) USING BTREE,
	INDEX `pb_btch_idx` (`batch_number`) USING BTREE
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=4096
;
