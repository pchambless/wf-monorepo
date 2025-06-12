import { createTheme } from '@mui/material/styles';

export const themeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f8bbd0',
    },
    warning: {
      main: '#edc802',
    },
    background: {
      default: '#e9f3db',
      paper: '#dcfce7',
    },
    text: {
      primary: '#03061c',
      secondary: '#241ec7',
      disabled: 'rgba(92,90,90,0.54)',
      hint: '#00796b',
    },
    sections: {
      ingredients: {
        light: '#f8bbd0', // Light pink
        main: '#f48fb1',  // Medium pink
        dark: '#ec407a'   // Dark pink for active items
      },
      products: {
        light: '#bbdefb', // Light blue
        main: '#90caf9',  // Medium blue
        dark: '#42a5f5'   // Dark blue for active items
      },
      batches: {
        light: '#c8e6c9', // Light green
        main: '#a5d6a7',  // Medium green
        dark: '#66bb6a'   // Dark green for active items
      }
    },
  },
  typography: {
    h2: {
      fontSize: 40,
      fontWeight: 700,
      fontFamily: 'Raleway',
      lineHeight: 1.14,
    },
    h3: {
      fontSize: 30,
      fontWeight: 600,
    },
    fontSize: 14,
    fontWeightLight: 300,
    htmlFontSize: 16,
    h4: {
      fontSize: 25,
    },
    h5: {
      fontSize: 19,
    },
  },
  direction: 'rtl',
  spacing: 8,
  components: {
    MuiList: {
      defaultProps: {
        dense: true,
      },
    },
    MuiMenuItem: {
      defaultProps: {
        dense: true,
      },
    },
    MuiTable: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiAppBar: {
      defaultProps: {
        color: 'transparent',
      },
    },
    MuiButton: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiButtonGroup: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiCheckbox: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiFab: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiFormControl: {
      defaultProps: {
        margin: 'dense',
        size: 'small',
      },
      styleOverrides: {
        root: {
          marginBottom: '8px',
          '&.form-field-container': {
            height: 'auto',
            minHeight: '40px'
          }
        }
      },
    },
    MuiFormHelperText: {
      defaultProps: {
        margin: 'dense',
      },
    },
    MuiIconButton: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiInputBase: {
      defaultProps: {
        margin: 'dense',
      },
    },
    MuiInputLabel: {
      defaultProps: {
        margin: 'dense',
      },
    },
    MuiRadio: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiSwitch: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
        margin: 'dense',
      },
      styleOverrides: {
        root: {
          marginBottom: '4px', // Reduce vertical spacing
          '& .MuiInputBase-root': {
            backgroundColor: '#f5f5f5',
            height: '40px',
            padding: '4px 8px'
          },
          // Multiline field styling
          '&.multiline-field': {
            width: '100%',
            '& .MuiInputBase-root': {
              height: 'auto',
              minHeight: '100px',
              backgroundColor: '#f5f5f5'
            },
            '& .MuiInputBase-inputMultiline': {
              position: 'static',
              padding: '8px',
              minHeight: '80px'
            },
            '& .MuiInputLabel-root': {
              transform: 'translate(14px, -6px) scale(0.75)',
              backgroundColor: '#f5f5f5',
              padding: '0 4px'
            }
          },
          // Label styling
          '& .MuiInputLabel-root': {
            backgroundColor: '#f5f5f5',
            padding: '0 4px',
            marginLeft: '-4px'
          }
        }
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            height: '40px',
            padding: '10px',
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          backgroundColor: '#dcfce7',  // Using theme.palette.background.paper
          '& .MuiDataGrid-row': {
            maxHeight: '32px',
            minHeight: '32px',
            '&.Mui-selected': {
              backgroundColor: '#c1e6c9',
              '&:hover': {
                backgroundColor: '#b1d6b9',
              },
            },
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#bae6c3',  // Darker green for headers
            minHeight: '40px',
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,           // Bold header text
              color: '#1a3e1c',          // Darker text for contrast
            },
          },
          '& .MuiDataGrid-virtualScroller': {
            minHeight: '300px',
            maxHeight: '400px',
          },
          '& .MuiDataGrid-footerContainer': {
            display: 'none',  // Hide pagination
          },
        },
        cell: {
          '&.sticky-actions-cell': {
            position: 'sticky !important',
            right: 0,
            backgroundColor: 'background.paper',
            zIndex: 3,
            boxShadow: '-2px 0 4px rgba(0,0,0,0.1)'
          }
        },
        columnHeader: {
          '&.sticky-actions-header': {
            position: 'sticky !important',
            right: 0,
            backgroundColor: 'background.paper',
            zIndex: 3,
            boxShadow: '-2px 0 4px rgba(0,0,0,0.1)'
          }
        }
      },
      defaultProps: {
        density: 'compact',
        disableColumnFilter: true,
        disableColumnMenu: true,
        disableSelectionOnClick: true,
        autoHeight: false,
      },
    },
    MuiBox: {
      variants: [
        {
          props: { className: 'form-container' },
          style: {
            backgroundColor: '#dcfce7',  // Same as DataGrid
            padding: '16px',
            borderRadius: '4px',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            minHeight: '100%',
            '& .MuiFormControl-root': {
              backgroundColor: '#fff',
              marginBottom: '8px'
            }
          }
        }
      ]
    }
  },
};

// Create the actual theme from themeOptions
const theme = createTheme(themeOptions);

export default theme;
