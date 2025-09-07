#!/usr/bin/env node
/**
 * 🧪 Test EventType Standards Validation
 */

import { validateEventTypeFile, formatValidationResults } from './validate-eventtype.js';

async function testValidation() {
  const filePath = '../apps/studio/pages/Studio/eventTypes/columns/columnSidebar.js';
  
  console.log('🔍 Testing EventType Standards Validation');
  console.log(`📁 File: ${filePath}`);
  
  const results = await validateEventTypeFile(filePath);
  const output = formatValidationResults(results, filePath);
  
  console.log(output);
}

testValidation();