import { createTheme } from '@mui/material/styles';

// Minimal MUI theme tuned to match existing dark UI defaults.
// We keep colors close to current CSS vars and prefer rounded/pill shapes.
export const materialTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8c9094', // maps to --accent-amber (neutral metallic)
    },
    secondary: {
      main: '#c7cace', // maps to --accent-mint
    },
    background: {
      default: '#0b0c0d', // --surface-0
      paper: '#181a1c', // --surface-2
    },
    text: {
      primary: '#f5f6f7', // --text-1
      secondary: '#9ba0a6', // --text-2
    },
  },
  shape: {
    borderRadius: 999, // favor pill shapes similar to current UI
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderWidth: 1,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

