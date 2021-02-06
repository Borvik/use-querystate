export function convertToNumber(value: unknown): number | undefined {
  if (typeof value === 'undefined' || value === null)
    return undefined;

  if (typeof value !== 'string')
    throw new Error(`Unable to convert value to number`);

  // Special case to allow reading "empty" value from qs
  if (value === '') return Number.NaN;

  if (isNaN(Number(value)))
    throw new Error(`QS value "${value}" cannot be represented as a 'number'.`);
  return Number(value);
}