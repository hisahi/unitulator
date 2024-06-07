import { isInteger } from './util';

// SI base quantities and some more
export enum BaseQuantity {
  Time = 1,
  Length = 2,
  Mass = 3,
  ElectricCurrent = 4,
  Temperature = 5,
  AmountOfSubstance = 6,
  LuminousIntensity = 7,

  // technically not SI, but makes it easier.
  PlaneAngle = 8,
  SolidAngle = 9,
}

// for quantity -> string conversion
const baseQuantityToChar = (quantity: BaseQuantity): string =>
  ({
    [BaseQuantity.Time]: 's',
    [BaseQuantity.Length]: 'm',
    [BaseQuantity.Mass]: 'g',
    [BaseQuantity.ElectricCurrent]: 'A',
    [BaseQuantity.Temperature]: 'K',
    [BaseQuantity.AmountOfSubstance]: 'M',
    [BaseQuantity.LuminousIntensity]: 'c',
    [BaseQuantity.PlaneAngle]: 'r',
    [BaseQuantity.SolidAngle]: 'S',
  })[quantity];

// for quantity -> string conversion
const baseQuantityFromChar = (key: string): BaseQuantity | undefined =>
  ({
    s: BaseQuantity.Time,
    m: BaseQuantity.Length,
    g: BaseQuantity.Mass,
    A: BaseQuantity.ElectricCurrent,
    K: BaseQuantity.Temperature,
    M: BaseQuantity.AmountOfSubstance,
    c: BaseQuantity.LuminousIntensity,
    r: BaseQuantity.PlaneAngle,
    S: BaseQuantity.SolidAngle,
  })[key];

// reduces a "fraction" of quantities by sorting and removing entries in both
const reduceQuantityFraction = (
  numerator: BaseQuantity[],
  denominator: BaseQuantity[],
): void => {
  for (
    let numeratorIndex = 0, denominatorIndex = 0;
    numeratorIndex < numerator.length && denominatorIndex < denominator.length;

  ) {
    if (numerator[numeratorIndex] === denominator[denominatorIndex]) {
      numerator.splice(numeratorIndex, 1);
      denominator.splice(denominatorIndex, 1);
    } else if (numerator[numeratorIndex] < denominator[denominatorIndex]) {
      ++numeratorIndex;
    } else {
      ++denominatorIndex;
    }
  }
};

export interface QuantityLiteral {
  name: string;
  power?: bigint;
}

export interface QuantityConstruction {
  numerators: QuantityLiteral[];
  denominators: QuantityLiteral[];
}

const mergePowers = (tokens: QuantityLiteral[]): QuantityLiteral[] => {
  const result: QuantityLiteral[] = [];
  const seen: { [name: string]: QuantityLiteral } = {};

  for (const token of tokens) {
    const mergeTo = seen[token.name];
    if (mergeTo) {
      mergeTo.power = (mergeTo.power ?? 1n) + (token.power ?? 1n);
    } else {
      seen[token.name] = token;
      result.push(token);
    }
  }

  return result;
};

const cancelPowers = (
  numerators: QuantityLiteral[],
  denominators: QuantityLiteral[],
) => {
  // cancel out units from both sides (including in powers)
  const numeratorsByName: { [name: string]: Array<[number, QuantityLiteral]> } =
    {};

  for (let index = 0; index < numerators.length; ++index) {
    const token = numerators[index];
    const { name } = token;
    if (!numeratorsByName[name]) numeratorsByName[name] = [];
    numeratorsByName[name].push([index, token]);
  }

  nextDenominator: for (let index = 0; index < denominators.length; ) {
    const token = denominators[index];
    const { name } = token;
    const candidates = numeratorsByName[name];
    if (candidates) {
      for (let candidateIndex = 0; candidateIndex < candidates.length; ) {
        const [numeratorIndex, candidate] = candidates[candidateIndex];
        const candidatePower = candidate.power ?? 1n;
        const tokenPower = token.power ?? 1n;

        if (candidatePower > tokenPower)
          candidate.power = candidatePower - tokenPower;
        if (candidatePower < tokenPower)
          token.power = tokenPower - candidatePower;

        if (candidatePower <= tokenPower) {
          candidates.splice(candidateIndex, 1);
          numerators.splice(numeratorIndex, 1);
        } else {
          ++candidateIndex;
        }

        if (tokenPower <= candidatePower) {
          denominators.splice(index, 1);
          continue nextDenominator;
        }
      }
    }
    ++index;
  }
};

export class Quantity {
  // basic quantity creator
  constructor(
    public name: string,
    public numerator: BaseQuantity[],
    public denominator: BaseQuantity[],
    public construction: QuantityConstruction,
  ) {
    this.numerator.sort();
    this.denominator.sort();
    reduceQuantityFraction(this.numerator, this.denominator);
  }

