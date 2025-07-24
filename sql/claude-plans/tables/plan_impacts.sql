CREATE TABLE `plan_impacts` (
      `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      `plan_id` INT UNSIGNED NOT NULL,
      `file_path` VARCHAR(500) NOT NULL,
      `change_type` VARCHAR(20) NOT NULL,    -- 'create', 'modify', 'delete'
      `status` VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed'
      `description` TEXT NULL,
      `created_at` TIMESTAMP NULL,
      `created_by` VARCHAR(50) NULL,
      `updated_at` TIMESTAMP NULL,
      `updated_by` VARCHAR(50) NULL,
      PRIMARY KEY (`id`),
      FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`),
      INDEX `idx_plan_impacts_plan_id` (`plan_id`),
      INDEX `idx_plan_impacts_file` (`file_path`)
);