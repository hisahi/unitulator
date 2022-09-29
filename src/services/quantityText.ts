export const getLocalizedQuantityName = (
  name: string,
  t: (key: string, values?: { [key: string]: string }) => string
): string =>
  name.startsWith('!')
    ? t('main:quantityCustom', { name: name.slice(1) })
    : t(`quantity:${name}`);

export const makeLiteralQuantityName = (name: string): string => `!${name}`;
