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

import { mergeWithStableProps } from '@stytch/js-utils';
import type { Session, StytchProjectConfigurationInput, StytchUIClient, User } from '@stytch/vanilla-js';
import type { PermissionsMap, StytchHeadlessClient } from '@stytch/vanilla-js/headless';
import { useAsyncState } from './utils/async';
import { noProviderError, providerMustBeUniqueError } from './utils/errors';
import { invariant } from './utils/invariant';
import { isStytchSSRProxy } from './StytchSSRProxy';

/**
 * The Stytch Client object passed in to <StytchProvider /> in your application root.
 * Either a StytchUIClient or StytchHeadlessClient.
 */
type StytchClient<TProjectConfiguration extends StytchProjectConfigurationInput> =
  | StytchUIClient<TProjectConfiguration>
  | StytchHeadlessClient<TProjectConfiguration>;

type StytchContext<TProjectConfiguration extends StytchProjectConfigurationInput> =
  | {
      isMounted: false;
    }
  | {
      isMounted: true;
      client: StytchClient<TProjectConfiguration>;
    };

type SWRUserUninitialized = {
  /**
   * Either the active {@link User} object, or null if the user is not logged in.
   */
  user: null;
  /**
   * If true, indicates that the value returned is from the application cache and a state refresh is in progress.
   */
  fromCache: false;
  /**
   * If true, indicates that the SDK has completed initialization.
   */
  isInitialized: false;
};

type SWRUserInitialized = {
  /**
   * Either the active {@link User} object, or null if the user is not logged in.
   */
  user: User | null;
  /**
   * If true, indicates that the value returned is from the application cache and a state refresh is in progress.
   */
  fromCache: boolean;
  /**
   * If true, indicates that the SDK has completed initialization.
   */
  isInitialized: true;
};

type SWRUser<TAlwaysInitialized extends boolean = boolean> = TAlwaysInitialized extends true
  ? SWRUserInitialized
  : SWRUserInitialized | SWRUserUninitialized;

const initialUser: SWRUserUninitialized = {
  user: null,
  fromCache: false,
  isInitialized: false,
};

type SWRSessionUninitialized = {
  /**
   * Either the active {@link Session} object, or null if the user is not logged in.
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

type SWRSessionInitialized = {
  /**
   * Either the active {@link Session} object, or null if the user is not logged in.
   */
  session: Session | null;
  /**
   * If true, indicates that the value returned is from the application cache and a state refresh is in progress.
   */
  fromCache: boolean;
  /**
   * If true, indicates that the SDK has completed initialization.
   */
  isInitialized: true;
};

type SWRSession<TAlwaysInitialized extends boolean = boolean> = TAlwaysInitialized extends true
  ? SWRSessionInitialized
  : SWRSessionInitialized | SWRSessionUninitialized;

const initialSession: SWRSessionUninitialized = {
  session: null,
  fromCache: false,
  isInitialized: false,
};

const StytchContext = createContext<StytchContext<StytchProjectConfigurationInput>>({ isMounted: false });
const StytchUserContext = createContext<SWRUser>(initialUser);
const StytchSessionContext = createContext<SWRSession>(initialSession);

export const useIsMounted__INTERNAL = (): boolean => useContext(StytchContext).isMounted;

export const isUIClient = <TProjectConfiguration extends StytchProjectConfigurationInput>(
  client: StytchClient<TProjectConfiguration>,
): client is StytchUIClient<TProjectConfiguration> => {
  return (client as StytchUIClient<TProjectConfiguration>).mountLogin !== undefined;
};

/**
 * Returns the active User.
 * The Stytch SDKs are used for client-side authentication and session management.
 * Check the isInitialized property to determine if the SDK has completed initialization.
 * Check the fromCache property to determine if the user data is from persistent storage.
 * @example
 * const {user, isInitialized, fromCache} = useStytchUser();
 * if (!isInitialized) {
 *     return <p>Loading...</p>;
 * }
 * return (<h1>Welcome, {user.name.first_name}</h1>);
 */
