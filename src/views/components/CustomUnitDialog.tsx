import React, { useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Quantity, isEquivalentQuantity } from '../../core/quantity';
import { Unit, SCALAR_UNIT, parseUnitFromName } from '../../core/unit';
import { UNIT } from '../../data/unit';
import { Prefix } from '../../core/prefix';
import { PREFIXES, PREFIX } from '../../data/prefix';
import { getLocalizedUnitName } from '../../services/unitText';
import { getBaseUnitsByQuantity } from '../../data/defaultUnits';
import { UnitGroup } from '../lib/units';
import { getLocalizedQuantityName } from '../../services/quantityText';
import UnitPicker from './UnitPicker';

const BASE_UNITS = getBaseUnitsByQuantity();

interface PrefixOption {
  label: string;
  name: string;
  symbol: string;
}

const EMPTY_PREFIX: PrefixOption = {
  label: 'main:customUnitDialog.noPrefix',
  symbol: '–',
  name: '',
};

const mapPrefix = (prefix: Prefix): PrefixOption => ({
  label: `prefix:${prefix.name}`,
  symbol: prefix.symbol,
  name: prefix.name,
});

const prefixList: PrefixOption[] = [
  ...PREFIXES.filter(
    (prefix) => prefix.factor.numerator > prefix.factor.denominator,
  ).map(mapPrefix),
  EMPTY_PREFIX,
  ...PREFIXES.filter(
    (prefix) => prefix.factor.numerator < prefix.factor.denominator,
  ).map(mapPrefix),
];

const unitGroups: UnitGroup[] = Object.keys(BASE_UNITS).map((quantityName) => ({
  label: `quantity:${quantityName}`,
  units: BASE_UNITS[quantityName],
}));
unitGroups.sort((a, b) => a.label.localeCompare(b.label));
unitGroups.forEach((group) =>
  group.units.sort((a, b) =>
    getLocalizedUnitName(a.name).localeCompare(getLocalizedUnitName(b.name)),
  ),
);

