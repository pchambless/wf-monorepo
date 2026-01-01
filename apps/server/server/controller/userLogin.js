import bcrypt from 'bcrypt';
import { createRequestBody } from '../utils/queryResolver.js';
import { executeQuery } from '../utils/dbUtils.js';
import logger from '../utils/logger.js';
import { getEventType } from '../events/index.js';
import { resetSessionCounters } from './resetSessionCounters.js';
import { setValsDirect } from './setVals.js';

const codeName = '[userLogin.js]';

// Remove cache clearing - no longer needed with package-based approach
// Object.keys(require.cache).forEach(function(key) {
//     delete require.cache[key];
// });

async function rehashPassword(userEmail, oldHash) {
    try {
        const newHash = await bcrypt.hash(oldHash, 10);
        logger.debug(`${codeName} Password rehash generated`, { userEmail });

        const updateQuery = 'UPDATE api_wf.userList SET password = ? WHERE userEmail = ?';
        await executeQuery(updateQuery, 'PATCH', [newHash, userEmail]);
        logger.info(`${codeName} Password rehashed and updated`, { userEmail });
    } catch (error) {
        logger.error(`${codeName} Error rehashing password:`, error);
        throw error;
    }
}

async function login(req, res) {
    logger.info(`${codeName} Login attempt started`);

    try {
        const { userEmail, enteredPassword } = req.body;
        const password = enteredPassword; // Support both field names

        // Get login event from shared-events
        const loginEvent = getEventType('userLogin');

        // Simple direct SQL query - bypass broken queryResolver for now
        const directSQL = `
            SELECT *
            FROM api_wf.userList
            WHERE userEmail = '${userEmail}'
        `;

        // Execute query
        const users = await executeQuery(directSQL, 'GET');

        if (!users || users.length === 0) {
            logger.info(`${codeName} User not found: ${userEmail}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];

        logger.debug(`${codeName} User found`, {
            userEmail: user.userEmail,
            hasPassword: !!user.password,
            passwordPrefix: user.password ? user.password.substring(0, 4) : 'none',
            availableFields: Object.keys(user)
        });

        // Handle bcrypt version compatibility ($2y$ -> $2b$)
        let hashToCompare = user.password;
        if (hashToCompare.startsWith('$2y$')) {
            hashToCompare = hashToCompare.replace('$2y$', '$2b$');
        }

        // Verify bcrypt password
        const passwordMatches = await bcrypt.compare(enteredPassword, hashToCompare);

        logger.debug(`${codeName} Password verification result`, {
            userEmail,
            matched: passwordMatches,
            needsRehash: passwordMatches && user.password.length < 60
        });

        if (!passwordMatches) {
            logger.warn(`${codeName} Invalid password attempt`, { userEmail });
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // If using an old hash format, rehash the password
        if (user.password.length < 60) {
            await rehashPassword(userEmail, user.password);
        }

        const response = {
            success: true,
            user: {
                id: user.userID,
                email: user.userEmail,
                firstName: user.firstName || user.userEmail.split('@')[0],
                lastName: user.lastName || '',
                name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.userEmail,
                role: user.roleID,
                dfltAcctID: user.dfltAcctID || null
            }
        };

        // Reset session update counters for fresh tracking
        try {
            await resetSessionCounters(userEmail);
            logger.debug(`${codeName} Session counters reset for ${userEmail}`);
        } catch (resetError) {
            logger.warn(`${codeName} Failed to reset session counters:`, resetError);
            // Don't fail login if counter reset fails
        }

        // Populate context_store with user data
        try {
            await setValsDirect(userEmail, [
                { paramName: 'userEmail', paramVal: user.userEmail },
                { paramName: 'userID', paramVal: user.userID.toString() },
                { paramName: 'account_id', paramVal: user.dfltAcctID ? user.dfltAcctID.toString() : '1' },
                { paramName: 'firstName', paramVal: user.firstName || user.userEmail.split('@')[0] },
                { paramName: 'lastName', paramVal: user.lastName || '' },
                { paramName: 'userRole', paramVal: user.roleID ? user.roleID.toString() : '1' }
            ]);
            logger.info(`${codeName} Context store populated for ${userEmail}`);
        } catch (contextError) {
            logger.error(`${codeName} Failed to populate context_store:`, contextError);
            // Don't fail login if context population fails
        }

        logger.info(`${codeName} Login successful`, { userEmail });

        // Check if HTMX request - redirect to ingrType page for testing
        const isHTMX = req.headers['hx-request'] === 'true';
        if (isHTMX) {
            const redirectPath = '/whatsfresh/ingrType';
            logger.debug(`${codeName} Redirecting to: ${redirectPath}`);
            res.setHeader('HX-Redirect', redirectPath);
            res.send('');
        } else {
            // API response for non-HTMX clients
            res.json(response);
        }

    } catch (error) {
        logger.error(`${codeName} Login error:`, error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export default login;
