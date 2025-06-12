import { configureStore } from '@reduxjs/toolkit';
import createLogger from '../utils/logger';

const log = createLogger('MetricsStore');

const initialState = {
  metrics: {},
  history: []
};

const metricsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_ALL':
      log.debug('Updating all metrics data', {
        metricsCount: Object.keys(action.payload.metrics || {}).length,
        historyCount: (action.payload.history || []).length
      });
      return {
        metrics: action.payload.metrics || {},
        history: action.payload.history || []
      };
    default:
      return state;
  }
};

// Create error logging middleware
const errorMiddleware = () => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    log.error('Error in metrics middleware:', error);
    return initialState;
  }
};

// Create store with minimal middleware
const metricsStore = configureStore({
  reducer: metricsReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false
    }).concat(errorMiddleware)
});

// Simple subscription handler
export const getMetricsState = () => {
  try {
    return metricsStore.getState();
  } catch (error) {
    log.error('Error getting metrics state:', error);
    return initialState;
  }
};

export const dispatchMetrics = (updates) => {
  try {
    metricsStore.dispatch({
      type: 'UPDATE_ALL',
      payload: updates
    });
  } catch (error) {
    log.error('Error dispatching metrics:', error);
  }
};

export default metricsStore;
