import { QueryString } from '@borvik/querystring';
import { DeepNullable, QueryStateOptions } from "./types";

export function getQueryState<State extends object>(queryString: string, initialState: State, options?: QueryStateOptions): DeepNullable<State> {
  let typeDefs = options?.types;
  if (!!typeDefs && !!options?.prefix) {
    typeDefs = {
      [options.prefix]: typeDefs
    };
  }

  let qsObject = QueryString.parse(queryString, {
    initialState: !options?.prefix
      ? initialState
      : { [options.prefix]: initialState },
    types: typeDefs,
    lockTypesToInitialState: true,
    filterToTypeDef: options?.filterToTypeDef
  });
  let queryState: DeepNullable<State> = {} as DeepNullable<State>;

  if (!!options?.prefix) {
    queryState = (qsObject[options.prefix] ?? {}) as DeepNullable<State>;
  } else {
    queryState = qsObject as DeepNullable<State>;
  }

  return queryState;
}