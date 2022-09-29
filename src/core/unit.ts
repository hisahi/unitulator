import { Quantity, isEquivalentQuantity } from './quantity';
import {
  Fraction,
  makeFraction,
  multiplyFraction,
  divideFraction,
  divideScales,
  fractionToNumber,
} from './fraction';
import { parenthesize, residualSplit, shallowCopy } from './util';
import { Prefix } from './prefix';
import { PREFIX, INVERSE_PREFIX, PRODUCT_PREFIX } from '../data/prefix';
import { makeQuantity, SCALAR_QUANTITY } from '../data/quantity';

/* unit token etc. structures. all units in Unitulator are
      literals (unit, possibly with a prefix and integer power > 1)
      products of literals
      a fraction of two products of literals
   meter = m
   meter^2 = m^2
   second*ampere = s*A
   meter/second = m/s
   (second*ampere)/(meter/second) = (s^2*A)/(m)
   etc. */

export interface UnitTokenLiteral {
  prefix?: string;
  unit: string;
  symbol?: string;
  power?: bigint;
}

export interface UnitTokenProduct {
  product: UnitTokenLiteral[];
}

export type UnitTokenLiteralOrProduct = UnitTokenLiteral | UnitTokenProduct;

export interface UnitTokenFraction {
  numerator: UnitTokenLiteralOrProduct;
  denominator: UnitTokenLiteralOrProduct;
}

export type UnitToken = UnitTokenLiteral | UnitTokenProduct | UnitTokenFraction;

export const isUnitTokenLiteral = (
  token: UnitToken
): token is UnitTokenLiteral => 'unit' in token;
export const isUnitTokenProduct = (
  token: UnitToken
): token is UnitTokenProduct => 'product' in token;
export const isUnitTokenFraction = (
  token: UnitToken
): token is UnitTokenFraction => 'numerator' in token;

// creates a unique name for a unit out of the token construction
/* unitName format: English words [A-Z] per unit.
      prefixes: kilo-meter (kilometer = km)
      products: newton*meter (newton-meter = Nm)
      quotients: meter/second (meters per second = m/s)
        only one / per name: kilo-gram*meter^2/second^3*ampere^2 = (kg*m^2/(s^3*A^2)) = ohm
      powers: meter^2 (square meter)
      any combination of the above, but no parentheses (and prefixes can only be attached to singular units)
*/
const constructionToName = (token: UnitToken): string => {
  if (isUnitTokenFraction(token)) {
    const { numerator, denominator } = token;
    const numeratorName = constructionToName(numerator);
    const denominatorName = constructionToName(denominator);
    return `${numeratorName}/${denominatorName}`;
  }
  if (isUnitTokenProduct(token)) {
    return token.product.map(constructionToName).join('*');
  }
  if (isUnitTokenLiteral(token)) {
    const { prefix, unit, power } = token;
    const prefixName = prefix ? `${PREFIX[prefix].name}-` : '';
    const powerName = power && power > 1 ? `^${power.toString()}` : '';
    return prefixName + unit + powerName;
  }
  throw new Error('unrecognized token type');
};

// creates a symbol i.e. abbreviation for a unit out of the token construction
// e.g. METER^2 / SECOND = m^2/s
const constructionToSymbol = (token: UnitToken): string => {
  if (isUnitTokenFraction(token)) {
    const { numerator, denominator } = token;
    const numeratorSymbol = constructionToSymbol(numerator) || '1';
    const denominatorSymbol = constructionToSymbol(denominator);
    return `${numeratorSymbol}/${
      denominatorSymbol.includes('*')
        ? `(${denominatorSymbol})`
        : denominatorSymbol
    }`;
  }
  if (isUnitTokenProduct(token)) {
    return token.product.map(constructionToSymbol).join('*');
  }
  if (isUnitTokenLiteral(token)) {
    const { prefix, symbol, power } = token;
    const prefixSymbol = prefix ? PREFIX[prefix].symbol : '';
    const powerSymbol = power && power > 1 ? `^${power.toString()}` : '';
    return `${prefixSymbol}${symbol}${powerSymbol}`;
  }
  throw new Error('unrecognized token type');
};

