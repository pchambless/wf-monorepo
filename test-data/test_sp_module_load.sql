-- Test script for sp_module_load
-- This script tests loading modules into the database

-- Set the JSON input (in real usage, this would come from the application)
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

-- Call the stored procedure
CALL api_wf.sp_module_load (@modules_json, 'test-user');

-- Verify the results
SELECT
    id,
    file_path,
    fileName,
    fileFolder,
    package,
    active,
    created_at,
    last_detected_at
FROM api_wf.modules
WHERE
    active = 1
ORDER BY package, file_path;

-- Show summary statistics
SELECT package, COUNT(*) as module_count
FROM api_wf.modules
WHERE
    active = 1
GROUP BY
    package
ORDER BY package;