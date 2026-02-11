'use client';

import type { Member, MemberSession, Organization, StytchProjectConfigurationInput } from '@stytch/web/b2b';
import { StytchB2BClient } from '@stytch/web/b2b/headless';
import React, { ComponentType, ReactNode } from 'react';

export { useStytchB2BClient, withStytchB2BClient, withStytchPermissions } from '@stytch/web/react/b2b';

import {
  StytchB2BProvider as StytchB2BProviderShared,
  useStytchIsAuthorized as useStytchIsAuthorizedShared,
  useStytchMember as useStytchMemberShared,
  useStytchMemberSession as useStytchMemberSessionShared,
  useStytchOrganization as useStytchOrganizationShared,
  withStytchMember as withStytchMemberShared,
  withStytchMemberSession as withStytchMemberSessionShared,
  withStytchOrganization as withStytchOrganizationShared,
} from '@stytch/web/react/b2b';

/**
 * Returns the active Member.
 * The Stytch SDKs are used for client-side authentication and session management.
 * Check the isInitialized property to determine if the SDK has completed initialization.
 * Check the fromCache property to determine if the member data is from persistent storage.
 * @example
 * const {member, isInitialized, fromCache} = useStytchMember();
 * if (!isInitialized) {
 *   return <p>Loading...</p>;
 * }
 * return (<h1>Welcome, {member.name}</h1>);
 */
export const useStytchMember = useStytchMemberShared as <TAssumeHydrated extends boolean = true>() => ReturnType<
  typeof useStytchMemberShared<TAssumeHydrated>
>;

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
 *     router.replace('/login');
 *   }
 * }, [session, isInitialized]);
 */
export const useStytchMemberSession = useStytchMemberSessionShared as <
  TAssumeHydrated extends boolean = true,
>() => ReturnType<typeof useStytchMemberSessionShared<TAssumeHydrated>>;

/**
 * Returns the active Stytch organization.
 * The Stytch SDKs are used for client-side authentication and session management.
 * Check the isInitialized property to determine if the SDK has completed initialization.
 * Check the fromCache property to determine if the organization data is from persistent storage.
 * @example
 * const {organization, isInitialized, fromCache} = useStytchOrganization();
 * if (!isInitialized) {
 *   return <p>Loading...</p>;
 * }
 * return <p>Welcome to {organization.organization_name}</p>;
 */
export const useStytchOrganization = useStytchOrganizationShared as <
  TAssumeHydrated extends boolean = true,
>() => ReturnType<typeof useStytchOrganizationShared<TAssumeHydrated>>;

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
export const useStytchIsAuthorized = useStytchIsAuthorizedShared as <TAssumeHydrated extends boolean = false>(
  resourceId: string,
  action: string,
) => ReturnType<typeof useStytchIsAuthorizedShared<TAssumeHydrated>>;

export const withStytchMember = withStytchMemberShared as <T extends object, TAssumeHydrated extends boolean = false>(
  Component: ComponentType<
    T & { stytchMember: Member | null; stytchMemberIsInitialized: boolean; stytchMemberIsFromCache: boolean }
  >,
) => ReturnType<typeof withStytchMemberShared<T, TAssumeHydrated>>;

export const withStytchMemberSession = withStytchMemberSessionShared as <
  T extends object,
  TAssumeHydrated extends boolean = false,
>(
  Component: ComponentType<
    T & {
      stytchMemberSession: MemberSession | null;
      stytchMemberSessionIsInitialized: boolean;
      stytchMemberSessionIsFromCache: boolean;
    }
  >,
) => ReturnType<typeof withStytchMemberSessionShared<T, TAssumeHydrated>>;

export const withStytchOrganization = withStytchOrganizationShared as <
  T extends object,
  TAssumeHydrated extends boolean = false,
>(
  Component: ComponentType<
    T & {
      stytchOrganization: Organization | null;
      stytchOrganizationIsInitialized: boolean;
      stytchOrganizationIsFromCache: boolean;
    }
  >,
) => ReturnType<typeof withStytchOrganizationShared<T, TAssumeHydrated>>;

export interface StytchB2BProviderProps<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> {
  /**
   * A Stytch client instance, a {@link StytchB2BClient}
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
 * const stytch = createStytchB2BClient('public-token-<find yours in the stytch dashboard>')
 *
 * ReactDOM.render(
 *   <StytchB2BProvider stytch={stytch}>
 *     <App />
 *   </StytchProvider>,
 *   document.getElementById('root'),
 * )
 */
export const StytchB2BProvider = <
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>({
  stytch,
  children,
  assumeHydrated = true,
}: StytchB2BProviderProps<TProjectConfiguration>): JSX.Element => (
  <StytchB2BProviderShared stytch={stytch} assumeHydrated={assumeHydrated}>
    {children}
  </StytchB2BProviderShared>
);
