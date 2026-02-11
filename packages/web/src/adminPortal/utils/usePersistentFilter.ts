import { useCallback, useMemo } from 'react';

import { useSessionStorage } from '../utils/useSessionStorage';

const serialize = <T>(value: ReadonlySet<T>) => Array.from(value);

export const usePersistentFilter = <T extends string>({
  viewId,
  fieldId,
  defaultValue,
  permittedValues,
}: {
  viewId: string;
  fieldId: string;
  defaultValue: ReadonlySet<T>;
  permittedValues: ReadonlySet<T>;
}) => {
  const deserialize = useCallback(
    (value: T[] | undefined) => {
      if (!value) {
        return new Set(defaultValue);
      }
      return new Set(value.filter((v) => permittedValues.has(v)));
    },
    [defaultValue, permittedValues],
  );

  const [serializedValue, setSerializedValue] = useSessionStorage(
    `${viewId}_filter_${fieldId}`,
    serialize(defaultValue),
  );

  const value = useMemo(() => deserialize(serializedValue), [deserialize, serializedValue]);
  const setValue = useCallback(
    (newValue: ReadonlySet<T>) => setSerializedValue(serialize(newValue)),
    [setSerializedValue],
  );

  return [value, setValue] as const;
};
