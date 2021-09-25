
export function isObjEmpty(value: unknown): boolean {
  if (typeof value === 'undefined') return true;
  if (value === null) return true;
  if (Array.isArray(value) && !value.length) return true;
  if (typeof value === 'object' && Object.keys(value!).length) return true;
  return false;
}