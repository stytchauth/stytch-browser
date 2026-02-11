import { ResponseCommon } from '../common';

interface BaseSCIMConnection {
  /**
   * Globally unique UUID that identifies a specific Organization.
   */
  organization_id: string;
  /**
   * Globally unique UUID that identifies a specific SCIM Connection.
   */
  connection_id: string;
  /**
   * The status of the connection. The possible values are deleted or active.
   */
  status: string;
  /**
   * A human-readable display name for the connection.
   */
  display_name: string;
  /**
   * The identity provider of this connection.
   */
  identity_provider: string;
  /**
   * The base URL of the SCIM connection.
   */
  base_url: string;
  /**
   * An array of implicit group role assignments granted to members in this organization who are provisioned this SCIM connection
   * and belong to the specified group.
   * See our {@link https://stytch.com/docs/b2b/guides/rbac/role-assignment RBAC guide} for more information about
   * role assignment.
   */
  scim_group_implicit_role_assignments: { role_id: string; group_id: string }[];
}

export interface SCIMConnection extends BaseSCIMConnection {
  /**
   * Last four characters of the issued bearer token.
   */
  bearer_token_last_four: string;
  /**
   * The time at which the bearer token expires.
   */
  bearer_token_expires_at: string;
  /**
   * Present during rotation, the next bearer token's last four digits.
   */
  next_bearer_token_last_four?: string;
  /**
   * Present during rotation, the time at which the next bearer token expires.
   */
  next_bearer_token_expires_at?: string;
}

export interface SCIMConnectionWithBearerToken extends BaseSCIMConnection {
  /**
   * The bearer token used to authenticate with the SCIM API.
   */
  bearer_token: string;
  /**
   * The time at which the bearer token expires.
   */
  bearer_token_expires_at: string;
}

export interface SCIMConnectionWithNextBearerToken extends BaseSCIMConnection {
  /**
   * The bearer token used to authenticate with the SCIM API.
   */
  next_bearer_token: string;
  /**
   * The time at which the bearer token expires.
   */
  next_bearer_token_expires_at: string;
  /**
   * Last four characters of the issued bearer token.
   */
  bearer_token_last_four: string;
  /**
   * The time at which the bearer token expires.
   */
  bearer_token_expires_at: string;
}

export interface SCIMGroup {
  /**
   * Globally unique UUID that identifies a specific Organization.
   */
  organization_id: string;
  /**
   * Globally unique UUID that identifies a specific SCIM Connection.
   */
  connection_id: string;
  /**
   * Globally unique UUID that identifies a specific SCIM Group.
   */
  group_id: string;
  /**
   * Name given to the group by the IDP.
   */
  group_name: string;
}

export type B2BSCIMCreateConnectionOptions = {
  /**
   * A human-readable display name for the connection.
   */
  display_name?: string;
  /**
   * The identity provider of this connection.
   */
  identity_provider?: string;
};

export type B2BSCIMCreateConnectionResponse = ResponseCommon & {
  connection: SCIMConnectionWithBearerToken;
};

export type B2BSCIMUpdateConnectionOptions = {
  /**
   * Globally unique UUID that identifies a specific SCIM Connection.
   */
  connection_id: string;
  /**
   * A human-readable display name for the connection.
   */
  display_name?: string;
  /**
   * The identity provider of this connection.
   */
  identity_provider?: string;
  /**
   * An array of implicit role assignments granted to members in this organization who are created via this SCIM connection
   * and belong to the specified group.
   * Before adding any group implicit role assignments, you must first provision groups from your IdP into Stytch,
   * see our {@link https://stytch.com/docs/b2b/guides/scim/overview scim-guide}.
   * See our {@link https://stytch.com/docs/b2b/guides/rbac/role-assignment RBAC guide} for more information about
   * role assignment.
   */
  scim_group_implicit_role_assignments?: { role_id: string; group_id: string }[];
};

export type B2BSCIMUpdateConnectionResponse = ResponseCommon & {
  connection: SCIMConnection;
};

export type B2BSCIMDeleteConnectionResponse = ResponseCommon & {
  /**
   * Globally unique UUID that identifies a specific SCIM Connection.
   */
  connection_id: string;
};

export type B2BSCIMGetConnectionResponse = ResponseCommon & {
  connection: SCIMConnection;
};

export type B2BSCIMGetConnectionGroupsOptions = {
  /**
   * The maximum number of groups that should be returned by the API.
   */
  limit?: number;
  /**
   * The cursor to use to indicate where to start group results.
   */
  cursor?: string;
};

export type B2BSCIMGetConnectionGroupsResponse = ResponseCommon & {
  /**
   * List of SCIM Groups for the connection.
   */
  scim_groups: SCIMGroup[];
  /**
   * The cursor to use to get the next page of results.
   */
  next_cursor: string | null;
};

export type B2BSCIMRotateStartResponse = ResponseCommon & {
  connection: SCIMConnectionWithNextBearerToken;
};

export type B2BSCIMRotateCompleteResponse = ResponseCommon & {
  connection: SCIMConnection;
};

export type B2BSCIMRotateCancelResponse = ResponseCommon & {
  connection: SCIMConnection;
};

