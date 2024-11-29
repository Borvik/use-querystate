import type { PathTypes } from '@borvik/querystring';

export interface QueryStateOptions {
  prefix?: string; // prefix for the container to this set of values
  internalState?: boolean; // store in qs or not (doesn't allow portability, but could be nicer for multiple on same page)
  types?: PathTypes;
  filterToTypeDef?: boolean;
}

export type DeepPartial<T> =
  T extends string | number | bigint | boolean | null | undefined | symbol | Date
    ? T | undefined | null
    : T extends Array<infer ArrayType>
      ? Array<DeepPartial<ArrayType>>
      : T extends ReadonlyArray<infer ArrayType>
        ? ReadonlyArray<DeepPartial<ArrayType>>
        : T extends Set<infer SetType>
          ? Set<DeepPartial<SetType>>
          : T extends ReadonlySet<infer SetType>
            ? ReadonlySet<DeepPartial<SetType>>
            : T extends Map<infer KeyType, infer ValueType>
              ? Map<DeepPartial<KeyType>, DeepPartial<ValueType>>
              : T extends ReadonlyMap<infer KeyType, infer ValueType>
                ? ReadonlyMap<DeepPartial<KeyType>, DeepPartial<ValueType>>
                : {
                  [K in keyof T]?: DeepPartial<T[K]> | null
                }