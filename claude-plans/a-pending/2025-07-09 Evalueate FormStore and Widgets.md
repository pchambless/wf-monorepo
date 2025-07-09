# Evaluate if FormStore can be simplified by using the Forms Field types

## Issue
It appears to my novice eyes that the FormStore is doing more than it needs to.  I don't see that it is importing the /home/paul/wf-monorepo-new/packages/shared-imports/src/components/forms 
```
└── 📁forms
    ├── BooleanField.jsx
    ├── DateField.jsx
    ├── DatePick.jsx
    ├── DecimalField.jsx
    ├── index.js
    ├── MultiLineField.jsx
    ├── NumberField.jsx
    ├── Select.jsx
    └── TextField.jsx
```
I'm not sure what this is about as we are using DML utility to generate the data necessary for inserts, updates and deletes:
- import { insertRecord, updateRecord, deleteRecord } from '@whatsfresh/shared-imports';

Do we need to do this?  the columns are presented in the formConfig with attributes telling the form what is hidden or what type it is.
- displayColumns = []; // Filtered columns for form display

## Current State
- At the very least we need to look at this to see if there is overlap with the forms modules.