import { getObjectPaths } from "../pathTree";
import { PathTypes, validQSTypes, isValidQSType } from "../types";
import { convertValue } from './convertValue';
import get from 'lodash/get';
import set from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';

export function convert(qsObj: Record<string, unknown>, definedTuples: boolean, typeDef: PathTypes, typeDefsFromInitial: boolean, filterToTypeDef: boolean): Record<string, unknown> {
  let dataTypes = getPathTypes(typeDef, definedTuples);
  let paths = getObjectPaths(qsObj, definedTuples);

  let convertedObj: Record<string, unknown> = typeDefsFromInitial ? cloneDeep(qsObj) : {};
  if (filterToTypeDef) paths = getObjectPaths(typeDef, definedTuples);

  for (let propPath of paths) {
    let joinedPath = propPath.join('.');
    let value = get(qsObj, propPath, undefined);

    if (typeof value !== 'undefined') {
      let definedType: validQSTypes | undefined = dataTypes.get(joinedPath) ?? (typeDefsFromInitial ? 'any' : undefined);
      if (definedType) {
        let newValue = convertValue(value, definedType);
        if (typeof newValue !== 'undefined')
          set(convertedObj, propPath, newValue);
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