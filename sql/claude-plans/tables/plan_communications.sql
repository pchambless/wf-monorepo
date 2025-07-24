CREATE TABLE `plan_communications` (
      `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      `plan_id` INT UNSIGNED NOT NULL,
      `from_agent` VARCHAR(20) NOT NULL COLLATE 'utf8mb4_unicode_ci',
      `to_agent` VARCHAR(20) NOT NULL COLLATE 'utf8mb4_unicode_ci',
      `type` VARCHAR(30) NOT NULL COLLATE 'utf8mb4_unicode_ci',
      `subject` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
      `message` TEXT NOT NULL COLLATE 'utf8mb4_unicode_ci',
      `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COLLATE 'utf8mb4_unicode_ci',
      `created_at` TIMESTAMP NULL DEFAULT NULL,
      `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`),
      INDEX `idx_plan_comm_plan_id` (`plan_id`),
      INDEX `idx_plan_comm_status` (`status`)
  );