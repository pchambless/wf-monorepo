# REPORTS - React-PDF Worksheet System

## User Idea

Implement React-PDF based worksheet generation to replace the jsPDF library approach. This follows the "don't look back" MVP philosophy - moving to a cleaner, more maintainable solution that integrates with our configuration-driven architecture.

## Current Context

- User has existing jsPDF library but acknowledges it's not developer-friendly
- Product Batch Worksheet is a critical production document for small food producers
- Legacy SQL views (v_prd_btch_dtl, v_prd_btch_ingr_dtl, v_prd_btch_task_dtl) already contain all necessary data with complex joins
- Need to integrate with BatchMapping page as action button

## Architecture Integration

This fits perfectly with our established patterns:
- **Configuration-driven**: reportMap → ReportLayout pattern
- **Event-driven**: Uses existing SQL views through eventTypes
- **Component-based**: React-PDF templates as reusable components
- **Data-driven**: Clean separation of data and presentation

## Implementation Scope

### Phase 1: Core React-PDF Infrastructure
- Add React-PDF to shared-imports
- Create base ReportLayout component
- Implement WorksheetPDF template component

### Phase 2: Data Integration
- Create productBatchWorksheet eventType
- Integrate with existing legacy SQL views
- Parameter resolution through contextStore

### Phase 3: UI Integration
- Add worksheet generation to BatchMapping page
- Implement download/print functionality
- User testing and refinement

## Success Criteria

- Generate print-ready Product Batch Worksheet matching current format
- Clean, maintainable React-PDF template code
- Seamless integration with BatchMapping workflow
- Foundation for future report types (FDA compliance, analytics)

## Dependencies

- Completion of DML auto-refresh system (Plan 0011)
- BatchMapping page functionality
- Legacy SQL views (already exist)

## Next Steps

1. Get Claude architectural review on React-PDF approach
2. Implement core React-PDF infrastructure
3. Create worksheet template matching current design
4. Integrate with BatchMapping page
5. Test with real production data

---

**Plan Status:** Investigation → Ready for Implementation  
**Coordination:** Awaiting Claude architectural guidance  
**Sprint Goal:** Production-ready worksheet generation in React-PDF