/**
 * Common Directive Map
 * Field type definitions used across both client and admin
 */

export const FIELD_TYPES = {
    text: {
        type: 'text',
        inputType: 'text'
    },

    number: {
        type: 'number',
        inputType: 'number'
    },

    select: {
        type: 'select',
        inputType: 'select'
    },

    date: {
        type: 'date',
        inputType: 'date'
    },

    datetime: {
        type: 'datetime-local',
        inputType: 'datetime-local'
    },

    boolean: {
        type: 'checkbox',
        inputType: 'checkbox'
    },

    textarea: {
        type: 'textarea',
        inputType: 'textarea'
    }
};

export default FIELD_TYPES;