// constructs an UnitToken, literal or product, out of a list of literals, combining duplicates into powers
const makeProduct = (
  partsOriginal: UnitTokenLiteral[]
): UnitTokenLiteralOrProduct => {
  if (partsOriginal.length === 0) return SCALAR_TOKEN;

  const parts: UnitTokenLiteral[] = [];
  const literals: { [key: string]: UnitTokenLiteral } = {};

  for (const part of partsOriginal) {
    const newPart = { ...part };
    const literal = literals[newPart.unit];
    if (literal) {
      // duplicate; combine powers
      literal.power = (literal.power ?? 1n) + (part.power ?? 1n);
    } else {
      // new: add to list
      literals[newPart.unit] = newPart;
      parts.push(newPart);
    }
  }

  if (parts.length === 1) {
    // literal out of a single part
    return parts[0];
  }
  return { product: parts };
};

const dumpConstruction = (
  token: UnitToken,
  numeratorTokens: UnitTokenLiteral[],
  denominatorTokens: UnitTokenLiteral[]
): void => {
  if (isUnitTokenFraction(token)) {
    // swap num and denom for denominator, since a/(b/c) = a*c/b
    dumpConstruction(token.numerator, numeratorTokens, denominatorTokens);
    dumpConstruction(token.denominator, denominatorTokens, numeratorTokens);
  } else if (isUnitTokenProduct(token)) {
    token.product.forEach((unit) =>
      dumpConstruction(unit, numeratorTokens, denominatorTokens)
    );
  } else if (isUnitTokenLiteral(token)) {
    numeratorTokens.push(token);
  } else {
    throw new Error('unrecognized token type');
  }
};

const simplifyPrefixesWithin = (tokens: UnitTokenLiteral[]) => {
  // simplify prefixes within the list of tokens
  const prefixesByPower: { [powerKey: string]: UnitTokenLiteral[] } = {};

  nextToken: for (const token of tokens) {
    if (token.prefix) {
      const powerKey = token.power?.toString() ?? '1';
      let existingList = prefixesByPower[powerKey];
      if (!existingList) {
        existingList = [];
        prefixesByPower[powerKey] = existingList;
      }

      for (let index = 0; index < existingList.length; ++index) {
        const existing = existingList[index];
        const product = PRODUCT_PREFIX[existing.prefix!][token.prefix];
        if (product !== undefined) {
          delete token.prefix;
          if (product) {
            existing.prefix = product;
          } else {
            delete existing.prefix;
            existingList.splice(index, 1);
          }
          continue nextToken;
        }
      }

      existingList.push(token);
    }
  }
};

const simplifyPrefixes = (
  numerators: UnitTokenLiteral[],
  denominators: UnitTokenLiteral[]
) => {
  // simplify prefixes within the list(s) of tokens
  simplifyPrefixesWithin(numerators);
  simplifyPrefixesWithin(denominators);

  // then cancel out opposing prefixes between the two lists
  const numeratorPrefixesByPower: { [powerKey: string]: UnitTokenLiteral[] } =
    {};
  for (const token of numerators) {
    if (token.prefix) {
      const powerKey = token.power?.toString() ?? '1';
      let existingList = numeratorPrefixesByPower[powerKey];
      if (!existingList) {
        existingList = [];
        numeratorPrefixesByPower[powerKey] = existingList;
      }
      existingList.push(token);
    }
  }

  nextToken: for (const token of denominators) {
    if (token.prefix) {
      const inverse = INVERSE_PREFIX[token.prefix];
      if (inverse) {
        const existingList =
          numeratorPrefixesByPower[token.power?.toString() ?? '1'];
        for (
          let index = 0;
          existingList && index < existingList.length;
          ++index
        ) {
          const existing = existingList[index];
          const product = PRODUCT_PREFIX[existing.prefix!][inverse];
          if (product !== undefined) {
            delete token.prefix;
            if (product) {
              existing.prefix = product;
            } else {
              delete existing.prefix;
              existingList.splice(index, 1);
            }
            continue nextToken;
          }
        }
      }
    }
  }
};

