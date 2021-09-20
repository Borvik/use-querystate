import { PathTypes } from '@borvik/querystring';

export interface QueryStateOptions {
  prefix?: string; // prefix for the container to this set of values
  internalState?: boolean; // store in qs or not (doesn't allow portability, but could be nicer for multiple on same page)
  types?: PathTypes;
  filterToTypeDef?: boolean;
}

export type DeepNullable<T> = {
  [P in keyof T]: T[P] extends (infer U)[]
    ? DeepNullable<U>[]
    : T[P] extends Readonly<infer U>[]
      ? Readonly<DeepNullable<U> | null>[]
      : DeepNullable<T[P]> | null
};