/* eslint-disable @typescript-eslint/no-explicit-any */
import Action from '../types/action';

export interface MenuState {
  open: boolean;
}

const defaults: MenuState = {
  open: false,
};

const OPEN_MENU = 'OPEN_MENU';
const CLOSE_MENU = 'CLOSE_MENU';

export const menuSelector = (state: any): MenuState => state.menu;
export const openMenu = (): Action<string, void> => ({ type: OPEN_MENU });
export const closeMenu = (): Action<string, void> => ({ type: CLOSE_MENU });

export default function menu(state = defaults, action: Action<string, any>) {
  switch (action.type) {
    case OPEN_MENU:
      return { ...state, open: true };
    case CLOSE_MENU:
      return { ...state, open: false };
    default:
      return state;
  }
}
