import React, { useCallback } from 'react';

export const useStateSliceSetter = <TState extends object, const TStateKey extends keyof TState>(
  setState: React.Dispatch<React.SetStateAction<TState>>,
  key: TStateKey,
) => {
  return useCallback(
    (value: TState[TStateKey]) => {
      setState((state) => {
        return {
          ...state,
          [key]: value,
        };
      });
    },
    [key, setState],
  );
};
