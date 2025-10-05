CREATE TABLE `plan_documents` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`plan_id` INT UNSIGNED NOT NULL,
	`document_type` VARCHAR(30) NOT NULL COLLATE 'utf8mb4_general_ci',
	`file_path` VARCHAR(500) NOT NULL COLLATE 'utf8mb4_general_ci',
	`title` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`author` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`status` VARCHAR(20) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`created_at` TIMESTAMP NULL DEFAULT (now()),
	`created_by` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` TIMESTAMP NULL DEFAULT NULL,
	`updated_by` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`deleted_by` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `idx_plan_docs_plan_id` (`plan_id`) USING BTREE,
	INDEX `idx_plan_docs_type` (`document_type`) USING BTREE,
	CONSTRAINT `plan_documents_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=48
;