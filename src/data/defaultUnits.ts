import defaultUnitsJson from './defaultUnits.json';
import { Quantity, isCompatibleQuantity } from '../core/quantity';
import { QUANTITIES } from './quantity';
import { Unit } from '../core/unit';
import { UNIT, UNITS } from './unit';
import {
  UnitSpecification,
  unitSpecificationToUnit,
} from '../core/unitSpecification';

const defaultUnits: { [quantityName: string]: UnitSpecification[] } =
  defaultUnitsJson;

// gets default "recommended" units for a specific quantity, as specified in defaults.json
export const getDefaultUnits = (quantity: Quantity): Unit[] | null => {
  const defaultUnitsForQuantity = defaultUnits[quantity.name];
  if (!defaultUnitsForQuantity) return null;
  return defaultUnitsForQuantity.map((unit) =>
    unitSpecificationToUnit(unit, UNIT),
  );
};

export const getBaseUnitsForQuantity = (quantity: Quantity): Unit[] =>
  UNITS.filter((unit) => isCompatibleQuantity(quantity, unit.quantity));

export const getBaseUnitsByQuantity = (): { [quantity: string]: Unit[] } =>
  Object.fromEntries(
    QUANTITIES.map((quantity) => [
      quantity.name,
      getBaseUnitsForQuantity(quantity),
    ]),
  );
