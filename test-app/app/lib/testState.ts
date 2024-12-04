import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';

export const TestingState = atom('off' as 'off' | 'simple' | 'multi' | 'mulit-safe');

type ResetFn = () => void;

export function useTestingState(test: 'simple' | 'multi' | 'mulit-safe'): [boolean, ResetFn] {
  const [state, setState] = useAtom(TestingState);
  const navigate = useNavigate();

  const reset = useCallback(() => {
    // reset the url fo next test
    navigate('/');

    // toggle test
    if (state === test) {
      setState('off');
    } else {
      setState(test);
    }
  }, [test, state, setState, navigate]);

  return [(state === test), reset];
}