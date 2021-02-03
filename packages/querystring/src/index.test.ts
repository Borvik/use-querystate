import { QueryString } from './index';

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

  test('Simple Merge', () => {
    expect(QueryString.merge('a=b', {c: 5})).toBe('a=b&c=5');
  });

  test('Merge Unset', () => {
    expect(QueryString.merge('a=b&c=5', {c: null})).toBe('a=b');
  });
});