  // quantity that is a product of integer powers of quantities
  static productQuantity(
    name: string,
    derivation: Array<[BaseQuantity, number]>,
  ): Quantity {
    const numerator: BaseQuantity[] = [];
    const denominator: BaseQuantity[] = [];

    derivation.forEach(([baseQuantity, power]) => {
      if (isInteger(power) && power !== 0) {
        // |power| times: push baseQuantity into numerator or denominator
        let target;
        if (power < 0) {
          power = -power;
          target = denominator;
        } else {
          target = numerator;
        }
        for (let i = 0; i < power; ++i) {
          target.push(baseQuantity);
        }
      }
    });

    return new Quantity(name, numerator, denominator, {
      numerators: [{ name }],
      denominators: [],
    });
  }

  // quantity that is a "fraction" of other quantities
  static derivedQuantity(
    name: string,
    numerators: Quantity[],
    denominators: Quantity[],
  ) {
    let numerator: BaseQuantity[] = [];
    let denominator: BaseQuantity[] = [];

    for (const quantity of numerators) {
      numerator = [...numerator, ...quantity.numerator];
      denominator = [...denominator, ...quantity.denominator];
    }
    for (const quantity of denominators) {
      numerator = [...numerator, ...quantity.denominator];
      denominator = [...denominator, ...quantity.numerator];
    }

    return new Quantity(name, numerator, denominator, {
      numerators: [{ name }],
      denominators: [],
    });
  }

  static extendQuantity(
    name: string,
    quantity: Quantity,
    numerators: Quantity[],
    denominators: Quantity[],
  ) {
    const numeratorTokens: QuantityLiteral[] = mergePowers([
      ...(quantity.construction.numerators || []),
      ...numerators.map((q) => ({ name: q.name })),
    ]);
    const denominatorTokens: QuantityLiteral[] = mergePowers([
      ...(quantity.construction.denominators || []),
      ...denominators.map((q) => ({ name: q.name })),
    ]);

    cancelPowers(numeratorTokens, denominatorTokens);

    return new Quantity(
      name,
      [
        ...quantity.numerator,
        ...numerators.map((q) => q.numerator).flat(),
        ...denominators.map((q) => q.denominator).flat(),
      ],
      [
        ...quantity.denominator,
        ...numerators.map((q) => q.denominator).flat(),
        ...denominators.map((q) => q.numerator).flat(),
      ],
      { numerators: numeratorTokens, denominators: denominatorTokens },
    );
  }
}

// converts quantity into a unique string for lookup purposes
export const quantitySearchKey = (quantity: Quantity): string =>
  `${quantity.numerator.map(baseQuantityToChar).join('')}/${quantity.denominator
    .map(baseQuantityToChar)
    .join('')}`;

// converts key back to quantity
export const parseQuantityFromKey = (
  name: string,
  key: string,
): Quantity | null => {
  const numerators: BaseQuantity[] = [];
  const denominators: BaseQuantity[] = [];
  let target: BaseQuantity[] = numerators;

  for (const char of key) {
    if (char === '/' && target === numerators) {
      target = denominators;
    } else {
      const base = baseQuantityFromChar(char);
      if (base === undefined) return null;
      target.push(base);
    }
  }

  return new Quantity(name, numerators, denominators, {
    numerators: [{ name }],
    denominators: [],
  });
};

// are two quantities equivalent (such as "velocity" and "distance / time")
export const isEquivalentQuantity = (lhs: Quantity, rhs: Quantity): boolean =>
  quantitySearchKey(lhs) === quantitySearchKey(rhs);

// are two quantities compatible ("close enough")
export const isCompatibleQuantity = (lhs: Quantity, rhs: Quantity): boolean =>
  lhs.name === rhs.name ||
  (!(lhs.name.match(/[*/()^]/) == null) && isEquivalentQuantity(lhs, rhs));

const maybeParenthesize = (name: string) =>
  name.search(/\s/) >= 0 ? `(${name})` : name;

const quantityLiteralToFormula = (token: QuantityLiteral): string =>
  token.power
    ? `${maybeParenthesize(token.name)}^${String(token.power)}`
    : token.name;

export const quantityConstructionToFormula = (quantity: Quantity): string => {
  const { construction } = quantity;
  const { numerators, denominators } = construction;
  let result = numerators.map(quantityLiteralToFormula).join(' * ');

  if (denominators.length > 0) {
    result = result || '1';
    result += ` / ${maybeParenthesize(
      denominators.map(quantityLiteralToFormula).join(' * '),
    )}`;
  }

  return result;
};
