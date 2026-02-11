import { useCallback, useState } from 'react';

export const useTimer = () => {
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const start = useCallback(() => {
    setEndTime(null);
    setStartTime(performance.now());
  }, []);

  const stop = useCallback(() => {
    setEndTime(performance.now());
  }, []);

  const duration = startTime !== null && endTime !== null ? endTime - startTime : null;

  return {
    start,
    stop,
    duration,
  };
};
