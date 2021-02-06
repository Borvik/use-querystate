import { isset } from "../isset";
import { typeofWithArrays, VALID_TYPES } from "../types";
import { convertToBigInt } from "./convertToBigInt";
import { convertToBoolean } from "./convertToBoolean";
import { convertToNumber } from "./convertToNumber";

export function convertValue(value: unknown, toType: typeofWithArrays) {
  if (!VALID_TYPES.includes(toType))
    throw new Error(`Unable to convert string value to '${toType}'`);

  if (typeof value === 'undefined') return undefined;
  if (value === null) return undefined;

  if (typeof value === toType || toType === 'any')
    return value;

  if (toType === 'bigint') {
    return convertToBigInt(value);
  }

  if (toType === 'bigint[]') {
    if (!value) return undefined;

    if (Array.isArray(value))
      return value.map(convertToBigInt).filter(isset);

    if (typeof value !== 'string')
      throw new Error(`Unable to convert value to number array`);
    let valueArr = value.split(',');
    return valueArr.map(convertToBigInt).filter(isset);
  }

  if (toType === 'number') {
    return convertToNumber(value);
  }

  if (toType === 'number[]') {
    if (!value) return undefined;

    if (Array.isArray(value))
      return value.map(convertToNumber).filter(isset);

    if (typeof value !== 'string')
      throw new Error(`Unable to convert value to number array`);
    let valueArr = value.split(',');
    return valueArr.map(convertToNumber).filter(isset);
  }

  if (toType === 'boolean') {
    return convertToBoolean(value);
  }

  if (toType === 'boolean[]') {
    if (!value) return undefined;

    if (Array.isArray(value))
      return value.map(convertToBoolean).filter(isset);

    if (typeof value !== 'string')
      throw new Error(`Unable to convert value to boolean array`);
    let valueArr = value.split(',');
    return valueArr.map(convertToBoolean).filter(isset);
  }

  if (toType === 'string[]') {
    if (typeof value === 'undefined' || value === null)
      return undefined;
    if (Array.isArray(value))
      return value;
    if (typeof value !== 'string')
      throw new Error(`Unable to convert value to string array`);
    return value.split(',');
  }

  return value;
}