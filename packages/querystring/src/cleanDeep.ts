/**
 * Typescripified from: https://www.npmjs.com/package/clean-deep
 * 
 * Also better import/export behavior
 */
import transform from 'lodash/transform.js';
import isPlainObject from 'lodash/isPlainObject.js';
import isEmpty from 'lodash/isEmpty.js';
import type { Dictionary } from 'lodash';

interface CleanDeepOptions {
  cleanKeys?: string[]
  cleanValues?: unknown[]
  emptyArrays?: boolean
  emptyObjects?: boolean
  emptyStrings?: boolean
  NaNValues?: boolean
  nullValues?: boolean
  undefinedValues?: boolean
}

export function cleanDeep<T>(object: Dictionary<T>, {
  cleanKeys = [],
  cleanValues = [],
  emptyArrays = true,
  emptyObjects = true,
  emptyStrings = true,
  NaNValues = false,
  nullValues = true,
  undefinedValues = true
}: CleanDeepOptions = {}) {
  return transform<T, Dictionary<any>>(object, (result, value, key) => {
    // Exclude specific keys.
    if (cleanKeys.includes(key)) {
      return;
    }

    // Recurse into arrays and objects.
    if (Array.isArray(value) || isPlainObject(value)) {
      value = cleanDeep(value as Dictionary<unknown>, { NaNValues, cleanKeys, cleanValues, emptyArrays, emptyObjects, emptyStrings, nullValues, undefinedValues }) as T;
    }

    // Exclude specific values.
    if (cleanValues.includes(value)) {
      return;
    }

    // Exclude empty objects.
    if (emptyObjects && isPlainObject(value) && isEmpty(value)) {
      return;
    }

    // Exclude empty arrays.
    if (emptyArrays && Array.isArray(value) && !value.length) {
      return;
    }

    // Exclude empty strings.
    if (emptyStrings && value === '') {
      return;
    }

    // Exclude NaN values.
    if (NaNValues && Number.isNaN(value)) {
      return;
    }

    // Exclude null values.
    if (nullValues && value === null) {
      return;
    }

    // Exclude undefined values.
    if (undefinedValues && value === undefined) {
      return;
    }

    // Append when recursing arrays.
    if (Array.isArray(result)) {
      return result.push(value);
    }

    result[key] = value;
  });
};
