import { convert } from '../src/convert/index';

describe('Conversion tests', () => {
  test('Basic Conversions', () => {
    expect(convert({
      a: {b:'c'},
      d: 'e',
      f: '1',
      g: '3',
      h: '1',
      i: ['j', 'k'],
      l: ['1', '2'],
      m: ['1', '2'],
      o: ['1', '0'],
    }, false, {
      a: 'any',
      d: 'string',
      f: 'number',
      g: 'bigint',
      h: 'boolean',
      i: 'string[]',
      l: 'number[]',
      m: 'bigint[]',
      o: 'boolean[]',
    }, true))
    .toMatchObject({
      a: {b:'c'},
      d: 'e',
      f: 1,
      g: BigInt('3'),
      h: true,
      i: ['j', 'k'],
      l: [1, 2],
      m: [BigInt('1'), BigInt('2')],
      o: [true, false],
    });
  });

  test('Tuple Conversion', () => {
    expect(convert({a: {b: ['1', 'c', '1']}}, true, {
      a: {
        b: ['number', 'string', 'boolean']
      }
    }, true)).toEqual({a: {b: [1, 'c', true]}});
  });

  test('Filtered by typeDef', () => {
    expect(convert({pageSize: '50'}, false, {
      page: 'number'
    }, false)).toEqual({});
  });

  test('Filtered by typeDef 2', () => {
    expect(convert({page: '1', pageSize: '50'}, false, {
      page: 'number'
    }, false)).toEqual({page: 1});
  });

  test('Unfiltered by initial typeDef', () => {
    expect(convert({pageSize: '50'}, false, {
      page: 'number'
    }, true)).toEqual({pageSize: '50'});
  });

  test('Unfiltered by initial typeDef 2', () => {
    expect(convert({page: '1', pageSize: '50'}, false, {
      page: 'number'
    }, true)).toEqual({page: 1, pageSize: '50'});
  });
});