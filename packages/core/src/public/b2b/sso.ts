import { locale, ResponseCommon, SDKDeviceHistory, SessionDurationOptions } from '../common';
import { StytchProjectConfigurationInput } from '../typeConfig';
import {
  B2BAuthenticateResponseWithMFA,
  ExternalConnection,
  OIDCConnection,
  SAMLConnection,
  SSOActiveConnection,
} from './common';

export type SSOStartOptions = {
  /**
   * The ID of the SSO Connection to use for the login flow
   *
   * @example "saml-connection-test-51861cbc-d3b9-428b-9761-227f5fb12be9"
   */
  connection_id: string;
  /**
   * The URL that Stytch redirects to after the SSO flow is completed for a user that already exists.
   * This URL should be an endpoint in the backend server that verifies the request by querying Stytch's /sso/authenticate endpoint and finishes the login.
   * The URL should be configured as a Login URL in the Stytch Dashboard's Redirect URL page.
   * If the field is not specified, the default in the Dashboard is used.
   */
  login_redirect_url?: string;
  /**
   * The URL that Stytch redirects to after the SSO flow is completed for a user that does not yet exist.
   * This URL should be an endpoint in the backend server that verifies the request by querying Stytch's /sso/authenticate endpoint and finishes the login.
   * The URL should be configured as a Sign Up URL in the Stytch Dashboard's Redirect URL page.
   * If the field is not specified, the default in the Dashboard is used.
   */
  signup_redirect_url?: string;
};

export type SSOAuthenticateOptions = SessionDurationOptions & {
  /**
   *  The sso token used to authenticate a member
   */
  sso_token: string;

  /**
   * The locale will be used if an OTP code is sent to the member's phone number as part of a
   * secondary authentication requirement.
   */
  locale?: locale;
};

export type SSOAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BAuthenticateResponseWithMFA<TProjectConfiguration> & {
  /**
   * The device history of the member.
   */
  member_device?: SDKDeviceHistory;
};

export type B2BSSOSAMLCreateConnectionOptions = {
  /**
   * A human-readable display name for the connection.
   */
  display_name?: string;
  /**
   * The identity provider of this connection. For SAML, the accepted values are `generic`, `okta`, `microsoft-entra`, and 'google-workspace'.
   */
  identity_provider?: string;
};

export type B2BSSOSAMLCreateConnectionResponse = ResponseCommon & {
  /**
   * The SAML Connection object affected by this API call.
   */
  connection: SAMLConnection;
};

export type B2BSSOSAMLUpdateConnectionOptions = {
  /**
   * Globally unique UUID that identifies a specific SAML Connection.
   */
  connection_id: string;
  /**
   * A globally unique name for the IdP. This will be provided by the IdP.
   */
  idp_entity_id?: string;
  /**
   * A human-readable display name for the connection.
   */
  display_name?: string;
  /**
   * An object that represents the attributes used to identify a Member.
   * This object will map the IdP-defined User attributes to Stytch-specific values.
   * Required attributes: `email` and one of `full_name` or `first_name` and `last_name`.
   */
  attribute_mapping?: Record<string, string>;
  /**
   * The URL for which assertions for login requests will be sent. This will be provided by the IdP.
   */
  idp_sso_url?: string;
  /**
   * A certificate that Stytch will use to verify the sign-in assertion sent by the IdP,
   * in {@link https://en.wikipedia.org/wiki/Privacy-Enhanced_Mail PEM} format.
   * See our {@link https://stytch.com/docs/b2b/api/saml-certificates X509 guide} for more info.
   */
  x509_certificate?: string;
  /**
   * An array of implicit role assignments granted to members in this organization who log in with this SAML connection.
   * See our {@link https://stytch.com/docs/b2b/guides/rbac/role-assignment RBAC guide} for more information about
   * role assignment.
   */
  saml_connection_implicit_role_assignments?: { role_id: string }[];
  /**
   * An array of implicit role assignments granted to members in this organization who log in with this SAML connection
   * and belong to the specified group.
   * Before adding any group implicit role assignments, you must add a "groups" key to your SAML connection's
   * attribute_mapping. Make sure that your IdP is configured to correctly send the group information.
   * See our {@link https://stytch.com/docs/b2b/guides/rbac/role-assignment RBAC guide} for more information about
   * role assignment.
   */
  saml_group_implicit_role_assignments?: { role_id: string; group: string }[];
  /**
   * The identity provider of this connection. For SAML, the accepted values are `generic`, `okta`, `microsoft-entra`, and 'google-workspace'.
   */
  identity_provider?: string;

  /**
   * A private key in PEM format that Stytch will use to sign SAML requests.
   * See our {@link https://stytch.com/docs/b2b/api/saml-certificates X509 guide} for more info.
   */
  signing_private_key?: string;

  /**
   * A private key in PEM format that Stytch will use to decrypt encrypted SAML assertions.
   * See our {@link https://stytch.com/docs/b2b/api/saml-certificates X509 guide} for more info.
   */
  saml_encryption_private_key?: string;
};

