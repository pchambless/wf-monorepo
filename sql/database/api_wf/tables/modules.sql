-- Modules table for dependency tracking
-- Stores file metadata with generated columns for parsing

CREATE TABLE IF NOT EXISTS api_wf.modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_path VARCHAR(500) NOT NULL UNIQUE,
    blast_radius ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',

-- Generated columns for file parsing
fileName VARCHAR(255) GENERATED ALWAYS AS (
    SUBSTRING_INDEX(file_path, '/', -1)
) STORED,
fileFolder VARCHAR(400) GENERATED ALWAYS AS (
    CASE
        WHEN file_path LIKE '%/%' THEN SUBSTRING(
            file_path,
            1,
            LENGTH(file_path) - LENGTH(
                SUBSTRING_INDEX(file_path, '/', -1)
            ) - 1
        )
        ELSE ''
    END
) STORED,
package VARCHAR(100) GENERATED ALWAYS AS (
    CASE
        WHEN file_path LIKE 'apps/%' THEN SUBSTRING_INDEX(
            SUBSTRING_INDEX(file_path, '/', 2),
            '/',
            -1
        )
        WHEN file_path LIKE 'packages/%' THEN SUBSTRING_INDEX(
            SUBSTRING_INDEX(file_path, '/', 2),
            '/',
            -1
        )
        ELSE 'monorepo'
    END
) STORED,

-- Virtual column for active status (soft delete pattern)
active BOOLEAN GENERATED ALWAYS AS (deleted_at IS NULL) VIRTUAL,

-- Audit fields
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
created_by VARCHAR(50) DEFAULT 'system',
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
updated_by VARCHAR(50) DEFAULT 'system',
deleted_at TIMESTAMP NULL,
deleted_by VARCHAR(50) NULL,
last_detected_at TIMESTAMP NULL COMMENT 'Last time this file was detected during filesystem scan',

-- Indexes
INDEX idx_file_path (file_path),
    INDEX idx_package (package),
    INDEX idx_blast_radius (blast_radius),
    INDEX idx_active (active),
    INDEX idx_created_at (created_at),
    INDEX idx_last_detected_at (last_detected_at)
);