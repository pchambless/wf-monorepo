CREATE TABLE `ingredient_batches` (
	`id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Non-Intelligent ID',
	`ingredient_id` INT UNSIGNED NOT NULL,
	`shop_event_id` INT UNSIGNED NOT NULL DEFAULT '0',
	`vendor_id` INT UNSIGNED NOT NULL,
	`brand_id` INT UNSIGNED NULL DEFAULT NULL,
	`lot_number` VARCHAR(255) NOT NULL DEFAULT '' COLLATE 'utf8mb4_unicode_ci',
	`batch_number` VARCHAR(50) NOT NULL DEFAULT '-' COLLATE 'utf8mb4_unicode_ci',
	`purchase_date` DATE NOT NULL,
	`purchase_quantity` FLOAT NOT NULL DEFAULT '0',
	`global_measure_unit_id` INT UNSIGNED NOT NULL DEFAULT '51',
	`measure_id` INT UNSIGNED NULL DEFAULT NULL,
	`unit_quantity` FLOAT NOT NULL DEFAULT '0',
	`unit_price` DECIMAL(13,4) NULL DEFAULT NULL,
	`purchase_total_amount` DECIMAL(13,2) NULL DEFAULT NULL,
	`best_by_date` DATE NULL DEFAULT NULL,
	`comments` TEXT NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`created_at` TIMESTAMP NULL DEFAULT (CURRENT_TIMESTAMP),
	`created_by` VARCHAR(50) NOT NULL DEFAULT '-' COLLATE 'utf8mb4_unicode_ci',
	`updated_at` TIMESTAMP NULL DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` VARCHAR(50) NULL DEFAULT '-' COLLATE 'utf8mb4_unicode_ci',
	`deleted_at` TIMESTAMP NULL DEFAULT NULL,
	`deleted_by` VARCHAR(50) NULL DEFAULT '-' COLLATE 'utf8mb4_unicode_ci',
	`oldUUID` BINARY(16) NULL DEFAULT NULL COMMENT 'old UUID.',
	`active` CHAR(1) AS ((case when (`deleted_at` is null) then _utf8mb4'Y' else _utf8mb4'' end)) stored,
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `ingredient_id` (`ingredient_id`, `batch_number`) USING BTREE,
	INDEX `ib_ingrBtch_idx` (`id`) USING BTREE,
	INDEX `ib_ingr_idx` (`ingredient_id`) USING BTREE,
	INDEX `ib_vndr_idx` (`vendor_id`) USING BTREE,
	INDEX `ib_brnd_idx` (`brand_id`) USING BTREE,
	INDEX `ib_measure_idx` (`global_measure_unit_id`) USING BTREE,
	INDEX `ib_btch_idx` (`batch_number`) USING BTREE,
	INDEX `ib_shop_idx` (`shop_event_id`) USING BTREE
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=4096
;
