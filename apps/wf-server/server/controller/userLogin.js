import bcrypt from 'bcrypt';
import { createRequestBody } from '../utils/queryResolver.js';
import { executeQuery } from '../utils/dbUtils.js';
import logger from '../utils/logger.js';
import { getEventType } from '@whatsfresh/shared-imports/events';

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
        const { userEmail, password } = req.body;

        // Get login event from shared-events
        const loginEvent = getEventType('userLogin');

        // Create SQL with parameters - including both email and password
        const { qrySQL } = loginEvent;
        const params = {
            userEmail,
            enteredPassword: password  // Pass the password as a parameter
        };
        const qryMod = createRequestBody(qrySQL, params);

        // Execute query 
        const users = await executeQuery(qryMod, 'GET');

        if (!users || users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];
        const {enteredPassword} = user; // Get from query results

        // Verify bcrypt password
        const passwordMatches = await bcrypt.compare(enteredPassword, user.password);

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
                name: `${user.firstName} ${user.lastName}`,
                role: user.roleID
            }
        };

        logger.info(`${codeName} Login successful`, { userEmail });
        res.json(response);

    } catch (error) {
        logger.error(`${codeName} Login error:`, error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export default login;
