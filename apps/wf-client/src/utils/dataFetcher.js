import { execEventType } from '../api/api';
import createLogger from '../utils/logger';

const log = createLogger('dataFetcher');

export const fetchData = async (eventType, params) => {
  try {
    log(`RequestBody: ${eventType}`);
    const data = await execEventType(eventType, params);
    log('Data fetched:', data);
    return data;
  } catch (error) {
    log('Error fetching data:', error);
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};
