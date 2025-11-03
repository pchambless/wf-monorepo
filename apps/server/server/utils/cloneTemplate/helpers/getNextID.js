import execEventTypeController from '../../../controller/execEventType.js';

/**
 * Get next available component ID from database
 * @returns {Promise<number>} Next available ID
 */
export async function getNextComponentID() {
  const mockReq = {
    body: {
      eventSQLId: 'nextXrefID',
      userEmail: 'claude@whatsfresh.ai'
    }
  };

  let result;
  const mockRes = {
    json: (data) => { result = data; },
    status: (code) => ({
      json: (data) => { throw new Error(data.message || 'Failed to get next ID'); }
    })
  };

  await execEventTypeController(mockReq, mockRes);

  if (!result || !result.data || !result.data[0]) {
    throw new Error('Failed to get next component ID');
  }

  const nextID = result.data[0].nextID;
  return nextID;
}
