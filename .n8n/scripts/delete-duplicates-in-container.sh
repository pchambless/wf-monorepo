#!/bin/bash

docker exec n8n-whatsfresh sqlite3 /home/node/.n8n/database.sqlite << 'EOF'
DELETE FROM workflow_entity 
WHERE id IN (
  'WKbnUPbM51oqPxqT',
  'hcWLVergHncN9zwh',
  'j4bMIWzzMA4z6SoJ',
  'IwJDrTlU6eTPLdKP',
  'fvM38fuyrTOS75Qd',
  'TYLWkX77dz36XGDn',
  'CqkXbVOu2qqb0hzd',
  'eAWRs9idMuHgN1KF',
  'XPk2traMBYW6wxqX'
);

SELECT 'Deleted ' || changes() || ' workflows';

SELECT id, name, active, updatedAt
FROM workflow_entity
WHERE name = 'Module Dependency Analysis';
EOF

echo ""
echo "✅ Cleanup complete. Remaining 'Module Dependency Analysis' workflows shown above."
