export const VALID_TYPES: string[] = ["any", "string", "number", "bigint", "boolean", "string[]", "number[]", "bigint[]", "boolean[]"];
type typeofResult = "any" | "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
export type typeofWithArrays = typeofResult | "string[]" | "number[]" | "bigint[]" | "boolean[]";
export type validQSTypes = "any" | "string" | "number" | "bigint" | "boolean" | "string[]" | "number[]" | "bigint[]" | "boolean[]";
export type QueryStringFilterTypes = "any" | "string" | "number" | "bigint" | "boolean";

export const SCALAR_TYPES = ['undefined', 'boolean', 'number', 'bigint', 'string'];

export function isValidQSType(value: string): value is validQSTypes {
  return VALID_TYPES.includes(value);
}

export interface PathTypes {
  [x: string]: validQSTypes | validQSTypes[] | PathTypes
}

export interface ParseOptions {
  types?: PathTypes
  definedTuples?: boolean
}

export interface MergeOptions {
  deepMerge?: boolean
}