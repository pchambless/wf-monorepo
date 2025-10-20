-- EventSQL: spModuleMap
-- Phase 2: Map module dependencies from analysis JSON
-- Parameters: dependencies_json, user_id

CALL sp_module_map(:dependencies_json, :user_id);