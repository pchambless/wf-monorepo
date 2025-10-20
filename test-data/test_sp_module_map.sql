-- Test script for sp_module_map
-- This script tests mapping dependencies between modules
-- NOTE: Run test_sp_module_load.sql first to populate modules

-- Set the JSON input (in real usage, this would come from the application)
SET
    @dependencies_json = '[
  {
    "from_path": "apps/server/server/app.js",
    "to_path": "apps/server/server/middleware/errorHandler.js"
  },
  {
    "from_path": "apps/server/server/app.js",
    "to_path": "apps/server/server/routes/api.js"
  },
  {
    "from_path": "apps/server/server/app.js",
    "to_path": "apps/server/server/config/config.js"
  },
  {
    "from_path": "apps/server/server/routes/api.js",
    "to_path": "apps/server/server/controllers/userController.js"
  },
  {
    "from_path": "apps/server/server/controllers/userController.js",
    "to_path": "apps/server/server/models/User.js"
  },
  {
    "from_path": "apps/server/server/controllers/userController.js",
    "to_path": "apps/server/server/utils/database.js"
  },
  {
    "from_path": "apps/server/server/models/User.js",
    "to_path": "apps/server/server/utils/database.js"
  },
  {
    "from_path": "apps/client/src/App.jsx",
    "to_path": "apps/client/src/components/Layout.jsx"
  },
  {
    "from_path": "apps/client/src/App.jsx",
    "to_path": "apps/client/src/pages/Dashboard.jsx"
  },
  {
    "from_path": "apps/client/src/App.jsx",
    "to_path": "apps/client/src/services/api.js"
  },
  {
    "from_path": "apps/client/src/components/Layout.jsx",
    "to_path": "packages/shared-imports/jsx.js"
  },
  {
    "from_path": "apps/client/src/services/api.js",
    "to_path": "packages/shared-imports/index.js"
  },
  {
    "from_path": "apps/client/src/utils/helpers.js",
    "to_path": "packages/shared-imports/utils/logger.js"
  },
  {
    "from_path": "packages/shared-imports/jsx.js",
    "to_path": "packages/shared-imports/index.js"
  },
  {
    "from_path": "packages/shared-imports/utils/logger.js",
    "to_path": "packages/shared-imports/index.js"
  }
]';

-- Call the stored procedure
CALL api_wf.sp_module_map ( @dependencies_json, 'test-user' );

-- Verify the results with readable paths
SELECT
    mx.id,
    mf.file_path as from_path,
    mt.file_path as to_path,
    mx.created_at,
    mx.last_detected_at,
    -- Show derived dependency type based on package comparison
    CASE
        WHEN mf.package = mt.package THEN 'internal'
        ELSE 'external'
    END as derived_dependency_type
FROM api_wf.module_xref mx
    JOIN api_wf.modules mf ON mx.from_module_id = mf.id
    JOIN api_wf.modules mt ON mx.to_module_id = mt.id
WHERE
    mx.deleted_at IS NULL
ORDER BY mf.package, mf.file_path, mt.file_path;

-- Show dependency summary by package
SELECT
    mf.package as from_package,
    mt.package as to_package,
    COUNT(*) as dependency_count,
    CASE
        WHEN mf.package = mt.package THEN 'internal'
        ELSE 'external'
    END as dependency_type
FROM api_wf.module_xref mx
    JOIN api_wf.modules mf ON mx.from_module_id = mf.id
    JOIN api_wf.modules mt ON mx.to_module_id = mt.id
WHERE
    mx.deleted_at IS NULL
GROUP BY
    mf.package,
    mt.package
ORDER BY from_package, to_package;