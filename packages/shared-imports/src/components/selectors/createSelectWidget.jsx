import React from 'react';
import { SelectWidget } from './SelectWidget.jsx';
import { getEventType } from '../../events/index.js';

/**
 * Creates a select widget component from an event type
 */
export function createSelectWidget(eventType) {
  const event = getEventType(eventType);
  if (!event) {
    console.error(`Event type ${eventType} not found`);
    return () => <div>Invalid event type: {eventType}</div>;
  }

  // Extract base name by removing "List" suffix
  const baseName = eventType.replace('List', '');
  const valueKey = `${baseName}ID`;
  const labelKey = `${baseName}Name`;

  // Create and return a component
  const SelectComponent = (props) => (
    <SelectWidget
      id={`sel${baseName}`}
      eventName={eventType}
      valueKey={valueKey}
      labelKey={labelKey}
      {...props}
    />
  );

  // Set display name for React DevTools
  SelectComponent.displayName = `Sel${baseName}`;

  return SelectComponent;
}

export default createSelectWidget;