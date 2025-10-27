-- AI Agent Context Store Initialization
-- Creates base context records for Claude and Kiro AI agents
-- Email identifiers: claude@whatsfresh.ai, kiro@whatsfresh.ai

-- Claude AI Agent Context
INSERT INTO api_wf.context_store (email, paramName, paramVal, created_by)
VALUES
  ('claude@whatsfresh.ai', 'firstName', 'Claude', 'system'),
  ('claude@whatsfresh.ai', 'userEmail', 'claude@whatsfresh.ai', 'system'),
  ('claude@whatsfresh.ai', 'role', 'ai-architect', 'system'),
  ('claude@whatsfresh.ai', 'agent_type', 'claude', 'system'),
  ('claude@whatsfresh.ai', 'planID', NULL, 'system'),
  ('claude@whatsfresh.ai', 'currentTask', NULL, 'system')
ON DUPLICATE KEY UPDATE
  paramVal = VALUES(paramVal),
  updated_by = 'system';

-- Kiro AI Agent Context
INSERT INTO api_wf.context_store (email, paramName, paramVal, created_by)
VALUES
  ('kiro@whatsfresh.ai', 'firstName', 'Kiro', 'system'),
  ('kiro@whatsfresh.ai', 'userEmail', 'kiro@whatsfresh.ai', 'system'),
  ('kiro@whatsfresh.ai', 'role', 'ai-implementer', 'system'),
  ('kiro@whatsfresh.ai', 'agent_type', 'kiro', 'system'),
  ('kiro@whatsfresh.ai', 'planID', NULL, 'system'),
  ('kiro@whatsfresh.ai', 'currentTask', NULL, 'system')
ON DUPLICATE KEY UPDATE
  paramVal = VALUES(paramVal),
  updated_by = 'system';
