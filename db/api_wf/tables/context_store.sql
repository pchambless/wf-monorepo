CREATE TABLE `context_store` (
  `id` int NOT NULL AUTO_INCREMENT,
  `paramName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `paramVal` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updates` int DEFAULT '0',
  `getVals` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `USI_context_store` (`email`,`paramName`),
  KEY `context_store_email_IDX` (`email`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=16668 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
