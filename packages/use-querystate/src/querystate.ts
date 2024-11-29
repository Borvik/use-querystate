import { useCallback, useDebugValue, useRef, useState } from 'react';
import { useLocation, useHistory, Location } from './history/index.js';
import { getQueryState } from './getQueryState.js';
import { DeepPartial, QueryStateOptions } from "./types.js";
import { isEqual } from '@borvik/querystring/dist/isEqual';
import { useDeepDerivedState } from './useDeepDerivedState.js';
import { BATCHING_UPDATES, performBatchedUpdate } from './batchUpdates.js';
import { getQueryString } from './getQueryString.js';

type LocalState<State> = {init: false} | {init: true, publicState: State, search: string};
type NewState<State> = (Partial<State> | ((state: State) => Partial<State>));

export function useQueryState<State extends object>(initialState: State, options?: QueryStateOptions): [DeepPartial<State>, (newState: DeepPartial<State> | ((state: DeepPartial<State>) => DeepPartial<State>)) => void] {
  const [,setRerender] = useState(1);
  const localLocation = useRef<Location | null>(null);
  const localRef = useRef<LocalState<DeepPartial<State>>>({init: false});
  const location = useLocation();
  const history = useHistory();

  localLocation.current = location;
  let currPublicState: DeepPartial<State>;
  if (!localRef.current.init || (!options?.internalState && location.search !== localRef.current.search)) {
    let potentialPublicState = options?.internalState
      ? initialState
      : getQueryState(location.search, initialState, options);

    if (!localRef.current.init || !isEqual(localRef.current.publicState, potentialPublicState)) {
      currPublicState = potentialPublicState as DeepPartial<State>;
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
  const publicSetState = useCallback((newState: NewState<DeepPartial<State>>) => {
    if (!localRef.current.init) throw new Error('Set Query State called before it was initialized');

    /**
     * get FULL qs, and update it
     */
    const mergeState = typeof newState === 'function'
      ? (newState as any)(localRef.current.publicState)
      : newState;

    const publicState = { ...localRef.current.publicState, ...mergeState };

    if (BATCHING_UPDATES.current && !useInternalState) {
      performBatchedUpdate(history, localLocation.current!, mergeState, derivedInitialState, prefix);
      return;
    }

    let newQS = getQueryString(localLocation.current!.search, publicState, derivedInitialState, prefix);
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
  }, [localRef, localLocation, setRerender, useInternalState, prefix, derivedInitialState]);

  useDebugValue(currPublicState);
  return [currPublicState, publicSetState];
}