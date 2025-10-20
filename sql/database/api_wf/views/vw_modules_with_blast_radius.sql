-- View: Modules with calculated blast radius
-- Derives blast_radius based on number of dependents

CREATE OR REPLACE VIEW api_wf.vw_modules_with_blast_radius AS
SELECT m.id, m.file_path, m.fileName, m.fileFolder, m.package, m.created_at, m.created_by, m.updated_at, m.updated_by, m.deleted_at, m.deleted_by, m.last_detected_at, m.active,

-- Count of modules that depend on this module
COALESCE(dep_counts.dependent_count, 0) as dependent_count,

-- Count of modules this module depends on
COALESCE( dep_counts.dependency_count, 0 ) as dependency_count,

-- Calculated blast radius based on dependent count
CASE
    WHEN COALESCE(dep_counts.dependent_count, 0) >= 10 THEN 'critical'
    WHEN COALESCE(dep_counts.dependent_count, 0) >= 5 THEN 'high'
    WHEN COALESCE(dep_counts.dependent_count, 0) >= 2 THEN 'medium'
    ELSE 'low'
END as calculated_blast_radius
FROM api_wf.modules m
    LEFT JOIN (
        SELECT
            m.id,
            -- Count modules that depend on this one (incoming dependencies)
            COUNT(DISTINCT mx_in.module_id) as dependent_count,
            -- Count modules this one depends on (outgoing dependencies)  
            COUNT(DISTINCT mx_out.parent_id) as dependency_count
        FROM
            api_wf.modules m
            LEFT JOIN api_wf.module_xref mx_in ON m.id = mx_in.parent_id
            AND mx_in.deleted_at IS NULL
            LEFT JOIN api_wf.module_xref mx_out ON m.id = mx_out.module_id
            AND mx_out.deleted_at IS NULL
        GROUP BY
            m.id
    ) dep_counts ON m.id = dep_counts.id
WHERE
    m.active = 1
ORDER BY dependent_count DESC, m.package, m.file_path;