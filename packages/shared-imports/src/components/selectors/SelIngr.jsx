import React from 'react';
import { SelectWidget } from './SelectWidget.jsx';

/**
 * Ingredient selector widget
 * Uses ingrList eventType for data source
 */
const SelIngr = (props) => (
  <SelectWidget
    id="selIngr"
    eventName="ingrList"
    {...props}
  />
);

export default SelIngr;