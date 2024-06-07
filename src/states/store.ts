import { configureStore } from '@reduxjs/toolkit';
import menuReducer from './menu';
import modeReducer from './mode';

const store = configureStore({
  reducer: {
    menu: menuReducer,
    mode: modeReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
