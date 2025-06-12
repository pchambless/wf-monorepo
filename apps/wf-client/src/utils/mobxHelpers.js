import { toJS, isObservable } from 'mobx';

/**
 * Safely convert any MobX observables to plain JS objects
 * Apply this to ALL props passed between components
 */
export function safeProp(value) {
  // Handle null/undefined
  if (value == null) return value;
  
  // ALWAYS convert MobX observables
  if (isObservable(value)) {
    return toJS(value);
  }
  
  // Handle functions that might capture observables
  if (typeof value === 'function') {
    // We can't safely convert functions, so warn in dev
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Function passed to safeProp, may contain observable closure', value);
    }
    return value; // Return as is, can't safely convert
  }
  
  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(item => safeProp(item));
  }
  
  // Handle plain objects (but not React elements, DOM nodes, etc)
  if (value && typeof value === 'object' && 
      value.constructor === Object) {
    const result = {};
    for (const key in value) {
      result[key] = safeProp(value[key]);
    }
    return result;
  }
  
  // Primitives and other values can be returned as-is
  return value;
}
