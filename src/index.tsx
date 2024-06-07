import React from 'react';
import ReactDOM from 'react-dom/client';
import './services/i18n';
import Unitulator from './views/Unitulator';
import './index.css';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { CircularProgress, CssBaseline } from '@mui/material';
import theme from './themes/theme';
import store from './states/store';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <React.Suspense
          fallback={
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <CircularProgress />
            </div>
          }
        >
          <Unitulator />
        </React.Suspense>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);
