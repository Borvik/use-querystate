import { QueryString } from '../src/index';

describe('Parsing Tests', () => {
  test('Empty Query String', () => {
    expect(QueryString.parse('')).toEqual({});
  });
  
  test('?a', () => {
    expect(QueryString.parse('?a')).toEqual({
      a: ''
    });
  });

  test('?a=', () => {
    expect(QueryString.parse('?a=')).toEqual({
      a: ''
    });
  });

  test('?a=b', () => {
    expect(QueryString.parse('?a=b')).toEqual({
      a: 'b'
    });
  });

  test('a=b', () => {
    expect(QueryString.parse('a=b')).toEqual({
      a: 'b'
    });
  });

  test('a=b&c=d', () => {
    expect(QueryString.parse('a=b&c=d')).toEqual({
      a: 'b',
      c: 'd',
    });
  });

  test('a=b,c', () => {
    expect(QueryString.parse('a=b,c')).toEqual({
      a: ['b', 'c']
    });
  });

  test('test=(a:b;c:d),(e:f;g:h)', () => {
    expect(QueryString.parse('test=(a:b;c:d),(e:f;g:h)')).toEqual({
      test: [
        {a: 'b', c: 'd'},
        {e: 'f', g: 'h'},
      ]
    });
  });

  test('?filter=(id:1),(id:1;op:nul),(or:(id:3,4;op:bet),(id:5,6,7;op:any)),(and:(id:9))', () => {
    expect(QueryString.parse('?filter=(id:1),(id:1;op:nul),(or:(id:3,4;op:bet),(id:5,6,7;op:any)),(and:(id:9))')).toEqual({
      filter: [
        {id: '1'},
        {id: '1', op: 'nul'},
        {
          or: [
            { id: ['3', '4'], op: 'bet' },
            { id: ['5', '6', '7'], op: 'any' }
          ]
        },
        {
          and: { id: '9' }
        }
      ]
    });
  });

  test('?page=2', () => {
    expect(QueryString.parse('?page=2', { initialState: { page: 1, pageSize: 10 }}))
      .toMatchObject({
        page: 2,
        pageSize: 10
      });
  });

  test('Convert: ?a=b&c=5&d=1,2,3&e=1&f=skipped', () => {
    expect(QueryString.parse('?a=b&c=5&d=1,2,3&e=1&f=skipped', {
      types: {
        a: 'string',
        c: 'number',
        d: 'number[]',
        e: 'boolean',
      }
    })).toMatchObject({
      a: 'b',
      c: 5,
      d: [1, 2, 3],
      e: true,
    });
  });

  test('Convert: ?filter=a,1,1', () => {
    expect(QueryString.parse('?filter=a,1,1', {
      definedTuples: true,
      types: {
        filter: ['string', 'number', 'boolean']
      }
    }))
    .toMatchObject({
      filter: ['a', 1, true]
    });
  });
});

describe('Stringify Tests', () => {
  test('Simple QS', () => {
    expect(QueryString.stringify({a: 'b', c: 'd e', f: 5, g: true, h: false})).toBe('a=b&c=d+e&f=5&g=1&h=0');
  });

  test('Array Single Value', () => {
    expect(QueryString.stringify({a: ['b'], c: 'd'})).toBe('a=b&c=d');
  });

  test('Array Multi-Value', () => {
    expect(QueryString.stringify({a: ['b', 1], c: 'd'})).toBe('a=b,1&c=d');
  });

  test('Simple Object', () => {
    expect(QueryString.stringify({a: {b: 'c', d: 'e'}})).toBe('a=(b:c;d:e)');
  });

  test('Set with init', () => {
    expect(QueryString.stringify({page: 1, q: 'query'}, {
      initialState: { page: 1 }
    })).toBe('q=query');
    
  });

  test('Set with init (empty)', () => {
    expect(QueryString.stringify({page: 1, pageSize: 10}, { initialState: { page: 1, pageSize: 10 }})).toBe('');
  });

  
});

describe('Merge Tests', () => {
  test('Simple Merge', () => {
    expect(QueryString.merge('a=b', {c: 5})).toBe('a=b&c=5');
  });

  test('Merge Unset (null)', () => {
    expect(QueryString.merge('a=b&c=5', {c: null})).toBe('a=b');
  });

  test('Merge Unset (undefined)', () => {
    expect(QueryString.merge('a=b&c=5', {c: undefined})).toBe('a=b');
  });

  test('Deep Merge', () => {
    expect(QueryString.merge(
      '?a=(b:c;d:e,f;j:(k:l))',
      {g:'h', a: {b:'1',m:'o'}},
      { deepMerge: true }
    )).toBe('a=(b:1;d:e,f;j:(k:l);m:o)&g=h')
  });

  test('Deep Unset', () => {
    expect(QueryString.merge(
      '?a=(b:c;d:e,f;j:(k:l))',
      {a: {j: {k: null}}},
      { deepMerge: true }
    )).toBe('a=(b:c;d:e,f)')
  });

  test('Merge with Initial State', () => {
    expect(QueryString.merge(
      '?page=5&pageSize=10',
      { page: 1 },
      { initialState: { page: 1, pageSize: 25 }}
    )).toBe('pageSize=10');
  });
});