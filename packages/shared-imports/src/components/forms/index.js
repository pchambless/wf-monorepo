import TextField from "./TextField.jsx";
import NumberField from "./NumberField.jsx";
import DecimalField from "./DecimalField.jsx";
import DateField from "./DateField.jsx";
import BooleanField from "./BooleanField.jsx";
import MultiLineField from "./MultiLineField.jsx";
import TextArea from "./TextArea.jsx";
import Select from "./Select.jsx";

/**
 * Registry of field widgets by type
 */
export const FIELD_WIDGETS = {
  text: TextField,
  number: NumberField,
  decimal: DecimalField,
  date: DateField,
  boolean: BooleanField,
  multiLine: MultiLineField,

  // Aliases
  currency: DecimalField,
  toggle: BooleanField,
  longText: MultiLineField,
};

// Export individual widgets
export {
  TextField,
  NumberField,
  DecimalField,
  DateField,
  BooleanField,
  MultiLineField,
  TextArea,
  Select,
};
