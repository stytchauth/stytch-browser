import { useEffect } from 'react';

export const useBeforeUnloadNavigationBlock = (shouldWarn: boolean): void => {
  useEffect(() => {
    if (shouldWarn) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = true;
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [shouldWarn]);
};
