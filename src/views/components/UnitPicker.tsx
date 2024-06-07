import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Quantity } from '../../core/quantity';
import { UnitGroup } from '../lib/units';
import { Unit } from '../../core/unit';
import { caseFold } from '../../core/util';
import { getLocalizedUnitName } from '../../services/unitText';
import CustomUnitDialog from './CustomUnitDialog';

const mapUnit = (unit: Unit, group: UnitGroup): UnitOption => ({
  name: unit.name,
  symbol: unit.symbol,
  quantity: unit.quantity,
  group: group.label,
  custom: !!group.custom,
});

const CUSTOM_UNIT_GROUP = {
  label: 'main:unitsCustom',
  units: [],
  custom: true,
};

export interface UnitSelection {
  unit: Unit;
  custom: boolean;
}

interface UnitOption {
  symbol: string | null;
  name: string | null;
  label?: string;
  quantity: Quantity | null;
  group: string;
  custom: boolean;
}

const getLocalizedUnitNameOrNull = (
  name: string | null | undefined,
): string | null => (!name ? null : getLocalizedUnitName(name));

const UnitPicker = ({
  unitGroups,
  quantity,
  value,
  onChange,
  allowCustom,
}: {
  unitGroups: UnitGroup[];
  quantity: Quantity | null;
  value: UnitSelection | null;
  onChange: (newValue: UnitSelection) => void;
  allowCustom: boolean;
}) => {
  const { t } = useTranslation();
  const [selectValue, setSelectValue] = useState<UnitOption | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [customUnitDialogOpen, setCustomUnitOpenDialog] = useState(false);

  const unitList: UnitOption[] = unitGroups
    .map((unitGroup) => unitGroup.units.map((unit) => mapUnit(unit, unitGroup)))
    .flat();
  const unitTable = Object.fromEntries(
    unitGroups
      .map((unitGroup) => unitGroup.units)
      .flat()
      .map((unit) => [unit.name, unit]),
  );
  const unitOptionTable = Object.fromEntries(
    unitList.map((unitOption) => [unitOption.name, unitOption]),
  );
  const hasGroups = unitGroups.find((unitGroup) => !unitGroup.label) == null;

  const optionToString = (unit: UnitOption): string =>
    t('main:unitOptionFormat', {
      name: getLocalizedUnitName(unit.name!),
      symbol: unit.symbol,
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doFiltering = (options: UnitOption[], state: any): UnitOption[] =>
    options.filter(
      (option) =>
        option.custom ||
        caseFold(optionToString(option)).includes(caseFold(state.inputValue)),
    );

  const updateSelectValue = (v: UnitOption | null) => {
    if (v?.name === null) {
      setCustomUnitOpenDialog(allowCustom);
      return;
    }
    setSelectValue(v);
    if (v != null) onChange({ unit: unitTable[v.name], custom: false });
  };

  const onCustomUnitDialogClose = () => setCustomUnitOpenDialog(false);

  const onCustomUnitDialogSubmit = (customUnit: Unit) => {
    onChange({ unit: customUnit, custom: true });
    setInputValue(customUnit.symbol);
    setSelectValue(mapUnit(customUnit, CUSTOM_UNIT_GROUP));
    onCustomUnitDialogClose();
  };

  useEffect(() => {
    if (value != null) {
      const found = unitOptionTable[value.unit.name];
      if (found) {
        setSelectValue(found);
        setInputValue(found.symbol);
      }
    }
  }, []);

  useEffect(() => {
    if (value == null || (!value.custom && !unitTable[value.unit.name])) {
      setSelectValue(null);
      setInputValue('');
    } else {
      if (value.custom) {
        setSelectValue(mapUnit(value.unit, CUSTOM_UNIT_GROUP));
      } else {
        setSelectValue(unitOptionTable[value.unit.name]);
      }
      setInputValue(value.unit.symbol);
    }
  }, [value]);

  if (allowCustom) {
    if (selectValue?.custom) {
      unitList.unshift(selectValue);
    }
    unitList.push({
      name: null,
      symbol: null,
      quantity: null,
      label: t(CUSTOM_UNIT_GROUP.label),
      group: CUSTOM_UNIT_GROUP.label,
      custom: true,
    });
  }

  unitList.forEach((unit) => (unit.group = t(unit.group)));

  return (
    <>
      <Autocomplete
        value={selectValue}
        onChange={(e, v) => updateSelectValue(v)}
        inputValue={inputValue}
        onInputChange={(e, v) => setInputValue(v)}
        disablePortal
        options={unitList}
        groupBy={hasGroups ? (option) => option.group : undefined}
        getOptionLabel={(unit) => unit.label ?? unit.symbol!}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        filterOptions={doFiltering}
        isOptionEqualToValue={(option, value) => option.name === value.name}
        renderOption={(props, unit) => (
          <li {...props}>{unit.label ?? optionToString(unit)}</li>
        )}
        renderInput={(params) => (
          <Tooltip
            placement="top"
            enterDelay={500}
            title={
              selectValue?.label ??
              getLocalizedUnitNameOrNull(selectValue?.name) ??
              ''
            }
          >
            <TextField {...params} label={t('main:unit')} />
          </Tooltip>
        )}
      />
      {allowCustom && quantity != null && (
        <CustomUnitDialog
          open={customUnitDialogOpen}
          onClose={onCustomUnitDialogClose}
          onSubmit={onCustomUnitDialogSubmit}
          defaultUnit={value?.custom ? value.unit : null}
          quantity={quantity}
        />
      )}
    </>
  );
};

export default UnitPicker;
