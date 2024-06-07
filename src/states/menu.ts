/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from '@reduxjs/toolkit';

export interface MenuState {
  open: boolean;
}

const defaults: MenuState = {
  open: false,
};

export const menuSlice = createSlice({
  name: 'menu',
  initialState: defaults,
  reducers: {
    openMenu: (): MenuState => ({ open: true }),
    closeMenu: (): MenuState => ({ open: false }),
  },
  selectors: {
    selectIsMenuOpen: (state: MenuState): boolean => state.open,
  },
});

export const { openMenu, closeMenu } = menuSlice.actions;
export const { selectIsMenuOpen } = menuSlice.selectors;
export const menuSelector = (state: any) => state.menu;
export default menuSlice.reducer;