export type B2BSSOSAMLUpdateConnectionResponse = ResponseCommon & {
  /**
   * The SAML Connection object affected by this API call.
   */
  connection: SAMLConnection;
};

export type B2BSSOSAMLUpdateConnectionByURLOptions = {
  /**
   * Globally unique UUID that identifies a specific SAML Connection.
   */
  connection_id: string;
  /**
   * A URL that points to the IdP metadata. This will be provided by the IdP.
   */
  metadata_url: string;
};

export type B2BSSOSAMLUpdateConnectionByURLResponse = ResponseCommon & {
  /**
   * The SAML Connection object affected by this API call.
   */
  connection: SAMLConnection;
};

export type B2BSSOSAMLDeleteVerificationCertificateOptions = {
  /**
   * Globally unique UUID that identifies a specific SAML Connection.
   */
  connection_id: string;
  /**
   * The ID of the certificate to be deleted.
   */
  certificate_id: string;
};

export type B2BSSOSAMLDeleteVerificationCertificateResponse = ResponseCommon & {
  /**
   * The ID of the certificate that was deleted.
   */
  certificate_id: string;
};

export type B2BSSOSAMLDeleteEncryptionPrivateKeyOptions = {
  /**
   * Globally unique UUID that identifies a specific SAML Connection.
   */
  connection_id: string;
  /**
   * The ID of the encryption private key to be deleted.
   */
  private_key_id: string;
};

export type B2BSSOSAMLDeleteEncryptionPrivateKeyResponse = ResponseCommon & {
  /**
   * The ID of the encryption private key that was deleted.
   */
  private_key_id: string;
};

export type B2BSSOCreateExternalConnectionOptions = {
  /**
   * A human-readable display name for the connection.
   */
  display_name?: string;
  /**
   * External connection organization id
   */
  external_organization_id: string;
  /**
   * External connection id
   */
  external_connection_id: string;
};

export type B2BSSOCreateExternalConnectionResponse = ResponseCommon & {
  /**
   * The External Connection object affected by this API call.
   */
  connection: ExternalConnection;
};

export type B2BSSOUpdateExternalConnectionOptions = {
  /**
   * Globally unique UUID that identifies a specific External Connection.
   */
  connection_id: string;
  /**
   * A human-readable display name for the connection.
   */
  display_name?: string;
  /**
   * An array of implicit role assignments granted to members in this organization who log in with this external connection.
   * See our {@link https://stytch.com/docs/b2b/guides/rbac/role-assignment RBAC guide} for more information about
   * role assignment.
   */
  external_connection_implicit_role_assignments?: { role_id: string }[];
  /**
   * An array of implicit role assignments granted to members in this organization who log in with this external connection
   * and belong to the specified group.
   * Before adding any group implicit role assignments, you must add a "groups" key to the underlying connection's
   * attribute_mapping. Make sure that your IdP is configured to correctly send the group information.
   * See our {@link https://stytch.com/docs/b2b/guides/rbac/role-assignment RBAC guide} for more information about
   * role assignment.
   */
  external_group_implicit_role_assignments?: { role_id: string; group: string }[];
};

export type B2BSSOUpdateExternalConnectionResponse = ResponseCommon & {
  /**
   * The External Connection object affected by this API call.
   */
  connection: ExternalConnection;
};

export type B2BSSOOIDCCreateConnectionOptions = {
  /**
   * A human-readable display name for the connection.
   */
  display_name?: string;
  /**
   * The identity provider of this connection. For OIDC, the accepted values are `generic`, `okta`, and `microsoft-entra`.
   */
  identity_provider?: string;
};

