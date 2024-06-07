import { Unit } from './unit';
import { PREFIX } from '../data/prefix';

interface UnitSpecificationLiteral {
  symbol?: string;
  prefix?: string;
  unit: string;
  power?: number;
}

interface UnitSpecificationFraction {
  symbol?: string;
  numerator: UnitSpecification[];
  denominator: UnitSpecification[];
}

export type UnitSpecification =
  | string
  | UnitSpecificationLiteral
  | UnitSpecificationFraction;

const isUnitSpecificationLiteral = (
  spec: UnitSpecification,
): spec is UnitSpecificationLiteral =>
  typeof spec !== 'string' && 'unit' in spec;
const isUnitSpecificationFraction = (
  spec: UnitSpecification,
): spec is UnitSpecificationFraction =>
  typeof spec !== 'string' && 'numerator' in spec;

export const unitSpecificationToUnit = (
  spec: UnitSpecification,
  unitMap: { [key: string]: Unit },
): Unit => {
  if (typeof spec === 'string') {
    if (!unitMap[spec]) throw new Error(`unrecognized unit ${spec}`);
    return unitMap[spec];
  }
  if (isUnitSpecificationLiteral(spec)) {
    const { prefix, unit, symbol, power } = spec;
    let newUnit = unitMap[unit];
    if (!newUnit) throw new Error(`unrecognized unit ${unit}`);
    if (prefix) {
      newUnit = Unit.prefixUnit(PREFIX[prefix], newUnit);
    }
    if (power && power > 1) {
      newUnit = Unit.powerUnit(newUnit, BigInt(power));
    }
    if (symbol) {
      newUnit = { ...newUnit, symbol };
    }
    return newUnit;
  }
  if (isUnitSpecificationFraction(spec)) {
    const { symbol, numerator, denominator } = spec;
    return Unit.derivedUnitWithSymbol(
      symbol,
      numerator.map((s) => unitSpecificationToUnit(s, unitMap)),
      denominator.map((s) => unitSpecificationToUnit(s, unitMap)),
    );
  }
  throw new Error('unrecognized specification');
};
