CREATE TABLE `product_batch_tasks` (
	`id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Not-Intelligent ID',
	`product_batch_id` BIGINT NULL DEFAULT NULL,
	`task_id` INT UNSIGNED NOT NULL,
	`comments` TEXT NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`workers` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`measure_value` DECIMAL(10,2) NULL DEFAULT NULL,
	`created_at` TIMESTAMP NULL DEFAULT (CURRENT_TIMESTAMP),
	`created_by` VARCHAR(50) NOT NULL DEFAULT '-' COLLATE 'utf8mb4_unicode_ci',
	`updated_at` TIMESTAMP NULL DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` VARCHAR(50) NULL DEFAULT '-' COLLATE 'utf8mb4_unicode_ci',
	`deleted_at` TIMESTAMP NULL DEFAULT NULL,
	`deleted_by` VARCHAR(50) NULL DEFAULT '-' COLLATE 'utf8mb4_unicode_ci',
	`oldUUID` BINARY(16) NULL DEFAULT NULL COMMENT 'old UUID.',
	`active` CHAR(1) AS ((case when (`deleted_at` is null) then _utf8mb4'Y' else _utf8mb4'' end)) stored,
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `pbt_task_idx` (`task_id`) USING BTREE,
	INDEX `pbt_btch_idx` (`product_batch_id`) USING BTREE
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=32768
;
