import { createSelectWidget } from './createSelectWidget.jsx';
import { SelectWidget } from './SelectWidget.jsx';
import { getClientSafeEventTypes } from '@whatsfresh/shared-imports';

// Create components for common selectors
export const SelBrnd = createSelectWidget('brndList');
export const SelVndr = createSelectWidget('vndrList');
export const SelMeas = createSelectWidget('measList');
export const SelProd = createSelectWidget('prodList');
export const SelProdType = createSelectWidget('prodTypeList');
export const SelIngr = createSelectWidget('ingrList');
export const SelIngrType = createSelectWidget('ingrTypeList');
export const SelWrkr = createSelectWidget('wrkrList');
export const SelAcct = createSelectWidget('acctList');
export const SelUserAcct = createSelectWidget('userAcctList');

// Export the base components
export { SelectWidget, createSelectWidget };