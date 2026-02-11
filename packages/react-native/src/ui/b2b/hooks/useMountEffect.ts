import { EffectCallback, useEffect, useRef } from 'react';

/**
 * Run an effect only once, on mount
 * @param effect An effect to run only once, on mount
 */
export const useMountEffect = (effect: EffectCallback) => {
  const effectRef = useRef(effect);
  useEffect(() => effectRef.current(), []);
};
