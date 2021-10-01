import { QueryString } from "@borvik/querystring";

export function getQueryString<State extends object>(origQueryString: string, newState: State, initialState: State, prefix?: string): string {
  let prefixedNewState = !prefix
    ? newState
    : Object.keys(newState).reduce((obj, key) => {
        obj[prefix + key] = newState[key as keyof State];
        return obj;
      }, {} as any);
      
  let prefixedInitialState = !prefix
    ? initialState
    : Object.keys(initialState).reduce((obj, key) => {
        obj[prefix + key] = initialState[key as keyof State];
        return obj;
      }, {} as any);

  return QueryString.merge(origQueryString, prefixedNewState, {
    initialState: prefixedInitialState
  });
}