const combinePowers = (tokens: UnitTokenLiteral[]) => {
  const tokensByName: { [name: string]: UnitTokenLiteral } = {};

  for (let index = 0; index < tokens.length; ) {
    const token = tokens[index];
    const name = (token.prefix ? `${token.prefix}-` : '') + token.unit;
    const duplicate = tokensByName[name];
    if (duplicate) {
      duplicate.power = duplicate.power ?? 1n;
      ++duplicate.power;
      tokens.splice(index, 1);
    } else {
      tokensByName[name] = token;
      ++index;
    }
  }
};

const cancelTokens = (
  numerators: UnitTokenLiteral[],
  denominators: UnitTokenLiteral[]
) => {
  combinePowers(numerators);
  combinePowers(denominators);

  // cancel out units from both sides (including in powers)
  const numeratorsByName: {
    [name: string]: Array<[number, UnitTokenLiteral]>;
  } = {};

  for (let index = 0; index < numerators.length; ++index) {
    const token = numerators[index];
    const name = (token.prefix ? `${token.prefix}-` : '') + token.unit;
    if (!numeratorsByName[name]) numeratorsByName[name] = [];
    numeratorsByName[name].push([index, token]);
  }

  nextDenominator: for (let index = 0; index < denominators.length; ) {
    const token = denominators[index];
    const name = (token.prefix ? `${token.prefix}-` : '') + token.unit;
    const candidates = numeratorsByName[name];
    if (candidates) {
      for (let candidateIndex = 0; candidateIndex < candidates.length; ) {
        const [numeratorIndex, candidate] = candidates[candidateIndex];
        const candidatePower = candidate.power ?? 1n;
        const tokenPower = token.power ?? 1n;

        if (candidatePower > tokenPower) {
          candidate.power = candidatePower - tokenPower;
        }
        if (candidatePower < tokenPower) {
          token.power = tokenPower - candidatePower;
        }

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

const makeConstruction = (
  numerators: Unit[],
  denominators: Unit[]
): UnitToken => {
  let numeratorTokens: UnitTokenLiteral[] = [];
  let denominatorTokens: UnitTokenLiteral[] = [];

  numerators.forEach((unit) =>
    dumpConstruction(unit.construction, numeratorTokens, denominatorTokens)
  );
  denominators.forEach((unit) =>
    dumpConstruction(unit.construction, denominatorTokens, numeratorTokens)
  );

  numeratorTokens = numeratorTokens
    .filter((token) => token.unit)
    .map(shallowCopy<UnitTokenLiteral>);
  denominatorTokens = denominatorTokens
    .filter((token) => token.unit)
    .map(shallowCopy<UnitTokenLiteral>);

  simplifyPrefixes(numeratorTokens, denominatorTokens);
  cancelTokens(numeratorTokens, denominatorTokens);

  if (denominatorTokens.length === 0) {
    return makeProduct(numeratorTokens);
  }

  return {
    numerator: makeProduct(numeratorTokens),
    denominator: makeProduct(denominatorTokens),
  };
};

const parseUnitTokenProductFromLiteral = (name: string): UnitTokenLiteral => {
  if (!name) return SCALAR_TOKEN;

  let prefix = '';
  let power: bigint | null = null;

  if (name.includes('^')) {
    const [restOfString, powerString] = residualSplit(name, '^', 1);
    try {
      power = BigInt(powerString);
    } catch (e) {
      // OK, that's fine then
    }
    name = restOfString;
  }

  if (name.includes('-')) {
    const [prefixString, restOfString] = residualSplit(name, '-', 1);
    prefix = prefixString;
    name = restOfString;
  }

  return { unit: name, prefix: prefix ?? undefined, power: power ?? undefined };
};

const parseUnitTokenProductFromName = (name: string): UnitTokenLiteral[] =>
  name.split('*').map(parseUnitTokenProductFromLiteral);

export const parseUnitTokenFromName = (name: string): UnitToken => {
  if (name.includes('/')) {
    const [numeratorString, denumeratorString] = residualSplit(name, '/', 1);

    const numeratorTokens = parseUnitTokenProductFromName(numeratorString);
    const denominatorTokens = parseUnitTokenProductFromName(denumeratorString);

    simplifyPrefixes(numeratorTokens, denominatorTokens);
    cancelTokens(numeratorTokens, denominatorTokens);

    if (denominatorTokens.length === 0) {
      return makeProduct(numeratorTokens);
    }

    return {
      numerator: makeProduct(numeratorTokens),
      denominator: makeProduct(denominatorTokens),
    };
  }

  const tokens = parseUnitTokenProductFromName(name);
  simplifyPrefixesWithin(tokens);
  return makeProduct(tokens);
};

export const unitTokenToUnit = (
  token: UnitToken,
  unitTable: { [key: string]: Unit }
): Unit | null => {
  if (isUnitTokenFraction(token)) {
    const { numerator, denominator } = token;
    const numeratorUnit = unitTokenToUnit(numerator, unitTable);
    if (numeratorUnit === null) return null;
    const denominatorUnit = unitTokenToUnit(denominator, unitTable);
    if (denominatorUnit === null) return null;
    return Unit.derivedUnit([numeratorUnit], [denominatorUnit]);
  }
  if (isUnitTokenProduct(token)) {
    const { product } = token;
    const units = [];
    for (const token of product) {
      const unit = unitTokenToUnit(token, unitTable);
      if (unit === null) return null;
      units.push(unit);
    }
    return Unit.derivedUnit(units, []);
  }
  if (isUnitTokenLiteral(token)) {
    const { prefix, unit, power } = token;
    let result = unitTable[unit];
    if (!result) return null;
    if (prefix) {
      const prefixObject = PREFIX[prefix];
      if (!prefixObject) return null;
      result = Unit.prefixUnit(prefixObject, result);
    }
    if (power) {
      result = Unit.powerUnit(result, power);
    }
    return result;
  }
  throw new Error('unrecognized token type');
};

export const parseUnitFromName = (
  name: string,
  unitTable: { [key: string]: Unit }
): Unit | null => unitTokenToUnit(parseUnitTokenFromName(name), unitTable);

const ONE_ONE = makeFraction(1n, 1n);

// product of N fractions
const productFraction = (numbers: Fraction[]): Fraction =>
  numbers.reduce(multiplyFraction, ONE_ONE);

export class Unit {
  // name = localizable unique name, format described above.
  // symbol = symbol/abbreviation
  // quantity = quantity this unit represents
  // scale = the scale of this unit relative to the basic unit (such as feet to the meter)
  // scaleConstant = additional floating-point factor (e.g. PI for degrees/radians)
  // construction = a tree of how the unit is laid out

  constructor(
    public name: string,
    public symbol: string,
    public quantity: Quantity,
    public scale: Fraction,
    public scaleConstant: number,
    public construction: UnitToken
  ) {}

  // basic unit with name, symbol, quantity and scale 1 (basic unit for that quantity)
  static baseUnit(name: string, symbol: string, quantity: Quantity): Unit {
    return new Unit(name, symbol, quantity, ONE_ONE, 1, { unit: name, symbol });
  }

  // base unit with an SI prefix
  static prefixUnit(prefix: Prefix, unit: Unit): Unit {
    if (unit.name.match(/[*/()-]/) != null) {
      throw new Error(
        'cannot stack prefixes or add prefixes to non-basic units'
      );
    }
    return new Unit(
      `${prefix.name}-${unit.name}`,
      prefix.symbol + parenthesize(unit.symbol),
      unit.quantity,
      multiplyFraction(unit.scale, prefix.factor),
      unit.scaleConstant,
      { unit: unit.name, symbol: unit.symbol, prefix: prefix.name }
    );
  }

  // base unit with scaling (e.g. feet for meters, degrees for radians)
  static scaledUnit(
    name: string,
    symbol: string,
    unit: Unit,
    scale: Fraction,
    scaleConstant: number
  ): Unit {
    return new Unit(
      name,
      symbol,
      unit.quantity,
      multiplyFraction(unit.scale, scale),
      scaleConstant,
      { unit: name, symbol }
    );
  }

  // derived unit out of a "fraction" of units
  static derivedUnitWithConstruction(
    symbol: string,
    name: string,
    quantity: Quantity | undefined,
    numerators: Unit[],
    denominators: Unit[],
    construction: UnitToken
  ): Unit {
    // TODO better simplification.
    const automaticQuantity = makeQuantity(
      numerators.map((unit) => unit.quantity),
      denominators.map((unit) => unit.quantity)
    );
    if (quantity != null) {
      if (!isEquivalentQuantity(quantity, automaticQuantity)) {
        throw new Error('quantity mismatch!');
      }
    } else {
      quantity = automaticQuantity;
    }
    return new Unit(
      name,
      symbol,
      quantity,
      divideFraction(
        productFraction(numerators.map((unit) => unit.scale)),
        productFraction(denominators.map((unit) => unit.scale))
      ),
      divideScales(
        numerators.map((unit) => unit.scaleConstant),
        denominators.map((unit) => unit.scaleConstant)
      ),
      construction
    );
  }

  // derived unit out of a quantity and "fraction" of units
  static derivedUnitWithNameAndQuantity(
    symbol: string,
    name: string,
    quantity: Quantity | undefined,
    numerators: Unit[],
    denominators: Unit[]
  ): Unit {
    return Unit.derivedUnitWithConstruction(
      symbol,
      name,
      quantity,
      numerators,
      denominators,
      makeConstruction(numerators, denominators)
    );
  }

  static derivedUnitWithName(
    symbol: string,
    name: string,
    numerators: Unit[],
    denominators: Unit[],
    construction: UnitToken | undefined
  ): Unit {
    construction = construction ?? makeConstruction(numerators, denominators);
    return Unit.derivedUnitWithConstruction(
      symbol,
      name,
      undefined,
      numerators,
      denominators,
      construction
    );
  }

  static derivedUnitWithSymbol(
    symbol: string | undefined,
    numerators: Unit[],
    denominators: Unit[]
  ): Unit {
    const construction = makeConstruction(numerators, denominators);
    const name = constructionToName(construction);
    return Unit.derivedUnitWithName(
      symbol ? symbol : constructionToSymbol(construction),
      name,
      numerators,
      denominators,
      construction
    );
  }

  static derivedUnit(numerators: Unit[], denominators: Unit[]): Unit {
    return Unit.derivedUnitWithSymbol(undefined, numerators, denominators);
  }

  // unit raised to Nth power
  static powerUnit(unit: Unit, power: bigint): Unit {
    const result: Unit[] = [];
    const negative = power < 0;
    if (negative) power = -power;
    while (power > 0) {
      result.push(unit);
      --power;
    }
    return Unit.derivedUnit(negative ? [] : result, negative ? result : []);
  }
}

export const getUnitScale = (unit: Unit) =>
  unit.scaleConstant * fractionToNumber(unit.scale);

export const SCALAR_UNIT = Unit.baseUnit('', '1', SCALAR_QUANTITY);
const SCALAR_TOKEN: UnitTokenLiteral = { unit: '', symbol: SCALAR_UNIT.symbol };
