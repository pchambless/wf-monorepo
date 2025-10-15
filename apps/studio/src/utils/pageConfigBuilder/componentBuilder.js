import { parsePosOrder } from './positionParser.js';
import { buildWorkflowTriggers } from './triggersBuilder.js';
import { getComponentProps, getComponentTriggers, getChildComponents } from './dataFetcher.js';
import { generateGridComponents } from './genGrid.js';
import { generateFormComponents } from './genForm.js';
import { generateButtonComponents } from './genButton.js';

const mergeColumnOverrides = (props) => {
  if (props.columns && props.columnOverrides) {
    const mergedColumns = props.columns.map(col => {
      const { defaultValue, ...colWithoutDefault } = col;
      return {
        ...colWithoutDefault,
        ...(props.columnOverrides[col.name] || {})
      };
    });

    const { columnOverrides, columns, ...restProps } = props;
    return { ...restProps, columns: mergedColumns };
  }

  if (props.columns) {
    const columnsWithoutDefault = props.columns.map(col => {
      const { defaultValue, ...colWithoutDefault } = col;
      return colWithoutDefault;
    });
    return { ...props, columns: columnsWithoutDefault };
  }

  return props;
};

const extractTableNameFromQuery = (qrySQL) => {
  if (!qrySQL) return null;

  const fromMatch = qrySQL.match(/from\s+([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)/i);
  return fromMatch ? fromMatch[1] : null;
};

export const buildComponentConfig = async (component, level = 0) => {
  console.log(`🔧 Building component: ${component.comp_name} (id: ${component.id}, parent_id: ${component.parent_id})`);

  const position = parsePosOrder(component.posOrder);
  let props = await getComponentProps(component.id);
  const triggers = await getComponentTriggers(component.id);
  const workflowTriggers = buildWorkflowTriggers(triggers);

  props = mergeColumnOverrides(props);

  if ((component.comp_type === 'Form' || component.comp_type === 'Grid') && props.qrySQL) {
    const tableName = extractTableNameFromQuery(props.qrySQL);
    if (tableName) {
      const { qrySQL, ...restProps } = props;
      props = { ...restProps, ...(props.rowKey && { rowKey: props.rowKey }), tableName };
    }
  }

  const childComponents = await getChildComponents(component.id);
  console.log(`   ↳ Found ${childComponents.length} children for ${component.comp_name}`);

  let children = [];
  for (const child of childComponents) {
    const childConfig = await buildComponentConfig(child, level + 1);
    children.push(childConfig);
  }

  if (component.comp_type === 'Grid' && props.columns) {
    const generatedChildren = generateGridComponents(props, component.comp_name);
    children = [...generatedChildren, ...children];
  } else if (component.comp_type === 'Form' && props.columns) {
    children = generateFormComponents(props, component.comp_name, children);
  } else if (component.comp_type === 'Button' && children.length === 0) {
    const generatedChildren = generateButtonComponents(props, component.comp_name);
    children = [...generatedChildren, ...children];
  }

  const config = {
    id: component.comp_name,
    comp_type: component.comp_type,
    xref_id: component.id,
    ...(position.row > 0 && { position }),
    props: { ...props },
    ...(workflowTriggers && { workflowTriggers }),
    ...(children.length > 0 && { components: children })
  };

  return config;
};
