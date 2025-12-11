# Universal App Recovery Checklist

## When Universal App Stops Working

### 1. Quick Health Check
```bash
# Start the app and check browser console for health check results
npm start
# Look for: "🏥 Universal App health checks..."
```

### 2. Database Dependencies
```sql
-- Verify sp_pageStructure exists and works
CALL api_wf.sp_pageStructure(1);
-- Should return 10+ components

-- Check fetchPageStructure eventSQL
SELECT * FROM api_wf.eventSQL WHERE qryName = 'fetchPageStructure';
-- Should exist and be active=1

-- Verify template page exists
SELECT * FROM api_wf.page_registry WHERE id = 11;
-- Should be the CRUD template page
```

### 3. Component Dependencies
Check these files exist and have correct content:

- `apps/universal-app/src/rendering/renderers/GridRenderer.js` - Contains `GridComponent`
- `apps/universal-app/src/rendering/PageRenderer.jsx` - Imports and uses `GridComponent`
- `apps/universal-app/src/utils/fetchConfig.js` - Contains `fetchPageStructure`
- `apps/universal-app/src/utils/healthCheck.js` - Health check system

### 4. Server Dependencies
```bash
# Check server is running
curl http://localhost:3002/api/auth/session

# Check API endpoint works
curl -X POST http://localhost:3002/api/execEvent \
  -H "Content-Type: application/json" \
  -d '{"qryName":"fetchEventTypeConfig"}'
```

### 5. Common Issues & Fixes

#### Grid Not Rendering
- Check `GridComponent` is imported in PageRenderer.jsx
- Verify `comp_type === "Grid"` handler exists
- Check Grid component has `columns` and `workflowTriggers.onRefresh`

#### Page Structure Empty
- Verify `sp_pageStructure` returns data
- Check `fetchPageStructure` eventSQL is active
- Ensure pageID exists in page_registry

#### Authentication Errors
- Check session cookie exists
- Verify server is running on port 3002
- Clear browser cache/cookies if needed

#### Import Errors
- Check all file paths are correct
- Verify shared-imports package is installed
- Run `npm install` if needed

### 6. Nuclear Option - Restore from Known Good State

If all else fails, restore these key files:

1. **PageRenderer.jsx** - Grid handling:
```javascript
if (comp_type === "Grid") {
  return <GridComponent
    key={id}
    component={component}
    renderComponent={renderComponent}
    contextStore={contextStore}
    config={config}
    setData={setData}
  />;
}
```

2. **GridRenderer.js** - Must export `GridComponent`

3. **App.jsx** - Must import and run health checks

4. **Database** - Restore sp_pageStructure if corrupted

### 7. Prevention

- Always run health checks after changes
- Test with multiple pageIDs (1, 9, 12)
- Validate Grid rendering works
- Check browser console for errors
- Document any custom changes

### 8. Emergency Contacts

If recovery fails:
- Check Plan 1 communications for similar issues
- Search for "Universal App" or "Grid" in plan_communications
- Look for recent stability analysis entries

## Success Indicators

✅ Health checks pass (5/5 or 4/5 with warnings only)
✅ Grid components render with data
✅ Multiple CRUD pages work (pageID 1, 9, etc.)
✅ No console errors during page load
✅ Template system working (CRUD pages use pageID=11 components)