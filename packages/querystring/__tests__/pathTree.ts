import { getObjectPaths } from '../src/pathTree';

describe('PathTree Tests', () => {
  test('Path', () => {
    expect(getObjectPaths({
      a: 'b',
      c: ['d', 'e'],
      f: null,
      g: undefined,
      h: {
        i: {
          j: 'k',
          l: 'm',
        }
      },
      n: {
        o: 'p',
        q: function() {},
        r: Symbol('r'),
        s: true,
        t: 1,
      }
    })).toMatchObject([
      ['a'],
      ['c'],
      ['f'],
      ['g'],
      ['h', 'i', 'j'],
      ['h', 'i', 'l'],
      ['n', 'o'],
      ['n', 's'],
      ['n', 't'],
    ]);
  });

  test('Path with Array', () => {
    expect(getObjectPaths({
      a: 'b',
      c: ['d', 'e'],
      f: {
        g: ['h', 'i'],
      }
    }, true)).toMatchObject([
      ['a'],
      ['c', '0'],
      ['c', '1'],
      ['f', 'g', '0'],
      ['f', 'g', '1'],
    ]);
  });
});