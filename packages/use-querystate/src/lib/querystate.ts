import { useCallback, useDebugValue, useRef, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { getQueryState } from './getQueryState';
import { DeepNullable, QueryStateOptions } from "./types";
import { isEqual } from '@borvik/querystring/dist/isEqual';
import { useDeepDerivedState } from './useDeepDerivedState';
import { BATCHING_UPDATES, performBatchedUpdate } from './batchUpdates';
import { getQueryString } from './getQueryString';

type LocalState<State> = {init: false} | {init: true, publicState: State, search: string};
type NewState<State> = (Partial<State> | ((state: State) => Partial<State>));

export function useQueryState<State extends object>(initialState: State, options?: QueryStateOptions): [DeepNullable<State>, (newState: Partial<DeepNullable<State>> | ((state: DeepNullable<State>) => Partial<DeepNullable<State>>)) => void] {
  const [,setRerender] = useState(1);
  const localRef = useRef<LocalState<DeepNullable<State>>>({init: false});
  const location = useLocation();
  const history = useHistory();

  let currPublicState: DeepNullable<State>;
  if (!localRef.current.init || (!options?.internalState && location.search !== localRef.current.search)) {
    let potentialPublicState = options?.internalState
      ? initialState
      : getQueryState(location.search, initialState, options);

    if (!localRef.current.init || !isEqual(localRef.current.publicState, potentialPublicState)) {
      currPublicState = potentialPublicState as DeepNullable<State>;
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

  const { internalState: useInternalState, prefix } = options ?? {};
  const publicSetState = useCallback((newState: NewState<DeepNullable<State>>) => {
    if (!localRef.current.init) throw new Error('Set Query State called before it was initialized');

    /**
     * get FULL qs, and update it
     */
    const mergeState = typeof newState === 'function'
      ? (newState as any)(localRef.current.publicState)
      : newState;

    const publicState = { ...localRef.current.publicState, ...mergeState };

    if (BATCHING_UPDATES.current && !useInternalState) {
      performBatchedUpdate(history, history.location, mergeState, derivedInitialState, prefix);
      return;
    }

    let newQS = getQueryString(history.location.search, publicState, derivedInitialState, prefix);
    if (!useInternalState) {
      history.push({
        ...location,
        search: newQS
      });
    } else {
      localRef.current = { init: true, publicState, search: newQS };
      setRerender(v => 0 - v); // toggle's between 1 and -1
    }
    // eslint warns about including `history` and `location` not being included, except that actually _breaks_ functionality
    // eslint-disable-next-line
  }, [localRef, setRerender, useInternalState, prefix, derivedInitialState]);

  useDebugValue(currPublicState);
  return [currPublicState, publicSetState];
}