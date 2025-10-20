-- View: Dependencies with derived types
-- Derives dependency_type based on package comparison

CREATE OR REPLACE VIEW api_wf.vw_dependencies_with_types AS
SELECT mx.id, mx.module_id, mx.parent_id, mx.created_at, mx.created_by, mx.updated_at, mx.updated_by, mx.deleted_at, mx.deleted_by, mx.last_detected_at, mx.active,

-- Module details (from)
mf.file_path as from_path,
mf.fileName as from_fileName,
mf.package as from_package,

-- Parent module details (to)
mt.file_path as to_path,
mt.fileName as to_fileName,
mt.package as to_package,

-- Derived dependency type based on package comparison
CASE
    WHEN mf.package = mt.package THEN 'internal'
    ELSE 'external'
END as derived_dependency_type,

-- Additional context
CASE
    WHEN mf.package = mt.package THEN CONCAT('Within ', mf.package)
    ELSE CONCAT(mf.package, ' → ', mt.package)
END as dependency_context
FROM api_wf.module_xref mx
    JOIN api_wf.modules mf ON mx.module_id = mf.id
    JOIN api_wf.modules mt ON mx.parent_id = mt.id
WHERE
    mx.active = 1
    AND mf.active = 1
    AND mt.active = 1
ORDER BY mf.package, mf.file_path, mt.package, mt.file_path;