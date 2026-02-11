import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

// useState can cause memory leaks if it is set after the component unmounted. For example, if it is
// set after `await`, or in a `then`, `catch`, or `finally`, or in a setTimout/setInterval.
export const useAsyncState = <T>(initialState: T | (() => T)): [T, Dispatch<SetStateAction<T>>] => {
  const isMounted = useRef<boolean>(true);
  const [state, setState] = useState<T>(initialState);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const setStateAction = useCallback<Dispatch<SetStateAction<T>>>((newState) => {
    if (isMounted.current) {
      setState(newState);
    }
  }, []);

  return [state, setStateAction];
};
