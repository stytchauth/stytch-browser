import {
  Member,
  MemberSession,
  Organization,
  PermissionsMap,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';
import { mergeWithStableProps } from '@stytch/js-utils';
import React, {
  ComponentType,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { StytchB2BClient } from '../../../b2b/StytchB2BClient';
import { isStytchSSRProxy } from '../bindings/StytchSSRProxy';
import { useAsyncState } from '../utils/async';
import { noProviderError } from '../utils/errors';
import { invariant } from '../utils/invariant';

// There's no user facing strings in this file
/* eslint-disable lingui/no-unlocalized-strings */

type StytchB2BContext<TProjectConfiguration extends StytchProjectConfigurationInput> =
  | {
      isMounted: false;
    }
  | {
      isMounted: true;
      client: StytchB2BClient<TProjectConfiguration>;
    };

type SWRMemberUninitialized = {
  /**
   * Either the active {@link Member} object, or null if the member is not logged in.
   */
  member: null;
  /**
   * If true, indicates that the value returned is from the application cache and a state refresh is in progress.
   */
  fromCache: false;
  /**
   * If true, indicates that the SDK has completed initialization.
   */
  isInitialized: false;
};

type SWRMemberInitialized = {
  /**
   * Either the active {@link Member} object, or null if the member is not logged in.
   */
  member: Member | null;
  /**
   * If true, indicates that the value returned is from the application cache and a state refresh is in progress.
   */
  fromCache: boolean;
  /**
   * If true, indicates that the SDK has completed initialization.
   */
  isInitialized: true;
};

type SWRMember<TAlwaysInitialized extends boolean = boolean> = TAlwaysInitialized extends true
  ? SWRMemberInitialized
  : SWRMemberInitialized | SWRMemberUninitialized;

const initialMember: SWRMember = {
  member: null,
  fromCache: false,
  isInitialized: false,
};

type SWRMemberSessionUninitialized = {
  /**
   * Either the active {@link MemberSession} object, or null if the member is not logged in.
   */
  session: null;
  /**
   * If true, indicates that the value returned is from the application cache and a state refresh is in progress.
   */
  fromCache: false;
  /**
   * If true, indicates that the SDK has completed initialization.
   */
  isInitialized: false;
};

type SWRMemberSessionInitialized = {
  /**
   * Either the active {@link MemberSession} object, or null if the member is not logged in.
   */
  session: MemberSession | null;
  /**
   * If true, indicates that the value returned is from the application cache and a state refresh is in progress.
   */
  fromCache: boolean;
  /**
   * If true, indicates that the SDK has completed initialization.
   */
  isInitialized: true;
};

type SWRMemberSession<TAlwaysInitialized extends boolean = boolean> = TAlwaysInitialized extends true
  ? SWRMemberSessionInitialized
  : SWRMemberSessionInitialized | SWRMemberSessionUninitialized;

const initialMemberSession: SWRMemberSession = {
  session: null,
  fromCache: false,
  isInitialized: false,
};

type SWROrganizationUninitialized = {
  /**
   * Either the active {@link Organization} object, or null if the member is not logged in.
   */
  organization: null;
  /**
   * If true, indicates that the value returned is from the application cache and a state refresh is in progress.
   */
  fromCache: false;
  /**
   * If true, indicates that the SDK has completed initialization.
   */
  isInitialized: false;
};

type SWROrganizationInitialized = {
  /**
   * Either the active {@link Organization} object, or null if the member is not logged in.
   */
  organization: Organization | null;
  /**
   * If true, indicates that the value returned is from the application cache and a state refresh is in progress.
   */
  fromCache: boolean;
  /**
   * If true, indicates that the SDK has completed initialization.
   */
  isInitialized: true;
};

type SWROrganization<TAlwaysInitialized extends boolean = boolean> = TAlwaysInitialized extends true
  ? SWROrganizationInitialized
  : SWROrganizationInitialized | SWROrganizationUninitialized;

const initialOrganization: SWROrganization = {
  organization: null,
  fromCache: false,
  isInitialized: false,
};

const StytchB2BContext = createContext<StytchB2BContext<StytchProjectConfigurationInput>>({ isMounted: false });
const StytchMemberContext = createContext<SWRMember>(initialMember);
const StytchMemberSessionContext = createContext<SWRMemberSession>(initialMemberSession);
const StytchOrganizationContext = createContext<SWROrganization>(initialOrganization);

export const useIsMounted__INTERNAL = (): boolean => useContext(StytchB2BContext).isMounted;

/**
 * Returns the active Member.
 * The Stytch SDKs are used for client-side authentication and session management.
 * Check the isInitialized property to determine if the SDK has completed initialization.
 * Check the fromCache property to determine if the member data is from persistent storage.
 * @example
 * const {member, isInitialized, fromCache} = useStytchMember();
 * if (!isInitialized) {
 *     return <p>Loading...</p>;
 * }
 * return (<h1>Welcome, {member.name}</h1>);
 */
export const useStytchMember = <TAssumeHydrated extends boolean = false>(): SWRMember<TAssumeHydrated> => {
  invariant(useIsMounted__INTERNAL(), noProviderError('useStytchMember', 'StytchB2BProvider'));
  return useContext(StytchMemberContext) as SWRMember<TAssumeHydrated>;
};

/**
 * Returns the active member's Stytch member session.
 * The Stytch SDKs are used for client-side authentication and session management.
 * Check the isInitialized property to determine if the SDK has completed initialization.
 * Check the fromCache property to determine if the session data is from persistent storage.
 * @example
 * const {session, isInitialized, fromCache} = useStytchMemberSession();
 * useEffect(() => {
 *   if (!isInitialized) {
 *     return;
 *   }
 *   if (!session) {
 *     router.replace('/login')
 *   }
 * }, [session, isInitialized]);
 */
export const useStytchMemberSession = <
  TAssumeHydrated extends boolean = false,
>(): SWRMemberSession<TAssumeHydrated> => {
  invariant(useIsMounted__INTERNAL(), noProviderError('useStytchMemberSession', 'StytchB2BProvider'));
  return useContext(StytchMemberSessionContext) as SWRMemberSession<TAssumeHydrated>;
};

/**
 * Returns the active Stytch organization.
 * The Stytch SDKs are used for client-side authentication and session management.
 * Check the isInitialized property to determine if the SDK has completed initialization.
 * Check the fromCache property to determine if the organization data is from persistent storage.
 * @example
 * const {organization, isInitialized, fromCache} = useStytchOrganization();
 * if (!isInitialized) {
 *     return <p>Loading...</p>;
 * }
 * return (<p>Welcome to {organization.organization_name}</p>);
 */
export const useStytchOrganization = <TAssumeHydrated extends boolean = false>(): SWROrganization<TAssumeHydrated> => {
  invariant(useIsMounted__INTERNAL(), noProviderError('useStytchOrganization', 'StytchB2BProvider'));
  return useContext(StytchOrganizationContext) as SWROrganization<TAssumeHydrated>;
};

type SWRIsAuthorizedUninitialized = {
  /**
   * Whether the logged-in member is allowed to perform the specified action on the specified resource.
   */
  isAuthorized: false;
  /**
   * If true, indicates that the value returned is from the application cache and a state refresh is in progress.
   */
  fromCache: false;
  /**
   * If true, indicates that the SDK has completed initialization.
   */
  isInitialized: false;
};

type SWRIsAuthorizedInitialized = {
  /**
   * Whether the logged-in member is allowed to perform the specified action on the specified resource.
   */
  isAuthorized: boolean;
  /**
   * If true, indicates that the value returned is from the application cache and a state refresh is in progress.
   */
  fromCache: boolean;
  /**
   * If true, indicates that the SDK has completed initialization.
   */
  isInitialized: boolean;
};

type SWRIsAuthorized<TAlwaysInitialized extends boolean> = TAlwaysInitialized extends true
  ? SWRIsAuthorizedInitialized
  : SWRIsAuthorizedInitialized | SWRIsAuthorizedUninitialized;

/**
 * Determines whether the logged-in member is allowed to perform the specified action on the specified resource.
 * Returns `true` if the member can perform the action, `false` otherwise.
 *
 * If the member is not logged in, this method will always return false.
 * If the resource or action provided are not valid for the configured RBAC policy, this method will return false.
 *
 * Remember - authorization checks for sensitive actions should always occur on the backend as well.
 * @example
 * const { isAuthorized } = useStytchIsAuthorized('documents', 'edit');
 * return <button disabled={!isAuthorized}>Edit</button>
 */
export const useStytchIsAuthorized = <TAssumeHydrated extends boolean = false>(
  resourceId: string,
  action: string,
): SWRIsAuthorized<TAssumeHydrated> => {
  invariant(useIsMounted__INTERNAL(), noProviderError('useStytchIsAuthorized', 'StytchB2BProvider'));
  const client = useStytchB2BClient();
  const { session } = useStytchMemberSession();
  const [isAuthorized, setIsAuthorized] = useAsyncState<SWRIsAuthorized<boolean>>({
    isInitialized: false,
    fromCache: false,
    isAuthorized: false,
  });

  useEffect(() => {
    if (isStytchSSRProxy(client)) {
      return;
    }

    setIsAuthorized({
      isInitialized: true,
      fromCache: true,
      isAuthorized: client.rbac.isAuthorizedSync(resourceId, action),
    });
  }, [action, client, resourceId, setIsAuthorized]);

  useEffect(() => {
    if (isStytchSSRProxy(client)) {
      return;
    }

    client.rbac.isAuthorized(resourceId, action).then((isAuthorized) => {
      setIsAuthorized({ isAuthorized, fromCache: false, isInitialized: true });
    });
  }, [client, session?.roles, resourceId, action, setIsAuthorized]);

  return isAuthorized;
};

/**
 * Returns the Stytch B2B client stored in the Stytch context.
 *
 * @example
 * const stytch = useStytchB2BClient();
 * useEffect(() => {
 *   stytch.magicLinks.authenticate('...')
 * }, [stytch]);
 */
export const useStytchB2BClient = <
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>(): StytchB2BClient<TProjectConfiguration> => {
  const ctx = useContext(StytchB2BContext);
  invariant(ctx.isMounted, noProviderError('useStytchB2BClient', 'StytchB2BProvider'));
  return ctx.client as StytchB2BClient<TProjectConfiguration>;
};

export const withStytchB2BClient = <T extends object, TProjectConfiguration extends StytchProjectConfigurationInput>(
  Component: ComponentType<T & { stytch: StytchB2BClient<TProjectConfiguration> }>,
): ComponentType<T> => {
  const WithStytch: ComponentType<T> = (props) => {
    invariant(useIsMounted__INTERNAL(), noProviderError('withStytchB2BClient', 'StytchB2BProvider'));
    return <Component {...props} stytch={useStytchB2BClient()} />;
  };
  WithStytch.displayName = `withStytch(${Component.displayName || Component.name || 'Component'})`;
  return WithStytch;
};

export const withStytchMember = <T extends object, TAssumeHydrated extends boolean = false>(
  Component: ComponentType<
    T & { stytchMember: Member | null; stytchMemberIsInitialized: boolean; stytchMemberIsFromCache: boolean }
  >,
): ComponentType<T> => {
  const WithStytchUser: ComponentType<T> = (props) => {
    invariant(useIsMounted__INTERNAL(), noProviderError('withStytchMember', 'StytchB2BProvider'));
    const { member, isInitialized, fromCache } = useStytchMember<TAssumeHydrated>();
    return (
      <Component
        {...props}
        stytchMember={member}
        stytchMemberIsInitialized={isInitialized}
        stytchMemberIsFromCache={fromCache}
      />
    );
  };
  WithStytchUser.displayName = `withStytchMember(${Component.displayName || Component.name || 'Component'})`;
  return WithStytchUser;
};

export const withStytchMemberSession = <T extends object, TAssumeHydrated extends boolean = false>(
  Component: ComponentType<
    T & {
      stytchMemberSession: MemberSession | null;
      stytchMemberSessionIsInitialized: boolean;
      stytchMemberSessionIsFromCache: boolean;
    }
  >,
): ComponentType<T> => {
  const WithStytchSession: ComponentType<T> = (props) => {
    invariant(useIsMounted__INTERNAL(), noProviderError('withStytchMemberSession', 'StytchB2BProvider'));
    const { session, isInitialized, fromCache } = useStytchMemberSession<TAssumeHydrated>();
    return (
      <Component
        {...props}
        stytchMemberSession={session}
        stytchMemberSessionIsInitialized={isInitialized}
        stytchMemberSessionIsFromCache={fromCache}
      />
    );
  };
  WithStytchSession.displayName = `withStytchMemberSession(${Component.displayName || Component.name || 'Component'})`;
  return WithStytchSession;
};

export const withStytchOrganization = <T extends object, TAssumeHydrated extends boolean = false>(
  Component: ComponentType<
    T & {
      stytchOrganization: Organization | null;
      stytchOrganizationIsInitialized: boolean;
      stytchOrganizationIsFromCache: boolean;
    }
  >,
): ComponentType<T> => {
  const WithStytchOrganization: ComponentType<T> = (props) => {
    invariant(useIsMounted__INTERNAL(), noProviderError('withStytchOrganization', 'StytchB2BProvider'));
    const { organization, isInitialized, fromCache } = useStytchOrganization<TAssumeHydrated>();
    return (
      <Component
        {...props}
        stytchOrganization={organization}
        stytchOrganizationIsInitialized={isInitialized}
        stytchOrganizationIsFromCache={fromCache}
      />
    );
  };
  WithStytchOrganization.displayName = `withStytchOrganization(${
    Component.displayName || Component.name || 'Component'
  })`;
  return WithStytchOrganization;
};

type PermissionsLoaded<Permissions extends Record<string, string>> =
  | {
      loaded: false;
      value: null;
    }
  | {
      loaded: true;
      value: PermissionsMap<Permissions>;
    };

/**
 * Wrap your component with this HOC in order to receive the permissions for the logged-in member.
 * Evaluates all permissions granted to the logged-in member.
 * Returns a Record<RoleId, Record<Action, boolean>> response indicating the member's permissions.
 * Each boolean will be `true` if the member can perform the action, `false` otherwise.
 *
 * If the member is not logged in, all values will be false.
 *
 * Remember - authorization checks for sensitive actions should always occur on the backend as well.
 * @example
 * type Permissions = {
 *   document: 'create' | 'read' | 'write
 *   image: 'create' | 'read'
 * }
 *
 * const MyComponent = (props) => {
 *   const canEditDocuments = props.stytchPermissions.document.edit;
 *   const canReadImages = props.stytchPermissions.image.read;
 * }
 * return withStytchPermissions<Permissions>(MyComponent)
 */
export const withStytchPermissions = <Permissions extends Record<string, string>, T extends object>(
  Component: ComponentType<T & { stytchPermissions: PermissionsMap<Permissions> }>,
): ComponentType<T> => {
  const WithStytchPermissions: ComponentType<T> = (props) => {
    invariant(useIsMounted__INTERNAL(), noProviderError('useRBACPermissions', 'StytchB2BProvider'));
    const client = useStytchB2BClient();
    const { session } = useStytchMemberSession();
    const [permissions, setPermissions] = useAsyncState<PermissionsLoaded<Permissions>>({ loaded: false, value: null });
    useEffect(() => {
      client.rbac
        .allPermissions<Permissions>()
        .then((permissions) => setPermissions({ loaded: true, value: permissions }));
    }, [client, session?.roles, setPermissions]);

    if (!permissions.loaded) {
      return null;
    }
    return <Component {...props} stytchPermissions={permissions.value} />;
  };
  WithStytchPermissions.displayName = `withStytchPermissions(${
    Component.displayName || Component.name || 'Component'
  })`;
  return WithStytchPermissions;
};

export interface StytchB2BProviderProps<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> {
  /**
   * A Stytch client instance, created using either {@link createStytchB2BClient} or {@link createStytchB2BClient}
   */
  stytch: StytchB2BClient<TProjectConfiguration>;
  /**
   * When true, the provider will assume that the component will only be
   * rendered in a browser environment, either in a single-page application or
   * after completing hydration of a server-rendered application. This allows
   * cached values to be retrieved from the browser on the first render, meaning
   * that the `isInitialized` value returned from Stytch hooks will be `true`
   * starting from the first render.
   *
   * When `false`, the provider will defer initialization until after the first
   * render, and `isInitialized` will initially be `false`.
   *
   * This value defaults to `false` in `@stytch/nextjs`.
   */
  assumeHydrated?: boolean;
  children?: ReactNode;
}

/**
 * The Stytch Context Provider.
 * Wrap your application with this component in order to use Stytch everywhere in your app.
 * @example
 * const stytch = createStytchB2BClient('public-token-<find yours in the stytch dashboard>')
 *
 * return (
 *   <StytchB2BProvider stytch={stytch}>
 *     <App />
 *   </StytchB2BProvider>
 * )
 */
export const StytchB2BProvider = <
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>({
  stytch,
  children,
  assumeHydrated = false,
}: StytchB2BProviderProps<TProjectConfiguration>): JSX.Element => {
  invariant(!useIsMounted__INTERNAL(), 'You cannot render a <StytchB2BProvider> inside another <StytchB2BProvider>.');
  invariant(
    !assumeHydrated || typeof window !== 'undefined',
    'The `assumeHydrated` prop must be set to `false` when using StytchB2BProvider in a server environment.',
  );

  const ctx = useMemo(() => ({ client: stytch, isMounted: true }), [stytch]);

  type ClientState<TAlwaysInitialized extends boolean> = {
    member: SWRMember<TAlwaysInitialized>;
    session: SWRMemberSession<TAlwaysInitialized>;
    organization: SWROrganization<TAlwaysInitialized>;
  };

  const getHydratedState = useCallback(() => {
    return {
      member: { ...stytch.self.getInfo(), isInitialized: true },
      session: { ...stytch.session.getInfo(), isInitialized: true },
      organization: { ...stytch.organization.getInfo(), isInitialized: true },
    } satisfies ClientState<true>;
  }, [stytch]);

  const getInitialState = () => {
    return {
      member: initialMember,
      session: initialMemberSession,
      organization: initialOrganization,
    } satisfies ClientState<false>;
  };

  const [{ member, session, organization }, setClientState] = useAsyncState<ClientState<boolean>>(() =>
    assumeHydrated ? getHydratedState() : (getInitialState() as ClientState<boolean>),
  );

  // Store the initial value of `assumeHydrated` in a ref, because it is
  // logically only relevant for the first render
  const assumeHydratedRef = useRef(assumeHydrated);
  useEffect(() => {
    if (isStytchSSRProxy(stytch)) {
      return;
    }

    const updateState = () => {
      setClientState((oldState) => mergeWithStableProps(oldState, getHydratedState()));
    };

    if (!assumeHydratedRef.current) {
      updateState();
    }

    return stytch.onStateChange(updateState);
  }, [getHydratedState, setClientState, stytch]);

  return (
    <StytchB2BContext.Provider value={ctx}>
      <StytchOrganizationContext.Provider value={organization}>
        <StytchMemberContext.Provider value={member}>
          <StytchMemberSessionContext.Provider value={session}>{children}</StytchMemberSessionContext.Provider>
        </StytchMemberContext.Provider>
      </StytchOrganizationContext.Provider>
    </StytchB2BContext.Provider>
  );
};
