CREATE TABLE `api_wf.plans` (
        `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
        `cluster` VARCHAR(20) NOT NULL COLLATE 'utf8mb4_unicode_ci',
        `name` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
        `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COLLATE 'utf8mb4_unicode_ci',
        `priority` VARCHAR(20) NOT NULL DEFAULT 'medium' COLLATE 'utf8mb4_unicode_ci',
        `description` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
        `created_by` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_unicode_ci',
        `assigned_to` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
        `started_at` TIMESTAMP NULL DEFAULT NULL,
        `completed_at` TIMESTAMP NULL DEFAULT NULL,
        `created_at` TIMESTAMP NULL DEFAULT NULL,
        `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
        `deleted_at` TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (`id`),
        INDEX `idx_plans_status` (`status`),
        INDEX `idx_plans_cluster` (`cluster`),
        INDEX `idx_plans_created_by` (`created_by`)
  )
  COLLATE='utf8mb4_unicode_ci'
  ENGINE=InnoDB
  AUTO_INCREMENT=1;