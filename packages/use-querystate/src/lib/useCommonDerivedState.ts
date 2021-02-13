// Adapted from: https://hackernoon.com/whats-the-right-way-to-fetch-data-in-react-hooks-a-deep-dive-2jc13230

import { useState, useCallback, useRef } from 'react';
import { ComparatorFn } from './comparators';

type LocalState<State> = {init: false} | {init: true, publicState: State, depList: any[]};

export function useCommonDerivedState<State>(onDepChange: (prevState: State | null) => State, depList: any[], comparator: ComparatorFn): [State, (newState: State | ((state: State) => State)) => void] {
  const [,setRerender] = useState(1);
  const localRef = useRef<LocalState<State>>({init: false});

  let currPublicState: State;
  if (!localRef.current.init || !comparator(depList, localRef.current.depList)) {
    currPublicState = onDepChange(!localRef.current.init ? null : localRef.current.publicState);
    localRef.current = {
      init: true,
      publicState: currPublicState,
      depList
    };
  } else {
    currPublicState = localRef.current.publicState;
  }

  const localState = localRef.current;
  const publicSetState = useCallback(
    (newState: (State | ((state: State) => State))) => {
      if (!localState.init) throw new Error();
      const publicState = typeof newState === 'function'
        ? (newState as any)(localState.publicState) as State
        : newState;
      localRef.current = { ...localState, publicState };
      setRerender(v => 0 - v); // toggle's between 1 and -1
    },
    [ localState ]
  );
  return [currPublicState, publicSetState];
}