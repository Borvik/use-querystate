import { encode, decode } from "./encoder.js";
import { splitCommas } from "./splitCommas.js";
import { isset, isStringable } from "./isset.js";
import { cleanDeep } from './cleanDeep.js';
import set from 'lodash/set.js';
import get from 'lodash/get.js';
import has from 'lodash/has.js';
import unset from 'lodash/unset.js';
import cloneDeep from 'lodash/cloneDeep.js';
import { MergeOptions, ParseOptions, StringifyOptions } from "./types.js";
import { getObjectPaths } from "./pathTree.js";
import { convert } from "./convert/index.js";
import { buildTypeDefs } from "./buildTypeDefs.js";
import { isEqual } from "./isEqual.js";
import defaults from 'lodash/defaults.js';

export type { PathTypes } from './types.js';

export class QueryString {

  /**
   * Serializes an object to the query string format
   * 
   * @param obj Object to serialize to query string format
   * @param options Stringify options to influence how the data is stringified
   */
  static stringify<T extends object, S extends object>(obj: T, options: StringifyOptions<S> = {}): string {
    let objToStringify: unknown = cloneDeep(obj);
    let topKeysToKeep: Set<string> = new Set();
    let topKeysToSkip: Set<string> = new Set();
    if (!!options.initialState) {
      let statePaths = getObjectPaths(options.initialState);
      for (let pathKey of statePaths) {
        if (pathKey.length < 1) continue;
        if (topKeysToSkip.has(pathKey[0])) continue;
        let curValue = get(objToStringify, pathKey, undefined);
        let initValue = get(options.initialState, pathKey);

        let hasInitialValue = (initValue !== null && typeof initValue !== 'undefined');
        let hasCurValue = (curValue !== null && typeof curValue !== 'undefined');

        if (pathKey.length === 1) {
          if (isEqual(curValue, initValue)) {
            unset(objToStringify, pathKey);
          }
          else if (hasInitialValue && !hasCurValue) {
            set(objToStringify as any, pathKey, '');
          }
        }
        else if (hasInitialValue && hasCurValue) {
          let topCurValue = get(objToStringify, pathKey[0], undefined);
          let topInitValue = get(options.initialState, pathKey[0]);

          // filter out properties marked undefined
          if (topCurValue && typeof topCurValue === 'object') {
            topCurValue = JSON.parse(JSON.stringify(topCurValue, (_k, value) => {
              return typeof value === 'undefined' || value === null ? undefined : value;
            }));
          }

          if (topInitValue && typeof topInitValue === 'object') {
            topInitValue = JSON.parse(JSON.stringify(topInitValue, (_k, value) => {
              return typeof value === 'undefined' || value === null ? undefined : value;
            }));
          }

          if (isEqual(topCurValue, topInitValue)) {
            unset(objToStringify, pathKey[0]);
            topKeysToSkip.add(pathKey[0]);
          }
        }
        else if (hasInitialValue && !hasCurValue) {
          set(objToStringify as any, pathKey, null);
          topKeysToKeep.add(pathKey[0]);
        }
      }
    }
    objToStringify = cleanDeep(objToStringify as any, { emptyStrings: false });

    if (topKeysToKeep.size) {
      for (let key of topKeysToKeep) {
        if (!has(objToStringify, key)) {
          set(objToStringify as any, key, '');
        }
      }
    }

    let seenObjects: any[] = [];

    function doStringify(obj: unknown, nested: boolean): string {
      if (obj && typeof obj === 'object') {
        if (seenObjects.includes(obj))
          return '';
        seenObjects.push(obj);
      }

      if (typeof obj === 'undefined' || obj === null) {
        return '';
      }
      else if (Array.isArray(obj)) {
        let arrResult = obj.filter(isset)
          .map((a: any) => doStringify(a, true))
          .join(',');
        return arrResult;
      }
      else if (typeof obj === 'object' && !!obj) {
        let keys = Object.keys(obj) as (keyof typeof obj)[];

        // filter out null/undefined keys
        keys = keys.filter(k => isset(obj[k]));

        // nested determins HOW to output the object,
        // top level, standard qs format key=value&key2=value2
        // nested, (key:value,key2:value2)
        let keyValueSep = '=',
            keySep = '&',
            prefix = '',
            suffix = '';

        if (nested) {
          keyValueSep = ':';
          keySep = ';';
          prefix = '(';
          suffix = ')';
        }
        let keyValues = keys.map(key => `${encode(key)}${keyValueSep}${doStringify(obj[key], true)}`);
        return `${prefix}${keyValues.join(keySep)}${suffix}`;
      }
      else if (typeof obj === 'function' || typeof obj === 'symbol') {
        return '';
      }
      else if (typeof obj === 'boolean') {
        return obj ? '1' : '0';
      }
      else if (typeof obj === 'number') {
        if (Number.isNaN(obj)) return '';
        return encode(obj.toString());
      }
      else if (isStringable(obj)) {
        return encode(obj.toString());
      }
      else {
        // scalar value - toString to convert numbers to strings for encode
        return encode(`${obj}`);
      }
    }
    
    return doStringify(objToStringify, false);
  }

