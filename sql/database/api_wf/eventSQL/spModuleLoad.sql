-- EventSQL: spModuleLoad
-- Phase 1: Load modules from analysis JSON
-- Parameters: modules_json, user_id

CALL sp_module_load(:modules_json, :user_id);