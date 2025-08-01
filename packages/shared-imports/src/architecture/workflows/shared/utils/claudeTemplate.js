/**
 * CLAUDE.md Document Template
 * Future-proof behavioral guide
 */

export function claudeTemplate(params) {
  const currentDate = new Date().toISOString().split("T")[0];
  
  return `# CLAUDE.md - WhatsFresh Working Guide
*Working documentation - stays current because Claude depends on it daily*

## 🧠 Core Behavior
- **Tone**: Concise, technical, respectful, minimally verbose
- **Code Style**: NO comments unless explicitly requested
- **Philosophy**: MVP development - break and fix over backward compatibility
- **Modularization**: Always try to modularize code if a module gets complicated

## 📖 Documentation Priority
1. **\`.kiro/steering.yaml\`** - Live project patterns and file paths
2. **\`CLAUDE.md\`** - This file - behavioral preferences
3. **\`AI/collaboration-rules.md\`** - Role boundaries
4. **\`AI/session-startup.md\`** - Context recovery

## 🎛️ Investigation Efficiency
- **Check steering.yaml first** for frequent_paths before searching
- **Reference established_patterns** to avoid re-investigation
- **Focus on deep_investigation areas** where decisions are needed

## 🔧 Workflow Helpers
- **createDoc.js** - Shared document creation with impact tracking
- **createPlanImpact.js** - Impact tracking for all file changes
- **Co-located templates** - Templates live with workflows (Template.js)

## 📋 Quick Fix Impact Tracking
When making spontaneous edits:
1. **Make changes** using appropriate tools
2. **Track impact immediately**:
\`\`\`bash
curl -X POST http://localhost:3001/api/execDML -H "Content-Type: application/json" \\
-d '{"method": "INSERT", "table": "api_wf.plan_impacts", "data": {"plan_id": 0, "file_path": "[PATH]", "change_type": "[TYPE]", "description": "[DESC]", "status": "completed", "userID": "claude"}}'
\`\`\`
3. **Plan 0000 "Adhoc-Operations"** for all quick fixes

## 🤝 Collaboration
- **Claude**: Architecture, analysis, investigation support
- **Kiro**: Implementation, testing, impact tracking
- **Communication**: Via \`.kiro/communication/coordination-log.json\`

## 🚀 Session Management
- **Startup**: Check session-startup.md and coordination-log.json
- **Plan Context**: Wait for "Plan NNNN" signal
- **Token Conservation**: Batch calls, reference docs, use TodoWrite

*Updated: ${currentDate}*`;
}

export default claudeTemplate;