  /**
   * Decodes a query string encoded with this format to an object
   * 
   * @param qs Query string to parse to an object
   * @param options Parse options to allow transforming the data to proper types
   */
  static parse<T extends object>(qs: string, options: ParseOptions<T> = {}): Record<string, unknown> {
    qs = (qs ?? '').replace(/^\s*?\?/, '?');
    if (!qs || qs === '?') return options.initialState ?? {};
    if (qs[0] === '?') qs = qs.substr(1);

    // build types (if we can)
    let typeDefs = options.types;
    if (!typeDefs && !!options.initialState) {
      typeDefs = buildTypeDefs(options.initialState);
    }

    let result: Record<string, unknown> = {};
    
    function parseValue(value: string): any {
      // value like: (a:b;c:d),(e:f,g:h)
      let valueArray = splitCommas(value);
      let parsedValues = valueArray.map(val => {
        if (val.length < 4) {
          return decode(val);
        }
        
        if (val[0] === '(' && val.substr(-1, 1) === ')') {
          // Object format - (a:b;c:d) - could be (a:b),(c:d)
          let objValue: any = {};
          let trimmed = val.substring(1, val.length - 1);
          let allObjectKeys = splitCommas(trimmed, ';');
          for (let objKeyValue of allObjectKeys) {
            // should be like - a:b
            let [objK, objV] = splitCommas(objKeyValue, ':');
            if (typeof objV === 'undefined') {
              objValue[decode(objK)] = '';
              continue;
            }
            objValue[decode(objK)] = parseValue(objV);
          }
          return objValue;
        }

        return decode(val);
      });

      if (valueArray.length < 1) return '';
      return (valueArray.length === 1) 
        ? parsedValues[0]
        : parsedValues;
    }

    // first split on & for top level keys
    let allKeyValues = qs.split('&');

    for (let keyValue of allKeyValues) {
      // should be like: key=(a:b;c:d),(e:f,g:h)
      let [key, value] = keyValue.split('=');

      if (typeof value === 'undefined') {
        result[decode(key)] = '';
        continue;
      }
      result[decode(key)] = parseValue(value);
    }

    if (typeof typeDefs !== 'undefined') {
      result = convert(
        result,
        {
          definedTuples: options.definedTuples ?? false,
          typeDef: typeDefs,
          typeDefsFromInitial: (!!typeDefs && !options.types && !options.lockTypesToInitialState),
          filterToTypeDef: options.filterToTypeDef ?? false,
        }
      );
    }

    if (options.initialState)
      result = defaults(result, options.initialState);
    return result;
  }

  /**
   * Merges an existing query string, with new values to form a new query string.
   * 
   * @param origQS String containing the original query string to merge new values with
   * @param newValues An object containing new values to add to the query string
   * @param options Merge options
   */
  static merge<T extends object, S extends object>(origQS: string, newValues: T, options: MergeOptions<S> = { deepMerge: false }): string {
    let qsObject = QueryString.parse(origQS);

    if (options.deepMerge) {
      let newKeys = getObjectPaths(newValues);
      for (let key of newKeys) {
        let value = get(newValues, key);
        set(qsObject, key, value);
      }
    } else {
      let newKeys = Object.keys(newValues) as (keyof T)[];
      for (let key of newKeys) {
        qsObject[key as string] = newValues[key];
      }
    }

    let qsOptions: StringifyOptions<S> = {};
    if (options.initialState)
      qsOptions.initialState = options.initialState;

    return QueryString.stringify(qsObject, qsOptions);
  }
}