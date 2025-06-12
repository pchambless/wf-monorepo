# [Feature] Crud Table

## Description
The Table component in the CrudLayout will present the Table data for all the listEvent events.  The folder structure in the src/components/crud folder is like this
```
└── 📁Table
    └── index.js
    └── Presenter.js
    └── Table.js
```
- **index.js**:  This presents the other components for reference purposes.
- **Presenter.js**:  This presents props to the Table that are necessary for rendering the Crud Table.  This should include the data from the listEvent and the columnMap from the associated pageConfig that is passed in from the 
- **Table**: This renders the Table for the User.

## Behavior / Flow
- The User selects a page from the menu.  
- When the page is loaded, the Tab 0 table should be presented to the user.  
- Each time the user clicks on the **Next Tab**, the data associated with the **listEvent** for that tab should be loaded into the table.
- If the User clicks the first tab from any other tab, the data from that tabs listEvent will render again.   

## Acceptance Criteria
- [ ] Data renders correctly with a Del Icon in the first column that works with the crudDML module. 
- [ ] values in the columnMap are populated with the values in the table columns.
- [ ] columns in the table are presented correctly with the appropriate columns hidden.  


## Related Components
- src\components\crud\CrudLayout.js
- src\components\crud\Table


## Notes
**Hidden Columns**:  ColumnMap.MultiLine: true, ColumnMap.selList is populated, columnMap.group <=0. 


Issue #29 - Created by pchambless on 4/13/2025
