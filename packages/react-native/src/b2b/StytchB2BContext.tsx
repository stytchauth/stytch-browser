import { StytchB2BClient } from './StytchB2BClient';
import { Member, MemberSession, Organization, StytchProjectConfigurationInput } from '@stytch/core/public';
import * as React from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { logger } from '@stytch/core';
import { mergeWithStableProps } from '@stytch/js-utils';

type SWRMember = {
  /**
   * Either the active {@link Member} object, or null if the member is not logged in.
   */
  member: Member | null;
  /**
   * If true, indicates that the value returned is from the application cache and a state refresh is in progress.
   */
  fromCache: boolean;
};

const initialMember: SWRMember = {
  member: null,
  fromCache: false,
};

type SWRSession = {
  /**
   * Either the active {@link MemberSession} object, or null if the member is not logged in.
   */
  session: MemberSession | null;
  /**
   * If true, indicates that the value returned is from the application cache and a state refresh is in progress.
   */
  fromCache: boolean;
};

const initialSession: SWRSession = {
  session: null,
  fromCache: false,
};

type SWROrganization = {
  /**
   * Either the active {@link Organization} object, or null if the member is not logged in.
   */
  organization: Organization | null;
  /**
   * If true, indicates that the value returned is from the application cache and a state refresh is in progress.
   */
  fromCache: boolean;
};

const initialOrganization: SWROrganization = {
  organization: null,
  fromCache: false,
};

export const StytchMemberContext = React.createContext<SWRMember>(initialMember);
export const StytchMemberSessionContext = React.createContext<SWRSession>(initialSession);
export const StytchOrganizationContext = React.createContext<SWROrganization>(initialOrganization);
export const StytchB2BContext = React.createContext<StytchB2BClient<StytchProjectConfigurationInput>>(
  {} as StytchB2BClient<StytchProjectConfigurationInput>,
);

export const useStytchMember = (): SWRMember => {
  return React.useContext(StytchMemberContext);
};
export const useStytchMemberSession = (): SWRSession => {
  return React.useContext(StytchMemberSessionContext);
};
export const useStytchB2BClient = <
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>(): StytchB2BClient<TProjectConfiguration> => {
  return React.useContext(StytchB2BContext);
};
export const useStytchOrganization = (): SWROrganization => {
  return React.useContext(StytchOrganizationContext);
};

export const withStytchB2BClient = <
  T extends object,
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>(
  Component: React.ComponentType<T & { stytch: StytchB2BClient<TProjectConfiguration> }>,
): React.ComponentType<T> => {
  const WithStytch: React.ComponentType<T> = (props) => {
    return <Component {...props} stytch={useStytchB2BClient()} />;
  };
  WithStytch.displayName = `withStytch(${Component.displayName || Component.name || 'Component'})`;
  return WithStytch;
};
export const withStytchMember = <T extends object>(
  Component: React.ComponentType<T & { stytchMember: Member | null; stytchMemberIsFromCache: boolean }>,
): React.ComponentType<T> => {
  const WithStytchMember: React.ComponentType<T> = (props) => {
    const { member, fromCache } = useStytchMember();
    return <Component {...props} stytchMember={member} stytchMemberIsFromCache={fromCache} />;
  };
  WithStytchMember.displayName = `withStytchMember(${Component.displayName || Component.name || 'Component'})`;
  return WithStytchMember;
};
export const withStytchMemberSession = <T extends object>(
  Component: React.ComponentType<T & { stytchMemberSession: MemberSession | null; stytchSessionIsFromCache: boolean }>,
): React.ComponentType<T> => {
  const WithStytchMemberSession: React.ComponentType<T> = (props) => {
    const { session, fromCache } = useStytchMemberSession();
    return <Component {...props} stytchMemberSession={session} stytchSessionIsFromCache={fromCache} />;
  };
  WithStytchMemberSession.displayName = `withStytchMemberSession(${
    Component.displayName || Component.name || 'Component'
  })`;
  return WithStytchMemberSession;
};

export const withStytchOrganization = <T extends object>(
  Component: React.ComponentType<
    T & { stytchOrganization: Organization | null; stytchOrganizationIsFromCache: boolean }
  >,
): React.ComponentType<T> => {
  const WithStytchOrganization: React.ComponentType<T> = (props) => {
    const { organization, fromCache } = useStytchOrganization();
    return <Component {...props} stytchOrganization={organization} stytchOrganizationIsFromCache={fromCache} />;
  };
  WithStytchOrganization.displayName = `withStytchOrganization(${
    Component.displayName || Component.name || 'Component'
  })`;
  return WithStytchOrganization;
};

export type StytchB2BProviderProps<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = {
  stytch: StytchB2BClient<TProjectConfiguration>;
  children?: React.ReactNode;
};

export const StytchB2BProvider = <
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>({
  stytch,
  children,
}: StytchB2BProviderProps<TProjectConfiguration>): React.JSX.Element => {
  const [{ member, session, organization }, setClientState] = React.useState({
    session: stytch.session.getInfo(),
    member: stytch.self.getInfo(),
    organization: stytch.organization.getInfo(),
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
        if (stytch.session.getInfo().session) {
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
            member: stytch.self.getInfo(),
            organization: stytch.organization.getInfo(),
          };

          return mergeWithStableProps(oldState, newState);
        });
      }),
    [setClientState, stytch],
  );

  return (
    <StytchB2BContext.Provider value={stytch}>
      <StytchOrganizationContext.Provider value={organization}>
        <StytchMemberContext.Provider value={member}>
          <StytchMemberSessionContext.Provider value={session}>{children}</StytchMemberSessionContext.Provider>
        </StytchMemberContext.Provider>
      </StytchOrganizationContext.Provider>
    </StytchB2BContext.Provider>
  );
};
