import { useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { QueryStateOptions } from "./types";

export function useQueryState<State>(initialState: State, options?: QueryStateOptions): [State, (newState: Partial<State> | ((state: State) => Partial<State>)) => void] {
  const [localState, setLocalState] = useState<{init: false} | {init: true, publicState: State, search: string}>({init: false});
  const location = useLocation();
  const history = useHistory();

  let currPublicState: State;
  if (!localState.init || (!options?.internalState && location.search !== localState.search)) {
    let potentialPublicState = options?.internalState
      ? initialState
      : {}
  }
}