export type B2BSSOOIDCCreateConnectionResponse = ResponseCommon & {
  /**
   * The OIDC Connection object affected by this API call.
   */
  connection: OIDCConnection;
};

export type B2BSSOOIDCUpdateConnectionOptions = {
  /**
   * Globally unique UUID that identifies a specific OIDC Connection.
   */
  connection_id: string;
  /**
   * A human-readable display name for the connection.
   */
  display_name?: string;
  /**
   * A case-sensitive `https://` URL that uniquely identifies the IdP. This will be provided by the IdP.
   */
  issuer?: string;
  /**
   * The OAuth2.0 client ID used to authenticate login attempts. This will be provided by the IdP.
   */
  client_id?: string;
  /**
   * The secret belonging to the OAuth2.0 client used to authenticate login attempts. This will be provided by the IdP.
   */
  client_secret?: string;
  /**
   * The location of the URL that starts an OAuth login at the IdP. This will be provided by the IdP.
   */
  authorization_url?: string;
  /**
   * The location of the URL that issues OAuth2.0 access tokens and OIDC ID tokens. This will be provided by the IdP.
   */
  token_url?: string;
  /**
   * The location of the IDP's UserInfo Endpoint. This will be provided by the IdP.
   */
  userinfo_url?: string;
  /**
   * The location of the IdP's JSON Web Key Set, used to verify credentials issued by the IdP. This will be provided by the IdP.
   */
  jwks_url?: string;
  /**
   * The identity provider of this connection. For OIDC, the accepted values are `generic`, `okta`, and `microsoft-entra`.
   */
  identity_provider?: string;
  /**
   * A space-separated list of custom scopes that will be requested on each SSOStart call. The total set of scopes will be the union of: the OIDC scopes `openid email profile`, the scopes requested in the `custom_scopes` query parameter on each SSOStart call, and the scopes listed in the OIDC Connection object.
   */
  custom_scopes?: string;
  /**
   * An object that represents the attributes used to identify a Member. This object will map the IdP-defined User attributes to Stytch-specific values, which will appear on the member's Trusted Metadata.
   */
  attribute_mapping?: Record<string, string>;
};

export type B2BSSOOIDCUpdateConnectionResponse = ResponseCommon & {
  /**
   * The OIDC Connection object affected by this API call.
   */
  connection: OIDCConnection;
  /**
   * If it is not possible to resolve the well-known metadata document from the OIDC issuer, this field will explain what went wrong if the request is successful otherwise.
   * In other words, even if the overall request succeeds, there could be relevant warnings related to the connection update.
   */
  warning: string;
};

export type B2BSSOGetConnectionsResponse = ResponseCommon & {
  /**
   * The list of SAML Connections owned by this organization.
   */
  saml_connections: SAMLConnection[];
  /**
   * The list of OIDC Connections owned by this organization.
   */
  oidc_connections: OIDCConnection[];
  /**
   * The list of External Connections owned by this organization.
   */
  external_connections: ExternalConnection[];
};

export type B2BSSODeleteConnectionResponse = ResponseCommon & {
  /**
   * Globally unique UUID that identifies a specific SSO Connection.
   */
  connection_id: string;
};

export type B2BSSODiscoverConnectionsResponse = ResponseCommon & {
  connections: SSOActiveConnection[];
};

export interface IHeadlessB2BSSOClient<TProjectConfiguration extends StytchProjectConfigurationInput> {
  /**
   * The `sso.start()` method starts an SSO flow by redirecting the browser to Stytch's {@link https://stytch.com/docs/b2b/api/sso-authenticate-start SSO Start} endpoint.
   * The method will also generate a PKCE `code_verifier` and store it in localstorage on the device.
   *
   * @example
   * const loginWithOkta = useCallback(()=> {
   *   stytch.sso.start({
   *     connection_id: 'saml-connection-test-51861cbc-d3b9-428b-9761-227f5fb12be9',
   *     login_redirect_url: 'https://example.com/oauth/callback',
   *     signup_redirect_url: 'https://example.com/oauth/callback',
   *   })
   * }, [stytch]);
   * return (
   *   <Button onClick={loginWithOkta}> Log in with IDP </Button>
   * );
   *
   * @param data - An {@link SSOStartOptions} object
   *
   * @returns void - the browser is redirected during this function call. You should not attempt to run any code after calling this function.
   *
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  start(data: SSOStartOptions): Promise<void>;

  /**
   * The authenticate method wraps the {@link https://stytch.com/docs/b2b/api/sso-authenticate SSO Authenticate} API endpoint which validates the SSO token passed in.
   *
   * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/sso#authenticate Stytch Docs} for a complete reference.
   *
   * @example
   * stytch.sso.authenticate({
   *   sso_token: 'token',
   *   session_duration_minutes: 60,
   * });
   *
   * @param data - {@link SSOAuthenticateOptions}
   *
   * @returns A {@link SSOAuthenticateResponse} indicating that the SSO flow has been authenticated and the member is now logged in.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
   */
  authenticate(data: SSOAuthenticateOptions): Promise<SSOAuthenticateResponse<TProjectConfiguration>>;

