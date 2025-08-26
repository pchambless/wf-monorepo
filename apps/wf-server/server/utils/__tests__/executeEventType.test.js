import { executeEventType } from '../executeEventType.js';
import { createRequestBody } from '../queryResolver.js';
import { executeQuery } from '../dbUtils.js';
import { getEventType } from '../../events/index.js';
import logger from '../logger.js';

// Mock dependencies
jest.mock('../queryResolver.js');
jest.mock('../dbUtils.js');
jest.mock('../../events/index.js');
jest.mock('../logger.js');

describe('executeEventType', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock logger methods
        logger.sanitizeLogData = jest.fn(data => data);
        logger.debug = jest.fn();
        logger.info = jest.fn();
        logger.error = jest.fn();
    });

    describe('Valid event execution', () => {
        test('should execute event with parameters successfully', async () => {
            // Arrange
            const eventType = 'ingrTypeList';
            const params = { ':acctID': 1, ':userID': 123 };
            const mockEventRoute = {
                qrySQL: 'SELECT * FROM api_wf.ingrTypeList WHERE acctID = :acctID',
                method: 'GET'
            };
            const mockQueryResult = [
                { ingrTypeID: 1, ingrTypeName: 'Spice', acctID: 1 },
                { ingrTypeID: 2, ingrTypeName: 'Produce', acctID: 1 }
            ];

            getEventType.mockReturnValue(mockEventRoute);
            createRequestBody.mockReturnValue('SELECT * FROM api_wf.ingrTypeList WHERE acctID = 1');
            executeQuery.mockResolvedValue(mockQueryResult);

            // Act
            const result = await executeEventType(eventType, params);

            // Assert
            expect(getEventType).toHaveBeenCalledWith(eventType);
            expect(createRequestBody).toHaveBeenCalledWith(mockEventRoute.qrySQL, params);
            expect(executeQuery).toHaveBeenCalledWith('SELECT * FROM api_wf.ingrTypeList WHERE acctID = 1', 'GET');
            expect(result).toEqual(mockQueryResult);
            expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Event executed successfully'));
        });

        test('should handle different HTTP methods', async () => {
            // Arrange
            const eventType = 'testEvent';
            const params = { ':id': 1 };
            const mockEventRoute = {
                qrySQL: 'SELECT * FROM test WHERE id = :id',
                method: 'POST'
            };

            getEventType.mockReturnValue(mockEventRoute);
            createRequestBody.mockReturnValue('SELECT * FROM test WHERE id = 1');
            executeQuery.mockResolvedValue([]);

            // Act
            await executeEventType(eventType, params);

            // Assert
            expect(executeQuery).toHaveBeenCalledWith(expect.any(String), 'POST');
        });
    });

    describe('Error handling', () => {
        test('should throw structured error for invalid event type', async () => {
            // Arrange
            const eventType = 'invalidEvent';
            const params = { ':acctID': 1 };

            getEventType.mockReturnValue(null);

            // Act & Assert
            await expect(executeEventType(eventType, params)).rejects.toMatchObject({
                message: "Event type 'invalidEvent' not found",
                status: 400,
                code: 'INVALID_EVENT_TYPE'
            });

            expect(logger.error).toHaveBeenCalled();
        });

        test('should handle database execution errors', async () => {
            // Arrange
            const eventType = 'ingrTypeList';
            const params = { ':acctID': 1 };
            const mockEventRoute = {
                qrySQL: 'SELECT * FROM api_wf.ingrTypeList WHERE acctID = :acctID',
                method: 'GET'
            };
            const dbError = new Error('Database connection failed');

            getEventType.mockReturnValue(mockEventRoute);
            createRequestBody.mockReturnValue('SELECT * FROM api_wf.ingrTypeList WHERE acctID = 1');
            executeQuery.mockRejectedValue(dbError);

            // Act & Assert
            await expect(executeEventType(eventType, params)).rejects.toMatchObject({
                message: 'Database connection failed',
                status: 500,
                code: 'EVENT_EXECUTION_FAILED'
            });

            expect(logger.error).toHaveBeenCalled();
        });

        test('should preserve existing error status and code', async () => {
            // Arrange
            const eventType = 'ingrTypeList';
            const params = { ':acctID': 1 };
            const mockEventRoute = {
                qrySQL: 'SELECT * FROM api_wf.ingrTypeList WHERE acctID = :acctID',
                method: 'GET'
            };
            const customError = new Error('Custom error');
            customError.status = 403;
            customError.code = 'FORBIDDEN';

            getEventType.mockReturnValue(mockEventRoute);
            createRequestBody.mockReturnValue('SELECT * FROM api_wf.ingrTypeList WHERE acctID = 1');
            executeQuery.mockRejectedValue(customError);

            // Act & Assert
            await expect(executeEventType(eventType, params)).rejects.toMatchObject({
                message: 'Custom error',
                status: 403,
                code: 'FORBIDDEN'
            });
        });
    });

    describe('Parameter handling', () => {
        test('should sanitize parameters in logs', async () => {
            // Arrange
            const eventType = 'ingrTypeList';
            const params = { ':acctID': 1, ':userID': 123, ':password': 'secret' };
            const mockEventRoute = {
                qrySQL: 'SELECT * FROM api_wf.ingrTypeList WHERE acctID = :acctID',
                method: 'GET'
            };

            getEventType.mockReturnValue(mockEventRoute);
            createRequestBody.mockReturnValue('SELECT * FROM api_wf.ingrTypeList WHERE acctID = 1');
            executeQuery.mockResolvedValue([]);

            // Act
            await executeEventType(eventType, params);

            // Assert
            expect(logger.sanitizeLogData).toHaveBeenCalledWith(params);
            expect(logger.debug).toHaveBeenCalledWith(
                expect.stringContaining('Executing event'),
                expect.objectContaining({ params: params })
            );
        });
    });
});