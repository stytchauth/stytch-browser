import { ConnectedAppPublic, ResponseCommon, ScopeResult } from '../common';

export type B2BOAuthAuthorizeStartOptions = {
  client_id: string;
  redirect_uri: string;
  response_type: string;
  scopes: string[];
  prompt?: string;
};

export type B2BOAuthAuthorizeStartResponse = ResponseCommon & {
  client: ConnectedAppPublic;
  consent_required: boolean;
  scope_results: ScopeResult[];
};

export type B2BOAuthAuthorizeSubmitOptions = {
  client_id: string;
  redirect_uri: string;
  response_type: string;
  scopes: string[];
  state?: string;
  nonce?: string;
  code_challenge?: string;
  consent_granted: boolean;
  prompt?: string;
};

export type B2BOAuthAuthorizeSubmitResponse = ResponseCommon & {
  redirect_uri: string;
  authorization_code?: string;
};

export type B2BOAuthLogoutStartOptions = {
  client_id: string;
  post_logout_redirect_uri: string;
  state: string;
  id_token_hint?: string;
};

export type B2BOAuthLogoutStartResponse = ResponseCommon & {
  redirect_uri: string;
  consent_required: boolean;
};

export interface IHeadlessB2BIDPClient {
  /**
   * Initiates a request for authorization of a Connected App to access a Member's account.
   *
   * Call this endpoint using the query parameters from an OAuth Authorization request. This endpoint validates various fields (scope, client_id, redirect_uri, prompt, etc...) are correct and returns relevant information for rendering an OAuth Consent Screen.
   *
   * @example
   * const response = await stytch.idp.oauthAuthorizeStart({
   *   client_id: 'client_123',
   *   redirect_uri: 'https://example.com/callback',
   *   scope: 'openid email profile',
   * });
   */
  oauthAuthorizeStart(data: B2BOAuthAuthorizeStartOptions): Promise<B2BOAuthAuthorizeStartResponse>;

  /**
   * Completes a request for authorization of a Connected App to access a Member's account.
   *
   * Call this endpoint using the query parameters from an OAuth Authorization request, after previously validating those parameters using the Preflight Check API. Note that this endpoint takes in a few additional parameters the preflight check does not- state, nonce, and code_challenge.
   *
   * If the authorization was successful, the redirect_uri will contain a valid authorization_code embedded as a query parameter. If the authorization was unsuccessful, the redirect_uri will contain an OAuth2.1 error_code. In both cases, redirect the Member to the location for the response to be consumed by the Connected App.
   *
   * Exactly one of the following must be provided to identify the Member granting authorization:
   * organization_id + member_id
   * session_token
   * session_jwt
   *
   * If a session_token or session_jwt is passed, the OAuth Authorization will be linked to the Member's session for tracking purposes. One of these fields must be used if the Connected App intends to complete the Exchange Access Token flow.
   *
   * @example
   * const response = await stytch.idp.oauthAuthorizeSubmit({
   *   client_id: 'client_123',
   *   redirect_uri: 'https://example.com/callback',
   *   scope: 'openid email profile',
   * });
   */
  oauthAuthorizeSubmit(data: B2BOAuthAuthorizeSubmitOptions): Promise<B2BOAuthAuthorizeSubmitResponse>;
}
