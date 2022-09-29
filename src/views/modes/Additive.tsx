import React, { useState } from 'react';
import { Box, Button, IconButton, Divider, Grid, Stack, Tooltip } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import QuantityPicker, { QuantitySelection } from '../components/QuantityPicker';
import { UnitSelection } from '../components/UnitPicker';
import UnitInput from '../components/UnitInput';
import UnitOutput from '../components/UnitOutput';
import { Unit, getUnitScale } from '../../core/unit';
import { Significance, getSignificance, maximumSignificance, formatWithSignificanceAndUnits } from '../../core/significance';
import { doAdditiveConversion } from '../../core/convert';
import { UnitGroup, getQuantityGroups, getUnitGroups } from '../lib/units';

interface UnitsAndSelectedUnit {
  units: UnitGroup[]
  current: UnitSelection | null
}

interface UnitInputValue extends UnitsAndSelectedUnit {
  units: UnitGroup[]
  current: UnitSelection | null
  value: number | null
  text: string
  significance: Significance | null
}

interface UnitOutputValue extends UnitsAndSelectedUnit {
  units: UnitGroup[]
  current: UnitSelection | null
  value: number | null
}

const emptyInputValue = (): UnitInputValue => ({ units: [], current: null, value: null, text: '', significance: null });
const emptyOutputValue = (): UnitOutputValue => ({ units: [], current: null, value: null });
const inputToOutput = (input: UnitInputValue): UnitOutputValue => ({ units: input.units, current: input.current, value: input.value });
const outputToInput = (output: UnitOutputValue, significance: Significance | null, text: string): UnitInputValue => ({ units: output.units, current: output.current, value: output.value, text, significance });

const quantityGroups = getQuantityGroups();

const getUnitScaleSafe = (unit: Unit | undefined) => (unit != null) ? getUnitScale(unit) : 0;

