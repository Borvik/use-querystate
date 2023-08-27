import { getQueryString } from './getQueryString';
import type { HistoryType, LocationDescriptor } from './history/types';

let batchedHistoryObj: HistoryType | null;
let batchUpdateLoc: LocationDescriptor | null;
export const BATCHING_UPDATES = {
  current: false
};

export function performBatchedUpdate(history: HistoryType, location: LocationDescriptor, newState: any, initialState: any, optionPrefix?: string): void {
  if (!batchUpdateLoc) {
    batchUpdateLoc = location;
    batchedHistoryObj = history;
  }

  let newQS = getQueryString(batchUpdateLoc.search ?? '', newState, initialState, optionPrefix);
  batchUpdateLoc.search = newQS;
}

export function batchedQSUpdate(cb: Function) {
  BATCHING_UPDATES.current = true;

  cb();
  
  BATCHING_UPDATES.current = false;

  if (batchedHistoryObj) {
    batchedHistoryObj.push(batchUpdateLoc!);
  }

  batchUpdateLoc = null;
  batchedHistoryObj = null;
}