import { ExternalTaggedConnection, SAMLTaggedConnection } from '../sso/TaggedConnection';

export const getSsoConnectionRoleAssignments = (connection: SAMLTaggedConnection | ExternalTaggedConnection) =>
  connection.connectionType === 'saml'
    ? connection.saml_connection_implicit_role_assignments
    : connection.external_connection_implicit_role_assignments;

export const getSsoGroupRoleAssignments = (connection: SAMLTaggedConnection | ExternalTaggedConnection) =>
  connection.connectionType === 'saml'
    ? connection.saml_group_implicit_role_assignments
    : connection.external_group_implicit_role_assignments;
