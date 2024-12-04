import { createContext, useMemo } from 'react';
import invariant from 'tiny-invariant';
import type { HistoryType, LocationDescriptor, Location } from './types.js';

interface IHistoryContext {
  useHistory: () => HistoryType
  useLocation: () => Location
}

function createPath({ pathname = '/', search = '', hash = '' }: LocationDescriptor) {
  if (search && search !== "?")
    pathname += search.charAt(0) === "?" ? search : "?" + search;
  if (hash && hash !== "#")
    pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
  return pathname;
}

function useDefaultHistory(): HistoryType {
  invariant(window, 'You should not use "useHistory" outside of a <HistoryProvider>');
  
  const globalHistory = window.history;

  return useMemo(() => ({
    push: (pathOrLocation: string | LocationDescriptor, state?: unknown) => {
      if (typeof pathOrLocation === 'string') {
        globalHistory?.pushState(state, '', pathOrLocation);
      }
      else {
        const url = createPath(pathOrLocation);
        globalHistory?.pushState(pathOrLocation.state, '', url);
      }
    }
  }), [globalHistory]);
}

function useDefaultLocation(): Location {
  invariant(window, 'You should not use "useHistory" outside of a <HistoryProvider>');
  const globalLocation = window.location;
  
  return useMemo(() => ({
    pathname: globalLocation?.pathname || '/',
    search: globalLocation?.search || '',
    hash: globalLocation?.hash || '',
  }), [globalLocation]);
}

export const HistoryContext = createContext<IHistoryContext>({
  useHistory: useDefaultHistory,
  useLocation: useDefaultLocation,
});

export const HistoryContextProvider = HistoryContext.Provider;