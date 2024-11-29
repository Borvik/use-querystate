import { SCALAR_TYPES } from "./types";

export function getObjectPaths<T extends {}>(obj: T, includeArrayIndicies: boolean = false, parentKey: string[] = []): string[][] {
  if (!obj) return [];

  let paths: string[][] = [];

  let objKeys = Object.keys(obj);
  for (let i = 0; i < objKeys.length; i++) {
    let k = objKeys[i];
    let v = obj[k as keyof T];

    let currentPath = [...parentKey, k];
    // console.log('Checking', {k, v, t, currentPath});

    if (v === null || SCALAR_TYPES.includes(typeof v)) {
      paths.push(currentPath);
    }
    else if (Array.isArray(v)) {
      if (!includeArrayIndicies)
        paths.push(currentPath);
      else {
        paths = paths.concat((v as unknown[]).map((_, idx) => {
          return [...currentPath, idx.toString()];
        }));
      }
    }
    else if (typeof v === 'object') {
      let subPaths = getObjectPaths(v, includeArrayIndicies, currentPath);
      paths = paths.concat(subPaths);
    }
    // skip symbols and functions as they don't get serialized
  }

  return paths;
}