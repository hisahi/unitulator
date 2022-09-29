import React, { useState } from 'react';
import { Grid, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Quantity } from '../../core/quantity';
import { UnitGroup } from '../lib/units';
import UnitPicker, { UnitSelection } from './UnitPicker';

const UnitInput = ({ mode, quantity, unitGroups, value, onChange, unitValue, onUnitChange }: {
  mode: string, quantity: Quantity, unitGroups: UnitGroup[], value: string
  onChange: (newText: string, newValue: number | undefined) => void
  unitValue: UnitSelection | null, onUnitChange: (newValue: UnitSelection) => void
}) => {
  const { t } = useTranslation();
  const [error, setError] = useState(false);

  const updateValue = (v: string) => {
    const n = v ? Number(v) : 0;
    const valid = Number.isFinite(n);
    setError(!valid);
    onChange(v, valid ? n : undefined);
  };

  const noUpDownArrows = (e: KeyboardEvent) => {
    if (['ArrowDown', 'ArrowUp'].includes(e.code)) {
      e.preventDefault();
    }
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={8}>
        <TextField type="number" label={t(`main:${mode}.input`)} inputProps={{ style: { textAlign: 'end' }, className: 'no-spinner', onKeyDown: noUpDownArrows }} value={value} onChange={e => updateValue(e.target.value)} error={error} fullWidth />
      </Grid>
      <Grid item xs>
        <UnitPicker unitGroups={unitGroups} quantity={quantity} value={unitValue} onChange={onUnitChange} allowCustom />
      </Grid>
    </Grid>
  );
};

export default UnitInput;
