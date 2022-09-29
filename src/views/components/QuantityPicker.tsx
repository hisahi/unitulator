import React, { useState, useEffect } from 'react';
import { Autocomplete, Box, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Quantity } from '../../core/quantity';
import { QuantityGroup } from '../lib/units';
import { getLocalizedQuantityName } from '../../services/quantityText';
import CustomQuantityDialog from './CustomQuantityDialog';

interface QuantityOption {
  name: string | null;
  quantity: Quantity | null;
  label?: string;
  group: string;
  custom: boolean;
}

export interface QuantitySelection {
  quantity: Quantity;
  custom: boolean;
}

const CUSTOM_QUANTITY_GROUP = {
  label: 'main:quantitiesCustom',
  quantities: [],
  custom: true,
};

const mapQuantity = (
  quantity: Quantity,
  group: QuantityGroup
): QuantityOption => ({
  name: quantity.name,
  quantity,
  group: group.label,
  custom: !!group.custom,
});

const QuantityPicker = ({
  quantityGroups,
  value,
  onChange,
  allowCustom,
}: {
  quantityGroups: QuantityGroup[];
  value: QuantitySelection | null;
  onChange: (newValue: QuantitySelection) => void;
  allowCustom: boolean;
}) => {
  const { t } = useTranslation();
  const [selectValue, setSelectValue] = useState<QuantityOption | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [customQuantityDialogOpen, setCustomQuantityOpenDialog] =
    useState(false);

  const quantityList: QuantityOption[] = quantityGroups
    .map((quantityGroup) =>
      quantityGroup.quantities.map((quantity) =>
        mapQuantity(quantity, quantityGroup)
      )
    )
    .flat();
  const quantityTable = Object.fromEntries(
    quantityGroups
      .map((quantityGroup) => quantityGroup.quantities)
      .flat()
      .map((quantity) => [quantity.name, quantity])
  );
  const quantityOptionTable = Object.fromEntries(
    quantityList.map((quantityOption) => [quantityOption.name, quantityOption])
  );
  const hasGroups =
    quantityGroups.find((quantityGroup) => !quantityGroup.label) == null;

  const updateSelectValue = (v: QuantityOption | null) => {
    if (v != null) {
      if (v.quantity == null) {
        setCustomQuantityOpenDialog(true);
        return;
      }
      setSelectValue(v);
      if (v.quantity.name !== value?.quantity.name) {
        onChange({ quantity: v.quantity, custom: false });
      }
    }
  };

  const onCustomQuantityDialogClose = () => setCustomQuantityOpenDialog(false);

  const onCustomQuantityDialogSubmit = (customQuantity: Quantity) => {
    onChange({ quantity: customQuantity, custom: true });
    setInputValue(customQuantity.name);
    setSelectValue(mapQuantity(customQuantity, CUSTOM_QUANTITY_GROUP));
    onCustomQuantityDialogClose();
  };

  useEffect(() => {
    if (value != null) {
      const found = quantityOptionTable[value.quantity.name];
      if (found) {
        setSelectValue(found);
        setInputValue(found.name);
      }
    }
  }, []);

  useEffect(() => {
    if (
      value == null ||
      (!value.custom && !quantityTable[value.quantity.name])
    ) {
      setSelectValue(null);
      setInputValue('');
    } else {
      if (value.custom) {
        setSelectValue(mapQuantity(value.quantity, CUSTOM_QUANTITY_GROUP));
      } else {
        setSelectValue(quantityOptionTable[value.quantity.name]);
      }
      setInputValue(value.quantity.name);
    }
  }, [value, quantityGroups]);

  if (allowCustom) {
    if (selectValue?.custom) {
      quantityList.unshift(selectValue);
    }
    quantityList.push({
      name: null,
      quantity: null,
      label: t(CUSTOM_QUANTITY_GROUP.label),
      group: CUSTOM_QUANTITY_GROUP.label,
      custom: true,
    });
  }

  quantityList.forEach((quantity) => {
    quantity.group = t(quantity.group);
    quantity.label =
      quantity.label ?? getLocalizedQuantityName(quantity.name!, t);
  });

  return (
    <Box>
      <Autocomplete
        value={selectValue}
        onChange={(e, v) => updateSelectValue(v)}
        inputValue={inputValue}
        onInputChange={(e, v) => setInputValue(v)}
        disablePortal
        options={quantityList}
        groupBy={hasGroups ? (option) => option.group : undefined}
        getOptionLabel={(quantity) => quantity.label!}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        isOptionEqualToValue={(option, value) => option.name === value.name}
        fullWidth
        renderInput={(params) => (
          <TextField {...params} fullWidth label={t('main:quantity')} />
        )}
      />
      {allowCustom && (
        <CustomQuantityDialog
          open={customQuantityDialogOpen}
          onClose={onCustomQuantityDialogClose}
          onSubmit={onCustomQuantityDialogSubmit}
          defaultQuantity={value?.custom ? value.quantity : null}
        />
      )}
    </Box>
  );
};

export default QuantityPicker;
