import { useEffect, useState } from 'react';

export type Countdown = {
  expiration: number; // Unix epoch
  start: (durationInSeconds: number) => void;
  clear: () => void;
};

export function useCountdown(): Countdown {
  const [expiration, setExpiration] = useState(0);

  const start = (durationInSeconds: number) => {
    setExpiration(Date.now() + durationInSeconds * 1_000);
  };

  const clear = () => {
    setExpiration(0);
  };

  return {
    expiration,
    start,
    clear,
  };
}

export function formatCountdown(secondsLeft: number) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft - minutes * 60;
  return minutes + ':' + String(seconds).padStart(2, '0');
}

const getSecondsRemaining = (expiration: number) => Math.max(0, Math.ceil((expiration - Date.now()) / 1_000));

export const useTimeRemaining = (expirationEpoch: number) => {
  const [seconds, setSeconds] = useState(() => getSecondsRemaining(expirationEpoch));

  const codeExpired = seconds <= 0;
  useEffect(() => {
    const updateSeconds = () => setSeconds(getSecondsRemaining(expirationEpoch));
    updateSeconds();

    if (Date.now() >= expirationEpoch) return;
    const interval = setInterval(updateSeconds, 1000);

    return () => clearInterval(interval);
  }, [codeExpired, expirationEpoch]);

  return [seconds, !codeExpired] as const;
};
