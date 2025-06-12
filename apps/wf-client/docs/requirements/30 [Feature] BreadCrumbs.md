# [Feature] BreadCrumbs

## Description
Breadcrumbs should help the User understand how they've traversed through the app.  There should be 2 different use cases.
1. Hierarchy navigation (Ingredients and Products)
2. Independent Navigation (Accounts)

## Behavior / Flow
As the user clicks on a row in the table, the named value associated with the row should be populated into the Breadcrumb in this manner:

**INGREDIENTS**
1. IngredientTypes:  value associated with **field: "ingrTypeName"**
2. Ingredients:  value associated with **field: "ingrName"**
3. IngredientBatches: value associated with **field: "btchNbr"**.

**PRODUCTS**
1. ProductTypes:  value associated with **field: "prodTypeName"**
2. Products:  value associated with **field: "prodName"**
3. ProductBatches: value associated with **field: "btchNbr"**.

Note:  Population of the breadcrumb should be done after the rowClick population of the **columnMap** values attributes.

## Acceptance Criteria
- [ ] Breadcrumbs reflect the Hierarchy of values as outlined in the Behavior / Flow

## Related Components


<!-- Optional sections -->
<!--
## Links
- **Related docs:** [link]

## Notes
Any additional information
-->


Issue #30 - Created by pchambless on 4/14/2025
