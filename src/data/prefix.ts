import { Prefix } from '../core/prefix';
import {
  Fraction,
  powerOfTenFraction,
  fractionToString,
  multiplyFraction,
} from '../core/fraction';

const P = (symbol: string, name: string, factor: Fraction): Prefix => ({
  symbol,
  name,
  factor,
});
const P10 = (symbol: string, name: string, power: number): Prefix =>
  P(symbol, name, powerOfTenFraction(power));

// SI prefixes
/* eslint-disable */ 
export const PREFIXES: Prefix[] = [
  P10('Y',  'yotta',  24),
  P10('Z',  'zetta',  21),
  P10('E',  'exa',    18),
  P10('P',  'peta',   15),
  P10('T',  'tera',   12),
  P10('G',  'giga',    9),
  P10('M',  'mega',    6),
  P10('k',  'kilo',    3),
  P10('h',  'hecto',   2),
  P10('da', 'deca',    1),

  P10('d',  'deci',   -1),
  P10('c',  'centi',  -2),
  P10('m',  'milli',  -3),
  P10('µ',  'micro',  -6),
  P10('n',  'nano',   -9),
  P10('p',  'pico',  -12),
  P10('f',  'femto', -15),
  P10('a',  'atto',  -18),
  P10('z',  'zepto', -21),
  P10('y',  'yocto', -24),
];
/* eslint-enable */

export const PREFIX: { [name: string]: Prefix } = {};
export const INVERSE_PREFIX: { [name: string]: string } = {};
export const PRODUCT_PREFIX: { [name: string]: { [name: string]: string } } =
  {};

const PREFIXES_BY_FACTOR: { [factor: string]: string } = {};

PREFIXES_BY_FACTOR['1/1'] = '';
PREFIXES.forEach((prefix) => {
  PREFIX[prefix.name] = prefix;
  PREFIXES_BY_FACTOR[fractionToString(prefix.factor)] = prefix.name;
});

PREFIXES.forEach((prefix) => {
  const inverse = PREFIXES.find(
    (candidate) =>
      candidate.factor.numerator === prefix.factor.denominator &&
      candidate.factor.denominator === prefix.factor.numerator,
  );
  if (inverse != null) INVERSE_PREFIX[prefix.name] = inverse.name;

  const products: { [name: string]: string } = {};
  PRODUCT_PREFIX[prefix.name] = products;
  PREFIXES.forEach((prefix2) => {
    const product = multiplyFraction(prefix.factor, prefix2.factor);
    const candidate = PREFIXES_BY_FACTOR[fractionToString(product)];
    if (candidate !== undefined) products[prefix2.name] = candidate;
  });
});
