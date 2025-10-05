# Call to DML Module

## Description
The DML module will orchestrate a request to the Server to perform **INSERT, UPDATE** and **DELETE** operations.  Initially it will be called from the Crud components but may be expanded to be called from other components.

## Behavior / Flow
The **columnMap** of the data should be passed to the **crudDML** utility with the pertinent populated values for rendering the **requestBody**.
Initially, the crudDML utility will be called from either:
- the **Del** column iconClick, which should be the first column in the Table component in the CrudLayout.
- the **Submit** button in the Form component in the CrudLayout.
- the crudDML will use the setVars function from the **externalStore** to populate the variables that will be passed in the api Call **params**.

When any of these actions is kicked off, the crudDML component should open a Modal that displays both
-  the requestBody of a DML call to the server (api call will be implemented later)
-  a representation of the SQL Statement that will eventually be rendered in the server to pass to the database.
-  the table in the database is represented in the dbTable attribute of the columnMap.  

## Acceptance Criteria
- [ ]  Viewing a Modal with both the rendering of the requestBody and the SQL statement.

## Related Components
- src\utils\DML\crudDML.js
- src\utils\DML\buildRequest.js
- src\utils\DML\buildSql.js
- src\utils\DML\index.js
- src\utils\DML\previewSql.js
- src\components\crud\Table (_**Del** column added as first column in all table renditions. For DELETE action_)
- src\components\crud\Form (_ **Submit** button passes necessary info for creating either the INSERT or UPDATE action_)  


## Notes
Example columnMap (from ingrTypes)
export const IngrTypes = {
    dbTable: 'ingredient_types',
    columns: [
        {
            group: -1,
            where: 1,
            ordr: 1,
            field: "ingrTypeID",
            dbCol: "id",
            label: "",
            width: 0,
            dataType: "INT",
            value: "",
            setVar: ":ingrTypeID"
        },
        {
            group: 0,
            ordr: 2,
            field: "acctID",
            dbCol: "account_id",
            label: "",
            width: 0,
            dataType: "INT",
            value: "",
            required: true
        },
        {
            group: 1,
            ordr: 3,
            field: "ingrTypeName",
            dbCol: "name",
            label: "Name",
            width: 200,
            dataType: "STRING",
            value: "",
            required: true,
            setVar: ":ingrTypeName"
        }
    ]
};




Issue #28 - Created by pchambless on 4/12/2025
