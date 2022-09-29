/* eslint-disable @typescript-eslint/no-explicit-any */
import Action from '../types/action';

export enum UnitulatorMode {
  Difference,
  Additive,
  Absolute,
  Logarithm,
  Percent,
  Help,
}

export interface ModeState {
  mode: UnitulatorMode;
}

const defaults: ModeState = {
  mode: UnitulatorMode.Difference,
};

const MODE_CHANGE = 'MODE_CHANGE';

export const modeSelector = (state: any): ModeState => state.mode;
export const changeMode = (
  newMode: UnitulatorMode
): Action<string, UnitulatorMode> => ({ type: MODE_CHANGE, payload: newMode });

export default function mode(state = defaults, action: Action<string, any>) {
  switch (action.type) {
    case MODE_CHANGE:
      return { ...state, mode: action.payload };
    default:
      return state;
  }
}
