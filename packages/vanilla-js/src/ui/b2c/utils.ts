import { useEffect, useState } from 'react';
import { useStytch } from './GlobalContextProvider';
import { readB2CInternals } from '../../utils/internal';
import { BootstrapData } from '@stytch/core';

export const useBootstrap = (): { bootstrap: BootstrapData; fromCache: boolean } => {
  const stytchClient = useStytch();
  const [bootstrap, setBootstrap] = useState({
    bootstrap: readB2CInternals(stytchClient).bootstrap.getSync(),
    fromCache: true,
  });

  useEffect(() => {
    readB2CInternals(stytchClient)
      .bootstrap.getAsync()
      .then((data) =>
        setBootstrap({
          bootstrap: data,
          fromCache: false,
        }),
      );
  }, [stytchClient]);

  return bootstrap;
};
