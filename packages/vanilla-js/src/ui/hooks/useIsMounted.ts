import { MutableRefObject, useEffect, useRef } from 'react';

export const useIsUnmounted = (): MutableRefObject<boolean> => {
  const isUnmounted = useRef<boolean>(false);

  useEffect(
    () => () => {
      isUnmounted.current = true;
    },
    [],
  );

  return isUnmounted;
};

export const useIsMounted = (): MutableRefObject<boolean> => {
  const isUnmounted = useRef<boolean>(true);

  useEffect(
    () => () => {
      isUnmounted.current = false;
    },
    [],
  );

  return isUnmounted;
};
