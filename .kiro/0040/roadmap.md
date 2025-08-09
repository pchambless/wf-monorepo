# Plan 0040 - Task Execution Roadmap

**Generated**: 2025-01-09  
**Status**: Foundation Complete (1.1, 1.2, 1.3, 6.1, 6.2, 6.3 ✅)

## Execution Strategy

This roadmap orders tasks by dependency requirements and optimal resource utilization across different AI models.

## Phase 1: Database Schema Foundation
*Next available - no blockers*

### 1. Task 2.1 - Database Schema Parser
```bash
npm run route-task 0040 2.1
```
- **Model**: gemini-flash (low complexity)
- **Estimated**: 1500-4000 tokens
- **Blocks**: 2.2, 2.3, 3.2
- **Description**: SQL parsing, mechanical work

### 2. Task 2.2 - Field Constraint Analysis  
```bash
npm run route-task 0040 2.2
```
- **Model**: gemini-flash (low complexity) 
- **Estimated**: 1500-4000 tokens
- **Depends**: 2.1
- **Blocks**: 3.2
- **Description**: Database type mapping

### 3. Task 2.3 - Foreign Key Mapping
```bash
npm run route-task 0040 2.3  
```
- **Model**: gemini-flash (low complexity)
- **Estimated**: 1500-4000 tokens
- **Depends**: None (parallel with 2.2)
- **Blocks**: 3.2
- **Description**: Relationship parsing

## Phase 2: EventType Analysis
*Can run parallel with Phase 1*

### 4. Task 3.1 - EventType Analysis
```bash
npm run route-task 0040 3.1
```
- **Model**: gpt-4o (medium complexity)
- **Estimated**: 3000-8000 tokens  
- **Blocks**: 3.2
- **Description**: Business logic extraction

## Phase 3: Integration & Templates
*Requires Phase 1 & 2 complete*

### 5. Task 4.1 - Dual-Zone Templates
```bash
npm run route-task 0040 4.1
```
- **Model**: gemini-flash (low complexity)
- **Estimated**: 1500-3000 tokens
- **Blocks**: 4.2, 4.3
- **Description**: Template file creation

### 6. Task 3.2 - Combined Schema Analysis ⚠️ HIGH PRIORITY
```bash
npm run route-task 0040 3.2
```
- **Model**: claude-sonnet (high complexity)
- **Estimated**: 6000-15000 tokens
- **Depends**: 2.1, 2.2, 2.3, 3.1
- **Blocks**: 3.3, 5.1, 5.2
- **Critical**: Blocks major workflow generation

## Phase 4: Generation Systems
*Requires Phase 3 integration*

### 7. Task 4.2 - Template Processing Engine
```bash
npm run route-task 0040 4.2
```
- **Model**: gpt-4o (medium complexity)
- **Estimated**: 3000-6000 tokens
- **Depends**: 4.1
- **Blocks**: 4.3, 5.2

### 8. Task 3.3 - Directive Output Generation  
```bash
npm run route-task 0040 3.3
```
- **Model**: gpt-4o (medium complexity)
- **Estimated**: 3000-6000 tokens
- **Depends**: 3.2
- **Blocks**: 5.1

### 9. Task 4.3 - Safe Regeneration System
```bash
npm run route-task 0040 4.3
```
- **Model**: gpt-4o (medium complexity)
- **Estimated**: 4000-8000 tokens  
- **Depends**: 4.2
- **Blocks**: 5.2, 5.3

## Phase 5: Workflow Generation
*Core MVP functionality*

### 10. Task 5.1 - Workflow Configuration Generation
```bash
npm run route-task 0040 5.1
```
- **Model**: gpt-4o (medium complexity)
- **Estimated**: 4000-8000 tokens
- **Depends**: 3.3
- **Blocks**: None (parallel with 5.2)

### 11. Task 5.2 - Co-located File Creation  
```bash
npm run route-task 0040 5.2
```
- **Model**: gemini-flash (low complexity)
- **Estimated**: 2000-4000 tokens
- **Depends**: 4.3, 3.2
- **Blocks**: 5.3

### 12. Task 5.3 - Generated File Validation
```bash
npm run route-task 0040 5.3
```
- **Model**: gemini-flash (low complexity) 
- **Estimated**: 1500-3000 tokens
- **Depends**: 5.2
- **Blocks**: None

## Phase 6: UI Integration
*High complexity, architectural work*

### 13. Task 8.1 - Connect tab-planImpacts
```bash
npm run route-task 0040 8.1
```
- **Model**: claude-sonnet (high complexity)
- **Estimated**: 5000-10000 tokens
- **Depends**: Impact processing complete (✅)
- **Description**: UI integration with existing architecture

### 14. Task 8.2 - Grid Integration
```bash
npm run route-task 0040 8.2  
```
- **Model**: claude-sonnet (high complexity)
- **Estimated**: 5000-10000 tokens
- **Depends**: 8.1
- **Description**: Complex grid component integration

### 15. Task 8.3 - Workflow-Triggered Impact Tracking
```bash
npm run route-task 0040 8.3
```
- **Model**: claude-sonnet (high complexity)
- **Estimated**: 6000-12000 tokens
- **Depends**: 8.1, 5.x complete
- **Description**: Complex workflow integration

## Phase 7: Resilience & Quality
*Can be done in parallel once core is working*

### 16-18. Tasks 7.1, 7.2, 7.3 - Impact Batching
- **Models**: gpt-4o (medium complexity)
- **Can run in parallel**
- **Non-blocking for MVP**

### 19-21. Tasks 9.1, 9.2, 9.3 - Error Handling  
- **Models**: gpt-4o (medium complexity)
- **Can run in parallel**
- **Non-blocking for MVP**

### 22-24. Tasks 10.1, 10.2, 10.3 - Testing
- **Models**: gpt-4o (medium complexity)
- **After core functionality works**

### 25-27. Tasks 11.1, 11.2, 11.3 - Deployment
- **Models**: gemini-flash/gpt-4o (low/medium complexity)
- **Final phase**

## Critical Path Summary

```
2.1 → 2.2 ↘
3.1 --------→ 3.2 → 3.3 → 5.1
4.1 → 4.2 → 4.3 -------→ 5.2 → 5.3
                         ↓
                        8.1 → 8.2 → 8.3
```

## Model Distribution

- **gemini-flash**: 8 tasks (simple file ops, parsing, validation)
- **gpt-4o**: 12 tasks (business logic, configuration, testing)  
- **claude-sonnet**: 6 tasks (architecture, integration, complex UI)

## Next Immediate Actions

1. **Start with 2.1**: Database schema parser (gemini-flash)
2. **Parallel 3.1**: EventType analysis (gpt-4o) 
3. **Complete 3.2**: Combined analysis (claude-sonnet) - CRITICAL PATH
4. **Template work**: 4.1-4.3 can proceed once 3.2 is done

**Estimated MVP Completion**: 15-20 tasks until basic genDirectives/genWorkflows automation is working.