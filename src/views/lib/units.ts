import { Quantity, isCompatibleQuantity } from '../../core/quantity';
import { Unit } from '../../core/unit';
import { QUANTITIES } from '../../data/quantity';
import { UNITS } from '../../data/unit';
import { getDefaultUnits } from '../../data/defaultUnits';

export interface QuantityGroup {
  label: string;
  quantities: Quantity[];
  custom?: boolean;
}

export interface UnitGroup {
  label: string;
  units: Unit[];
  custom?: boolean;
}

export const getUnitGroups = (quantity: Quantity): UnitGroup[] => {
  const defaultUnitsForQuantity = getDefaultUnits(quantity);
  let unitGroups: UnitGroup[] = [];

  if (defaultUnitsForQuantity != null) {
    const recommendedUnitNames = new Set();
    defaultUnitsForQuantity.map((unit) => recommendedUnitNames.add(unit.name));
    unitGroups = [
      { label: 'main:unitsRecommended', units: defaultUnitsForQuantity },
      {
        label: 'main:unitsRest',
        units: UNITS.filter(
          (unit) =>
            !recommendedUnitNames.has(unit.name) &&
            isCompatibleQuantity(quantity, unit.quantity),
        ),
      },
    ];
  } else {
    unitGroups = [
      {
        label: '',
        units: UNITS.filter((unit) =>
          isCompatibleQuantity(quantity, unit.quantity),
        ),
      },
    ];
  }

  return unitGroups;
};

export const getUnitsForQuantity = (quantity: Quantity): Unit[] =>
  getUnitGroups(quantity)
    .map((group) => group.units)
    .flat();

export const getQuantityGroups = (): QuantityGroup[] => {
  const commonQuantities: Quantity[] = [];
  const otherQuantities: Quantity[] = [];

  QUANTITIES.forEach((quantity) =>
    (getUnitsForQuantity(quantity).length > 1
      ? commonQuantities
      : otherQuantities
    ).push(quantity),
  );

  return [
    { label: 'main:quantitiesRecommended', quantities: commonQuantities },
    { label: 'main:quantitiesRest', quantities: otherQuantities },
  ];
};