  /**
   * The Get SSO Connections method wraps the {@link https://stytch.com/docs/b2b/api/get-sso-connections Get SSO Connections} API endpoint.
   * The `organization_id` will be automatically inferred from the logged-in Member's session.
   * This method cannot be used to get SSO connections from other Organizations.
   *
   * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/sso#get-connections Stytch Docs} for a complete reference.
   *
   * @example
   * stytch.sso.getConnections();
   *
   * @rbac action="get", resource="stytch.sso"
   *
   * @returns A {@link B2BSSOGetConnectionsResponse} containing the organization's SSO connections
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
   */
  getConnections(): Promise<B2BSSOGetConnectionsResponse>;

  /**
   * The SSO Discovery method surfaces SSO connections for the end user. It will return all active SSO connections
   * for an end user or, if no active connections are found, it will return all SSO connections that the end user
   * could JIT provision into based on the provided email address.
   *
   * @example
   * stytch.sso.discoverConnections('example@stytch.com');
   *
   * @param emailAddress - Email address to return SSO connection IDs for.
   *
   * @returns A {@link B2BSSODiscoverConnectionsResponse} containing an array of associated SSO connection IDs.
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
   */
  discoverConnections(emailAddress: string): Promise<B2BSSODiscoverConnectionsResponse>;

  /**
   * The Delete SSO Connection method wraps the {@link https://stytch.com/docs/b2b/api/delete-sso-connection Delete SSO Connection} API endpoint.
   * The `organization_id` will be automatically inferred from the logged-in Member's session.
   * This method cannot be used to delete SSO connections in other Organizations.
   *
   * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/sso#delete-connection Stytch Docs} for a complete reference.
   *
   * @example
   * stytch.sso.deleteConnection('saml-connection-test-51861cbc-d3b9-428b-9761-227f5fb12be9');
   *
   * @rbac action="delete", resource="stytch.sso"
   *
   * @param connectionId - The ID of the connection to delete
   *
   * @returns A {@link B2BSSODeleteConnectionResponse} indicating that the SSO connection has been created.
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
   */
  deleteConnection(connectionId: string): Promise<B2BSSODeleteConnectionResponse>;

