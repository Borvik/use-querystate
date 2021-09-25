import { getObjectPaths } from "../pathTree";
import { PathTypes, validQSTypes, isValidQSType } from "../types";
import { convertValue } from './convertValue';
import get from 'lodash/get';
import set from 'lodash/set';
import has from 'lodash/has';
import cloneDeep from 'lodash/cloneDeep';

interface ConvertOptions {
  definedTuples?: boolean
  typeDef: PathTypes
  typeDefsFromInitial?: boolean
  filterToTypeDef?: boolean
}

// TODO: This need to account for potentially "unset" parent elements
export function convert(qsObj: Record<string, unknown>, { definedTuples = false, typeDef, typeDefsFromInitial = false, filterToTypeDef = false }: ConvertOptions): Record<string, unknown> {
  let dataTypes = getPathTypes(typeDef, definedTuples);
  let paths = getObjectPaths(qsObj, definedTuples);

  let convertedObj: Record<string, unknown> = typeDefsFromInitial ? cloneDeep(qsObj) : {};
  if (filterToTypeDef) paths = getObjectPaths(typeDef, definedTuples);

  for (let propPath of paths) {
    let joinedPath = propPath.join('.');
    let value = get(qsObj, propPath, undefined);

    if (value === '' || typeof value === 'undefined') {
      let keyToSearch = joinedPath + '.';
      let found = false;
      for (const key of dataTypes.keys()) {
        if (key.indexOf(keyToSearch) === 0) {
          found = true;
          break;
        }
      }

      if (found) {
        set(convertedObj, propPath, null);
        continue;
      }
    }

    if ((value === '' || typeof value === 'undefined') && filterToTypeDef) {
      // check the path parts if anything is set
      let curPath: string[] = [], curIdx: number = 0;
      do {
        curPath = propPath.slice(0, propPath.length - (curIdx++));
        if (curPath.length && has(qsObj, curPath)) {
          break;
        }
      } while(curPath.length > 1);

      if (curPath.length && curPath.length !== propPath.length) {
        set(convertedObj, curPath, null);
        continue;
      }
    }

    if (typeof value !== 'undefined') {
      let definedType: validQSTypes | undefined = dataTypes.get(joinedPath) ?? (typeDefsFromInitial ? 'any' : undefined);
      if (definedType) {
        let newValue = convertValue(value, definedType);
        if (typeof newValue !== 'undefined')
          set(convertedObj, propPath, newValue);
      }
      else if (value === null) {
        set(convertedObj, propPath, '');
      }
    }
  }
  return convertedObj;
}

function getPathTypes(typeDef: PathTypes, definedTuples: boolean): Map<string, validQSTypes> {
  let result: Map<string, validQSTypes> = new Map();

  let paths = getObjectPaths(typeDef, definedTuples);
  for (let propPath of paths) {
    let joinedPath = propPath.join('.');
    let varType = get(typeDef, propPath);
    if (!isValidQSType(varType)) {
      throw new Error(`Path definition is invalid - ${joinedPath} cannot be ${varType}`);
    }

    result.set(joinedPath, varType);
  }
  return result;
}