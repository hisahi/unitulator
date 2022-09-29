import { Quantity, BaseQuantity, quantitySearchKey } from '../core/quantity';
import {
  parenthesize,
  deparenthesize,
  makeNeatProductFromSortedTerms,
} from '../core/util';

const Q = Quantity.productQuantity;

const s = BaseQuantity.Time;
const m = BaseQuantity.Length;
const g = BaseQuantity.Mass;
const A = BaseQuantity.ElectricCurrent;
const K = BaseQuantity.Temperature;
const M = BaseQuantity.AmountOfSubstance;
const c = BaseQuantity.LuminousIntensity;
const r = BaseQuantity.PlaneAngle;
const S = BaseQuantity.SolidAngle;

/* eslint-disable */ 
export const QUANTITIES: Quantity[] = [
  Q('scalar',                       []),

  Q('time',                         [[s, 1]]),
  Q('length',                       [[m, 1]]),
  Q('mass',                         [[g, 1]]),
  Q('electricCurrent',              [[A, 1]]),
  Q('temperature',                  [[K, 1]]),
  Q('amountOfSubstance',            [[M, 1]]),
  Q('luminousIntensity',            [[c, 1]]),
  Q('planeAngle',                   [[r, 1]]),
  Q('solidAngle',                   [[S, 1]]),

  Q('frequency',                    [[s, -1]]),
  Q('area',                         [[m, 2]]),
  Q('volume',                       [[m, 3]]),
  Q('speed',                        [[m, 1], [s, -1]]),
  Q('acceleration',                 [[m, 1], [s, -2]]),
  Q('angularSpeed',                 [[r, 1], [s, -1]]),
  Q('angularAcceleration',          [[r, 1], [s, -2]]),
  Q('waveNumber',                   [[m, -1]]),
  Q('specificVolume',               [[m, 3], [g, -1]]),
  Q('density',                      [[g, 1], [m, -3]]),
  Q('areaDensity',                  [[g, 1], [m, -2]]),
  Q('frequencyDrift',               [[s, -2]]),
  Q('fuelEfficiency',               [[m, -2]]),

  Q('force',                        [[g, 1], [m, 1], [s, -2]]),
  Q('energy',                       [[g, 1], [m, 2], [s, -1]]),
  Q('work',                         [[g, 1], [m, 2], [s, -2]]),
  Q('momentum',                     [[g, 1], [m, 1], [s, -1]]),
  Q('angularMomentum',              [[g, 1], [m, 2], [s, -1]]),
  Q('power',                        [[g, 1], [m, 2], [s, -3]]),
  Q('action',                       [[g, 1], [m, 2], [s, -1]]),
  Q('specificEnergy',               [[m, 2], [s, -2]]),
  Q('energyDensity',                [[m, -1], [g, 1], [s, -2]]),
  Q('surfaceTension',               [[g, 1], [s, -2]]),
  Q('fluxDensity',                  [[g, 1], [s, -3]]),
  Q('pressure',                     [[g, 1], [m, -1], [s, -2]]),
  Q('torque',                       [[g, 1], [m, 2], [s, -2]]),
  Q('momentOfInertia',              [[m, 2], [g, 1]]),

  Q('kinematicViscosity',           [[m, 2], [s, -1]]),
  Q('dynamicViscosity',             [[m, -1], [g, 1], [s, -1]]),
  Q('linearMassDensity',            [[g, 1], [m, -1]]),
  Q('volumetricFlow',               [[m, 3], [s, -1]]),
  Q('massFlow',                     [[g, 1], [s, -1]]),
  Q('energyFluxDensity',            [[g, 1], [s, -3]]),
  Q('compressibility',              [[g, -1], [m, 1], [s, 2]]),

  Q('heatCapacity',                 [[m, 2], [g, 1], [s, -2], [K, -1]]),
  Q('specificHeatCapacity',         [[m, 2], [s, -2], [K, -1]]),
  Q('thermalConductivity',          [[m, 1], [g, 1], [s, -3], [K, -1]]),
  Q('thermalResistance',            [[m, -2], [g, -1], [s, 3], [K, 1]]),
  Q('thermalExpansionCoefficient',  [[K, -1]]),
  Q('temperatureGradient',          [[m, -1], [K, 1]]),

  Q('electricCharge',               [[s, 1], [A, 1]]),
  Q('electricDisplacementField',    [[s, 1], [A, 1], [m, -2]]),
  Q('voltage',                      [[g, 1], [m, 2], [A, -1], [s, -3]]),
  Q('capacitance',                  [[s, 4], [A, 2], [g, -1], [m, -2]]),
  Q('resistance',                   [[g, 1], [m, 2], [s, -3], [A, -2]]),
  Q('resistivity',                  [[g, 1], [m, 3], [s, -3], [A, -2]]),
  Q('electricConductivity',         [[s, 3], [A, 2], [g, -1], [m, -3]]),
  Q('permitivity',                  [[s, 4], [A, 2], [g, -1], [m, -3]]),
  Q('conductance',                  [[s, 3], [A, 2], [g, -1], [m, -2]]),
  Q('electricFieldStrength',        [[g, 1], [m, 1], [s, -3], [A, -1]]),
  Q('inductance',                   [[g, 1], [m, 2], [s, -2], [A, -2]]),
  Q('currentDensity',               [[A, 1], [m, -2]]),
  Q('electricChargeDensity',        [[A, 1], [m, -3], [s, 1]]),
  Q('linearChargeDensity',          [[A, 1], [m, -1], [s, 1]]),
  Q('magneticDipoleMoment',         [[A, 1], [m, 2]]),
  Q('electronMobility',             [[A, 1], [g, -1], [s, 2]]),
  Q('radiationExposure',            [[A, 1], [s, 1], [g, -1]]),

  Q('magneticFlux',                 [[g, 1], [m, 2], [s, -2], [A, -1]]),
  Q('magneticFluxDensity',          [[g, 1], [s, -2], [A, -1]]),
  Q('magneticPermeability',         [[g, 1], [m, 1], [s, -2], [A, -2]]),
  Q('magneticFieldStrength',        [[A, 1], [m, -1]]),
  Q('magneticReluctance',           [[m, -2], [g, -1], [s, 2], [A, 2]]),
  Q('magneticVectorPotential',      [[m, 1], [g, 1], [s, -2], [A, -1]]),
  Q('magneticMoment',               [[m, 3], [g, 1], [s, -2], [A, -1]]),
  Q('magneticSusceptibility',       [[m, 1], [g, -1], [s, 2], [A, 2]]),

  Q('substanceConcentration',       [[M, 1], [m, -3]]),
  Q('molarity',                     [[M, 1], [m, -3]]),
  Q('molarVolume',                  [[M, -1], [m, 3]]),
  Q('molarHeatCapacity',            [[M, -1], [m, 2], [g, 1], [s, -2], [K, -1]]),
  Q('molarEnergy',                  [[M, -1], [m, 2], [g, 1], [s, -2]]),
  Q('molarConductivity',            [[M, -1], [s, 3], [g, 1], [A, 2]]),
  Q('molality',                     [[M, 1], [g, -1]]),
  Q('molarMass',                    [[M, -1], [g, 1]]),
  Q('catalyticEfficiency',          [[M, -1], [m, 3], [s, -1]]),

  Q('luminousFlux',                 [[c, 1], [s, 1]]),
  Q('luminousEnergy',               [[c, 1], [S, 1]]),
  Q('luminousExposure',             [[c, 1], [s, 1], [m, -2]]),
  Q('illuminance',                  [[c, 1], [S, 1], [m, -2]]),
  Q('luminance',                    [[c, 1], [m, -2]]),
  Q('luminousEfficacy',             [[c, 1], [m, -2], [g, -1], [s, 3]]),
  Q('spectralRadiance',             [[g, 1], [s, -3], [m, -1], [S, -1]]),
  Q('spectralIrradiance',           [[g, 1], [s, -3], [m, -1]]),
  Q('spectralPower',                [[g, 1], [s, -3], [m, 1]]),
  Q('radiantIntensity',             [[g, 1], [s, -3], [m, 2], [S, -1]]),
  Q('spectralIntensity',            [[g, 1], [s, -3], [m, 1], [S, -1]]),

  Q('absorbedDose',                 [[m, 2], [s, -2]]),
  Q('absorbedDoseRate',             [[m, 2], [s, -3]]),
  Q('catalyticActivity',            [[M, 1], [s, -1]]),
];
/* eslint-enable */

