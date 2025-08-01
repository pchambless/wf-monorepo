CREATE TABLE `plan_impacts` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`plan_id` INT UNSIGNED NOT NULL,
	`file_path` VARCHAR(500) NOT NULL COLLATE 'utf8mb4_general_ci',
	`phase` VARCHAR(20) NOT NULL DEFAULT 'idea' COLLATE 'utf8mb4_general_ci',
	`change_type` VARCHAR(20) NOT NULL COLLATE 'utf8mb4_general_ci',
	`status` VARCHAR(20) NOT NULL DEFAULT 'pending' COLLATE 'utf8mb4_general_ci',
	`description` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`created_at` TIMESTAMP NULL DEFAULT NULL,
	`created_by` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`updated_at` TIMESTAMP NULL DEFAULT NULL,
	`updated_by` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`fileName` VARCHAR(255) AS (substring_index(`file_path`,_utf8mb4'/',-(1))) stored,
	`fileFolder` VARCHAR(255) AS (substr(`file_path`,1,((length(`file_path`) - length(substring_index(`file_path`,_utf8mb4'/',-(1)))) - 1))) stored,
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `idx_plan_impacts_plan_id` (`plan_id`) USING BTREE,
	INDEX `idx_plan_impacts_file` (`file_path`) USING BTREE,
	INDEX `Idx_plan_impacts_phase` (`phase`) USING BTREE,
	INDEX `idx_plan_impacts_folder` (`fileFolder`) USING BTREE,
	CONSTRAINT `plan_impacts_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=124
;
