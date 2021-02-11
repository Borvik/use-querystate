import React from 'react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { renderHook, act } from '@testing-library/react-hooks';
import { useQueryState } from '../lib';
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
    expect(qs).toMatchObject({ page: 2, pageSize: 10 });

    await act(async () => {
      setQs({ page: 1 });
    });

    [qs, setQs] = result.current;
    expect(qs).toMatchObject({ page: 1, pageSize: 10 });
    expect(history.location.search).toBe('');
  });

  test('Internal state', async () => {
    const result = getHook({ page: 1, pageSize: 10 }, { internalState: true });

    expect(history.location.search).toBe('?page=2'); // default qs, internalState ignores

    let [qs, setQs] = result.current;
    expect(qs).toMatchObject({ page: 1, pageSize: 10 });

    await act(async () => {
      setQs({ page: 3 });
    });

    [qs, setQs] = result.current;
    expect(qs).toMatchObject({ page: 3, pageSize: 10 });
    expect(history.location.search).toBe('?page=2'); // should be unchanged
  });

  test('Prefix', async () => {
    history.push('/?d=(page:2)');
    const result = getHook({ page: 1, pageSize: 10 }, { prefix: 'd' });

    let [qs, setQs] = result.current;
    expect(qs).toMatchObject({ page: 2, pageSize: 10 });

    await act(async () => {
      setQs({ page: 3 });
    });

    [qs, setQs] = result.current;
    expect(qs).toMatchObject({ page: 3, pageSize: 10 });
    expect(history.location.search).toBe('?d=(page:3)');
  });
});