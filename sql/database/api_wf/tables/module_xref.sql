-- Module cross-reference table for dependency mapping
-- Many-to-many self-referencing table

CREATE TABLE IF NOT EXISTS api_wf.module_xref (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_module_id INT NOT NULL,
    to_module_id INT NOT NULL,
    dependency_type ENUM('internal', 'external') DEFAULT 'internal',

-- Audit fields
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
created_by VARCHAR(50) DEFAULT 'system',
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
updated_by VARCHAR(50) DEFAULT 'system',
deleted_at TIMESTAMP NULL,
deleted_by VARCHAR(50) NULL,
last_detected_at TIMESTAMP NULL COMMENT 'Last time this dependency was detected during filesystem scan',

-- Foreign keys
FOREIGN KEY (from_module_id) REFERENCES api_wf.modules (id) ON DELETE CASCADE,
FOREIGN KEY (to_module_id) REFERENCES api_wf.modules (id) ON DELETE CASCADE,

-- Unique constraint to prevent duplicate dependencies
UNIQUE KEY unique_dependency (from_module_id, to_module_id),

-- Indexes
INDEX idx_from_module (from_module_id),
    INDEX idx_to_module (to_module_id),
    INDEX idx_dependency_type (dependency_type),
    INDEX idx_created_at (created_at),
    INDEX idx_last_detected_at (last_detected_at)
);