export const useStytchUser = <TAssumeHydrated extends boolean = false>(): SWRUser<TAssumeHydrated> => {
  invariant(useIsMounted__INTERNAL(), noProviderError('useStytchUser'));
  return useContext(StytchUserContext) as SWRUser<TAssumeHydrated>;
};

/**
 * Returns the active user's Stytch session.
 * The Stytch SDKs are used for client-side authentication and session management.
 * Check the isInitialized property to determine if the SDK has completed initialization.
 * Check the fromCache property to determine if the session data is from persistent storage.
 * @example
 * const {session, isInitialized, fromCache} = useStytchSession();
 * useEffect(() => {
 *   if (!isInitialized) {
 *     return;
 *   }
 *   if (!session) {
 *     router.replace('/login')
 *   }
 * }, [session, isInitialized]);
 */
export const useStytchSession = <TAssumeHydrated extends boolean = false>(): SWRSession<TAssumeHydrated> => {
  invariant(useIsMounted__INTERNAL(), noProviderError('useStytchSession'));
  return useContext(StytchSessionContext) as SWRSession<TAssumeHydrated>;
};

/**
 * Returns the Stytch client stored in the Stytch context.
 *
 * @example
 * const stytch = useStytch();
 * useEffect(() => {
 *   stytch.magicLinks.authenticate('...')
 * }, [stytch]);
 */
export const useStytch = <
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>(): StytchClient<TProjectConfiguration> => {
  const ctx = useContext(StytchContext);
  invariant(ctx.isMounted, noProviderError('useStytch'));
  return ctx.client as StytchClient<TProjectConfiguration>;
};

export const withStytch = <
  T extends object,
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>(
  Component: ComponentType<T & { stytch: StytchClient<TProjectConfiguration> }>,
): ComponentType<T> => {
  const WithStytch: ComponentType<T> = (props) => {
    invariant(useIsMounted__INTERNAL(), noProviderError('withStytch'));
    return <Component {...props} stytch={useStytch()} />;
  };
  WithStytch.displayName = `withStytch(${Component.displayName || Component.name || 'Component'})`;
  return WithStytch;
};

export const withStytchUser = <T extends object, TAssumeHydrated extends boolean = false>(
  Component: ComponentType<
    T & { stytchUser: User | null; stytchUserIsInitialized: boolean; stytchUserIsFromCache: boolean }
  >,
): ComponentType<T> => {
  const WithStytchUser: ComponentType<T> = (props) => {
    invariant(useIsMounted__INTERNAL(), noProviderError('withStytchUser'));
    const { user, isInitialized, fromCache } = useStytchUser<TAssumeHydrated>();
    return (
      <Component
        {...props}
        stytchUser={user}
        stytchUserIsInitialized={isInitialized}
        stytchUserIsFromCache={fromCache}
      />
    );
  };
  WithStytchUser.displayName = `withStytchUser(${Component.displayName || Component.name || 'Component'})`;
  return WithStytchUser;
};

export const withStytchSession = <T extends object, TAssumeHydrated extends boolean = false>(
  Component: ComponentType<
    T & { stytchSession: Session | null; stytchSessionIsInitialized: boolean; stytchSessionIsFromCache: boolean }
  >,
): ComponentType<T> => {
  const WithStytchSession: ComponentType<T> = (props) => {
    invariant(useIsMounted__INTERNAL(), noProviderError('withStytchSession'));
    const { session, isInitialized, fromCache } = useStytchSession<TAssumeHydrated>();
    return (
      <Component
        {...props}
        stytchSession={session}
        stytchSessionIsInitialized={isInitialized}
        stytchSessionIsFromCache={fromCache}
      />
    );
  };
  WithStytchSession.displayName = `withStytchSession(${Component.displayName || Component.name || 'Component'})`;
  return WithStytchSession;
};

