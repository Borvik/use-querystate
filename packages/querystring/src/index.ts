import { encode, decode } from "./encoder";
import { splitCommas } from "./splitCommas";
import { isset, isStringable } from "./isset";
import cleanDeep from 'clean-deep';
import set from 'lodash/set';

export class QueryString {

  /**
   * Serializes an object to the query string format
   * 
   * @param obj Object to serialize to query string format
   */
  static stringify<T extends {}>(obj: T): string {
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
    
    return doStringify(obj, false);
  }

  /**
   * Decodes a query string encoded with this format to an object
   * 
   * @param qs Query string to parse to an object
   */
  static parse(qs: string): Record<string, unknown> {
    qs = (qs ?? '').trim();
    if (!qs || qs === '?') return {};
    if (qs[0] === '?') qs = qs.substr(1);

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

    return result;
  }

  /**
   * Merges an existing query string, with new values to form a new query string.
   * 
   * @param origQS String containing the original query string to merge new values with
   * @param newValues An object containing new values to add to the query string
   */
  static merge<T extends {}>(origQS: string, newValues: T): string {
    let qsObject = QueryString.parse(origQS);

    let newKeys = Object.keys(newValues) as (keyof T)[];
    for (let key of newKeys) {
      if (typeof newValues[key] === 'undefined') continue;
      set(qsObject, key, newValues[key]);
    }

    qsObject = cleanDeep(qsObject, { emptyStrings: false });
    return QueryString.stringify(qsObject);
  }
}