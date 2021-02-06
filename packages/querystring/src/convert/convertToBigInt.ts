export function convertToBigInt(value: unknown): BigInt | undefined {
  if (!value || value === null) return undefined;
  if (typeof value !== 'string')
    throw new Error(`Unable to convert value to bigint`);

  if (!value.match(/^\d+$/))
    throw new Error(`QS value "${value}" cannot be represented as a 'bigint'.`);
  return BigInt(value);
}