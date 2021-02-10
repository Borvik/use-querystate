import { useCallback, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { getQueryState } from './getQueryState';
import { QueryStateOptions } from "./types";
import { isEqual } from '@borvik/querystring/dist/isEqual';
import { useDeepDerivedState } from './useDeepDerivedState';
import { BATCHING_UPDATES, performBatchedUpdate } from './batchUpdates';
import { getQueryString } from './getQueryString';

export function useQueryState<State extends object>(initialState: State, options?: QueryStateOptions): [State, (newState: Partial<State> | ((state: State) => Partial<State>)) => void] {
  const [localState, setLocalState] = useState<{init: false} | {init: true, publicState: State, search: string}>({init: false});
  const location = useLocation();
  const history = useHistory();

  let currPublicState: State;
  if (!localState.init || (!options?.internalState && location.search !== localState.search)) {
    let potentialPublicState = options?.internalState
      ? initialState
      : getQueryState(location.search, initialState, options);

    if (!localState.init || !isEqual(localState.publicState, potentialPublicState)) {
      currPublicState = potentialPublicState;
    } else {
      currPublicState = localState.publicState;
    }

    setLocalState({
      init: true,
      publicState: currPublicState,
      search: location.search,
    });
  } else {
    currPublicState = localState.publicState;
  }

  // derive state so reference can be the same
  let [derivedInitialState] = useDeepDerivedState(() => { return initialState; }, [initialState]);

  const publicSetState = (newState: (Partial<State> | ((state: State) => Partial<State>))) => {
    setLocalState(localState => {
      if (!localState.init) throw new Error('Set Query State called before it was initialized');

      /**
       * get FULL qs, and update it
       */
      const mergeState = typeof newState === 'function'
        ? (newState as any)(localState.publicState)
        : newState;

      const publicState = { ...localState.publicState, ...mergeState };

      if (BATCHING_UPDATES.current && !options?.internalState) {
        performBatchedUpdate(history, location, publicState, derivedInitialState, options?.prefix);
        return localState;
      }

      let newQS = getQueryString(location.search, publicState, derivedInitialState, options?.prefix);
      if (!options?.internalState) {
        setImmediate(() => {
          // TODO: Remove console after testing
          console.log('HISTORY UPDATING:', newQS);
          history.push({
            ...location,
            search: newQS
          });
        });
      }

      return { init: true, publicState, search: newQS };
    });
  };

  return [currPublicState, publicSetState];
}