type SWRIsAuthorizedUninitialized = {
  /**
   * Whether the logged-in user is allowed to perform the specified action on the specified resource.
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
   * Whether the logged-in user is allowed to perform the specified action on the specified resource.
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
 * Determines whether the logged-in user is allowed to perform the specified action on the specified resource.
 * Returns `true` if the user can perform the action, `false` otherwise.
 *
 * If the user is not logged in, this method will always return false.
 * If the resource or action provided are not valid for the configured RBAC policy, this method will return false.
 *
 * Remember - authorization checks for sensitive actions should always occur on the backend as well.
 * @example
 * const { isAuthorized } = useStytchIsAuthorized<Permissions>('documents', 'edit');
 * return <button disabled={!isAuthorized}>Edit</button>
 */
export const useStytchIsAuthorized = <TAssumeHydrated extends boolean = false>(
  resourceId: string,
  action: string,
): SWRIsAuthorized<TAssumeHydrated> => {
  invariant(useIsMounted__INTERNAL(), noProviderError('useStytchIsAuthorized', 'StytchProvider'));
  const client = useStytch();
  const { user } = useStytchUser();
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
  }, [client, user?.roles, resourceId, action, setIsAuthorized]);

  return isAuthorized;
};

type permissionsLoaded<Permissions extends Record<string, string>> =
  | {
      loaded: false;
      value: null;
    }
  | {
      loaded: true;
      value: PermissionsMap<Permissions>;
    };

/**
 * Wrap your component with this HOC in order to receive the permissions for the logged-in user.
 * Evaluates all permissions granted to the logged-in user.
 * Returns a Record<RoleId, Record<Action, boolean>> response indicating the user's permissions.
 * Each boolean will be `true` if the user can perform the action, `false` otherwise.
 *
 * If the user is not logged in, all values will be false.
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
    invariant(useIsMounted__INTERNAL(), noProviderError('useRBACPermissions', 'StytchProvider'));
    const client = useStytch();
    const { user } = useStytchUser();
    const [permissions, setPermissions] = useAsyncState<permissionsLoaded<Permissions>>({ loaded: false, value: null });

    useEffect(() => {
      client.rbac.allPermissions<Permissions>().then((permissions) => {
        setPermissions({ loaded: true, value: permissions });
      });
    }, [client, user?.roles, setPermissions]);

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

export interface StytchProviderProps<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> {
  /**
   * A Stytch client instance, created using either {@link createStytchHeadlessClient} or {@link createStytchUIClient}
   */
  stytch: StytchClient<TProjectConfiguration>;
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
 * const stytch = createStytchHeadlessClient('public-token-<find yours in the stytch dashboard>')
 *
 * return (
 *   <StytchProvider stytch={stytch}>
 *     <App />
 *   </StytchProvider>
 * )
 */
export const StytchProvider = <
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>({
  stytch,
  children,
  assumeHydrated = false,
}: StytchProviderProps<TProjectConfiguration>): JSX.Element => {
  invariant(!useIsMounted__INTERNAL(), providerMustBeUniqueError);
  invariant(
    !assumeHydrated || typeof window !== 'undefined',
    'The `assumeHydrated` prop must be set to `false` when using StytchProvider in a server environment.',
  );

  const ctx = useMemo(() => ({ client: stytch, isMounted: true }), [stytch]);

  type ClientState<TAlwaysInitialized extends boolean> = {
    session: SWRSession<TAlwaysInitialized>;
    user: SWRUser<TAlwaysInitialized>;
  };

  const getHydratedState = useCallback(() => {
    return {
      session: { ...stytch.session.getInfo(), isInitialized: true },
      user: { ...stytch.user.getInfo(), isInitialized: true },
    } satisfies ClientState<true>;
  }, [stytch]);

  const getInitialState = () => {
    return {
      session: initialSession,
      user: initialUser,
    } satisfies ClientState<false>;
  };

  const [{ user, session }, setClientState] = useAsyncState<ClientState<boolean>>(() =>
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
    <StytchContext.Provider value={ctx}>
      <StytchUserContext.Provider value={user}>
        <StytchSessionContext.Provider value={session}>{children}</StytchSessionContext.Provider>
      </StytchUserContext.Provider>
    </StytchContext.Provider>
  );
};
