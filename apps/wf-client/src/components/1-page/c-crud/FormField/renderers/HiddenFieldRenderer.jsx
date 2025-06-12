/**
 * Hidden Field Renderer Implementation
 */
import React from 'react';
import { observer } from 'mobx-react-lite';

class HiddenFieldRenderer {
  /**
   * Render a hidden field (invisible input)
   */
  render = observer(({ field, store }) => {
    return (
      <input
        type="hidden"
        id={`field-${field.field}`}
        name={field.field}
        value={store.value || ''}
      />
    );
  });
}

export default HiddenFieldRenderer;
