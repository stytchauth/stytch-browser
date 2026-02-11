import { useEffect, useState } from 'react';

import { useB2BInternals } from './useB2BInternals';

export const useBootstrap = () => {
  const b2bInternals = useB2BInternals();

  const [bootstrap, setBootstrap] = useState(b2bInternals.bootstrap.getSync());

  useEffect(() => {
    b2bInternals.bootstrap.getAsync().then((value) => {
      setBootstrap(value);
    });
  }, [b2bInternals.bootstrap]);

  return bootstrap;
};
