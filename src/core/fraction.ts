// fraction (bigint/bigint)
export interface Fraction {
  numerator: bigint;
  denominator: bigint;
}

// standard Euclidean for GCD (for reducing fractions)
export const greatestCommonDivisor = (a: bigint, b: bigint): bigint => {
  let t: bigint;
  while (b > 0) {
    t = b;
    b = a % b;
    a = t;
  }
  return a;
};

// absolute value of bigint (3 => 3, -5 => 5, etc.)
const bigintAbs = (number: bigint): bigint => (number < 0 ? -number : number);

// bigint, bigint -> bigint/bigint fraction
export const makeFraction = (
  numerator: bigint,
  denominator: bigint
): Fraction => {
  if (!denominator) {
    throw new Error('denominator cannot be zero');
  }
  if (denominator < 0) {
    numerator = -numerator;
    denominator = -denominator;
  }
  // reduce fraction by GCD
  const gcd = greatestCommonDivisor(bigintAbs(numerator), denominator);
  numerator /= gcd;
  denominator /= gcd;
  return { numerator, denominator };
};

export const integerToFraction = (integer: bigint): Fraction => ({
  numerator: integer,
  denominator: 1n,
});

export const powerOfTwo = (power: number | bigint): bigint => {
  if (typeof power === 'number') power = BigInt(power);
  return 2n ** power;
};

export const powerOfTen = (power: number | bigint): bigint => {
  if (typeof power === 'number') power = BigInt(power);
  return 10n ** power;
};

export const powerOfTenFraction = (power: number | bigint): Fraction => {
  if (typeof power === 'number') power = BigInt(power);
  const result = powerOfTen(bigintAbs(power));
  if (power < 0) {
    // -5 => 10^-5 > 1/10^5
    return makeFraction(1n, result);
  }
  return makeFraction(result, 1n);
};

// parses a number in one of three formats into a Fraction
//    (a) 5 -> 5(/1)
//    (b) 5/2 -> 5/2
//    (c) 5.2 -> 52/10
export const parseFraction = (text: string): Fraction => {
  if (text.match(/^[0-9]+(?:[/.][0-9]+)?$/) == null) {
    throw new Error(`invalid fraction format (cannot parse ${text})`);
  }
  if (text.includes('/')) {
    let [numerator, denominator] = text.split('/');
    numerator = numerator.trim();
    denominator = denominator.trim();
    return makeFraction(BigInt(numerator), BigInt(denominator));
  }
  if (text.includes('.')) {
    let [numerator, denominator] = text.split('.');
    numerator = numerator.trim();
    denominator = denominator.trim();
    numerator += denominator;
    return makeFraction(BigInt(numerator), powerOfTen(denominator.length));
  }
  return integerToFraction(BigInt(text));
};

// standard fraction multiplication a/b * c/d = ac/bd
export const multiplyFraction = (a: Fraction, b: Fraction): Fraction =>
  makeFraction(a.numerator * b.numerator, a.denominator * b.denominator);

// standard fraction division a/b * c/d = ad/bc
export const divideFraction = (a: Fraction, b: Fraction): Fraction =>
  makeFraction(a.numerator * b.denominator, a.denominator * b.numerator);

export const fractionToNumber = (fraction: Fraction): number =>
  // TODO this function is not good, come up with something better
  Number(fraction.numerator) / Number(fraction.denominator);

export const fractionToString = (fraction: Fraction): string =>
  `${fraction.numerator.toString()}/${fraction.denominator.toString()}`;

const productNumber = (numbers: number[]): number =>
  numbers.reduce((a, b) => a * b, 1);

export const divideScales = (
  numerators: number[],
  denominators: number[]
): number =>
  // what about when we're dealing with large numbers?
  productNumber(numerators) / productNumber(denominators);
