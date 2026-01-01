CREATE TABLE `plans` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `priority` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `comments` text COLLATE utf8mb4_unicode_ci,
  `assigned_to` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT (now()),
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) GENERATED ALWAYS AS ((case when (`deleted_at` is null) then 1 else 0 end)) STORED,
  PRIMARY KEY (`id`),
  KEY `idx_plans_status` (`status`),
  KEY `idx_plans_created_by` (`created_by`)
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