const CustomUnitDialog = ({
  open,
  quantity,
  defaultUnit,
  onClose,
  onSubmit,
}: {
  open: boolean;
  quantity: Quantity;
  defaultUnit: Unit | null;
  onClose: () => void;
  onSubmit: (unit: Unit) => void;
}) => {
  const { t } = useTranslation();
  const [unit, setUnit] = useState(defaultUnit ?? SCALAR_UNIT);
  const [prefixValue, setPrefixValue] = useState<PrefixOption | null>(
    EMPTY_PREFIX,
  );
  const [partUnit, setPartUnit] = useState<Unit | null>(null);
  const [powerValue, setPowerValue] = useState<number>(1);
  const [sourceDialogOpen, setSourceDialogOpen] = useState<boolean>(false);
  const [sourceDialogError, setSourceDialogError] = useState<boolean>(false);
  const [sourceDialogText, setSourceDialogText] = useState<string>('');

  const unitOK = () => open && isEquivalentQuantity(quantity, unit.quantity);

  const updatePowerValue = (value: string) => {
    const n = Number(value);
    if (!n || n < 1 || n > 9) {
      setPowerValue(NaN);
    } else {
      setPowerValue(n);
    }
  };

  const submit = () => {
    onSubmit(unit);
    onCloseSourceDialog();
    onClose();
  };

  const onCloseWrapper = (event: object, reason: string) => {
    if (reason !== 'backdropClick') {
      onCloseSourceDialog();
      onClose();
    }
  };

  const onCloseSourceDialog = () => setSourceDialogOpen(false);

  const onSubmitSourceDialog = () => {
    const parsedUnit = parseUnitFromName(sourceDialogText, UNIT);
    if (parsedUnit === null) {
      setSourceDialogError(true);
    } else {
      setSourceDialogError(false);
      setUnit(parsedUnit);
      onCloseSourceDialog();
    }
  };

  const getPartUnit = (): Unit | null => {
    if (partUnit == null || prefixValue == null || !powerValue) {
      return null;
    }
    let newUnit = partUnit;
    if (prefixValue.name) {
      newUnit = Unit.prefixUnit(PREFIX[prefixValue.name], newUnit);
    }
    if (powerValue > 1) {
      newUnit = Unit.powerUnit(newUnit, BigInt(powerValue));
    }
    return newUnit;
  };

  const resetToCurrentUnit = () => {
    const newUnit = getPartUnit();
    if (newUnit != null) {
      setUnit(newUnit);
    }
  };

  const multiplyByCurrentUnit = () => {
    const newUnit = getPartUnit();
    if (newUnit != null) {
      setUnit(Unit.derivedUnit([unit, newUnit], []));
    }
  };

  const divideByCurrentUnit = () => {
    const newUnit = getPartUnit();
    if (newUnit != null) {
      setUnit(Unit.derivedUnit([unit], [newUnit]));
    }
  };

  const onSourceButton = () => {
    setSourceDialogText(unit.name);
    setSourceDialogError(false);
    setSourceDialogOpen(true);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onCloseWrapper}
        aria-labelledby="custom-unit-dialog-title"
        fullWidth
      >
        <DialogTitle id="custom-unit-dialog-title">
          {t('main:customUnitDialog.title', {
            quantity: getLocalizedQuantityName(quantity.name, t),
          })}
        </DialogTitle>
        <DialogContent>
          <Box
            style={{
              alignItems: 'stretch',
              minHeight: '500px',
              flexDirection: 'column',
            }}
          >
            <Stack spacing={2}>
              <TextField
                fullWidth
                value={unit.symbol}
                label={t('main:customUnitDialog.symbol')}
                variant="filled"
                inputProps={{ style: { textAlign: 'center' }, readOnly: true }}
              />
              <TextField
                fullWidth
                value={getLocalizedUnitName(unit.name)}
                label={t('main:customUnitDialog.name')}
                variant="filled"
                inputProps={{ readOnly: true }}
              />
              <Divider />
              <Grid container spacing={0}>
                <Grid item p={1} xs={3}>
                  <Autocomplete
                    value={prefixValue}
                    onChange={(e, v) => setPrefixValue(v)}
                    disablePortal
                    options={prefixList}
                    getOptionLabel={(prefix) => prefix.symbol}
                    isOptionEqualToValue={(option, value) =>
                      option.name === value.name
                    }
                    selectOnFocus
                    clearOnBlur
                    handleHomeEndKeys
                    renderOption={(props, prefix) => (
                      <li {...props}>
                        {t('main:prefixOptionFormat', {
                          name: t(prefix.label),
                          symbol: prefix.symbol,
                        })}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('main:customUnitDialog.prefix')}
                      />
                    )}
                  />
                </Grid>
                <Grid item p={1} xs={7}>
                  <UnitPicker
                    unitGroups={unitGroups}
                    quantity={null}
                    value={
                      partUnit != null
                        ? { unit: partUnit, custom: false }
                        : null
                    }
                    onChange={(p) => setPartUnit(p.unit)}
                    allowCustom={false}
                  />
                </Grid>
                <Grid item p={1} xs={2}>
                  <TextField
                    type="number"
                    label={t('main:customUnitDialog.power')}
                    inputProps={{ style: { textAlign: 'end' }, min: 1, max: 9 }}
                    value={powerValue}
                    onChange={(e) => updatePowerValue(e.target.value)}
                    error={!powerValue}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={1}>
                    <Grid item xs>
                      <Button
                        fullWidth
                        onClick={() => resetToCurrentUnit()}
                        disabled={partUnit == null}
                      >
                        {t('main:customUnitDialog.set')}
                      </Button>
                    </Grid>
                    <Grid item xs>
                      <Button
                        fullWidth
                        onClick={() => multiplyByCurrentUnit()}
                        disabled={partUnit == null}
                      >
                        {t('main:customUnitDialog.multiply')}
                      </Button>
                    </Grid>
                    <Grid item xs>
                      <Button
                        fullWidth
                        onClick={() => divideByCurrentUnit()}
                        disabled={partUnit == null}
                      >
                        {t('main:customUnitDialog.divide')}
                      </Button>
                    </Grid>
                    {/*
                    <Grid item xs>
                      <Button fullWidth onClick={() => simplify()}>{t('main:customUnitDialog.simplify')}</Button>
                    </Grid>
                    */}
                  </Grid>
                </Grid>
              </Grid>
            </Stack>
            {!unitOK() && (
              <div style={{ alignSelf: 'end' }}>
                <br />
                <Alert severity="warning">
                  {t('main:customUnitDialog.quantitiesMustMatch')}
                </Alert>
              </div>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onSourceButton}>
            {t('main:customUnitDialog.source')}
          </Button>
          <Button onClick={onClose}>{t('main:cancel')}</Button>
          <Button onClick={submit} autoFocus disabled={!unitOK()}>
            {t('main:ok')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={sourceDialogOpen}
        onClose={onCloseSourceDialog}
        aria-labelledby="custom-unit-source-dialog-title"
        fullWidth
      >
        <DialogTitle id="custom-unit-source-dialog-title">
          {t('main:customUnitDialog.source')}
        </DialogTitle>
        <DialogContent>
          <br />
          <Stack spacing={2}>
            <TextField
              fullWidth
              value={sourceDialogText}
              onChange={(e) => setSourceDialogText(e.target.value)}
              label={t('main:customUnitDialog.source')}
              error={sourceDialogError}
            />
          </Stack>
          <br />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseSourceDialog}>{t('main:cancel')}</Button>
          <Button onClick={onSubmitSourceDialog}>{t('main:ok')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomUnitDialog;
