export function convertToBoolean(value: unknown): boolean | undefined {
  if (!value || value === null) return undefined;
  if (typeof value !== 'string')
    throw new Error(`Unable to convert value to boolean`);

  if (['1', 'true', 't'].includes(value.toLocaleLowerCase()))
    return true;
  if (['0', 'false', 'f'].includes(value.toLocaleLowerCase()))
    return false;
  throw new Error(`QS value "${value}" cannot be represented as a 'boolean'.`);
}