import { useStytch, useStytchUser } from '@stytch/nextjs';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

function Authenticate() {
  const stytchClient = useStytch();
  const { user, isInitialized } = useStytchUser();
  const { query, replace } = useRouter();

  useEffect(() => {
    if (stytchClient && query.token && user && isInitialized) {
      replace('/dashboard');
    }
  }, [stytchClient, query.token, user, isInitialized, replace]);

  useEffect(() => {
    if (stytchClient && query.token && !(user && isInitialized)) {
      try {
        stytchClient.magicLinks.authenticate(query.token as string, {
          session_duration_minutes: 60,
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log('Error on authenticate', err);
      }
    }
  }, [stytchClient, query.token, user, isInitialized]);

  return (
    <div>
      <h1>Authenticating...</h1>
    </div>
  );
}

export default Authenticate;
