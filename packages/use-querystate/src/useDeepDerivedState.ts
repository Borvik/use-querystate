import { useDebugValue } from 'react';
import { useCommonDerivedState } from './useCommonDerivedState.js';
import { deepCompare } from './comparators.js';

export function useDeepDerivedState<State>(onDepChange: (prevState: State | null) => State, depList: any[]): [State, (newState: State | ((state: State) => State)) => void] {
  let value = useCommonDerivedState(onDepChange, depList, deepCompare);
  useDebugValue(value[0]);
  return value;
}