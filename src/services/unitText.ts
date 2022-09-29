import i18n from './i18n';
import {
  UnitToken,
  isUnitTokenLiteral,
  isUnitTokenProduct,
  isUnitTokenFraction,
  parseUnitTokenFromName,
} from '../core/unit';
import { parenthesize } from '../core/util';

import { getLocalizedUnitName as getLocalizedUnitName_en } from './languages/en';
import { getLocalizedUnitName as getLocalizedUnitName_fi } from './languages/fi';

const unitNameToText_impl: {
  [languageCode: string]: (unit: UnitToken) => string;
} = {
  en: getLocalizedUnitName_en,
  fi: getLocalizedUnitName_fi
};

const getLocalizedUnitName_default = (token: UnitToken): string => {
  if (isUnitTokenFraction(token)) {
    return `${getLocalizedUnitName_default(token.numerator)} / ${parenthesize(
      getLocalizedUnitName_default(token.denominator)
    )}`;
  }
  if (isUnitTokenProduct(token)) {
    return token.product.map(getLocalizedUnitName_default).join(' * ');
  }
  if (isUnitTokenLiteral(token)) {
    const prefix = token.prefix ? `${token.prefix}-` : '';
    const power = token.power ? `^${token.power.toString()}` : '';
    return prefix + token.unit + power;
  }
  throw new Error('invalid token');
};

export const getLocalizedUnitName_impl = (
  language: string
): ((token: UnitToken) => string) => {
  if (unitNameToText_impl[language]) return unitNameToText_impl[language];
  return getLocalizedUnitName_default;
};

export const getLocalizedUnitNameFromToken = (unit: UnitToken): string =>
  getLocalizedUnitName_impl(i18n.resolvedLanguage)(unit);

export const getLocalizedUnitName = (name: string): string =>
  getLocalizedUnitNameFromToken(parseUnitTokenFromName(name));
