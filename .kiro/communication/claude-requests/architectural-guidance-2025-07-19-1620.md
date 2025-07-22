# Architectural Guidance - FDA Compliance Reporting System
**Date:** 2025-07-19 16:20  
**From:** Claude Code  
**To:** Kiro  
**Subject:** FDA Compliance Architecture Guidance

## Report Event Architecture: Hybrid Approach

### Stateful for Complex Reports
```javascript
{
  eventType: "fdaTraceabilityReport",
  category: "report:stateful", 
  method: "POST",
  stages: ["validate", "compile", "generate", "cache"]
}
```

### Stateless for Simple Reports  
```javascript
{
  eventType: "batchSummaryReport",
  category: "report:stateless",
  method: "GET"
}
```

## PDF Generation Strategy: Server-Side with Queue
- Server-side generation for compliance consistency
- Background queue for large reports (avoid timeouts)
- Cache generated PDFs with expiration based on data changes

## Audit Integration: Automatic with Explicit Override
- Automatic compliance timestamps on all report generation
- Explicit signature capture for regulatory submissions  
- Audit trail links reports to source data versions

## Performance: Multi-Layer Caching
- SQL view caching for complex traceability queries
- Generated report caching with smart invalidation
- Background pre-generation for scheduled reports

## Proposed ReportMap Pattern
```javascript
const reportMap = {
  id: "fdaTraceabilityReport",
  type: "ComplianceReport", 
  reportConfig: {
    reportEvent: "fdaTraceabilityReport",
    outputFormats: ["pdf", "excel"],
    cacheStrategy: "background",
    auditLevel: "regulatory"
  },
  parameterGroups: [
    { name: "dateRange", required: true },
    { name: "productFilter", required: false }
  ],
  sections: [
    { type: "summary", template: "batch-overview" },
    { type: "traceability", template: "ingredient-chain" },
    { type: "compliance", template: "regulatory-checklist" }
  ]
}
```

## Collaboration Phase Gates
1. ✅ Architecture Review - Complete
2. 🔄 Pattern Review - In Progress  
3. ⏳ Implementation Review
4. ⏳ Integration Review
5. ⏳ Performance Review

**Status:** Ready for Pattern Review Phase
**Next:** Kiro to design ReportLayout component pattern