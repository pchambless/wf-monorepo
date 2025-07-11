# User Input 
When the user switches accounts, they should be redirected to the dashboard.  Switching accounts works fine, but we stay on the same page with the old acct data.  if I switch to a new page, it displays the new acct data.

It may help to reference this plan:   b-completed/2025-07-10 User Login.md as we did a lot of work on what may be the same areas.

<!-- planPhase: Investigation only -->

## Investigation Results

### Current Account Switching Architecture

**Key Files:**
- `apps/wf-client/src/pages/dashboard/Presenter.js:63-73` - Main account switching logic
- `apps/wf-client/src/services/accountService.js:49-76` - Service with optional navigation
- `packages/shared-imports/src/stores/contextStore.js` - State management

### Root Cause Analysis

**Current Implementation:**
- Account switching updates `contextStore.acctID` parameter correctly
- Dashboard `handleAccountChange()` function explicitly avoids navigation (line 70-72)
- Comment states: "No need to navigate or reload - the state change will trigger re-renders"

**The Problem:**
1. **State Updates Work:** `contextStore.setParameter('acctID', newAccountId)` updates correctly
2. **Navigation Doesn't Happen:** Dashboard presenter intentionally stays on current page
3. **Data Doesn't Refresh:** Current page continues showing old account data until manual navigation

### Implementation Strategy

**Required Changes:**
1. **Dashboard Presenter** (`Presenter.js:63-73`): Add navigation to `/dashboard` after account change
2. **Service Integration**: Use existing `accountService.switchAccount()` with navigation parameters
3. **Context Store**: Ensure data refresh triggers are in place

**Key Dependencies:**
- `react-router-dom` navigation hook (already available in React components)
- `accountService.switchAccount()` already supports navigation parameters
- `contextStore` state changes should trigger re-renders on dashboard

### Technical Details

**Current Dashboard handleAccountChange():**
```javascript
const handleAccountChange = useCallback((newAccountId) => {
  log.info('Account changed', { from: currentAcctID, to: newAccountId });
  setCurrentAcctID(newAccountId);
  contextStore.setParameter('acctID', newAccountId);
  
  // Currently: "No need to navigate or reload"
  // Needed: Navigate to dashboard for fresh data
  log.info('Account changed successfully, no navigation needed');
}, [currentAcctID]);
```

**Available Service Method:**
```javascript
// accountService.js already supports navigation
async switchAccount(accountId, navigate = null, shouldNavigate = false)
```

### Solution Approach

**Option 1: Minimal Change (Recommended)**
- Add `useNavigate` hook to Dashboard presenter
- Modify `handleAccountChange` to call `navigate('/dashboard')` after state update
- Preserve existing state management patterns

**Option 2: Service Integration**
- Replace local logic with `accountService.switchAccount()` call
- Pass navigation function and `shouldNavigate: true`
- More consistent with service layer architecture

### Files to Modify

1. `apps/wf-client/src/pages/dashboard/Presenter.js` - Add navigation after account change ✅
2. Possibly update imports for `useNavigate` from `react-router-dom` ✅

## Fix Applied

**Changes Made:**
1. Added `useNavigate` hook import and usage in Dashboard presenter
2. Modified `handleAccountChange` to navigate to `/dashboard` after account switch
3. Updated dependency array to include `navigate`

**Results:**
- Navigation to dashboard now works correctly after account switch
- **New Issue Discovered:** SelUserAcct widget shows "Select..." after account switch
- Widget value reappears when navigating to other pages

## New Issue: Widget State Synchronization

**Problem:** SelUserAcct widget loses its selected value after account switch and navigation, even though the underlying state is correct.

**Root Cause Found:** Using incorrect contextStore pattern from previous fix.

## Final Fix Applied

**Issue:** Dashboard was using old pattern `contextStore.setParameter('acctID', newAccountId)` instead of the proper `contextStore.setEvent('userAcctList', newAccountId)` pattern that was established in the previous SelUserAcct fix.

**Solution:** Updated Dashboard presenter to use `contextStore.setEvent('userAcctList', newAccountId)` which:
- Properly manages account selection and widget state synchronization
- Maintains SelUserAcct widget selection throughout the session
- Clears child parameters appropriately
- Preserves navigation functionality

**Status:** ✅ Complete - Account switching now navigates to dashboard AND maintains proper widget state.

## Minor Issue Remaining

**Symptom:** SelUserAcct widget briefly shows "Select..." after account switch before displaying correct account
**Impact:** Cosmetic only - all functionality works correctly (navigation, data refresh, session persistence)
**Priority:** Low - minor UX polish item for future consideration