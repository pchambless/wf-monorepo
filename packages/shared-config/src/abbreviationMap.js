/**
 * Dictionary of common abbreviations for entity and field names
 * Alphabetically ordered for easy reference and maintenance
 */

const abbreviationMap = {
  // A
  'acct': 'Account',
  'addr': 'Address',
  'amt': 'Amount',
  
  // B
  'btch': 'Batch',
  'Btch': 'Batch',
  'brnd': 'Brand',
  
  // C
  'cat': 'Category',
  'cfg': 'Config',
  'chk': 'Check',
  'cust': 'Customer',
  
  // D
  'dept': 'Department',
  'desc': 'Description',
  'distr': 'Distribution',
  
  // G
  'grp': 'Group',
  
  // I
  'img': 'Image',
  'ingr': 'Ingredient',
  'inv': 'Inventory',
  
  // L
  'loc': 'Location',
  
  // M
  'meas': 'Measure',
  
  // O
  'ordr': 'Order',
  
  // P
  'pay': 'Payment',
  'prd': 'Product',
  'prod': 'Product',
  
  // Q
  'qty': 'Quantity',
  
  // R
  'rcpe': 'Recipe',
  
  // U
  'usr': 'User',
  
  // V
  'vndr': 'Vendor',
};

/**
 * Special acronyms that should remain uppercase
 */
const acronyms = [
  'ID', 'URL', 'PO', 'SSN', 'EIN', 'QR', 'SKU', 'UPC', 'API', 'CSV', 
  'PDF', 'XML', 'HTML', 'JSON', 'VAT', 'PIN', 'DOB', 'VIN'
];

module.exports = {
  abbreviationMap,
  acronyms
};
