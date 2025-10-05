CREATE TABLE `shop_event` (
	`id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Non-Intelligent ID',
	`account_id` INT UNSIGNED NOT NULL,
	`shop_date` TIMESTAMP NULL DEFAULT (now()),
	`vendor_id` INT UNSIGNED NOT NULL,
	`total_amount` DECIMAL(13,2) NULL DEFAULT NULL,
	`comments` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`created_at` TIMESTAMP NULL DEFAULT (now()),
	`created_by` VARCHAR(50) NOT NULL DEFAULT '-' COLLATE 'utf8mb4_unicode_ci',
	`updated_at` TIMESTAMP NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` VARCHAR(50) NULL DEFAULT '-' COLLATE 'utf8mb4_unicode_ci',
	`deleted_at` TIMESTAMP NULL DEFAULT NULL,
	`deleted_by` VARCHAR(50) NULL DEFAULT '-' COLLATE 'utf8mb4_unicode_ci',
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `se_shop_idx` (`id`) USING BTREE
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=2048
;
