/**
 * DirectRenderer - Database-driven HTML rendering without custom components
 *
 * Renders pageConfig directly using standard HTML elements:
 * - form → <form> with <input> elements
 * - button → <button> with database styles
 * - select → <select> with <option> elements
 * - page → <div> container
 */

import React from 'react';

const DirectRenderer = ({ config }) => {
  if (!config) {
    return <div>No config provided</div>;
  }

  const renderComponent = (component) => {
    const { type, id, props = {}, components = [] } = component;
    // Get workflowTriggers from props or component level
    const workflowTriggers = props.workflowTriggers || component.workflowTriggers || {};

    switch (type) {
      case 'page':
        return (
          <div key={id} style={{ padding: '16px' }}>
            {components.map(child => renderComponent(child))}
          </div>
        );

      case 'form':
        return (
          <form key={id} style={{
            padding: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#fff'
          }}>
            {props.title && <h3 style={{ marginTop: 0 }}>{props.title}</h3>}

            {/* Render form fields */}
            {props.fields?.map((field, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: '500'
                }}>
                  {field.label}
                  {field.required && <span style={{ color: 'red' }}>*</span>}
                </label>
                <input
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  required={field.required}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            ))}

            {/* Render child components (buttons, etc.) */}
            {components.map(child => renderComponent(child))}
          </form>
        );

      case 'button':
        const handleClick = async (e) => {
          e.preventDefault();
          console.log('🔥 Button clicked:', id, workflowTriggers);

          // Get form data
          const form = e.target.closest('form');
          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());
          console.log('📝 Form data:', data);

          // Handle onSubmit triggers
          if (workflowTriggers.onSubmit) {
            console.log('🚀 Executing onSubmit triggers:', workflowTriggers.onSubmit);

            for (const trigger of workflowTriggers.onSubmit) {
              console.log(`🎯 Trigger: ${trigger.action}`, trigger);

              if (trigger.action === 'httpPost') {
                try {
                  const triggerContent = JSON.parse(trigger.content);
                  const { url, body } = triggerContent;

                  // Replace template variables in body
                  const requestBody = {};
                  for (const [key, value] of Object.entries(body)) {
                    if (value.includes('{{form.')) {
                      // Extract field name from {{form.fieldName.value}}
                      const fieldMatch = value.match(/\{\{form\.(\w+)\.value\}\}/);
                      if (fieldMatch) {
                        const fieldName = fieldMatch[1];
                        requestBody[key] = data[fieldName];
                      }
                    } else {
                      requestBody[key] = value;
                    }
                  }

                  console.log('🌐 Making httpPost request:', { url, requestBody });

                  const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                  });

                  const result = await response.json();
                  console.log('📨 Response:', result);

                  if (result.success) {
                    console.log('✅ Login successful!');
                    // Handle onSuccess triggers
                    if (workflowTriggers.onSuccess) {
                      workflowTriggers.onSuccess.forEach(successTrigger => {
                        console.log('🎉 Success trigger:', successTrigger);
                        if (successTrigger.action === 'showComponent') {
                          console.log(`👁️ Would show component: ${successTrigger.content}`);
                          // TODO: Implement component visibility control
                        }
                      });
                    }
                  } else {
                    console.error('❌ Login failed:', result.message);
                  }
                } catch (error) {
                  console.error('💥 Error executing httpPost trigger:', error);
                }
              }
            }
          }
        };

        return (
          <button
            key={id}
            type="submit"
            onClick={handleClick}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            {props.label || 'Button'}
          </button>
        );

      case 'select':
        return (
          <select
            key={id}
            style={{
              width: '200px',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
              marginTop: '8px'
            }}
          >
            <option value="">Choose an option...</option>
            {/* TODO: Add dynamic options from database */}
          </select>
        );

      default:
        return (
          <div key={id} style={{
            padding: '8px',
            border: '1px dashed #999',
            margin: '4px',
            backgroundColor: '#f5f5f5'
          }}>
            <strong>Unknown component:</strong> {type} ({id})
            {components.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                {components.map(child => renderComponent(child))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <h2>DirectRenderer Test - Database-driven HTML</h2>
      {config.components?.map(component => renderComponent(component))}
    </div>
  );
};

export default DirectRenderer;