import { getObjectPaths } from "./pathTree";
import { isValidQSType, PathTypes } from "./types";
import get from 'lodash/get';
import set from 'lodash/set';

export function buildTypeDefs<T extends object>(initialState: T): PathTypes {
  let dataTypes: PathTypes = {};

  let statePaths = getObjectPaths(initialState);
  for (let pathKey of statePaths) {
    let value = get(initialState, pathKey, undefined);
    let initialType = typeof value;

    if (isValidQSType(initialType)) {
      set(dataTypes, pathKey, initialType);
    } else if (Array.isArray(value)) {
      let uniqueArrayTypes = new Set<string>();
      value.forEach(v => uniqueArrayTypes.add(typeof v));

      let arrayTypes = Array.from(uniqueArrayTypes);
      if (arrayTypes.length === 1 && isValidQSType(arrayTypes[0])) {
        set(dataTypes, pathKey, arrayTypes[0] + '[]');
      } else {
        set(dataTypes, pathKey, 'any');
      }
    } else {
      throw new Error(`Complex type ${initialType} unable to serialize to query string`);
    }
  }

  return dataTypes;
}