/* eslint-disable @typescript-eslint/no-explicit-any */
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

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

export const modeSlice = createSlice({
  name: 'mode',
  initialState: defaults,
  reducers: {
    changeMode: (
      _: ModeState,
      action: PayloadAction<UnitulatorMode>,
    ): ModeState => ({ mode: action.payload }),
  },
  selectors: {
    selectMode: (state: ModeState): UnitulatorMode => state.mode,
  },
});

export const { changeMode } = modeSlice.actions;
export const { selectMode } = modeSlice.selectors;
export const modeSelector = (state: any) => state.mode;
export default modeSlice.reducer;
