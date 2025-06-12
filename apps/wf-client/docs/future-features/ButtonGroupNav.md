# ButtonGroup Navigation Concept

## Overview
A hierarchical navigation system using Material-UI ButtonGroup components to replace the current MenuStrip.

## Features
- Dropdown menus for sub-sections
- Color-coded sections for visual organization
- Conditional visibility of menu items based on user role

## Implementation Notes
- Leverages MUI ButtonGroup, Button, Menu and MenuItem components
- Configuration-driven structure for easy modification
- Direct integration with current navigation system

## Code Sample
```jsx
// Sample implementation
import { ButtonGroup, Button, Menu, MenuItem } from '@mui/material';

const NavButtonGroup = ({ section }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  
  return (
    <ButtonGroup 
      variant="contained" 
      sx={{ backgroundColor: section.color }}
    >
      <Button onClick={() => navigateTo(section.path)}>
        {section.label}
      </Button>
      <Button 
        endIcon={<ArrowDropDownIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      />
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {section.items.map(item => (
          <MenuItem 
            key={item.path}
            onClick={() => {
              navigateTo(item.path);
              setAnchorEl(null);
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </ButtonGroup>
  );
};
