import { useMemo, type FC, type ReactNode } from 'react';
import { HistoryContextProvider, HistoryType, LocationDescriptor } from '@borvik/use-querystate';
import { useLocation, useNavigate } from 'react-router';

interface Props {
  children?: ReactNode
}

function useHistory(): HistoryType {
  const navigate = useNavigate();

  return useMemo(() => ({
    push: (pathOrLocation: string | LocationDescriptor, state?: unknown) => {
      if (typeof pathOrLocation === 'string') {
        navigate(pathOrLocation, { state });
      }
      else {
        const { state: pathState, ...loc } = pathOrLocation;
        navigate(loc, { state: pathState });
      }
    }
  }), [navigate]);
}

const HISTORY_VALUE = {
  useLocation,
  useHistory
};

export const HistoryProvider: FC<Props> = function HistoryProvider({ children }) {
  return <HistoryContextProvider value={HISTORY_VALUE}>
    {children}
  </HistoryContextProvider>
}