import { useCallback, useDebugValue, useRef, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { getQueryState } from './getQueryState';
import { QueryStateOptions } from "./types";
import { isEqual } from '@borvik/querystring/dist/isEqual';
import { useDeepDerivedState } from './useDeepDerivedState';
import { BATCHING_UPDATES, performBatchedUpdate } from './batchUpdates';
import { getQueryString } from './getQueryString';

type LocalState<State> = {init: false} | {init: true, publicState: State, search: string};
type NewState<State> = (Partial<State> | ((state: State) => Partial<State>));

export function useQueryState<State extends object>(initialState: State, options?: QueryStateOptions): [State, (newState: Partial<State> | ((state: State) => Partial<State>)) => void] {
  const [,setRerender] = useState(1);
  const localRef = useRef<LocalState<State>>({init: false});
  const location = useLocation();
  const history = useHistory();

  let currPublicState: State;
  if (!localRef.current.init || (!options?.internalState && location.search !== localRef.current.search)) {
    let potentialPublicState = options?.internalState
      ? initialState
      : getQueryState(location.search, initialState, options);

    if (!localRef.current.init || !isEqual(localRef.current.publicState, potentialPublicState)) {
      currPublicState = potentialPublicState;
    } else {
      currPublicState = localRef.current.publicState;
    }

    localRef.current = {
      init: true,
      publicState: currPublicState,
      search: location.search,
    };
  } else {
    currPublicState = localRef.current.publicState;
  }

  // derive state so reference can be the same
  let [derivedInitialState] = useDeepDerivedState(() => { return initialState; }, [initialState]);

  const localState = localRef.current;
  const { internalState: useInternalState, prefix } = options ?? {};
  const publicSetState = useCallback((newState: NewState<State>) => {
    if (!localState.init) throw new Error('Set Query State called before it was initialized');

    /**
     * get FULL qs, and update it
     */
    const mergeState = typeof newState === 'function'
      ? (newState as any)(localState.publicState)
      : newState;

    const publicState = { ...localState.publicState, ...mergeState };

    if (BATCHING_UPDATES.current && !useInternalState) {
      performBatchedUpdate(history, location, mergeState, derivedInitialState, prefix);
      return;
    }

    let newQS = getQueryString(location.search, publicState, derivedInitialState, prefix);
    if (!useInternalState) {
      setImmediate(() => {
        history.push({
          ...location,
          search: newQS
        });
      });
    } else {
      localRef.current = { init: true, publicState, search: newQS };
      setRerender(v => 0 - v); // toggle's between 1 and -1
    }
    // return { init: true, publicState, search: newQS };
  }, [localState, setRerender, useInternalState, prefix, history, location, derivedInitialState]);

  useDebugValue(currPublicState);
  return [currPublicState, publicSetState];
}