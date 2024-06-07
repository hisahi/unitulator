import { Unit, getUnitScale } from './unit';
import { isEquivalentQuantity } from './quantity';
import { fractionToNumber, divideFraction } from './fraction';
import ZERO_POINTS_ from '../data/zeroPoints.json';

const ZERO_POINTS: { [key: string]: number } = ZERO_POINTS_;

export const getScaleBetweenUnits = (fromUnit: Unit, toUnit: Unit): number => {
  // use scale constants (float numbers)
  let scale = fromUnit.scaleConstant / toUnit.scaleConstant;

  // and then multiply it by the fractional scales
  scale *= fractionToNumber(divideFraction(fromUnit.scale, toUnit.scale));

  return scale;
};

export const doLinearConversion = (
  fromUnit: Unit,
  toUnit: Unit,
  input: number,
): number => {
  if (!fromUnit || !toUnit) {
    throw new Error('both fromUnit and toUnit must be specified');
  }
  if (!isEquivalentQuantity(fromUnit.quantity, toUnit.quantity)) {
    throw new Error('units must have equivalent quantity');
  }
  if (!Number.isFinite(input)) {
    throw new Error('number must be finite');
  }

  return input * getScaleBetweenUnits(fromUnit, toUnit);
};

export const unitHasZeroPoint = (unit: Unit): boolean =>
  ZERO_POINTS[unit.name] !== undefined;

export const doAbsoluteConversion = (
  fromUnit: Unit,
  toUnit: Unit,
  input: number,
): number => {
  if (!fromUnit || !toUnit) {
    throw new Error('both fromUnit and toUnit must be specified');
  }
  if (!isEquivalentQuantity(fromUnit.quantity, toUnit.quantity)) {
    throw new Error('units must have equivalent quantity');
  }
  if (!Number.isFinite(input)) {
    throw new Error('number must be finite');
  }

  const zeroFrom = ZERO_POINTS[fromUnit.name] || 0;
  const zeroTo = ZERO_POINTS[toUnit.name] || 0;
  const scale = getScaleBetweenUnits(fromUnit, toUnit);

  // and finally scale, adjusting with zero point offsets as needed
  return (input - zeroFrom) * scale + zeroTo;
};

export const doAdditiveConversion = (
  fromUnits: Unit[],
  toUnits: Unit[],
  inputs: number[],
): number[] => {
  const sum: number = [...inputs]
    .reverse()
    .reduce(
      (previous, current, index) =>
        previous +
        getUnitScale(fromUnits[fromUnits.length - index - 1]) * current,
      0,
    );

  const results: number[] = [];

  if (toUnits.length > 0) {
    let spare = sum;
    for (const unit of toUnits.slice(0, -1)) {
      const scale = getUnitScale(unit);
      const converted = Math.floor(spare / scale);
      results.push(converted);
      spare -= converted * scale;
    }
    results.push(spare / getUnitScale(toUnits[toUnits.length - 1]));
  }

  return results;
};
