import React from 'react';
import { StytchClientContext } from '../StytchClientContext';

export const useStytchClient = () => {
  const client = React.useContext(StytchClientContext).client;
  if (!client) {
    throw new Error('A Stytch client could not be found');
  }
  return client;
};
