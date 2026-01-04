CREATE TABLE IF NOT EXISTS module_xref (
  id int NOT NULL AUTO_INCREMENT,
    module_id int NOT NULL,
    parent_id int NOT NULL,
    dependency_type enum('internal','external') COLLATE utf8mb4_general_ci DEFAULT 'internal',
    created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    updated_at timestamp NULL DEFAULT NULL,
    updated_by varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    last_detected_at timestamp NULL DEFAULT NULL,
    deleted_at timestamp NULL DEFAULT NULL,
    deleted_by varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    active tinyint(1) GENERATED ALWAYS AS ((case when (last_detected_at = updated_at) then 1 else 0 end)) STORED,
    PRIMARY KEY (id),
    KEY module_xref_idx_module (module_id),
    KEY module_xref_idx_parent (parent_id),
    CONSTRAINT module_xref_ibfk_1 FOREIGN KEY (module_id) REFERENCES modules (id) ON DELETE CASCADE,
    CONSTRAINT module_xref_ibfk_2 FOREIGN KEY (parent_id) REFERENCES modules (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