const Additive = () => {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState<QuantitySelection | null>(null);
  const [inputUnits, setInputUnits] = useState<UnitInputValue[]>([emptyInputValue()]);
  const [outputUnits, setOutputUnits] = useState<UnitOutputValue[]>([emptyOutputValue()]);
  const [significance, setSignificance] = useState<Significance | null>(null);

  const setInputUnit = (index: number, unit: UnitSelection): void => {
    const newInputs = [...inputUnits];
    newInputs[index] = { ...newInputs[index], current: unit };
    refilterUnits(newInputs);
    newInputs.sort((a, b) => getUnitScaleSafe(b.current?.unit) - getUnitScaleSafe(a.current?.unit));
    setInputUnits(newInputs);
    setOutputUnits(recalculate(newInputs, outputUnits));
  };

  const setOutputUnit = (index: number, unit: UnitSelection): void => {
    const newOutputs = [...outputUnits];
    newOutputs[index] = { ...newOutputs[index], current: unit };
    refilterUnits(newOutputs);
    newOutputs.sort((a, b) => getUnitScaleSafe(b.current?.unit) - getUnitScaleSafe(a.current?.unit));
    setOutputUnits(recalculate(inputUnits, newOutputs));
  };

  const refilterUnits = (selections: UnitsAndSelectedUnit[]) => {
    if (quantity != null) {
      // allow selection of the current unit but not any of the ones selected by others
      const units = quantity?.quantity ? getUnitGroups(quantity.quantity) : [];
      const selectedBy = Object.fromEntries(selections
        .map((value, index) => [index, value] as [number, UnitsAndSelectedUnit])
        .filter(([, value]) => value.current?.unit)
        .map(([index, value]) => [value.current!.unit.name, index]));
      selections.forEach((selection, index) => {
        selection.units = units.map(group => ({ ...group, units: group.units.filter(unit => [undefined, index].includes(selectedBy[unit.name])) }));
      });
    }
    return selections;
  };

  const getFreeUnits = (selections: UnitsAndSelectedUnit[]): UnitGroup[] => {
    if (quantity == null) return [];
    const units = quantity?.quantity ? getUnitGroups(quantity.quantity) : [];
    const selected = Object.fromEntries(selections
      .map((value, index) => [index, value] as [number, UnitsAndSelectedUnit])
      .filter(([, value]) => value.current?.unit)
      .map(([index, value]) => [value.current!.unit.name, true]));
    return units.map(group => ({ ...group, units: group.units.filter(unit => !selected[unit.name]) }));
  };

  const newInputValue = (): UnitInputValue => ({ ...emptyInputValue(), units: getFreeUnits(inputUnits) });
  const newOutputValue = (): UnitOutputValue => ({ ...emptyOutputValue(), units: getFreeUnits(outputUnits) });

  const updateQuantity = (quantity: QuantitySelection) => {
    setQuantity(quantity);
    const units = quantity?.quantity ? getUnitGroups(quantity.quantity) : [];
    setInputUnits(inputUnits.map(x => ({ ...x, units, current: null })));
    setOutputUnits(outputUnits.map(x => ({ ...x, units, current: null, value: null })));
  };

  const recalculate = (inputs: UnitInputValue[], outputs: UnitOutputValue[]): UnitOutputValue[] => {
    const filteredInputs = inputs.filter(selection => ((selection.current?.unit) != null) && selection.value !== null);
    const filteredOutputs = outputs.filter(selection => selection.current?.unit);
    const result = doAdditiveConversion(filteredInputs.map(input => input.current!.unit),
      filteredOutputs.map(output => output.current!.unit),
      filteredInputs.map(input => input.value!));
    outputs.forEach(output => output.value = null);
    filteredOutputs.forEach((output, index) => output.value = result[index]);
    return outputs;
  };

  const updateInputValue = (index: number, text: string, value: number | undefined) => {
    const newInputs = [...inputUnits];
    newInputs[index] = { ...newInputs[index], text };
    if (value !== undefined) {
      newInputs[index] = { ...newInputs[index], value, significance: getSignificance(value, text) };
      setSignificance(maximumSignificance(newInputs.map(value => value.significance).filter(x => x) as Significance[]));
    }
    setInputUnits(newInputs);
    setOutputUnits(recalculate(newInputs, [...outputUnits]));
  };

  const addInput = () => setInputUnits([...inputUnits, newInputValue()]);
  const addOutput = () => setOutputUnits([...outputUnits, newOutputValue()]);

  const removeInput = (index: number) => {
    const newInputs = [...inputUnits];
    newInputs.splice(index, 1);
    setInputUnits(newInputs);
    setSignificance(maximumSignificance(newInputs.map(value => value.significance).filter(x => x) as Significance[]));
    setOutputUnits(recalculate(newInputs, [...outputUnits]));
  };

  const removeOutput = (index: number) => {
    const newOutputs = [...outputUnits];
    newOutputs.splice(index, 1);
    setOutputUnits(recalculate(inputUnits, newOutputs));
  };

  const getInputUnitForSignificance = (): Unit | undefined => inputUnits[0].current?.unit;

  const getFormattedOutputValue = (outputValue: UnitOutputValue, useLocale: boolean): string => {
    const number = outputValue.value;
    const inputUnit = getInputUnitForSignificance();
    const outputUnit = outputValue.current?.unit;
    if (number === null || (inputUnit == null) || (outputUnit == null)) return '';
    return formatWithSignificanceAndUnits(number, significance, useLocale, inputUnit, outputUnit);
  };

  const swapInputsAndOutputs = () => {
    const newInputs = outputUnits.map(output => outputToInput(output, significance, getFormattedOutputValue(output, false)));
    const newOutputs = inputUnits.map(inputToOutput);
    setInputUnits(newInputs);
    setSignificance(maximumSignificance(newInputs.map(value => value.significance).filter(x => x) as Significance[]));
    setOutputUnits(recalculate(newInputs, newOutputs));
  };

  return (
    <div className="additive">
      <h1>{t('main:additive.title')}</h1>
      <p>{t('main:additive.description')}</p>
      <br />
      <QuantityPicker quantityGroups={quantityGroups} value={quantity} onChange={(q: QuantitySelection) => updateQuantity(q)} allowCustom />
      <br />
      {((quantity?.quantity) != null) && (
        <>
          <div>
            {
              inputUnits.map((inputUnit, index) => (
                <Grid container key={`unit-input-${index}`}>
                  <Grid item xs>
                    <Box height="100%" display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                      {index > 0 && <AddIcon />}
                    </Box>
                  </Grid>
                  <Grid item xs={11}>
                    <UnitInput mode="additive" quantity={quantity?.quantity} unitGroups={inputUnit.units} value={inputUnit.text} onChange={(t, v) => updateInputValue(index, t, v)} unitValue={inputUnit.current} onUnitChange={u => setInputUnit(index, u)} />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between">
                      <span />
                      <Tooltip title={t('main:delete')}>
                        <span>
                          <IconButton aria-label="delete" size="small" disabled={inputUnits.length <= 1} onClick={() => removeInput(index)}><Delete fontSize="inherit" /></IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                    <br />
                  </Grid>
                </Grid>
              ))
            }
          </div>
          <Divider />
          <br />
          <div>
            {
              outputUnits.map((outputUnit, index) => (
                <Grid container key={`unit-output-${index}`}>
                  <Grid item xs>
                    <Box height="100%" display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                      {index > 0 && <AddIcon />}
                    </Box>
                  </Grid>
                  <Grid item xs={11}>
                    <UnitOutput mode="additive" quantity={quantity?.quantity} unitGroups={outputUnit.units} value={getFormattedOutputValue(outputUnit, true)} unitValue={outputUnit.current} onUnitChange={(q: UnitSelection) => setOutputUnit(index, q)} />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between">
                      <span />
                      <Tooltip title={t('main:delete')}>
                        <span>
                          <IconButton aria-label="delete" size="small" disabled={outputUnits.length <= 1} onClick={() => removeOutput(index)}><Delete fontSize="inherit" /></IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                    <br />
                  </Grid>
                </Grid>
              ))
            }
          </div>
          <br />
          <Divider />
          <br />
          <div>
            <Box display="flex" justifyContent="flex-end">
              <Stack direction="row" spacing={2}>
                <Button onClick={() => swapInputsAndOutputs()}>{t('main:additive.swapInputsAndOutputs')}</Button>
                <Button onClick={() => addInput()}>{t('main:additive.addInput')}</Button>
                <Button onClick={() => addOutput()}>{t('main:additive.addOutput')}</Button>
              </Stack>
            </Box>
          </div>
        </>
      )}
    </div>
  );
};

export default Additive;
