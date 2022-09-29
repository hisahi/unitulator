import React from 'react';
import { Grid, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Quantity } from '../../core/quantity';
import { UnitGroup } from '../lib/units';
import UnitPicker, { UnitSelection } from './UnitPicker';

const UnitOutput = ({ mode, quantity, unitGroups, value, unitValue, onUnitChange }: {
  mode: string, quantity: Quantity, unitGroups: UnitGroup[], value: string
  unitValue: UnitSelection | null, onUnitChange: (newValue: UnitSelection) => void
}) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={1}>
      <Grid item xs={8}>
        <TextField label={t(`main:${mode}.output`)} inputProps={{ readOnly: true, style: { textAlign: 'end' } }} value={value} fullWidth />
      </Grid>
      <Grid item xs>
        <UnitPicker unitGroups={unitGroups} quantity={quantity} value={unitValue} onChange={onUnitChange} allowCustom />
      </Grid>
    </Grid>
  );
};

export default UnitOutput;
