CREATE TABLE `plan_communications` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`plan_id` INT UNSIGNED NOT NULL,
	`from_agent` VARCHAR(20) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`to_agent` VARCHAR(20) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`type` VARCHAR(30) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`subject` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`message` TEXT NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`status` VARCHAR(50) NOT NULL DEFAULT 'pending' COLLATE 'utf8mb4_unicode_ci',
	`created_at` TIMESTAMP NULL DEFAULT (now()),
	`created_by` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`deleted_at` TIMESTAMP NULL DEFAULT NULL,
	`deleted_by` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `idx_plan_comm_plan_id` (`plan_id`) USING BTREE,
	INDEX `idx_plan_comm_status` (`status`) USING BTREE,
	CONSTRAINT `plan_communications_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=24
;
