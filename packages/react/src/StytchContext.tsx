import React, { ComponentType, ReactNode } from 'react';

import type { StytchProjectConfigurationInput, StytchUIClient } from '@stytch/vanilla-js';
import type { Session, StytchHeadlessClient, User } from '@stytch/vanilla-js/headless';

export { useStytch, withStytch } from '@stytch/internal-react-shared';

import {
  StytchProvider as StytchProviderShared,
  useStytchSession as useStytchSessionShared,
  useStytchUser as useStytchUserShared,
  withStytchSession as withStytchSessionShared,
  withStytchUser as withStytchUserShared,
  useStytchIsAuthorized as useStytchIsAuthorizedShared,
  withStytchPermissions as withStytchPermissionsShared,
} from '@stytch/internal-react-shared';

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
export const useStytchUser = useStytchUserShared as <TAssumeHydrated extends boolean = true>() => ReturnType<
  typeof useStytchUserShared<TAssumeHydrated>
>;

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
export const useStytchSession = useStytchSessionShared as <TAssumeHydrated extends boolean = true>() => ReturnType<
  typeof useStytchSessionShared<TAssumeHydrated>
>;

export const withStytchUser = withStytchUserShared as <T extends object, TAssumeHydrated extends boolean = true>(
  Component: ComponentType<
    T & { stytchUser: User | null; stytchUserIsInitialized: boolean; stytchUserIsFromCache: boolean }
  >,
) => ReturnType<typeof withStytchUserShared<T, TAssumeHydrated>>;

export const withStytchSession = withStytchSessionShared as <T extends object, TAssumeHydrated extends boolean = true>(
  Component: ComponentType<
    T & { stytchSession: Session | null; stytchSessionIsInitialized: boolean; stytchSessionIsFromCache: boolean }
  >,
) => ReturnType<typeof withStytchSessionShared<T, TAssumeHydrated>>;

export const useStytchIsAuthorized = useStytchIsAuthorizedShared as <TAssumeHydrated extends boolean = true>(
  resourceId: string,
  action: string,
) => ReturnType<typeof useStytchIsAuthorizedShared<TAssumeHydrated>>;

export const withStytchPermissions = withStytchPermissionsShared as <
  Permissions extends Record<string, string>,
  T extends object,
>(
  Component: ComponentType<T & { stytchPermissions: Record<string, Record<string, boolean>> }>,
) => ReturnType<typeof withStytchPermissionsShared<Permissions, T>>;

/**
 * The Stytch Client object passed in to <StytchProvider /> in your application root.
 * Either a StytchUIClient or StytchHeadlessClient.
 */
type StytchClient<TProjectConfiguration extends StytchProjectConfigurationInput> =
  | StytchUIClient<TProjectConfiguration>
  | StytchHeadlessClient<TProjectConfiguration>;

export interface StytchProviderProps<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> {
  /**
   * A Stytch client instance, either a {@link StytchUIClient} or {@link StytchHeadlessClient}
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
   * If you encounter hydration errors relating to the use of this component,
   * set this to `false`.
   *
   * This value defaults to `true` in `@stytch/react`.
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
 * ReactDOM.render(
 *   <StytchProvider stytch={stytch}>
 *     <App />
 *   </StytchProvider>,
 *   document.getElementById('root'),
 * )
 */
export const StytchProvider = <
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>({
  stytch,
  children,
  assumeHydrated = true,
}: StytchProviderProps<TProjectConfiguration>): JSX.Element => {
  return (
    <StytchProviderShared stytch={stytch} assumeHydrated={assumeHydrated}>
      {children}
    </StytchProviderShared>
  );
};
