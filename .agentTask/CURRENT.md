# CURRENT.md – Phase 1 Tasks: Studio2 Minimal Navigation

## Overview
Rebuild Studio2's minimal navigation on the `studio2.studio` page using dropdowns for selecting App and Page. Leverage eventSQLs `selApps` and `selAppPages` (by `qryName`) for source data.

Dropdowns will initially be implemented directly on the main studio2.studio page. Consideration for moving them to the appbar is deferred (TBD after evaluation).

---

## Phase 1: Targeted Tasks

### 1. Implement App/Page Dropdowns on `studio2.studio`
- **Agent:** Claude
- Use `eventSQL` named `SelApps` as the data source for the App dropdown (list of available apps).
- Use `eventSQL` named `SelAppPages` as the data source for the Page dropdown (filtered by selected App).
- This is new ground, but Dev created eventComp_xref entries id in (178, 179) 
- Ensure both dropdowns function together: selecting an App loads its Pages. 
  This will involve trigger creation. 
- Provide clear loading/empty state handling when queries return no results.

### 2. Wiring and Data Handling
- **Agent:** Frontend/Studio2 Developer / Data Integration
- Confirm integration with existing eventSQL query execution and result handling utilities.
- Test real data responses and update dropdown logic as needed.

### 3. UI/UX Considerations
- **Agent:** UX/UI Designer (with FE Developer)
- Ensure dropdowns blend minimally and cleanly into the Studio2 navigation section.
- Placeholder and error states designed.
- Provide visual cues for loading, empty, or error conditions.

### 4. Review & Feedback
- **Agent:** Project Lead / Stakeholders
- Validate basic navigation via dropdowns.
- Collect team feedback before wider deployment.

---

## Notes / Decisions
- **Do NOT** integrate dropdowns into the appbar yet; keep logic modular if possible for easy migration.
- Any substantial eventSQL or query integration issues should be documented in this file.
- Update this file as progress continues into Phase 2 or if agent responsibilities shift.
- **DevNotes** this is a completely new 'custom' page.  We will probably need to create new eventComp_xref components as we build out this studio2.studo page.  
We will need to figure out the correct way to leverage the page_registry Props for 
custom pages... current for this page
{
  "tableID": "id",
  "parentID": "[appID]",
  "pageTitle": "Page Builder",
  "tableName": "api_wf.page_registry",
  "contextKey": "pageID",
  "formHeadCol": "name",
  "template_type": "custom"
} but I have no idea how this will play in custom built pages.  TBD.
---