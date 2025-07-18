import React from 'react';
import { SelectWidget } from './SelectWidget.jsx';

/**
 * Measurement selector widget
 * Uses measList eventType for data source
 */
const SelMeas = (props) => (
  <SelectWidget
    id="selMeas"
    eventName="measList"
    {...props}
  />
);

export default SelMeas;