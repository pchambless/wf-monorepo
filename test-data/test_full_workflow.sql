-- Full workflow test: Load modules then map dependencies
-- This simulates the complete two-phase population process

-- Phase 1: Load modules
SET
    @modules_json = '[
  { "file_path": "apps/server/server/app.js" },
  { "file_path": "apps/server/server/middleware/errorHandler.js" },
  { "file_path": "apps/server/server/routes/api.js" },
  { "file_path": "apps/server/server/controllers/userController.js" },
  { "file_path": "apps/server/server/models/User.js" },
  { "file_path": "apps/server/server/utils/database.js" },
  { "file_path": "apps/server/server/config/config.js" },
  { "file_path": "packages/shared-imports/index.js" },
  { "file_path": "packages/shared-imports/jsx.js" },
  { "file_path": "packages/shared-imports/utils/logger.js" },
  { "file_path": "apps/client/src/App.jsx" },
  { "file_path": "apps/client/src/components/Layout.jsx" },
  { "file_path": "apps/client/src/pages/Dashboard.jsx" },
  { "file_path": "apps/client/src/services/api.js" },
  { "file_path": "apps/client/src/utils/helpers.js" }
]';

SELECT 'Phase 1: Loading modules...' as status;

CALL api_wf.sp_module_load ( @modules_json, 'test-workflow' );

-- Phase 2: Map dependencies
SET
    @dependencies_json = '[
  { "from_path": "apps/server/server/app.js", "to_path": "apps/server/server/middleware/errorHandler.js" },
  { "from_path": "apps/server/server/app.js", "to_path": "apps/server/server/routes/api.js" },
  { "from_path": "apps/server/server/app.js", "to_path": "apps/server/server/config/config.js" },
  { "from_path": "apps/server/server/routes/api.js", "to_path": "apps/server/server/controllers/userController.js" },
  { "from_path": "apps/server/server/controllers/userController.js", "to_path": "apps/server/server/models/User.js" },
  { "from_path": "apps/server/server/controllers/userController.js", "to_path": "apps/server/server/utils/database.js" },
  { "from_path": "apps/server/server/models/User.js", "to_path": "apps/server/server/utils/database.js" },
  { "from_path": "apps/client/src/App.jsx", "to_path": "apps/client/src/components/Layout.jsx" },
  { "from_path": "apps/client/src/App.jsx", "to_path": "apps/client/src/pages/Dashboard.jsx" },
  { "from_path": "apps/client/src/App.jsx", "to_path": "apps/client/src/services/api.js" },
  { "from_path": "apps/client/src/components/Layout.jsx", "to_path": "packages/shared-imports/jsx.js" },
  { "from_path": "apps/client/src/services/api.js", "to_path": "packages/shared-imports/index.js" },
  { "from_path": "apps/client/src/utils/helpers.js", "to_path": "packages/shared-imports/utils/logger.js" },
  { "from_path": "packages/shared-imports/jsx.js", "to_path": "packages/shared-imports/index.js" },
  { "from_path": "packages/shared-imports/utils/logger.js", "to_path": "packages/shared-imports/index.js" }
]';

SELECT 'Phase 2: Mapping dependencies...' as status;

CALL api_wf.sp_module_map ( @dependencies_json, 'test-workflow' );

-- Final verification and analysis
SELECT 'Final Results:' as status;

-- Module summary
SELECT 'Modules by Package' as report_type, package, COUNT(*) as count
FROM api_wf.modules
WHERE
    active = 1
GROUP BY
    package
ORDER BY package;

-- Dependency analysis with blast radius calculation
SELECT
    'Blast Radius Analysis' as report_type,
    m.file_path,
    m.package,
    COUNT(mx.to_module_id) as dependencies_out,
    (
        SELECT COUNT(*)
        FROM api_wf.module_xref mx2
        WHERE
            mx2.to_module_id = m.id
            AND mx2.deleted_at IS NULL
    ) as dependents_in,
    CASE
        WHEN (
            SELECT COUNT(*)
            FROM api_wf.module_xref mx2
            WHERE
                mx2.to_module_id = m.id
                AND mx2.deleted_at IS NULL
        ) >= 5 THEN 'high'
        WHEN (
            SELECT COUNT(*)
            FROM api_wf.module_xref mx2
            WHERE
                mx2.to_module_id = m.id
                AND mx2.deleted_at IS NULL
        ) >= 2 THEN 'medium'
        ELSE 'low'
    END as calculated_blast_radius
FROM api_wf.modules m
    LEFT JOIN api_wf.module_xref mx ON m.id = mx.from_module_id
    AND mx.deleted_at IS NULL
WHERE
    m.active = 1
GROUP BY
    m.id,
    m.file_path,
    m.package
ORDER BY dependents_in DESC, m.package, m.file_path;