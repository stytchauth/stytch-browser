import { useEffect, useMemo, useState } from 'react';

/**
 * Return true if media query matches. The value is bound to media query list change event
 * so it will update automatically and trigger re-render when it changes. Pass in undefined
 * to disable this and cause it to return false.
 */
export function useMediaQuery(mediaQuery: string | undefined) {
  const query = useMemo(() => (mediaQuery ? matchMedia(mediaQuery) : undefined), [mediaQuery]);
  const [match, setMatch] = useState(() => query?.matches ?? false);
  useEffect(() => {
    if (!query) {
      setMatch(false);
      return;
    }

    const abortController = new AbortController();
    query.addEventListener('change', (evt) => setMatch(evt.matches), { signal: abortController.signal });
    return () => abortController.abort();
  }, [query]);
  return match;
}
