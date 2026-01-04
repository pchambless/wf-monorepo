CREATE TABLE IF NOT EXISTS _old_eventProps (
  id int NOT NULL AUTO_INCREMENT,
    xref_id int DEFAULT NULL,
    pageID int DEFAULT NULL,
    paramName varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    paramVal text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
    created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Paul',
    updated_at timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    updated_by varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    deleted_at timestamp NULL DEFAULT NULL,
    deleted_by varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    active tinyint(1) GENERATED ALWAYS AS ((case when (deleted_at is null) then 1 else 0 end)) STORED,
    PRIMARY KEY (id),
    KEY eventProps_eventType_xref_FK (xref_id),
    KEY idx_xref_page (xref_id,pageID),
    CONSTRAINT eventProps_eventComp_xref_FK FOREIGN KEY (xref_id) REFERENCES _old_eventComp_xref (id) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
