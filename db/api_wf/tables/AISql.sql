CREATE TABLE IF NOT EXISTS AISql (
  id int NOT NULL AUTO_INCREMENT,
    category varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'investigation, testing, validation, context',
    qryName varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    qrySQL text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT 'Use :paramName syntax',
    description varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '-',
    usage_count int DEFAULT '0',
    created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'claude',
    updated_at timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    updated_by varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    deleted_at timestamp NULL DEFAULT NULL,
    deleted_by varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    active tinyint(1) GENERATED ALWAYS AS ((case when (deleted_at is null) then 1 else 0 end)) STORED,
    PRIMARY KEY (id),
    UNIQUE KEY USI_AISql (qryName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
