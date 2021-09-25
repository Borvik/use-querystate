export const VALID_TYPES = ["any", "object", "string", "number", "bigint", "boolean", "string[]", "number[]", "bigint[]", "boolean[]"] as const;
type typeofResult = "any" | "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
export type typeofWithArrays = typeofResult | "string[]" | "number[]" | "bigint[]" | "boolean[]";
export type validQSTypes = typeof VALID_TYPES[number];
export type QueryStringFilterTypes = "any" | "string" | "number" | "bigint" | "boolean";

export const SCALAR_TYPES = ['undefined', 'boolean', 'number', 'bigint', 'string'];

export function isValidQSType(value: string): value is validQSTypes {
  return VALID_TYPES.includes(value as validQSTypes);
}

export interface PathTypes {
  [x: string]: validQSTypes | validQSTypes[] | PathTypes
}

export interface ParseOptions<T extends object> {
  types?: PathTypes
  definedTuples?: boolean
  initialState?: T
  lockTypesToInitialState?: boolean
  filterToTypeDef?: boolean
  log?: boolean
}

export interface MergeOptions<T extends object> {
  deepMerge?: boolean
  initialState?: T
}

export interface StringifyOptions<T extends object> {
  initialState?: T
}