export interface IHeadlessB2BSCIMClient {
  /**
   * The Create SCIM Connection method wraps the {@link https://stytch.com/docs/b2b/api/create-scim-connection Create SCIM Connection} API endpoint.
   * The `organization_id` will be automatically inferred from the logged-in Member's session.
   * This method cannot be used to create SCIM connections in other Organizations.
   *
   * @example
   * stytch.scim.createConnection({
   *   display_name: 'My SCIM Connection',
   *   identity_provider: 'okta'
   * });
   *
   * @rbac action="create", resource="stytch.scim"
   *
   * @param data - {@link B2BSCIMCreateConnectionOptions}
   *
   * returns A {@link B2BSCIMCreateConnectionResponse} indicating that the SCIM connection has been created.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  createConnection(data: B2BSCIMCreateConnectionOptions): Promise<B2BSCIMCreateConnectionResponse>;

  /**
   * Updates an existing SCIM connection.
   * This method wraps the {@link https://stytch.com/docs/b2b/api/update-scim-connection update-connection} endpoint.
   * If attempting to modify the `scim_group_implicit_role_assignments` the caller must have the `update.settings.implicit-roles` permission on the `stytch.organization` resource.
   * For all other fields, the caller must have the `update` permission on the `stytch.scim` resource.
   * SCIM via the project's RBAC policy & their role assignments.
   *
   * @example
   * stytch.scim.updateConnection({
   *   connection_id: 'connection-id-123',
   *   display_name: 'My SCIM Connection',
   *   identity_provider: 'okta',
   *   scim_group_implicit_role_assignments: [
   *    {
   *      group_id: 'group-id-123',
   *      role_id: 'role-id-123'
   *    }
   *   ]
   * });
   *
   * @rbac action="update", resource="stytch.scim"
   *
   * @param data - {@link B2BSCIMUpdateConnectionOptions}
   *
   * returns A {@link B2BSCIMUpdateConnectionResponse} indicating that the SCIM connection has been updated.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  updateConnection(data: B2BSCIMUpdateConnectionOptions): Promise<B2BSCIMUpdateConnectionResponse>;

  /**
   * The Delete SCIM Connection method wraps the {@link https://stytch.com/docs/b2b/api/delete-scim-connection Delete SCIM Connection} API endpoint.
   * The `organization_id` will be automatically inferred from the logged-in Member's session.
   * This method cannot be used to delete SCIM connections in other Organizations.
   *
   * @example
   * stytch.scim.deleteConnection('connection-id-123');
   *
   * @rbac action="delete", resource="stytch.scim"
   *
   * @param connectionId
   *
   * returns A {@link B2BSCIMDeleteConnectionResponse} indicating that the SCIM connection has been deleted.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  deleteConnection(connectionId: string): Promise<B2BSCIMDeleteConnectionResponse>;

  /**
   * The Get SCIM Connection method wraps the {@link https://stytch.com/docs/b2b/api/get-scim-connection Get SCIM Connection} API endpoint.
   * The `organization_id` will be automatically inferred from the logged-in Member's session.
   * This method cannot be used to get SCIM connection from other Organizations.
   *
   * @example
   * stytch.scim.getConnection();
   *
   * @rbac action="get", resource="stytch.scim"
   *
   * @param connectionId
   *
   * returns A {@link B2BSCIMGetConnectionResponse} indicating that the SCIM connection has been retrieved.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  getConnection(connectionId: string): Promise<B2BSCIMGetConnectionResponse>;

  /**
   * The Get SCIM Connection Groups method wraps the {@link https://stytch.com/docs/b2b/api/get-scim-connection-groups Get SCIM Connection} API endpoint.
   * The `organization_id` will be automatically inferred from the logged-in Member's session.
   *
   * @example
   * stytch.scim.getConnectionGroups({
   *   limit: 10
   * });
   *
   * @rbac action="get", resource="stytch.scim"
   *
   * @param data
   */
  getConnectionGroups(data: B2BSCIMGetConnectionGroupsOptions): Promise<B2BSCIMGetConnectionGroupsResponse>;

  /**
   * The SCIM Rotate Token Start method wraps the {@link https://stytch.com/docs/b2b/api/scim-rotate-token-start SCIM Rotate Token Start} API endpoint.
   * The `organization_id` will be automatically inferred from the logged-in Member's session.
   * This method cannot be used to start token rotations for SCIM connections in other Organizations.
   *
   * @example
   * stytch.scim.rotateStart('connection-id-123');
   *
   * @rbac action="update", resource="stytch.scim"
   *
   * @param connectionId
   *
   * returns A {@link B2BSCIMRotateStartResponse} containing a new bearer token
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  rotateStart(connectionId: string): Promise<B2BSCIMRotateStartResponse>;

  /**
   * The SCIM Rotate Token Complete method wraps the {@link https://stytch.com/docs/b2b/api/scim-rotate-token-complete SCIM Rotate Token Complete} API endpoint.
   * The `organization_id` will be automatically inferred from the logged-in Member's session.
   * This method cannot be used to complete token rotations for SCIM connections in other Organizations.
   *
   * @example
   * stytch.scim.rotateComplete('connection-id-123');
   *
   * @rbac action="update", resource="stytch.scim"
   *
   * @param connectionId
   *
   * returns A {@link B2BSCIMRotateCompleteResponse} containing a new bearer token
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  rotateComplete(connectionId: string): Promise<B2BSCIMRotateCompleteResponse>;

  /**
   * The SCIM Rotate Token Cancel method wraps the {@link https://stytch.com/docs/b2b/api/scim-rotate-token-cancel SCIM Rotate Token Cancel} API endpoint.
   * The `organization_id` will be automatically inferred from the logged-in Member's session.
   * This method cannot be used to cancel token rotations for SCIM connections in other Organizations.
   *
   * @example
   * stytch.scim.rotateCancel('connection-id-123');
   *
   * @rbac action="update", resource="stytch.scim"
   *
   * @param connectionId
   *
   * returns A {@link B2BSCIMRotateCancelResponse} containing a new bearer token
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  rotateCancel(connectionId: string): Promise<B2BSCIMRotateCancelResponse>;
}
