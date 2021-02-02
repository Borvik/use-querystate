export function isset<T>(obj: T): obj is T {
  return (typeof obj !== 'undefined' && obj !== null);
}