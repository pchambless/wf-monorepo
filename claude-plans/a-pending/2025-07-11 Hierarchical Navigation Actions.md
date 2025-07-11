# User Input

The auto-generated hierarchical navigation actions (eye icons) are appearing in the CRUD tables but not functioning yet. When clicking the "View [childEntity]" button, it should navigate to the child entity page with the correct parameters, but currently it's just producing lots of debug logs without navigation.

Example: ingrTypeList has a "View ingrList" action that should navigate to `/ingredients/:ingrTypeID/ingrList` with the selected row's ingrTypeID value.

Generated action structure:
```javascript
{
  "id": "navigate",
  "icon": "Visibility", 
  "color": "primary",
  "tooltip": "View ingrList",
  "route": "/ingredients/:ingrTypeID/ingrList",
  "paramField": "ingrTypeID"
}
```

The logs show CrudLayout is mounting correctly and forms are initializing, but the actual navigation isn't happening.