import { parsePosOrder } from './positionParser.js';
import { buildWorkflowTriggers } from './triggersBuilder.js';
import { getComponentProps, getComponentTriggers, getChildComponents } from './dataFetcher.js';

export const buildComponentConfig = async (component, level = 0) => {
  console.log(`🔧 Building component: ${component.comp_name} (id: ${component.id}, parent_id: ${component.parent_id})`);

  const position = parsePosOrder(component.posOrder);
  const props = await getComponentProps(component.id);
  const triggers = await getComponentTriggers(component.id);
  const workflowTriggers = buildWorkflowTriggers(triggers);

  const childComponents = await getChildComponents(component.id);
  console.log(`   ↳ Found ${childComponents.length} children for ${component.comp_name}`);

  const children = [];
  for (const child of childComponents) {
    const childConfig = await buildComponentConfig(child, level + 1);
    children.push(childConfig);
  }

  const config = {
    id: component.comp_name,
    comp_type: component.comp_type,
    xref_id: component.id,
    container: component.container || 'inline',
    ...(position.row > 0 && { position }),
    props: { ...props },
    ...(workflowTriggers && { workflowTriggers }),
    ...(children.length > 0 && { components: children })
  };

  return config;
};
