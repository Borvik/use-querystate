import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { renderHook, act } from '@testing-library/react-hooks';
import { useQueryState } from '../lib';

const history = createMemoryHistory({ initialEntries: ['/'] });

// https://blog.logrocket.com/testing-the-react-router-usehistory-hook-with-react-testing-library/
// https://codesandbox.io/s/react-ts-unit-test-example-kmubx?file=/src/hooks/useStepper/useStepper.test.tsx


describe('Parsing Tests', () => {
  test('Empty Query String', async () => {
    const { result } = renderHook(() => useQueryState({ page: 1 }), {
      wrapper: ({ children }) => (
        <>
          <Router history={history}>
            {children}
          </Router>
        </>
      )
    });

    await act(async () => {
      // do something
    });

    // test something
  });
});