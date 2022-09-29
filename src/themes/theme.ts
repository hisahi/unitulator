import { createTheme } from '@mui/material/styles';
import { teal, purple } from '@mui/material/colors';

export default createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: teal[200],
    },
    secondary: {
      main: purple[200],
    },
  },
});
