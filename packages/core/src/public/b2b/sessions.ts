import {
  SessionAuthenticateOptions,
  SessionRevokeResponse,
  SessionTokens,
  SessionTokensUpdate,
  StytchProjectConfigurationInput,
} from '../';
import { ExtractOpaqueTokens, IfOpaqueTokens } from '../../typeConfig';
import { Cacheable } from '../../utils';
import { ResponseCommon, SessionDurationOptions, UnsubscribeFunction, locale } from '../common';
import { B2BAuthenticateResponse, B2BAuthenticateResponseWithMFA, MemberSession } from './common';

export type B2BSessionAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BAuthenticateResponse<TProjectConfiguration>;

export type B2BSessionRevokeOptions = {
  /**
   * When true, clear the user and session object in the local storage, even in the event of a network failure revoking the session.
   * When false, the user and session object will not be cleared in the event that the SDK cannot contact the Stytch servers.
   * The user and session object will always be cleared when the session revoke call succeeds.
   * Defaults to false
   */
  forceClear?: boolean;
};

export type B2BSessionRevokeForMemberOptions = {
  /**
   * The ID of the Member whose sessions should be revoked.
   */
  member_id: string;
};

export type B2BSessionRevokeForMemberResponse = ResponseCommon;

export type B2BSessionOnChangeCallback = (session: MemberSession | null) => void;

export type B2BSessionExchangeOptions = SessionDurationOptions & {
  /**
   * The ID of the organization that the new session should belong to.
   */
  organization_id: string;

  /**
   * The locale will be used if an OTP code is sent to the member's phone number as part of a
   * secondary authentication requirement.
   */
  locale?: locale;
};

export type B2BSessionExchangeResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BAuthenticateResponseWithMFA<TProjectConfiguration>;

export type B2BSessionAccessTokenExchangeOptions = SessionDurationOptions & {
  /**
   * The Connected Apps access token.
   */
  access_token: string;
};

export type B2BSessionAccessTokenExchangeResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BAuthenticateResponse<TProjectConfiguration>;

export type MemberSessionInfo = Cacheable<{
  /**
   * The session object, or null if no session exists.
   */
  session: MemberSession | null;
}>;

export type B2BSessionAttestOptions = SessionDurationOptions & {
  /**
   * The ID of the organization that the new session should belong to.
   */
  organization_id?: string;

  /**
   * The ID of the token profile used to validate the JWT string.
   */
  profile_id: string;

  /**
   * JWT string.
   */
  token: string;
} & Partial<SessionTokens>;

export type B2BSessionAttestResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BAuthenticateResponse<TProjectConfiguration>;

export interface IHeadlessB2BSessionClient<TProjectConfiguration extends StytchProjectConfigurationInput> {
  /**
   * If logged in, the `session.getSync` method returns the cached session object. Otherwise it returns `null`.
   *
   * @example
   * const memberSession = stytch.session.getSync();
   * @returns The user's active {@link MemberSession} object or `null`
   */
  getSync(): MemberSession | null;

  /**
   * The `session.getInfo` method is similar to `session.getSync`, but it returns an object containing the `session` object and a `fromCache` boolean.
   * If `fromCache` is true, the session object is from the cache and a state refresh is in progress.
   */
  getInfo(): MemberSessionInfo;

  /**
   * Returns the `session_token` and `session_jwt` values associated with the logged-in user's active session.
   *
   * Session tokens are only available if:
   * - There is an active session, and
   * - The session is _not_ managed via HttpOnly cookies.
   *
   * If either of these conditions is not met, `getTokens` will return `null`.
   *
   * Note that the Stytch SDK stores the `session_token` and `session_jwt` values as session cookies in the user's browser.
   * Those cookies will be automatically included in any request that your frontend makes to a service (such as your backend) that shares the domain set on the cookies, so in most cases, you will not need to explicitly retrieve the `session_token` and `session_jwt` values using the `getTokens()` method.
   * However, we offer this method to serve some unique use cases where explicitly retrieving the tokens may be necessary.
   *
   * @example
   * const {session_jwt} = stytch.session.getTokens();
   * fetch('https://api.example.com, {
   *   headers: new Headers({
   *    'Authorization': 'Bearer ' + session_jwt,
   *    credentials: 'include',
   *   }),
   * })
   *
   */
  getTokens(): IfOpaqueTokens<ExtractOpaqueTokens<TProjectConfiguration>, never, SessionTokens | null>;

