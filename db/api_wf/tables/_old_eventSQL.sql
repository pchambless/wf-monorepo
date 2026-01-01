CREATE TABLE `_old_eventSQL` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `qryName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `qrySQL` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `description` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '-',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Paul',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `active` tinyint(1) GENERATED ALWAYS AS ((case when (`deleted_at` is null) then 1 else 0 end)) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `USI_eventSQL` (`qryName`)
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
