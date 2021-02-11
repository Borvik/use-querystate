import { QueryString } from '@borvik/querystring';
import { QueryStateOptions } from "./types";

export function getQueryState<State extends object>(queryString: string, initialState: State, options?: QueryStateOptions): State {
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
    types: typeDefs
  });
  let queryState: State = {} as State;
  
  if (!!options?.prefix) {
    queryState = (qsObject[options.prefix] ?? {}) as State;
  } else {
    queryState = qsObject as State;
  }

  return queryState;
}