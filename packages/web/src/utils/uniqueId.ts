import { nanoid } from 'nanoid';
import { useRef } from 'react';

export const getUniqueId = (prefix = 's') => prefix + nanoid();

/**
 * Create a unique ID (like React 18's useId()) with a specific prefix. The default 's' prefix
 * should be good enough for most use cases - we always want an alphabet as the first character
 * but we don't want it to be long enough to become selectable, to prevent this from accidentally
 * becoming a stable API.
 */
export const useUniqueId = (prefix = 's') => {
  const id = useRef(nanoid());
  return prefix + id.current;
};
