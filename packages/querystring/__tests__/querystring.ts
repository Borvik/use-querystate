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

  test('Filtered: ?pageSize=50', () => {
    expect(QueryString.parse('?pageSize=50', {
      types: {
        page: 'number'
      }
    })).toEqual({});
  });

  test('Unfiltered: ?pageSize=50', () => {
    expect(QueryString.parse('?pageSize=50', {
      initialState: {
        page: 1
      }
    })).toEqual({page: 1, pageSize: '50'});
  });

  test('Filtered by initial: ?pageSize=50', () => {
    expect(QueryString.parse('?pageSize=50', {
      initialState: {
        page: 1
      },
      lockTypesToInitialState: true,
    })).toEqual({page: 1});
  });

  test('Basic filter: ?filter=(amount:13;op:lt)', () => {
    expect(QueryString.parse('?filter=(amount:13;op:lt)', {
      types: {
        filter: 'any',
      },
      filterToTypeDef: true,
    })).toEqual({ filter: { amount: '13', op: 'lt' }})
  });

  test('Filter to types with existing: ?page=2', () => {
    expect(QueryString.parse('?page=2', {
      initialState: {
        filter: {
          num: '002',
          b: 3
        }
      },
      types: {
        filter: {
          num: 'string',
          b: 'number'
        }
      },
      filterToTypeDef: true,
    })).toEqual({ filter: { num: '002', b: 3 }});
  });

  test('Unset a default: ?page=&pageSize=10', () => {
    expect(QueryString.parse('?page=&pageSize=10', {
      initialState: {
        page: 2,
        pageSize: 25,
      }
    })).toEqual({ page: null, pageSize: 10 });
  });

  test('Unset a default 2: ?filter=', () => {
    expect(QueryString.parse('?filter=', {
      initialState: {
        filter: {
          num: "002"
        }
      },
      types: {
        filter: 'object'
      },
    })).toEqual({ filter: null });
  });

  test('Unset a default 3: ?filter=', () => {
    expect(QueryString.parse('?filter=', {
      initialState: {
        filter: {
          num: "002"
        }
      },
      types: {
        filter: {
          num: 'string'
        }
      },
    })).toEqual({ filter: null });
  });

  test('Unset a default 4: ?filter=', () => {
    expect(QueryString.parse('?filter=', {
      initialState: {
        filter: {
          num: "002"
        }
      },
      types: {
        filter: 'object'
      },
      filterToTypeDef: true,
    })).toEqual({ filter: null });
  });

  test('Unset a default 5: ?filter=', () => {
    expect(QueryString.parse('?filter=', {
      initialState: {
        filter: {
          num: "002"
        }
      },
      types: {
        filter: {
          num: 'string'
        }
      },
      filterToTypeDef: true,
    })).toEqual({ filter: null });
  });

  test('Unset a default 6: ?filter=', () => {
    expect(QueryString.parse('?filter=(b:3)', {
      initialState: {
        filter: {
          num: "002",
          b: 3,
        }
      },
    })).toEqual({ filter: { b: 3 } });
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

  test('Unsetting a default', () => {
    expect(QueryString.stringify({
      page: null,
    }, {
      initialState: { page: 2 }
    })).toBe('page=');
  });

  test('Unsetting a default 2: ?filter=', () => {
    expect(QueryString.stringify({
      filter: null,
    }, {
      initialState: {
        filter: {
          num: "002"
        }
      }
    })).toBe('filter=');
  });

  test('Unsetting a default - part 3', () => {
    // this is different from the merge of empty set in that, this isn't a merge - its setting in full
    expect(QueryString.stringify({}, {
      initialState: { page: 2 }
    })).toBe('page=');
  });

  test('Unsetting a default 4: ?filter=', () => {
    expect(QueryString.stringify({
      filter: {
        b: 3
      },
    }, {
      initialState: {
        filter: {
          num: "002",
          b: 3,
        }
      },
    })).toBe('filter=(b:3)');
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

  test('Deep Merge 2', () => {
    expect(QueryString.merge(
      '?a=(b:(c:d))',
      {
        a: { b: { e: 'f' }},
        'a.b.g': 'h',
      },
      { deepMerge: true }
    )).toBe('a=(b:(c:d;e:f))&a.b.g=h');
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

  test('Merge unset a default', () => {
    expect(QueryString.merge(
      '?page=5&pageSize=10',
      { page: null },
      { initialState: { page: 2, pageSize: 25 } }
    )).toBe('page=&pageSize=10');
  });

  test('Merge unset a default 2', () => {
    expect(QueryString.merge(
      '?filter=(num:003)',
      { filter: null }, {
      initialState: {
        filter: {
          num: "002"
        }
      }
    })).toBe('filter=');
  });

  test('Merge unset a default 3', () => {
    expect(QueryString.merge(
      '?page=5&pageSize=10',
      { }, // empty set of new data - no change
      { initialState: { page: 2, pageSize: 25 } }
    )).toBe('page=5&pageSize=10');
  });

  test('Merge unset a default 4', () => {
    expect(QueryString.merge(
      '?page=5',
      {
        filter: {
          b: 3,
        }
      },
      {
        initialState: {
          filter: {
            num: "002",
            b: 3,
          }
        },
      }
    )).toBe('page=5&filter=(b:3)');
  });

  test('Merge unset a default 5', () => {
    expect(QueryString.merge(
      '?page=5',
      {
        filter: null
      },
      {
        initialState: {
          filter: {
            num: "002",
            b: 3,
          }
        },
      }
    )).toBe('page=5&filter=');
  });
});