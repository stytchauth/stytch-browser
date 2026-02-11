import { useCallback, useMemo, useState } from 'react';

import { debounce } from '../../utils';

export const useDebouncedState = <T>(initialValue: T, delay?: number) => {
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const [pendingValue, setPendingValue] = useState(initialValue);

  const debouncedSetValue = useMemo(() => debounce(setDebouncedValue, delay), [delay]);

  const setValue = useCallback(
    (newValue: T) => {
      setPendingValue(newValue);
      debouncedSetValue(newValue);
    },
    [debouncedSetValue],
  );

  return [debouncedValue, setValue, pendingValue] as const;
};
