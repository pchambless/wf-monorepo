-- ============================================================================
-- Add Startup Queries to AISql Table
-- Run this SQL to enable database-driven session startup for both agents
-- ============================================================================

USE api_wf;

-- 1. Active Plans
INSERT INTO AISql (category, qryName, qrySQL, description, created_by, active)
VALUES (
  'startup',
  'startup_active_plans',
  'SELECT id, name, status, description, created_at FROM api_wf.plans WHERE active = 1 ORDER BY id DESC LIMIT 10',
  'Get active development plans at session startup',
  'kiro',
  1
);

-- 2. Investigation Tools Available
INSERT INTO AISql (category, qryName, qrySQL, description, created_by, active)
VALUES (
  'startup',
  'startup_investigation_tools',
  'SELECT category, qryName, description FROM api_wf.AISql WHERE active = 1 AND category = ''investigation'' ORDER BY usage_count DESC',
  'List available investigation queries for agents',
  'kiro',
  1
);

-- 3. Recent Impacts
INSERT INTO AISql (category, qryName, qrySQL, description, created_by, active)
VALUES (
  'startup',
  'startup_recent_impacts',
  'SELECT plan_id, file_path, change_type, description, created_at, created_by FROM api_wf.plan_impacts ORDER BY created_at DESC LIMIT 20',
  'Get recent file changes and impacts',
  'kiro',
  1
);

-- 4. System Health Check
INSERT INTO AISql (category, qryName, qrySQL, description, created_by, active)
VALUES (
  'startup',
  'startup_system_health',
  'SELECT (SELECT COUNT(*) FROM api_wf.plans WHERE active = 1) as active_plans, (SELECT COUNT(*) FROM api_wf.eventSQL WHERE active = 1) as active_queries, (SELECT COUNT(*) FROM api_wf.eventType WHERE active = 1) as active_eventtypes, (SELECT COUNT(*) FROM api_wf.page_registry WHERE active = 1) as active_pages',
  'System health metrics at startup',
  'kiro',
  1
);

-- 5. Recent Communications
INSERT INTO AISql (category, qryName, qrySQL, description, created_by, active)
VALUES (
  'startup',
  'startup_recent_communications',
  'SELECT plan_id, from_agent, to_agent, type, subject, created_at FROM api_wf.plan_communications ORDER BY created_at DESC LIMIT 10',
  'Recent agent coordination messages',
  'kiro',
  1
);

-- Verify the queries were added
SELECT 
  id,
  category,
  qryName,
  description,
  created_at
FROM AISql 
WHERE category = 'startup' 
ORDER BY id;