export const QUANTITY: { [name: string]: Quantity } = {};

QUANTITIES.forEach((quantity) => (QUANTITY[quantity.name] = quantity));

export const BASE_QUANTITIES = {
  [BaseQuantity.Time]: QUANTITY.time,
  [BaseQuantity.Length]: QUANTITY.length,
  [BaseQuantity.Mass]: QUANTITY.mass,
  [BaseQuantity.ElectricCurrent]: QUANTITY.electricCurrent,
  [BaseQuantity.Temperature]: QUANTITY.temperature,
  [BaseQuantity.AmountOfSubstance]: QUANTITY.amountOfSubstance,
  [BaseQuantity.LuminousIntensity]: QUANTITY.luminousIntensity,
  [BaseQuantity.PlaneAngle]: QUANTITY.planeAngle,
  [BaseQuantity.SolidAngle]: QUANTITY.solidAngle,
};

export const SCALAR_QUANTITY = QUANTITY.scalar;
SCALAR_QUANTITY.construction = { numerators: [], denominators: [] };

const QUANTITY_KEYS = Object.fromEntries(
  QUANTITIES.map((quantity) => [quantitySearchKey(quantity), quantity])
);

export const makeQuantity = (
  numerator: Quantity[],
  denominator: Quantity[]
): Quantity => {
  const numerator_names = [
    ...numerator
      .map((quantity) => deparenthesize(quantity.name.split('/')[0]).split('*'))
      .flat()
      .filter((x) => x),
    ...denominator
      .map((quantity) => deparenthesize(quantity.name.split('/')[1]).split('*'))
      .flat()
      .filter((x) => x),
  ];
  const denominator_names = [
    ...numerator
      .map((quantity) => deparenthesize(quantity.name.split('/')[1]).split('*'))
      .flat()
      .filter((x) => x),
    ...denominator
      .map((quantity) => deparenthesize(quantity.name.split('/')[0]).split('*'))
      .flat()
      .filter((x) => x),
  ];
  numerator_names.sort();
  let name = makeNeatProductFromSortedTerms(numerator_names);

  if (denominator_names.length > 0) {
    denominator_names.sort();
    if (!name) name = '1';
    name = `${name}/${parenthesize(
      makeNeatProductFromSortedTerms(denominator_names)
    )}`;
  }

  const derived = Quantity.derivedQuantity(name, numerator, denominator);
  const key = quantitySearchKey(derived);
  return QUANTITY_KEYS[key] || derived;
};
