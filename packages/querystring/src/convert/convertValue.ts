import { isset } from "../isset";
import { isValidQSType, typeofWithArrays } from "../types";
import { convertToBigInt } from "./convertToBigInt";
import { convertToBoolean } from "./convertToBoolean";
import { convertToNumber } from "./convertToNumber";

export function convertValue(value: unknown, toType: typeofWithArrays) {
  if (!isValidQSType(toType))
    throw new Error(`Unable to convert string value to '${toType}'`);

  if (typeof value === 'undefined') return undefined;
  if (value === null) return undefined;

  if (toType === 'object') {
    // special handling for objects (NOT ARRAYS)
    if (value === '') return undefined;
    if (typeof value !== 'object')
      throw new Error(`Unable to convert ${typeof value} to an 'object'`);
    if (Array.isArray(value))
      throw new Error(`Unable to convert an array to a standard object`);
    return value;
  }

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