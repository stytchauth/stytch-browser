import { IStorage, StorageKey } from './storage';
import { useCallback, useState } from 'react';

const tryParseJson = (value: string | null | undefined) => {
  try {
    if (value) {
      return JSON.parse(value) as unknown;
    }
  } catch {
    // no-op; assume data was malformed
  }

  return undefined;
};

/**
 * Low level wrapper around browser Storage (localStorage/sessionStorage). Do not use this hook directly, use
 * one of the useLocalStorage/useSessionStorage hook from inside ui and adminPortal instead.
 */
export const useInternalStorage = <T>(storage: IStorage, publicToken: string, key: StorageKey, defaultValue: T) => {
  const [cachedValue, setCachedValue] = useState(() => {
    const storedValue = storage.getItem(publicToken, key);
    return storedValue ? (tryParseJson(storedValue) as T) : defaultValue;
  });

  const setValue = useCallback(
    (value: T) => {
      setCachedValue(value);
      storage.setItem(publicToken, key, JSON.stringify(value));
    },
    [publicToken, key, storage],
  );

  return [cachedValue, setValue] as const;
};
