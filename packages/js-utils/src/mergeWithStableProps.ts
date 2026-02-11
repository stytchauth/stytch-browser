import { createDeepEqual } from './createDeepEqual';

const deepEqual = createDeepEqual();

/**
 * Returns a version of `newValue` whose properties that are deeply equal to
 * those in `oldValue` are replaced with those from `oldValue`. This provides a
 * limited form of "structural sharing" that provides a stable reference for
 * unchanged slices of the object.
 *
 * If `oldValue` and `newValue` are referentially equal, the same value is
 * returned.
 *
 * @param oldValue The old value
 * @param newValue The new value
 */
export const mergeWithStableProps = <T extends Record<string, unknown>, U extends Record<string, unknown> = T>(
  oldValue: U,
  newValue: T,
): T => {
  // If the values are already referentially the same, just return the new value
  if ((oldValue as unknown) === newValue) {
    return newValue;
  }

  return Object.keys(oldValue).reduce(
    (acc, key) => {
      if (key in newValue && deepEqual(oldValue[key], newValue[key])) {
        acc[key as keyof T] = oldValue[key] as unknown as T[keyof T];
      }
      return acc;
    },
    { ...newValue },
  );
};
