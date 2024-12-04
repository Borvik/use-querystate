import { PathTypes, QueryString } from '@borvik/querystring';
import { DeepPartial, QueryStateOptions } from "./types.js";

export function getQueryState<State extends object>(queryString: string, initialState: State, options?: QueryStateOptions): DeepPartial<State> {
  let typeDefs = options?.types;
  if (!!typeDefs && !!options?.prefix) {
    typeDefs = Object.keys(typeDefs).reduce((obj, key) => {
      obj[options.prefix + key] = typeDefs![key as keyof PathTypes];
      return obj;
    }, {} as any)
  }

  let qsObject = QueryString.parse(queryString, {
    initialState: !options?.prefix
      ? initialState
      : Object.keys(initialState).reduce((obj, key) => {
          obj[options.prefix + key] = initialState[key as keyof State];
          return obj;
        }, {} as any),
    types: typeDefs,
    lockTypesToInitialState: true,
    filterToTypeDef: options?.filterToTypeDef
  });
  let queryState: DeepPartial<State> = {} as DeepPartial<State>;

  if (!!options?.prefix) {
    queryState = Object.keys(qsObject).reduce((obj, key) => {
      let newKey = key;
      let prefixIndex = key.indexOf(options.prefix!);
      if (prefixIndex >= 0 && key.length > options.prefix!.length) {
        newKey = key.substr(options.prefix!.length);
      }
      obj[newKey] = qsObject[key];
      return obj;
    }, {} as any) as DeepPartial<State>;
  } else {
    queryState = qsObject as DeepPartial<State>;
  }

  return queryState;
}