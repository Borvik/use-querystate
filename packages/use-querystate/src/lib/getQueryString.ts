import { QueryString } from "@borvik/querystring";

export function getQueryString<State extends object>(origQueryString: string, newState: State, initialState: State, prefix?: string): string {
  let prefixedNewState = prefix ? { [prefix]: newState } : newState;
  let prefixedInitialState = prefix ? { [prefix]: initialState } : initialState;

  return QueryString.merge(origQueryString, prefixedNewState, {
    initialState: prefixedInitialState
  });
}