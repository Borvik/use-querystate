import { useContext } from "react";
import { HistoryContext } from "./context";
import type { HistoryType } from './types';

export function useHistory(): HistoryType {
  const { useHistory } = useContext(HistoryContext);
  return useHistory();
}