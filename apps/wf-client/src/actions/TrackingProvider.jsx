import React, { useEffect } from 'react';
import createLogger from '../utils/logger';
import tracker from './tracker';

const log = createLogger('TrackingProvider');

export const withTracking = (WrappedComponent, functionsToTrack = []) => {
  return function TrackingProvider(props) {
    // Add presenter initialization check
    const hasPresenter = Boolean(props.presenter);

    useEffect(() => {
      if (!hasPresenter) {
        // Skip tracking setup if no presenter
        return;
      }

      const instance = props.presenter;

      functionsToTrack.forEach(functionName => {
        if (typeof instance[functionName] === 'function') {
          const originalFn = instance[functionName].bind(instance);
          
          // Make sure we pass a valid context object
          const trackingContext = {
            component: WrappedComponent.name || 'UnknownComponent',
            functionName: functionName,
            pageName: props.pageName || 'unknown',
            acctID: props.acctID,
            userEmail: props.userEmail
          };
          
          instance[functionName] = tracker.wrapFunction(originalFn, trackingContext);
        }
      });

      log.debug('Tracking initialized for:', {
        component: WrappedComponent.name,
        functions: functionsToTrack
      });
    }, [
      hasPresenter,
      props.presenter, 
      props.pageName, 
      props.acctID, 
      props.userEmail
    ]);

    return <WrappedComponent {...props} />;
  };
};

// Add default export for backward compatibility
const TrackingProvider = { withTracking };
export default TrackingProvider;
