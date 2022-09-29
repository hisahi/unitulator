import { configureStore } from '@reduxjs/toolkit';
import menuReducer from './menu';
import modeReducer from './mode';

export default configureStore({
  reducer: {
    menu: menuReducer,
    mode: modeReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
