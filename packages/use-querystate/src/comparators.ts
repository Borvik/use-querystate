import { isEqual } from '@borvik/querystring/dist/isEqual';

export type ComparatorFn = (a: any[] | any[][], b: any[] | any[][]) => boolean;

export function deepCompare(a: any[], b: any[]): boolean {
  return isEqual(a, b);
}