  /**
   * The `session.onChange` method takes in a callback that gets called whenever the Member Session object changes.
   * It returns an unsubscribe method for you to call when you no longer want to listen for such changes.
   *
   * The `useStytchMemberSession` hook is available in `@stytch/react` or `@stytch/nextjs`. It implements these methods for you to easily access the session and listen for changes.
   * @example
   * stytch.session.onChange((memberSession) => {
   *   if(!memberSession) {
   *     // The member has been logged out!
   *     window.location.href = 'https://example.com/login'
   *   }
   * })
   * @param callback - {@link B2BSessionOnChangeCallback}
   */
  onChange(callback: B2BSessionOnChangeCallback): UnsubscribeFunction;

  /**
   * Wraps Stytch's {@link https://stytch.com/docs/b2b/api/authenticate-session authenticate } Session endpoint and validates that the session issued to the user is still valid.
   * The SDK will invoke this method automatically in the background. You probably won't need to call this method directly.
   * It's recommended to use `session.getSync` and `session.onChange` instead.
   * @example
   * stytch.session.authenticate({
   *   // Extend the session for another 60 minutes
   *   session_duration_minutes: 60
   * })
   * @param options - {@link SessionAuthenticateOptions}
   * @returns A {@link B2BSessionAuthenticateResponse} object
   */
  authenticate(options?: SessionAuthenticateOptions): Promise<B2BSessionAuthenticateResponse<TProjectConfiguration>>;

  /**
   * Wraps Stytch's {@link https://stytch.com/docs/b2b/api/revoke-session revoke} Session endpoint and revokes the user's current session.
   * This method should be used to log out a user. While calling this method, we clear the user and session objects from local storage
   * unless the SDK cannot contact the Stytch servers. This behavior can be overriden by using the optional param object.
   *
   * @param options - {@link B2BSessionRevokeOptions}
   *
   * @example
   * stytch.session.revoke()
   *   .then(() => window.location.href = 'https://example.com/login');
   * @returns A {@link SessionRevokeResponse}
   */
  revoke(options?: B2BSessionRevokeOptions): Promise<SessionRevokeResponse>;

  /**
   * Wraps Stytch's {@link https://stytch.com/docs/b2b/api/revoke-session revoke} Session endpoint and revokes all Sessions for a given Member.
   *
   * @rbac action="revoke-sessions", resource="stytch.member"
   *
   * @param options - {@link B2BSessionRevokeForMemberOptions}
   *
   * @example
   * stytch.session.revokeForMember({ member_id: 'member-id-123' });
   * @returns A {@link B2BSessionRevokeForMemberResponse}
   */
  revokeForMember(options: B2BSessionRevokeForMemberOptions): Promise<B2BSessionRevokeForMemberResponse>;

  /**
   * Update a user's session tokens to hydrate a front-end session from the backend.
   * For example, if you log your users in with one of our backend SDKs, you can pass the resulting `session_token` and `session_jwt` to this method to prime the frontend SDK with a valid set of tokens.
   * You must then make an {@link https://stytch.com/docs/api/session-auth authenticate} call to authenticate the session tokens and retrieve the user's current session.
   *
   * @param tokens - The session tokens to update to
   */
  updateSession(tokens: SessionTokensUpdate): void;

  /**
   * Wraps Stytch's {@link https://stytch.com/docs/b2b/api/exchange-session Exchange Session} endpoint and exchanges the member's current session for a session in the specified Organization.
   * @example
   * stytch.session.exchange({
   *   organization_id: 'organization-123',
   *   session_duration_minutes: 60
   * })
   * @param options - {@link B2BSessionExchangeOptions}
   * @returns A {@link B2BSessionExchangeResponse}
   */
  exchange(options: B2BSessionExchangeOptions): Promise<B2BSessionExchangeResponse<TProjectConfiguration>>;

  /**
   * Wraps Stytch's {@link https://stytch.com/docs/b2b/api/connected-app-access-token-exchange Exchange Access Token} endpoint and exchanges a Connected Apps token for a Session for the original Member.
   * @example
   * stytch.session.exchangeAccessToken({
   *   access_token: 'eyJh...',
   *   session_duration_minutes: 60
   * })
   * @param options - {@link B2BSessionExchangeOptions}
   * @returns A {@link B2BSessionExchangeResponse}
   */
  exchangeAccessToken(
    options: B2BSessionAccessTokenExchangeOptions,
  ): Promise<B2BSessionAccessTokenExchangeResponse<TProjectConfiguration>>;

  /**
   * Wraps Stytch's {@link https://stytch.com/docs/b2b/api/attest-session Attest} Session endpoint and gets a Stytch session from a trusted JWT.
   * @example
   * stytch.session.attest({
   *   organization_id: 'organization-123',
   *   profile_id: 'profile-123',
   *   token: 'eyJh...',
   *   session_duration_minutes: 60
   * })
   * @param data - {@link B2BSessionAttestOptions}
   * @returns A {@link B2BSessionAttestResponse}
   */
  attest(data: B2BSessionAttestOptions): Promise<B2BSessionAttestResponse<TProjectConfiguration>>;
}
