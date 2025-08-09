/* 
 * UserAcctList View
 * 
 * Description: Returns user-account relationships for active users and accounts
 * 
 * Fields:
 * - acctID: Account identifier
 * - acctName: Account display name
 * - userID: User identifier  
 * - firstName: User's first name
 * 
 * Usage: Used for loading user account associations in authentication flows
 */

CREATE OR REPLACE VIEW userAcctList AS
SELECT 
    c.id AS acctID,
    c.name AS acctName,
    a.id AS userID,
    a.first_name AS firstName
FROM users a
JOIN accounts_users b ON a.id = b.user_id
JOIN accounts c ON b.account_id = c.id
WHERE a.active = 'Y' 
  AND c.active = 'Y'
ORDER BY a.id, c.name;