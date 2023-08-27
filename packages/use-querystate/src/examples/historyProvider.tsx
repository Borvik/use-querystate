import React from 'react';
import { HistoryContextProvider } from '../lib';
import { useHistory, useLocation } from 'react-router-dom';

interface Props {
  children?: React.ReactNode
}

const HISTORY_VALUE = {
  useHistory,
  useLocation,
};

export const HistoryProvider: React.FC<Props> = function HistoryProvider({ children }) {
  return <HistoryContextProvider value={HISTORY_VALUE}>
    {children}
  </HistoryContextProvider>
}