  saml: {
    /**
     * The Create SAML Connection method wraps the {@link https://stytch.com/docs/b2b/api/create-saml-connection Create SAML Connection} API endpoint.
     * The `organization_id` will be automatically inferred from the logged-in Member's session.
     * This method cannot be used to create SAML connections in other Organizations.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/sso#create-saml-connection Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.sso.saml.createConnection({
     *   display_name: 'OneLogin SAML Connection',
     * });
     *
     * @rbac action="create", resource="stytch.sso"
     *
     * @param data - {@link B2BSSOSAMLCreateConnectionOptions}
     *
     * @returns A {@link B2BSSOSAMLCreateConnectionResponse} indicating that the SSO connection has been created.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
     */
    createConnection(data: B2BSSOSAMLCreateConnectionOptions): Promise<B2BSSOSAMLCreateConnectionResponse>;
    /**
     * The Update SAML Connection method wraps the {@link https://stytch.com/docs/b2b/api/update-saml-connection Update SAML Connection} API endpoint.
     * The `organization_id` will be automatically inferred from the logged-in Member's session.
     * This method cannot be used to update SAML connections in other Organizations.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/sso#update-saml-connection Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.sso.saml.updateConnection({
     *   connection_id: 'saml-connection-test-51861cbc-d3b9-428b-9761-227f5fb12be9',
     *   x509_certificate: '-----BEGIN CERTIFICATE----...',
     * });
     *
     * @rbac action="update", resource="stytch.sso"
     *
     * @param data - {@link B2BSSOSAMLUpdateConnectionOptions}
     *
     * @returns A {@link B2BSSOSAMLUpdateConnectionResponse} indicating that the SSO connection has been updated.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
     */
    updateConnection(data: B2BSSOSAMLUpdateConnectionOptions): Promise<B2BSSOSAMLUpdateConnectionResponse>;
    /**
     * The Update SAML Connection method wraps the {@link https://stytch.com/docs/b2b/api/update-saml-connection Update SAML Connection} API endpoint.
     * The `organization_id` will be automatically inferred from the logged-in Member's session.
     * This method cannot be used to update SAML connections in other Organizations.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/sso#update-saml-connection-url Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.sso.saml.updateConnectionByURL({
     *   connection_id: 'saml-connection-test-51861cbc-d3b9-428b-9761-227f5fb12be9',
     *   metadata_url: 'https://idp.example.com/app/51861cbc-d3b9-428b-9761-227f5fb12be9/sso/saml/metadata',
     * });
     *
     * @rbac action="update", resource="stytch.sso"
     *
     * @param data - {@link B2BSSOSAMLUpdateConnectionByURLOptions}
     *
     * @returns A {@link B2BSSOSAMLUpdateConnectionByURLResponse} indicating that the SSO connection has been updated.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
     */
    updateConnectionByURL(
      data: B2BSSOSAMLUpdateConnectionByURLOptions,
    ): Promise<B2BSSOSAMLUpdateConnectionByURLResponse>;
    /**
     * The Delete SAML Verification Certificate method wraps the {@link https://stytch.com/docs/b2b/api/delete-verification-certificate Delete Verification Certificate} API endpoint.
     * The `organization_id` will be automatically inferred from the logged-in Member's session.
     * This method cannot be used to delete verification certificates in other Organizations.
     *
     * You may need to do this when rotating certificates from your IdP, since Stytch allows a maximum of 5 certificates per connection. There must always be at least one certificate per active connection.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/sso#delete-verification-certificate Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.sso.saml.deleteVerificationCertificate({
     *   connection_id: 'saml-connection-test-51861cbc-d3b9-428b-9761-227f5fb12be9',
     *   certificate_id: 'saml-verification-key-test-5ccbc642-9373-42b8-928f-c1646c868701',
     * });
     *
     * @rbac action="update", resource="stytch.sso"
     *
     * @param data - {@link B2BSSOSAMLDeleteVerificationCertificateOptions}
     *
     * @returns A {@link B2BSSOSAMLDeleteVerificationCertificateResponse} indicating that the Verification Certificate has been deleted.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
     */
    deleteVerificationCertificate(
      data: B2BSSOSAMLDeleteVerificationCertificateOptions,
    ): Promise<B2BSSOSAMLDeleteVerificationCertificateResponse>;
    /**
     * The Delete SAML Encryption Private Key method wraps the {@link https://stytch.com/docs/b2b/api/delete-encryption-private-key Delete Encryption Private Key} API endpoint.
     * The `organization_id` will be automatically inferred from the logged-in Member's session.
     * This method cannot be used to delete encryption private keys in other Organizations.
     *
     * You may need to do this when rotating encryption private keys from your IdP, since Stytch allows a maximum of 5 private keys per connection.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/sso#delete-encryption-private-key Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.sso.saml.deleteEncryptionPrivateKey({
     *   connection_id: 'saml-connection-test-51861cbc-d3b9-428b-9761-227f5fb12be9',
     *   private_key_id: 'saml-encryption-key-test-5ccbc642-9373-42b8-928f-c1646c868701',
     * });
     *
     * @rbac action="update", resource="stytch.sso"
     *
     * @param data - {@link B2BSSOSAMLDeleteEncryptionPrivateKeyOptions}
     *
     * @returns A {@link B2BSSOSAMLDeleteEncryptionPrivateKeyResponse} indicating that the Encryption Private Key has been deleted.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
     */
    deleteEncryptionPrivateKey(
      data: B2BSSOSAMLDeleteEncryptionPrivateKeyOptions,
    ): Promise<B2BSSOSAMLDeleteEncryptionPrivateKeyResponse>;
  };

