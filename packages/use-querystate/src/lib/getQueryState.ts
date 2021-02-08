import { getObjectPaths, QueryString } from '@borvik/querystring';
import { isValidQSType } from '@borvik/querystring/dist/types';
import { QueryStateOptions } from "./types";
import get from 'lodash/get';
import set from 'lodash/set';
import defaultsDeep from 'lodash/defaultsDeep';

export function getQueryState<State>(queryString: string, initialState: State, options?: QueryStateOptions): State {
  let dataTypes = options?.types;

  if (!dataTypes) {
    dataTypes = {};
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
  }

  let qsObject = QueryString.parse(queryString, { types: dataTypes });
  return defaultsDeep(qsObject, initialState);
}