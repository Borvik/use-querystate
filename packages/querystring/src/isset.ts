export function isset<T>(obj: T): obj is T {
  return (typeof obj !== 'undefined' && obj !== null);
}

interface Stringable {
  toString(): string;
}

export function isStringable(obj: unknown): obj is Stringable {
  return typeof (obj as Stringable).toString === 'function';
}