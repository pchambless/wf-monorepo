CREATE TABLE IF NOT EXISTS _old_eventType (
  id int NOT NULL AUTO_INCREMENT,
    Hier int DEFAULT NULL,
    name varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
    category varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
    title varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
    style text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
    config text COLLATE utf8mb4_general_ci,
    purpose text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
    created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'Paul',
    updated_at timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    updated_by varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
    deleted_at timestamp NULL DEFAULT NULL,
    deleted_by varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
    active tinyint(1) GENERATED ALWAYS AS ((case when (deleted_at is null) then 1 else 0 end)) STORED,
    PRIMARY KEY (id),
    UNIQUE KEY name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
