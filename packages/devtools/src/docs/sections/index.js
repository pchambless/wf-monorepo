// import { sectionConfig as apps } from './apps/index.js';
// import { sectionConfig as pages } from './pages/index.js';
// import { sectionConfig as widgets } from './widgets/index.js';
// import { sectionConfig as dataFlow } from './dataFlow/index.js';
import { sectionConfig as eventTypes } from './eventTypes/index.js';

const allSections = [
 // { key: 'apps', config: apps, active: false },
  { key: 'eventTypes', config: eventTypes, active: true },
//  { key: 'dataFlow', config: dataFlow, active: false },
 // { key: 'pages', config: pages, active: false },
//  { key: 'widgets', config: widgets, active: false }
];

// Only export active sections
console.log('[sections.Index] Active sections:', allSections.filter(s => s.active).map(s => s.key));
export const sections = allSections.filter(s => s.active);