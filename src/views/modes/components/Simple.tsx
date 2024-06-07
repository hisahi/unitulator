import React, { useState, useEffect } from 'react';
import { Box, Button, IconButton, Divider, Grid, Tooltip } from '@mui/material';
import { Delete, SwapHoriz, SwapVert } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import QuantityPicker, {
  QuantitySelection,
} from '../../components/QuantityPicker';
import { UnitSelection } from '../../components/UnitPicker';
import UnitInput from '../../components/UnitInput';
import UnitOutput from '../../components/UnitOutput';
import { Quantity } from '../../../core/quantity';
import { Unit } from '../../../core/unit';
import {
  Significance,
  getSignificance,
  formatWithSignificanceAndUnits,
} from '../../../core/significance';
import {
  unitHasZeroPoint,
  doLinearConversion,
  doAbsoluteConversion,
} from '../../../core/convert';
import {
  UnitGroup,
  getUnitsForQuantity,
  getQuantityGroups,
  getUnitGroups,
} from '../../lib/units';

interface UnitsAndSelectedUnit {
  units: UnitGroup[];
  current: UnitSelection | null;
}

const emptySelection = (): UnitsAndSelectedUnit => ({
  units: [],
  current: null,
});

const allQuantityGroups = getQuantityGroups();

const Simple = ({ absolute }: { absolute: boolean }) => {
  const mode = absolute ? 'absolute' : 'difference';
  const quantityGroups = allQuantityGroups.map((group) => ({
    ...group,
    quantities: group.quantities.filter(
      (quantity) =>
        !absolute ||
        getUnitsForQuantity(quantity).filter(unitHasZeroPoint).length > 0,
    ),
  }));

  const { t } = useTranslation();
  const [quantity, setQuantity] = useState<QuantitySelection | null>(null);
  const [inputUnits, setInputUnits] =
    useState<UnitsAndSelectedUnit>(emptySelection());
  const [outputUnits, setOutputUnits] = useState<UnitsAndSelectedUnit[]>([
    emptySelection(),
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [inputValue, setInputValue] = useState<number | null>(null);
  const [significance, setSignificance] = useState<Significance | null>(null);

  const setInputUnit = (unit: UnitSelection): void => {
    setInputUnits({ ...inputUnits, current: unit });
  };

  const setOutputUnit = (index: number, unit: UnitSelection): void => {
    const newOutputUnits = [...outputUnits];
    newOutputUnits[index] = { ...newOutputUnits[index], current: unit };
    setOutputUnits(newOutputUnits);
  };

  const updateQuantity = (quantity: QuantitySelection) => {
    setQuantity(quantity);
    const units = quantity?.quantity ? getUnitGroups(quantity.quantity) : [];
    setInputUnits({ units, current: null });
    setOutputUnits(outputUnits.map(() => ({ units, current: null })));
  };

  const getCurrentUnit = (selection: UnitsAndSelectedUnit): Unit | null =>
    selection.current?.unit ?? null;

  const convertResult = (
    quantity: Quantity | null,
    fromUnit: Unit | null,
    toUnit: Unit | null,
    value: number,
  ): number | undefined => {
    if (
      quantity == null ||
      fromUnit == null ||
      toUnit == null ||
      !Number.isFinite(value)
    ) {
      return undefined;
    }
    if (absolute) {
      return doAbsoluteConversion(fromUnit, toUnit, value);
    }
    return doLinearConversion(fromUnit, toUnit, value);
  };

  const updateInputValue = (text: string, value: number | undefined) => {
    setInputText(text);
    if (value !== undefined) {
      setInputValue(value);
      setSignificance(getSignificance(value, text));
    }
  };

  const addOutput = () => {
    setOutputUnits([
      ...outputUnits,
      { units: outputUnits[outputUnits.length - 1].units, current: null },
    ]);
  };

  const getOutputValue = (outputUnit: Unit | null): number | undefined =>
    inputValue === null
      ? undefined
      : convertResult(
          quantity?.quantity ?? null,
          getCurrentUnit(inputUnits),
          outputUnit,
          inputValue,
        );

  const getFormattedOutputValue = (outputUnit: Unit | null): string => {
    const number = getOutputValue(outputUnit);
    if (number === undefined) return '';
    return formatWithSignificanceAndUnits(
      number,
      significance,
      true,
      getCurrentUnit(inputUnits)!,
      outputUnit!,
    );
  };

  const swapOutput = (index: number, swapValue: boolean) => {
    const newOutputs = [...outputUnits];
    const newInput = { ...newOutputs[index] };
    const oldOutputValue = getOutputValue(getCurrentUnit(newInput));
    newOutputs[index] = { ...inputUnits };
    setOutputUnits(newOutputs);
    setInputUnits(newInput);
    if (swapValue) {
      const value = oldOutputValue ?? 0;
      const formatted = formatWithSignificanceAndUnits(
        value,
        significance,
        false,
        getCurrentUnit(inputUnits)!,
        getCurrentUnit(newInput)!,
      );
      updateInputValue(formatted, value);
    }
  };

  const removeOutput = (index: number) => {
    const newOutputs = [...outputUnits];
    newOutputs.splice(index, 1);
    setOutputUnits(newOutputs);
  };

  useEffect(() => {
    const quantities = quantityGroups.map((group) => group.quantities).flat();
    if (quantities.length === 1) {
      updateQuantity({ quantity: quantities[0], custom: false });
    }
  }, []);

  return (
    <div className={mode}>
      <h1>{t(`main:${mode}.title`)}</h1>
      <p>{t(`main:${mode}.description`)}</p>
      <br />
      <QuantityPicker
        quantityGroups={quantityGroups}
        value={quantity}
        onChange={(q: QuantitySelection) => updateQuantity(q)}
        allowCustom
      />
      <br />
      {quantity?.quantity != null && (
        <>
          <div>
            <UnitInput
              mode={mode}
              quantity={quantity?.quantity}
              unitGroups={inputUnits.units}
              value={inputText}
              onChange={updateInputValue}
              unitValue={inputUnits.current}
              onUnitChange={setInputUnit}
            />
          </div>
          <br />
          <Divider />
          <br />
          <div>
            {outputUnits.map((outputUnit, index) => (
              <Grid container key={`unit-output-${index}`}>
                <Grid item xs={12}>
                  <UnitOutput
                    mode={mode}
                    quantity={quantity?.quantity}
                    unitGroups={outputUnit.units}
                    value={getFormattedOutputValue(getCurrentUnit(outputUnit))}
                    unitValue={outputUnit.current}
                    onUnitChange={(q: UnitSelection) => setOutputUnit(index, q)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="space-between">
                    <span>
                      <Tooltip title={t(`main:${mode}.swapUnitOnly`)}>
                        <span>
                          <IconButton
                            aria-label="swap units only"
                            size="small"
                            onClick={() => swapOutput(index, false)}
                            disabled={outputUnit.current == null}
                          >
                            <SwapHoriz fontSize="inherit" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={t(`main:${mode}.swapUnitAndValue`)}>
                        <span>
                          <IconButton
                            aria-label="swap unit and value"
                            size="small"
                            onClick={() => swapOutput(index, true)}
                            disabled={
                              undefined ===
                              getOutputValue(getCurrentUnit(outputUnit))
                            }
                          >
                            <SwapVert fontSize="inherit" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </span>
                    <Tooltip title={t('main:delete')}>
                      <span>
                        <IconButton
                          aria-label="delete"
                          size="small"
                          disabled={outputUnits.length <= 1}
                          onClick={() => removeOutput(index)}
                        >
                          <Delete fontSize="inherit" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                  <br />
                </Grid>
              </Grid>
            ))}
          </div>
          <br />
          <Divider />
          <br />
          <div>
            <Box display="flex" justifyContent="flex-end">
              <Button onClick={() => addOutput()}>
                {t(`main:${mode}.addOutput`)}
              </Button>
            </Box>
          </div>
        </>
      )}
    </div>
  );
};

export default Simple;
