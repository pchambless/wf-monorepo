-- View: Module Impact Analysis
-- Comprehensive view for impact analysis and blast radius assessment

CREATE OR REPLACE VIEW api_wf.vw_module_impact_analysis AS
SELECT m.id, m.file_path, m.fileName, m.fileFolder, m.package, m.last_detected_at,

-- Dependency counts
COALESCE(impact.dependent_count, 0) as dependent_count,
COALESCE(impact.dependency_count, 0) as dependency_count,
COALESCE(impact.internal_dependents, 0) as internal_dependents,
COALESCE(impact.external_dependents, 0) as external_dependents,
COALESCE(
    impact.internal_dependencies,
    0
) as internal_dependencies,
COALESCE(
    impact.external_dependencies,
    0
) as external_dependencies,

-- Calculated blast radius
CASE
    WHEN COALESCE(impact.dependent_count, 0) >= 10 THEN 'critical'
    WHEN COALESCE(impact.dependent_count, 0) >= 5 THEN 'high'
    WHEN COALESCE(impact.dependent_count, 0) >= 2 THEN 'medium'
    ELSE 'low'
END as blast_radius,

-- Impact score (weighted calculation)
(
    COALESCE(impact.dependent_count, 0) * 2 + COALESCE(impact.external_dependents, 0) * 3
) as impact_score,

-- Module classification
CASE 
        WHEN COALESCE(impact.dependent_count, 0) = 0 AND COALESCE(impact.dependency_count, 0) = 0 THEN 'isolated'
        WHEN COALESCE(impact.dependent_count, 0) = 0 THEN 'leaf'
        WHEN COALESCE(impact.dependency_count, 0) = 0 THEN 'root'
        WHEN COALESCE(impact.dependent_count, 0) >= 5 THEN 'hub'
        ELSE 'connector'
    END as module_type

FROM api_wf.modules m
LEFT JOIN (
    SELECT 
        m.id,
        -- Total counts
        COUNT(DISTINCT mx_in.module_id) as dependent_count,
        COUNT(DISTINCT mx_out.parent_id) as dependency_count,

-- Internal/External breakdown for dependents (modules that depend on this one)
COUNT(
    DISTINCT CASE
        WHEN mx_in.module_id IS NOT NULL
        AND mf_in.package = m.package THEN mx_in.module_id
    END
) as internal_dependents,
COUNT(
    DISTINCT CASE
        WHEN mx_in.module_id IS NOT NULL
        AND mf_in.package != m.package THEN mx_in.module_id
    END
) as external_dependents,

-- Internal/External breakdown for dependencies (modules this one depends on)
COUNT(DISTINCT CASE 
            WHEN mx_out.parent_id IS NOT NULL AND mt_out.package = m.package 
            THEN mx_out.parent_id 
        END) as internal_dependencies,
        COUNT(DISTINCT CASE 
            WHEN mx_out.parent_id IS NOT NULL AND mt_out.package != m.package 
            THEN mx_out.parent_id 
        END) as external_dependencies
        
    FROM api_wf.modules m
    LEFT JOIN api_wf.module_xref mx_in ON m.id = mx_in.parent_id AND mx_in.deleted_at IS NULL
    LEFT JOIN api_wf.modules mf_in ON mx_in.module_id = mf_in.id AND mf_in.deleted_at IS NULL
    LEFT JOIN api_wf.module_xref mx_out ON m.id = mx_out.module_id AND mx_out.deleted_at IS NULL
    LEFT JOIN api_wf.modules mt_out ON mx_out.parent_id = mt_out.id AND mt_out.deleted_at IS NULL
    GROUP BY m.id
) impact ON m.id = impact.id

WHERE m.active = 1
ORDER BY impact_score DESC, blast_radius DESC, m.package, m.file_path;