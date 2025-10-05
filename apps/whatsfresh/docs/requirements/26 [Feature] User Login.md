# [Feature] User Login

## Description
This is a Page that Logs the user in. 

## Behavior / Flow
1. Load EventTypes.
2. User enters email address and password.
3. loginRequest is sent to server using execEvent('userLogin')

**Successfully logged in:**
1. receive pertinent user data from Server.
2. Set User variables
3. Load account the user has access to using execEvent('userAcctList')
4. Call the **accountStore** to load all the semi-static lists for the account.5. Navigate to the Welcome page.
6. PageHeader renders a Select widget with the userAccounts

## Acceptance Criteria
- [ ] PageHeader Select Account widget is populated.

## Related Components
- src\pages\Login.js
- src\stores\accountStore.js
- src\stores\eventStore.js
- src\pages\PageHeader.js



Issue #26 - Created by pchambless on 4/9/2025
