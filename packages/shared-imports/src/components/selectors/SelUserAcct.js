import { createSelectWidget } from './createSelectWidget.jsx';

/**
 * User Account selector widget
 * Uses userAcctList eventType for data source
 * Requires userID parameter from authenticated user context
 */
const SelUserAcct = createSelectWidget('userAcctList');

export default SelUserAcct;
