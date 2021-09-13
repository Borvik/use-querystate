import React from 'react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { renderHook, act } from '@testing-library/react-hooks';
import { useQueryState, batchedQSUpdate } from '../lib';
import { QueryStateOptions } from '../lib/types';

const BASE_URL = '/?page=2';
const history = createMemoryHistory({ initialEntries: [ BASE_URL ] });

function getHook<T extends object>(initialState: T, options?: QueryStateOptions) {
  const { result } = renderHook(() => useQueryState(initialState, options), {
    wrapper: ({ children }) => (
      <>
        <Router history={history}>
          {children}
        </Router>
      </>
    )
  });
  return result;
}

describe('Parsing Tests', () => {
  beforeEach(() => {
    history.push(BASE_URL);
  });

  test('Basic parse and set', async () => {
    const result = getHook({ page: 1, pageSize: 10 })

    let [qs, setQs] = result.current;
    expect(qs).toStrictEqual({ page: 2, pageSize: 10 });

    await act(async () => {
      setQs({ page: 1 });
    });

    [qs, setQs] = result.current;
    expect(qs).toStrictEqual({ page: 1, pageSize: 10 });
    expect(history.location.search).toBe('');
  });

  test('Internal state', async () => {
    const result = getHook({ page: 1, pageSize: 10 }, { internalState: true });

    expect(history.location.search).toBe('?page=2'); // default qs, internalState ignores

    let [qs, setQs] = result.current;
    expect(qs).toStrictEqual({ page: 1, pageSize: 10 });

    await act(async () => {
      setQs({ page: 3 });
    });

    [qs, setQs] = result.current;
    expect(qs).toStrictEqual({ page: 3, pageSize: 10 });
    expect(history.location.search).toBe('?page=2'); // should be unchanged
  });

  test('Prefix', async () => {
    history.push('/?d=(page:2)');
    const result = getHook({ page: 1, pageSize: 10 }, { prefix: 'd' });

    let [qs, setQs] = result.current;
    expect(qs).toStrictEqual({ page: 2, pageSize: 10 });

    await act(async () => {
      setQs({ page: 3 });
    });

    [qs, setQs] = result.current;
    expect(qs).toStrictEqual({ page: 3, pageSize: 10 });
    expect(history.location.search).toBe('?d=(page:3)');
  });

  test('Batch Updates', async () => {
    history.push('/?page=2');
    const result = getHook({ page: 1, pageSize: 10 });

    let [qs, setQs] = result.current;
    expect(qs).toStrictEqual({ page: 2, pageSize: 10 });

    await act(async () => {
      batchedQSUpdate(() => {
        setQs({ page: 3 });
        setQs({ pageSize: 25 });
      });
    });

    [qs, setQs] = result.current;
    expect(qs).toStrictEqual({ page: 3, pageSize: 25 });
    expect(history.location.search).toBe('?page=3&pageSize=25');
  });

  test('Chained Updates', async () => {
    const result = getHook({ page: 1, pageSize: 10 });

    let [qs, setQsOrig] = result.current;
    expect(qs).toStrictEqual({ page: 2, pageSize: 10 });

    await act(async () => {
      setQsOrig(pg => ({ page: pg.page + 1 }));
    });

    let [qs1, setQs1] = result.current;
    expect(qs1).toStrictEqual({ page: 3, pageSize: 10 });
    expect(history.location.search).toBe('?page=3');
    expect(setQs1).toStrictEqual(setQsOrig);

    await act(async () => {
      setQs1(pg => ({ page: pg.page + 1 }));
    });

    let [qs2, setQs2] = result.current;
    expect(qs2).toStrictEqual({ page: 4, pageSize: 10 });
    expect(history.location.search).toBe('?page=4');
    expect(setQs2).toStrictEqual(setQsOrig);
  });

  test('Filter Object', async () => {
    history.push('/?filter=(amount:13;op:lt)');
    const result = getHook({ filter: null }, {
      types: {
        filter: 'any'
      },
      filterToTypeDef: true,
    });

    let [qs] = result.current;
    expect(qs).toStrictEqual({ filter: { amount: '13', op: 'lt' } });
  });

  test('Multi-Hook', async () => {
    history.push('/?page=2');
    const pageHook = getHook({ page: 1, pageSize: 10 });
    const sortHook = getHook({ sort: [] as string[] }, {
      types: {
        sort: 'string[]',
      }
    });

    let [pageQs, setPageQs] = pageHook.current;
    expect(pageQs).toStrictEqual({ page: 2, pageSize: 10 });

    let [sortQs, setSortQs] = sortHook.current;
    expect(sortQs).toStrictEqual({ sort: [] });

    await act(async () => {
      setSortQs({ sort: ['name asc'] });
    });

    let [pageQs1] = pageHook.current;
    expect(pageQs1).toStrictEqual({ page: 2, pageSize: 10 });

    let [sortQs1] = sortHook.current;
    expect(sortQs1).toStrictEqual({ sort: ['name asc'] });
    expect(history.location.search).toBe('?page=2&sort=name+asc');

    await act(async () => {
      setPageQs({ page: 3 });
    });

    let [pageQs2] = pageHook.current;
    expect(pageQs2).toStrictEqual({ page: 3, pageSize: 10 });

    let [sortQs2] = sortHook.current;
    expect(sortQs2).toStrictEqual({ sort: ['name asc'] });
    expect(history.location.search).toBe('?page=3&sort=name+asc');
  });

  test('Multi-Hook (batch)', async () => {
    history.push('/?page=2');
    const pageHook = getHook({ page: 1, pageSize: 10 });
    const sortHook = getHook({ sort: [] as string[] }, {
      types: {
        sort: 'string[]',
      }
    });

    let [pageQs, setPageQs] = pageHook.current;
    expect(pageQs).toStrictEqual({ page: 2, pageSize: 10 });

    let [sortQs, setSortQs] = sortHook.current;
    expect(sortQs).toStrictEqual({ sort: [] });

    await act(async () => {
      setSortQs({ sort: ['name asc'] });
    });

    let [pageQs1] = pageHook.current;
    expect(pageQs1).toStrictEqual({ page: 2, pageSize: 10 });

    let [sortQs1] = sortHook.current;
    expect(sortQs1).toStrictEqual({ sort: ['name asc'] });
    expect(history.location.search).toBe('?page=2&sort=name+asc');

    batchedQSUpdate(() => {
      setPageQs({ page: 3 });
      setPageQs({ pageSize: 25 });
    });

    let [pageQs2] = pageHook.current;
    expect(pageQs2).toStrictEqual({ page: 3, pageSize: 25 });

    let [sortQs2] = sortHook.current;
    expect(sortQs2).toStrictEqual({ sort: ['name asc'] });
    expect(history.location.search).toBe('?page=3&sort=name+asc&pageSize=25');
  });
});