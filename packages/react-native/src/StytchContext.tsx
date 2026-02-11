import { logger } from '@stytch/core';
import { Session, StytchProjectConfigurationInput, User } from '@stytch/core/public';
import { mergeWithStableProps } from '@stytch/js-utils';
import * as React from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { StytchClient } from './StytchClient';

type SWRUser = {
  /**
   * Either the active {@link User} object, or null if the user is not logged in.
   */
  user: User | null;
  /**
   * If true, indicates that the value returned is from the application cache and a state refresh is in progress.
   */
  fromCache: boolean;
};

const initialUser: SWRUser = {
  user: null,
  fromCache: false,
};

type SWRSession = {
  /**
   * Either the active {@link Session} object, or null if the user is not logged in.
   */
  session: Session | null;
  /**
   * If true, indicates that the value returned is from the application cache and a state refresh is in progress.
   */
  fromCache: boolean;
};

const initialSession: SWRSession = {
  session: null,
  fromCache: false,
};

export const StytchUserContext = React.createContext<SWRUser>(initialUser);
export const StytchSessionContext = React.createContext<SWRSession>(initialSession);
export const StytchContext = React.createContext<StytchClient<StytchProjectConfigurationInput>>(
  {} as StytchClient<StytchProjectConfigurationInput>,
);

export const useStytchUser = (): SWRUser => {
  return React.useContext(StytchUserContext);
};
export const useStytchSession = (): SWRSession => {
  return React.useContext(StytchSessionContext);
};
export const useStytch = <
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>(): StytchClient<TProjectConfiguration> => {
  return React.useContext(StytchContext);
};

export const withStytch = <
  T extends object,
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>(
  Component: React.ComponentType<T & { stytch: StytchClient<TProjectConfiguration> }>,
): React.ComponentType<T> => {
  const WithStytch: React.ComponentType<T> = (props) => {
    return <Component {...props} stytch={useStytch()} />;
  };
  WithStytch.displayName = `withStytch(${Component.displayName || Component.name || 'Component'})`;
  return WithStytch;
};
export const withStytchUser = <T extends object>(
  Component: React.ComponentType<T & { stytchUser: User | null; stytchUserIsFromCache: boolean }>,
): React.ComponentType<T> => {
  const WithStytchUser: React.ComponentType<T> = (props) => {
    const { user, fromCache } = useStytchUser();
    return <Component {...props} stytchUser={user} stytchUserIsFromCache={fromCache} />;
  };
  WithStytchUser.displayName = `withStytchUser(${Component.displayName || Component.name || 'Component'})`;
  return WithStytchUser;
};
export const withStytchSession = <T extends object>(
  Component: React.ComponentType<T & { stytchSession: Session | null; stytchSessionIsFromCache: boolean }>,
): React.ComponentType<T> => {
  const WithStytchSession: React.ComponentType<T> = (props) => {
    const { session, fromCache } = useStytchSession();
    return <Component {...props} stytchSession={session} stytchSessionIsFromCache={fromCache} />;
  };
  WithStytchSession.displayName = `withStytchSession(${Component.displayName || Component.name || 'Component'})`;
  return WithStytchSession;
};

export type StytchProviderProps<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = {
  stytch: StytchClient<TProjectConfiguration>;
  children?: React.ReactNode;
};

export const StytchProvider = <
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>({
  stytch,
  children,
}: StytchProviderProps<TProjectConfiguration>): React.JSX.Element => {
  const [{ user, session }, setClientState] = React.useState({
    session: stytch.session.getInfo(),
    user: stytch.user.getInfo(),
  });

  React.useEffect(() => {
    const handleAppStateChange = async (appState: AppStateStatus) => {
      if (appState === 'active') {
        tryAuthenticate();
      }
    };
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    const tryAuthenticate = async () => {
      try {
        const sessionInfo = stytch.session.getInfo();
        if (sessionInfo.session) {
          await stytch.session.authenticate();
        }
      } catch {
        logger.debug('Session foreground refresh failed.');
      }
    };
    return () => {
      appStateSubscription.remove();
    };
  }, [stytch.session]);

  React.useEffect(
    () =>
      stytch.onStateChange(() => {
        setClientState((oldState) => {
          const newState = {
            session: stytch.session.getInfo(),
            user: stytch.user.getInfo(),
          };

          return mergeWithStableProps(oldState, newState);
        });
      }),
    [setClientState, stytch],
  );

  return (
    <StytchContext.Provider value={stytch}>
      <StytchUserContext.Provider value={user}>
        <StytchSessionContext.Provider value={session}>{children}</StytchSessionContext.Provider>
      </StytchUserContext.Provider>
    </StytchContext.Provider>
  );
};
