import {createTheme} from '@mui/material/styles';

export const theme = createTheme({
  typography: {
    fontFamily: [
      'Roboto',
      'Outfit',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: 65,
      fontWeight: 500,
      fontFamily: "Outfit"
    },
    h2: {
      fontSize: 30,
      fontFamily: "Outfit",
      fontWeight: 600
    },
    h3: {
      fontSize: 24,
      fontFamily: "Outfit",
    },
    h4: {
      fontSize: 20,
      fontFamily: "Outfit",
    },
    h5: {
      fontSize: 16,
      fontFamily: "Outfit"
    },
    h6: {
      fontFamily: "Outfit"
    },
    body1: {
      fontSize: 18,
      fontFamily: "Roboto"
    },
    body2: {
      fontSize: 16,
      fontFamily: "Roboto"
    }
  },
  palette: {
    primary: {
      main: "#3A73F8",
      dark: "#759DFA",
      light: "#BFD3FD"
    },
    secondary: {
      main: "#F8B249",
      dark: "#FBC575",
      light: "#FDE4BF"
    },
    error: { main: '#F44336' },
    success: {
      main: '#447B3B',
      light: "#4CAF50",
      dark: "#1B5E20"
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {

        body: {
          overflowX: "hidden"
        },

      }
    }
  }
});
