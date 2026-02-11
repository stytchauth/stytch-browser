import { useCallback, useRef } from 'react';

import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';

/**
 * Use this for callbacks that are not called during render, most commonly event callbacks.
 * The returned callback will never change and therefore trigger unwanted effects
 * when used in deps or re-render of memoized components.
 * This is a copy of proposed the useEvent hook.
 */
export const useEvent = <Args extends unknown[], Ret = void>(fn: (...args: Args) => Ret) => {
  const handlerRef = useRef(fn);
  useIsomorphicLayoutEffect(() => {
    handlerRef.current = fn;
  }, [fn]);

  return useCallback((...args: Args) => {
    const fn = handlerRef.current;
    return fn(...args);
  }, []);
};
