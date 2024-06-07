import i18n from '../i18n';
import {
  UnitToken,
  isUnitTokenLiteral,
  isUnitTokenProduct,
  isUnitTokenFraction,
} from '../../core/unit';

const formatPower = (power: bigint | undefined): [string, string] => {
  if (power === undefined || power < 2) return ['', ''];
  if (power >= 10) return ['', ` ${String(power)}:een`];
  if (power <= 3) return [['neliö', 'kuutio'][Number(power) - 2], ''];
  return [
    '',
    ' ' +
      [
        'neljänteen',
        'viidenteen',
        'kuudenteen',
        'seitsemänteen',
        'kahdeksanteen',
        'yhdeksänteen',
        'kymmenenteen',
      ][Number(power) - 4],
  ];
};

const getPrefix = (prefix: string) => i18n.t(`prefix:${prefix}`) ?? prefix;
const getUnit = (unit: string) => i18n.t(`unit:${unit}`) ?? unit;
const getUnitPer = (unit: string) =>
  i18n.exists(`extra:unit_ine.${unit}`)
    ? i18n.t(`extra:unit_ine.${unit}`)
    : `per ${getUnit(unit)}`;

const hyphenate = (previous: string, next: string): boolean =>
  !!next.match(/^[aeiouyäö]$/i) && previous.slice(-1) === next.slice(0, 1);

const compoundJoin = (parts: string[]): string => {
  if (!parts.length) return '';
  let result = parts[0];

  for (let i = 1; i < parts.length; ++i) {
    const previousPart = parts[i - 1];
    const nextPart = parts[i];
    let separator = '';

    if (nextPart.match(/\s/)) {
      separator = '- ';
    } else if (previousPart.match(/\s/)) {
      separator = ' -';
    } else if (
      Boolean(previousPart.match(/-/)) ||
      Boolean(nextPart.match(/-/)) ||
      hyphenate(previousPart, nextPart)
    ) {
      separator = '-';
    }

    result += separator + nextPart;
  }

  return result;
};

export const generate = (token: UnitToken, reciprocal: boolean): string => {
  if (isUnitTokenFraction(token)) {
    if (isUnitTokenLiteral(token.numerator) && !token.numerator.unit) {
      return i18n.t('main:unitReciprocal', {
        denominator: generate(token.denominator, true),
      });
    }
    return i18n.t('main:unitPer', {
      numerator: generate(token.numerator, false),
      denominator: generate(token.denominator, true),
    });
  }
  if (isUnitTokenProduct(token)) {
    const parts = token.product;
    const lastIndex = parts.length - 1;
    return compoundJoin(
      parts.map((t, index) => generate(t, reciprocal && index === lastIndex)),
    );
  }
  if (isUnitTokenLiteral(token)) {
    const prefix = token.prefix ? `${getPrefix(token.prefix)}` : '';
    const [powerPrefix, powerSuffix] = formatPower(token.power);
    const parts = [(reciprocal ? getUnitPer : getUnit)(token.unit)];
    if (prefix) parts.unshift(prefix);
    if (powerPrefix) parts.unshift(powerPrefix);
    return compoundJoin(parts) + powerSuffix;
  }
  throw new Error('invalid token');
};

export const getLocalizedUnitName = (token: UnitToken): string =>
  generate(token, false);
