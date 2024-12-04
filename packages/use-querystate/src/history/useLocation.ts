import { useContext } from "react";
import { HistoryContext } from "./context.js";
import type { Location } from './types.js';

export function useLocation(): Location {
  const { useLocation } = useContext(HistoryContext);
  return useLocation();
}