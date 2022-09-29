import i18n from '../i18n';
import {
  UnitToken,
  isUnitTokenLiteral,
  isUnitTokenProduct,
  isUnitTokenFraction,
} from '../../core/unit';

const formatOrdinal = (power: bigint): string => {
  const hundred = Number(power % BigInt(100));
  if (hundred < 20) {
    const ones = hundred % 10;
    if (ones >= 1 && ones <= 3) {
      return power.toString() + ['st', 'nd', 'rd'][ones - 1];
    }
  }
  return `${power.toString()}th`;
};

const formatPower = (power: bigint | undefined): [string, string] => {
  if (power === undefined) return ['', ''];
  if (power <= 1) return ['', ''];
  if (power >= 4) return ['', ` to the ${formatOrdinal(power)} power`];
  return [`${['square', 'cubic'][Number(power) - 2]} `, ''];
};

export const getLocalizedUnitName = (token: UnitToken): string => {
  if (isUnitTokenFraction(token)) {
    if (isUnitTokenLiteral(token.numerator) && !token.numerator.unit) {
      return i18n.t('main:unitReciprocal', {
        denominator: getLocalizedUnitName(token.denominator),
      });
    }
    return i18n.t('main:unitPer', {
      numerator: getLocalizedUnitName(token.numerator),
      denominator: getLocalizedUnitName(token.denominator),
    });
  }
  if (isUnitTokenProduct(token)) {
    return token.product.map((t) => getLocalizedUnitName(t)).join('-');
  }
  if (isUnitTokenLiteral(token)) {
    const prefix = token.prefix ? `${token.prefix}` : '';
    const [powerPrefix, powerSuffix] = formatPower(token.power);
    return powerPrefix + prefix + token.unit + powerSuffix;
  }
  throw new Error('invalid token');
};
