import TextField from './TextField';
import NumberField from './NumberField';
import DecimalField from './DecimalField';
import DateField from './DateField';
import BooleanField from './BooleanField';
import MultiLineField from './MultiLineField';

/**
 * Registry of field widgets by type
 */
export const FIELD_WIDGETS = {
  'text': TextField,
  'number': NumberField,
  'decimal': DecimalField,
  'date': DateField,
  'boolean': BooleanField,
  'multiLine': MultiLineField,

  // Aliases
  'currency': DecimalField,
  'toggle': BooleanField,
  'longText': MultiLineField
};

// Export individual widgets
export {
  TextField,
  NumberField,
  DecimalField,
  DateField,
  BooleanField,
  MultiLineField
};