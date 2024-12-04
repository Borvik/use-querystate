import { useContext } from "react";
import { HistoryContext } from "./context.js";
import type { HistoryType } from './types.js';

export function useHistory(): HistoryType {
  const { useHistory } = useContext(HistoryContext);
  return useHistory();
}