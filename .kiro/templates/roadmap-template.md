# Plan {{PLAN_ID}} - Task Execution Roadmap

**Generated**: {{DATE}}  
**Status**: {{COMPLETION_STATUS}}

## Execution Strategy

This roadmap orders tasks by dependency requirements and optimal resource utilization across different AI models.

{{#PHASES}}
## Phase {{PHASE_NUMBER}}: {{PHASE_NAME}}
*{{PHASE_DESCRIPTION}}*

{{#TASKS}}
### {{TASK_ORDER}}. Task {{TASK_ID}} - {{TASK_NAME}}
```bash
npm run route-task {{PLAN_ID}} {{TASK_ID}}
```
- **Model**: {{SUGGESTED_MODEL}} ({{COMPLEXITY}} complexity)
- **Estimated**: {{TOKEN_ESTIMATE}} tokens
{{#DEPENDENCIES}}
- **Depends**: {{DEPENDENCIES}}
{{/DEPENDENCIES}}
{{#BLOCKS}}
- **Blocks**: {{BLOCKS}}
{{/BLOCKS}}
{{#IS_CRITICAL}}
- **⚠️ CRITICAL PATH**
{{/IS_CRITICAL}}
- **Description**: {{TASK_DESCRIPTION}}

{{/TASKS}}
{{/PHASES}}

## Critical Path Summary

```
{{DEPENDENCY_GRAPH}}
```

## Model Distribution

- **gemini-flash**: {{GEMINI_COUNT}} tasks ({{GEMINI_TYPES}})
- **gpt-4o**: {{GPT4O_COUNT}} tasks ({{GPT4O_TYPES}})  
- **claude-sonnet**: {{CLAUDE_COUNT}} tasks ({{CLAUDE_TYPES}})

## Next Immediate Actions

{{#NEXT_ACTIONS}}
{{ACTION_ORDER}}. **{{ACTION_TASK}}**: {{ACTION_DESCRIPTION}} ({{ACTION_MODEL}})
{{/NEXT_ACTIONS}}

**Estimated MVP Completion**: {{MVP_TASK_COUNT}} tasks until {{MVP_MILESTONE}}.