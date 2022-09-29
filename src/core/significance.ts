import { Unit } from './unit';
import { getScaleBetweenUnits } from './convert';
import { powerOfTen } from './fraction';

export interface Significance {
  decimals: number;
  additional: number;
}

export const codepointLength = (text: string) =>
  text.length -
  Array.from(text)
    .map((c) => c.charCodeAt(0))
    .filter((c) => c >= 0xd800 && c < 0xdc00).length;

const safeLog10 = (n: number): number => (n ? Math.log10(Math.abs(n)) : 0);

const lowestPlaceDecimalInternal = (text: string): number => {
  if (!text.includes('.')) return 0;
  return text.split('.')[1].length;
};

export const lowestPlaceDecimal = (value: number): number => {
  const string = String(value).toLowerCase();
  if (string.includes('e')) {
    const dp = lowestPlaceDecimalInternal(string.split('e')[0]);
    const exp = Number(string.split('e')[1]);
    return Math.max(0, dp - exp);
  }
  return lowestPlaceDecimalInternal(string);
};

const getDecimalPoint = (format: Intl.NumberFormat): string =>
  format.formatToParts(0.5).find((part) => part.type === 'decimal')?.value ??
  '.';

const getGroupSeparator = (format: Intl.NumberFormat): string =>
  format.formatToParts(powerOfTen(100n)).find((part) => part.type === 'group')
    ?.value ?? ',';

const SIGNIFICANCE_BUFFER = 2;
const DIGITS_ALWAYS = 2;

const deleteAnyOf = (text: string, characters: string[]): string => {
  for (const character of characters) {
    text = text.replaceAll(character, '');
  }
  return text;
};

const getRedundantDigits = (value: number, text: string): number => {
  const format = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
  text = text.replace(/[+-]/, '');
  const cleanText = deleteAnyOf(text, [
    getDecimalPoint(format),
    getGroupSeparator(format),
  ]);
  const inputLength = codepointLength(cleanText);
  const effectiveLength = codepointLength(
    format
      .formatToParts(value)
      .filter((part) => ['integer', 'fraction'].includes(part.type))
      .map((part) => part.value)
      .join('')
  );
  return Math.max(0, inputLength - effectiveLength);
};

export const getSignificance = (value: number, text: string): Significance => ({
  decimals: Math.ceil(SIGNIFICANCE_BUFFER - safeLog10(value)),
  additional: getRedundantDigits(value, text),
});

const significanceToNumber = (significance: Significance): number =>
  significance.decimals + significance.additional;
const largerSignificance = (a: Significance, b: Significance): Significance =>
  significanceToNumber(a) >= significanceToNumber(b) ? a : b;

export const maximumSignificance = (
  significances: Significance[]
): Significance =>
  significances
    .slice(1)
    .reduce((a, b) => largerSignificance(a, b), significances[0]);

const numberToString = (value: number, useLocale: boolean): string => {
  const nonLocale = String(value);
  if (!useLocale) return nonLocale;
  const lowestPlace = lowestPlaceDecimal(value);
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: Math.min(lowestPlace, 20),
  }).format(value);
};

const toInteger = (value: number): bigint => BigInt(Math.round(value));

const numberToFixed = (
  value: number,
  digits: number,
  useLocale: boolean
): string => {
  digits = Math.max(Math.ceil(digits), DIGITS_ALWAYS) | 0;
  if (digits <= 0) {
    return useLocale
      ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
          value
        )
      : String(toInteger(value));
  }
  // depth ≃ -log10(n); it's the number of decimal places in we have to go in to show the value
  const depth = -safeLog10(value);
  if (useLocale) {
    const dig = Math.min(digits, 20);
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: dig,
    }).format(value);
  }
  const dec = Math.ceil(digits + Math.max(depth, 0));
  return (
    value.toFixed(Math.min(dec, 100)).replace(/0+$/, '').replace(/\.$/, '') ||
    '0'
  );
};

export const formatWithSignificance = (
  value: number,
  significance: Significance | null,
  useLocale: boolean
): string => {
  if (!Number.isFinite(value)) return String(value);
  if (significance == null) return numberToString(value, useLocale);
  const digits = Math.max(0, significance.decimals) + significance.additional;
  const candidates = [
    numberToString(value, useLocale),
    numberToFixed(value, digits, useLocale),
  ];
  candidates.sort((a, b) => a.length - b.length);
  return candidates[0];
};

const adjustSignificance = (
  significance: Significance,
  offset: number
): Significance => ({
  ...significance,
  decimals: significance.decimals + offset,
});

export const formatWithSignificanceAndUnits = (
  value: number,
  significance: Significance | null,
  useLocale: boolean,
  fromUnit: Unit,
  toUnit: Unit
): string => {
  const conversionPrecision =
    -Math.log10(getScaleBetweenUnits(fromUnit, toUnit)) + 1;
  return formatWithSignificance(
    value,
    significance == null
      ? null
      : adjustSignificance(significance, conversionPrecision),
    useLocale
  );
};
