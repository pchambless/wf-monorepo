CREATE TABLE `plan_documents` (
      `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      `plan_id` INT UNSIGNED NOT NULL,
      `document_type` VARCHAR(30) NOT NULL, 
      `file_path` VARCHAR(500) NOT NULL,    
      `title` VARCHAR(255) NULL,
      `author` VARCHAR(50) NULL,            -- 'claude', 'kiro', 'user'
      `status` VARCHAR(20) NULL,            -- 'draft', 'approved', 'obsolete'
      `created_at` TIMESTAMP NULL,
      `created_by` VARCHAR(50) NULL,        -- 'claude', 'kiro', 'user'
      `updated_at` TIMESTAMP NULL,
      `updated_by` VARCHAR(50) NULL,        -- 'claude', 'kiro', 'user'
      PRIMARY KEY (`id`),
      FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`),
      INDEX `idx_plan_docs_plan_id` (`plan_id`),
      INDEX `idx_plan_docs_type` (`document_type`)
  );