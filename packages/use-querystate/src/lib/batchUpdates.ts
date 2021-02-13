import { useHistory } from 'react-router-dom';
import { getQueryString } from './getQueryString';

type HistoryType = ReturnType<typeof useHistory>;
type HistoryCreateRefProps = Parameters<HistoryType['createHref']>;
type LocationDescriptorObject = HistoryCreateRefProps[0];

let batchedHistoryObj: HistoryType | null;
let batchUpdateLoc: LocationDescriptorObject | null;
export const BATCHING_UPDATES = {
  current: false
};

export function performBatchedUpdate(history: HistoryType, location: LocationDescriptorObject, newState: any, initialState: any, optionPrefix?: string): void {
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