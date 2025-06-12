import createLogger from '../utils/logger';
import { setVar, getVar } from './externalStoreDel';

const log = createLogger('acctLists');

export const fetchAndCacheVndrList = async (execEvent) => {
  log('Starting fetchAndCacheVndrList');
  let cachedVndrList = getVar('vndrList');
  if (cachedVndrList) {
    log('Returning cached vendor list');
    return cachedVndrList;
  }
  try {
    const result = await execEvent('vndrList');
    log('Fetched vendor list');
    setVars('vndrList', result); // Cache the result
    return result;
  } catch (error) {
    log('Error fetching vendor list:', error);
    throw error;
  }
};

export const fetchAndCacheBrndList = async (execEvent) => {
  log('Starting fetchAndCacheBrndList');
  let cachedBrndList = getVar('brndList');
  if (cachedBrndList) {
    log('Returning cached brand list');
    return cachedBrndList;
  }
  try {
    const result = await execEvent('brndList');
    log('Fetched brand list');
    setVars('brndList', result); // Cache the result
    return result;
  } catch (error) {
    log('Error fetching brand list:', error);
    throw error;
  }
};

export const fetchAndCacheWrkrList = async (execEvent) => {
  log('Starting fetchAndCacheWrkrList');
  let cachedWrkrList = getVar('wrkrList');
  if (cachedWrkrList) {
    log('Returning cached worker list');
    return cachedWrkrList;
  }
  try {
    const result = await execEvent('wrkrList');
    log('Fetched worker list');
    setVars('wrkrList', result); // Cache the result
    return result;
  } catch (error) {
    log('Error fetching worker list:', error);
    throw error;
  }
};

export const fetchAndCacheUserAcctList = async (execEvent) => {
  log('Starting fetchAndCacheUserAcctList');
  let cachedUserAcctList = getVar('userAcctList');
  if (cachedUserAcctList) {
    log('Returning cached user account list');
    return cachedUserAcctList;
  }
  try {
    const result = await execEvent('userAcctList');
    log('Fetched user account list');
    setVars('userAcctList', result); // Cache the result
    return result;
  } catch (error) {
    log('Error fetching user account list:', error);
    throw error;
  }
};

export const fetchAndCacheMeasList = async (execEvent) => {
  log('Starting fetchAndCacheMeasList');
  let cachedMeasList = getVar('measList');
  if (cachedMeasList) {
    log('Returning cached measurement list');
    return cachedMeasList;
  }
  try {
    const result = await execEvent('measList');
    log('Fetched measurement list');
    setVars('measList', result); // Cache the result
    return result;
  } catch (error) {
    log('Error fetching measurement list:', error);
    throw error;
  }
};

export const fetchAcctLists = async (execEvent) => {
  log('Starting fetchAcctLists');
  try {
    const vndrList = await fetchAndCacheVndrList(execEvent);
    const brndList = await fetchAndCacheBrndList(execEvent);
    const wrkrList = await fetchAndCacheWrkrList(execEvent);
    log('Fetched account-specific lists successfully');
    return { vndrList, brndList, wrkrList };
  } catch (error) {
    log('Failed to fetch account-specific lists:', error);
    throw error;
  }
};

export const fetchLoginLists = async (execEvent) => {
  log('Starting fetchLoginLists');
  try {
    const userAcctList = await fetchAndCacheUserAcctList(execEvent);
    const measList = await fetchAndCacheMeasList(execEvent);
    log('Fetched login-specific lists successfully');
    return { userAcctList, measList };
  } catch (error) {
    log('Failed to fetch login-specific lists:', error);
    throw error;
  }
};

export const clearCachedLists = () => {
  log('Clearing cached lists');
  setVars('vndrList', null);
  setVars('brndList', null);
  setVars('wrkrList', null);
  setVars('userAcctList', null);
  setVars('measList', null);
};

export const getCachedList = (selList) => {
  switch (selList) {
    case 'vndrList':
      return getVar('vndrList');
    case 'brndList':
      return getVar('brndList');
    case 'wrkrList':
      return getVar('wrkrList');
    case 'userAcctList':
      return getVar('userAcctList');
    case 'measList':
      return getVar('measList');
    default:
      return [];
  }
};
