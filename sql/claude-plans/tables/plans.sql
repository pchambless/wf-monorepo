CREATE TABLE `plans` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`cluster` VARCHAR(20) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`name` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`status` VARCHAR(100) NOT NULL DEFAULT 'pending' COLLATE 'utf8mb4_unicode_ci',
	`priority` VARCHAR(20) NOT NULL DEFAULT 'medium' COLLATE 'utf8mb4_unicode_ci',
	`description` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`comments` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`assigned_to` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`deleted_at` TIMESTAMP NULL DEFAULT NULL,
	`deleted_by` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`created_at` TIMESTAMP NULL DEFAULT (now()),
	`created_by` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`active` TINYINT(1) AS ((case when (`deleted_at` is null) then 1 else 0 end)) stored,
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `idx_plans_status` (`status`) USING BTREE,
	INDEX `idx_plans_cluster` (`cluster`) USING BTREE,
	INDEX `idx_plans_created_by` (`created_by`) USING BTREE
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=31
;
