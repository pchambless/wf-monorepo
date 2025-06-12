/**
 * Field Renderer Registry
 */
import TextFieldRenderer from './TextFieldRenderer';
import NumberFieldRenderer from './NumberFieldRenderer';
import BooleanFieldRenderer from './BooleanFieldRenderer';
import SelectFieldRenderer from './SelectFieldRenderer';
import MultiLineRenderer from './MultiLineRenderer';
import DateFieldRenderer from './DateFieldRenderer';
import HiddenFieldRenderer from './HiddenFieldRenderer';

// Console log to debug the imported components
console.log('[RendererRegistry] TextFieldRenderer type:', typeof TextFieldRenderer);

// Map field types to renderer components
const renderers = {
  // Handle all display types and field types
  text: TextFieldRenderer,
  number: NumberFieldRenderer,
  multiLine: MultiLineRenderer,
  multiline: MultiLineRenderer, // Handle both casing variants
  select: SelectFieldRenderer,
  boolean: BooleanFieldRenderer,
  checkbox: BooleanFieldRenderer,
  date: DateFieldRenderer,
  hidden: HiddenFieldRenderer
};

// Simple registry with getRenderer method
const rendererRegistry = {
  getRenderer: (type) => {
    console.log(`[RendererRegistry] Getting renderer for type: ${type}`);
    return renderers[type] || renderers.text;
  }
};

export default rendererRegistry;
