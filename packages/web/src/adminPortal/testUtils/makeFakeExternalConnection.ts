import { ExternalConnection } from '@stytch/core/public';
import { MOCK_ORG_ID } from '@stytch/internal-mocks';

const fakeExternalConnection = {
  organization_id: MOCK_ORG_ID,
  connection_id: 'external-connection-test-b6c714c2-7413-4b92-a0f1-97aa1085aeff',
  display_name: 'Example External Connection',
  status: 'active',
  external_connection_id: 'external-connection-test-123',
  external_organization_id: 'external-organization-test-123',
  external_connection_implicit_role_assignments: [
    {
      role_id: 'stytch_admin',
    },
  ],
  external_group_implicit_role_assignments: [
    {
      role_id: 'sso_update',
      group: 'editors',
    },
    {
      role_id: 'sso_get',
      group: 'readers',
    },
  ],
} satisfies ExternalConnection;

export const makeFakeExternalConnection = (connection: Partial<ExternalConnection> = {}): ExternalConnection => ({
  ...fakeExternalConnection,
  ...connection,
});
