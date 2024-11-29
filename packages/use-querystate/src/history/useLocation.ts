import { useContext } from "react";
import { HistoryContext } from "./context";
import type { Location } from './types';

export function useLocation(): Location {
  const { useLocation } = useContext(HistoryContext);
  return useLocation();
}