export const isInteger = (n: number): boolean => n === Math.floor(n);

export const deparenthesize = (text: string | undefined): string => {
  text = text ?? '';
  if (text.startsWith('(') && text.endsWith(')')) {
    text = text.slice(1, -1);
  }
  return text;
};

export const parenthesize = (text: string | undefined): string => {
  text = text ?? '';
  if (text.match(/[*/()^]/) != null && !text.startsWith('(')) {
    text = `(${text})`;
  }
  return text;
};

export const makeNeatProductFromSortedTerms = (terms: string[]): string => {
  if (terms.length <= 1) {
    return terms[0] || '';
  }
  const mergedTerms: Array<[string, bigint]> = [];
  for (const term of terms) {
    if (
      mergedTerms.length === 0 ||
      mergedTerms[mergedTerms.length - 1][0] !== term
    ) {
      mergedTerms.push([term, 1n]);
    } else {
      mergedTerms[mergedTerms.length - 1][1]++;
    }
  }
  return mergedTerms
    .map(([term, power]) => term + (power > 1 ? `^${power.toString()}` : ''))
    .join('*');
};

export const shallowCopy = <T extends object>(value: T): T => ({ ...value });

// TODO fix. this may very well be broken
export const caseFold = (
  text: string,
  locales?: string[] | undefined
): string => text.toLocaleLowerCase(locales);

export const residualSplit = (
  text: string,
  separator: string,
  maxSplit: number | undefined
): string[] => {
  const split = text.split(separator);
  if (maxSplit === undefined) return split;
  if (maxSplit < 0 || !Number.isFinite(maxSplit) || !isInteger(maxSplit)) {
    throw new Error('maxSplit must be a non-negative integer');
  }
  return [...split.slice(0, maxSplit), split.slice(maxSplit).join(separator)];
};
