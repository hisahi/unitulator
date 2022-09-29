import { BaseQuantity } from '../core/quantity';
import { QUANTITY, BASE_QUANTITIES } from './quantity';
import { parseFraction } from '../core/fraction';
import { Unit, SCALAR_UNIT } from '../core/unit';
import { PREFIX } from './prefix';
import { SCALAR_CONSTANTS } from './constants';
import {
  UnitSpecification,
  unitSpecificationToUnit,
} from '../core/unitSpecification';
import scaledUnits from './scaledUnits.json';

const KILO = PREFIX.kilo;

const Q = (name: string, symbol: string, quantity: BaseQuantity) =>
  Unit.baseUnit(name, symbol, BASE_QUANTITIES[quantity]);

const s = Q('second', 's', BaseQuantity.Time);
const m = Q('meter', 'm', BaseQuantity.Length);
const g = Q('gram', 'g', BaseQuantity.Mass);
const A = Q('ampere', 'A', BaseQuantity.ElectricCurrent);
const K = Q('kelvin', 'K', BaseQuantity.Temperature);
const mol = Q('mole', 'mol', BaseQuantity.AmountOfSubstance);
const cd = Q('candela', 'cd', BaseQuantity.LuminousIntensity);
const rad = Q('radian', 'rad', BaseQuantity.PlaneAngle);
const sr = Q('steradian', 'sr', BaseQuantity.SolidAngle);

const BASE_UNITS = [s, m, g, A, K, mol, cd, rad, sr];
const kg = Unit.prefixUnit(KILO, g);

const U = (
  symbol: string,
  name: string,
  numerators: Unit[],
  denominators: Unit[]
) =>
  Unit.derivedUnitWithName(symbol, name, numerators, denominators, undefined);
const X = (
  symbol: string,
  name: string,
  quantity: string,
  numerators: Unit[],
  denominators: Unit[]
): Unit =>
  Unit.derivedUnitWithNameAndQuantity(
    symbol,
    name,
    QUANTITY[quantity],
    numerators,
    denominators
  );

/* eslint-disable */ 
export const UNITS: Unit[] = [
  SCALAR_UNIT,
  ...BASE_UNITS,

  U('Hz', 'hertz', [], [s]),
  U('N', 'newton', [kg, m], [s, s]),
  U('Pa', 'pascal', [kg, m], [m, m, s, s]),
  U('J', 'joule', [kg, m, m], [s, s]),
  U('W', 'watt', [kg, m, m], [s, s, s]),

  U('C', 'coulomb', [s, A], []),
  U('V', 'volt', [kg, m, m], [s, s, s, A]),
  U('F', 'farad', [s, s, s, s, A, A], [kg, m, m]),
  U('Ω', 'ohm', [kg, m, m], [s, s, s, A, A]),
  U('S', 'siemens', [s, s, s, A, A], [kg, m, m]),
  U('Wb', 'weber', [kg, m, m], [s, s, A]),
  U('T', 'tesla', [kg], [s, s, A]),
  U('H', 'henry', [kg, m, m], [s, s, A, A]),

  U('lm', 'lumen', [cd, sr], []),
  U('lx', 'lux', [cd, sr], [m, m]),

  X('Bq', 'becquerel', 'radioactivity', [], [s]),
  X('Gy', 'gray', 'absorbedDose', [m, m], [s, s]),
  X('kat', 'katal', 'catalyticAtivity', [mol], [s]),
];
/* eslint-enable */

interface ScaledUnit {
  baseUnit: UnitSpecification;
  symbol: string;
  name: string;
  scaleFraction: string;
  scaleConstant: number | string | undefined;
}

export const UNIT: { [name: string]: Unit } = {};

UNITS.forEach((unit) => (UNIT[unit.name] = unit));

for (const scaledUnit_ of scaledUnits) {
  const scaledUnit = scaledUnit_ as ScaledUnit;
  const fraction = parseFraction(scaledUnit.scaleFraction);
  const scaleFactor =
    typeof scaledUnit.scaleConstant === 'string'
      ? SCALAR_CONSTANTS[scaledUnit.scaleConstant]
      : scaledUnit.scaleConstant ?? 1;
  const newUnit = Unit.scaledUnit(
    scaledUnit.name,
    scaledUnit.symbol,
    unitSpecificationToUnit(scaledUnit.baseUnit, UNIT),
    fraction,
    scaleFactor
  );
  UNITS.push(newUnit);
  UNIT[newUnit.name] = newUnit;
}
