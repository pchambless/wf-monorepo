# Navigation Fix Plan

## Problem Identified
- Navigation to `/ingredients/1/ingrTypeList` works (URL changes correctly)
- Route is properly generated and should match
- BUT: Something redirects back to `/dashboard`

## Root Cause Found
- `accountService.js` line ~XX contains: `navigate('/dashboard');`
- This is called during account switching/loading
- Likely triggered when sidebar navigation occurs

## Investigation Results
1. ✅ Routes are generated correctly (`ingrTypeList` → `/ingredients/:acctID/ingrTypeList`)
2. ✅ Navigation resolves correctly (`/ingredients/1/ingrTypeList`)
3. ✅ Route matching works (debug route showed "DEBUG: Exact route matched!")
4. ❌ Something redirects back to dashboard after navigation

## Solution Plan
1. **Identify trigger**: Find what calls `accountService` during navigation
2. **Fix redirect logic**: Prevent automatic dashboard redirect during normal navigation
3. **Test navigation**: Verify ingredients page loads correctly
4. **Clean up debug code**: Remove temporary debug routes and logs

## Next Steps (for fresh chat)
- Focus on `accountService.js` and `handleAccountChange` calls
- Check if sidebar navigation triggers account change events
- Implement conditional redirect (only redirect to dashboard when appropriate)

## TurboRepo Status
- ✅ Installed and configured
- ✅ Build caching working (70s → 38s)
- ❌ Dev rebuilds still slow (shared-imports changes not picked up quickly)
- Need to investigate dev workflow optimization

## Files Modified
- `/home/paul/wf-monorepo-new/turbo.json` (created)
- `/home/paul/wf-monorepo-new/package.json` (added turbo scripts)
- `/home/paul/wf-monorepo-new/apps/wf-client/src/App.jsx` (debug routes added)