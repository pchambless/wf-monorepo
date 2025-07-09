# Session Persistence Fix - User/Account State

**Date**: 2025-07-09  
**Status**: PENDING  
**Priority**: HIGH

## Problem Description

When the browser page is refreshed, the application loses critical session state:
- `userID` is lost → `userAcctList` event fails (needs `userID` parameter)
- `acctID` is lost → account selection is reset
- `SelUserAcct` component displays "No accounts available"

This breaks the user experience and requires re-authentication/account selection after every refresh.

## Root Cause Analysis

The current authentication flow works initially:
1. User logs in → `userID` is set in memory
2. `userAcctList` event fetches accounts for that `userID`
3. User selects account → `acctID` is set in memory
4. Pages work correctly with both `userID` and `acctID`

**On page refresh**: Both `userID` and `acctID` are lost from memory, breaking the entire flow.

## Proposed Solution

### Phase 1: Identify Current State Management
- [ ] Investigate existing auth/state management in shared-imports
- [ ] Check if there's a user/auth context component
- [ ] Review navigation component's account selection logic
- [ ] Identify where `userID` and `acctID` are currently stored

### Phase 2: Implement Session Persistence
**Options to evaluate:**
1. **localStorage/sessionStorage** - Store `userID` and `acctID` in browser storage
2. **JWT tokens** - Include user info in authentication token
3. **URL parameters** - Include user/account info in routes
4. **Session cookies** - Server-side session management

### Phase 3: Restore State on App Load
- [ ] Implement state restoration logic in app initialization
- [ ] Ensure `userAcctList` event is called with restored `userID`
- [ ] Restore selected `acctID` and update `SelUserAcct` component
- [ ] Test refresh behavior across different pages

## Technical Details

### Key Components Involved
- `SelUserAcct` component (shows "No accounts available")
- `userAcctList` event (requires `userID` parameter)
- Navigation component (handles account selection)
- Authentication flow (sets initial `userID`)

### Event Dependencies
```
userLogin → userID → userAcctList → acctID → page functionality
```

## Success Criteria
- [ ] Page refresh maintains user session
- [ ] `SelUserAcct` shows correct accounts after refresh
- [ ] Selected account remains active after refresh
- [ ] No re-authentication required on refresh
- [ ] Works across all pages in the application

## Notes
- This is a foundational fix that affects all CRUD pages
- May require updates to shared-imports components
- Should be tested thoroughly across different browsers
- Consider security implications of chosen persistence method

---

**Next Steps**: Investigate current state management implementation before choosing persistence strategy.