  oidc: {
    /**
     * The Create OIDC Connection method wraps the {@link https://stytch.com/docs/b2b/api/create-oidc-connection Create OIDC Connection} API endpoint.
     * The `organization_id` will be automatically inferred from the logged-in Member's session.
     * This method cannot be used to create OIDC connections in other Organizations.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/sso#create-oidc-connection Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.sso.oidc.createConnection({
     *   display_name: 'OneLogin OIDC Connection',
     * });
     *
     * @rbac action="create", resource="stytch.sso"
     *
     * @param data - {@link B2BSSOOIDCCreateConnectionOptions}
     *
     * @returns A {@link B2BSSOOIDCCreateConnectionResponse} indicating that the SSO connection has been created.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
     */
    createConnection(data: B2BSSOOIDCCreateConnectionOptions): Promise<B2BSSOOIDCCreateConnectionResponse>;

    /**
     * The Update OIDC Connection method wraps the {@link https://stytch.com/docs/b2b/api/update-oidc-connection Update OIDC Connection} API endpoint.
     * The `organization_id` will be automatically inferred from the logged-in Member's session.
     * This method cannot be used to update OIDC connections in other Organizations.
     *
     * When the value of `issuer` changes, Stytch will attempt to retrieve the [OpenID Provider Metadata](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata) document found at `${issuer}/.well-known/openid-configuration`.
     * If the metadata document can be retrieved successfully, Stytch will use it to infer the values of `authorization_url`, `token_url`, `jwks_url`, and `userinfo_url`.
     * The `client_id` and `client_secret` values cannot be inferred from the metadata document, and *must* be passed in explicitly.
     *
     * If the metadata document cannot be retrieved, Stytch will still update the connection using values from the request body.
     *
     * If the metadata document can be retrieved, and values are passed in the request body, the explicit values passed in from the request body will take precedence over the values inferred from the metadata document.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/sso#update-oidc-connection Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.sso.oidc.updateConnection({
     *   connection_id: 'oidc-connection-test-b6c714c2-7413-4b92-a0f1-97aa1085aeff',
     *   client_id: "s6BhdRkqt3",
     *   client_secret: "SeiGwdj5lKkrEVgcEY3QNJXt6srxS3IK2Nwkar6mXD4="
     * });
     *
     * @rbac action="update", resource="stytch.sso"
     *
     * @param data - {@link B2BSSOOIDCUpdateConnectionOptions}
     *
     * @returns A {@link B2BSSOOIDCUpdateConnectionResponse} indicating that the SSO connection has been updated.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
     */
    updateConnection(data: B2BSSOOIDCUpdateConnectionOptions): Promise<B2BSSOOIDCUpdateConnectionResponse>;
  };

  external: {
    /**
     * The Create External Connection method wraps the {@link https://stytch.com/docs/b2b/api/create-external-connection Create External Connection} API endpoint.
     * The `organization_id` will be automatically inferred from the logged-in Member's session.
     * This method cannot be used to create External connections in other Organizations.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/sso#create-external-connection Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.sso.external.createConnection({
     *   display_name: 'OneLogin External Connection',
     * });
     *
     * @rbac action="create", resource="stytch.sso"
     *
     * @param data - {@link B2BSSOCreateExternalConnectionOptions}
     *
     * @returns A {@link B2BSSOCreateSAMLConnectionResponse} indicating that the SSO connection has been created.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
     */
    createConnection(data: B2BSSOCreateExternalConnectionOptions): Promise<B2BSSOCreateExternalConnectionResponse>;
    /**
     * The Update External Connection method wraps the {@link https://stytch.com/docs/b2b/api/update-external-connection Update External Connection} API endpoint.
     * The `organization_id` will be automatically inferred from the logged-in Member's session.
     * This method cannot be used to update External connections in other Organizations.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/sso#update-external-connection Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.sso.external.updateConnection({
     *   connection_id: 'external-connection-test-51861cbc-d3b9-428b-9761-227f5fb12be9',
     *   display_name: 'new display name',
     * });
     *
     * @rbac action="update", resource="stytch.sso"
     *
     * @param data - {@link B2BSSOUpdateExternalConnectionOptions}
     *
     * @returns A {@link B2BSSOUpdateExternalConnectionResponse} indicating that the SSO connection has been updated.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
     */
    updateConnection(data: B2BSSOUpdateExternalConnectionOptions): Promise<B2BSSOUpdateExternalConnectionResponse>;
  };
}
