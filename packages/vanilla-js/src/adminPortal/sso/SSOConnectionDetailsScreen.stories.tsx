import type { Meta, StoryObj } from '@storybook/react';
import { B2BSSOGetConnectionsResponse, Organization, ResponseCommon } from '@stytch/core/public';
import { HttpResponse, delay, http } from 'msw';
import {
  DataResponse,
  ErrorResponse,
  infiniteResolver,
  makeB2BSessionAuthenticateHandler,
  makeErrorResponse,
  organizationMeResponse,
} from '../../../.storybook/handlers';
import { makeFakeSamlConnection } from '../testUtils/makeFakeSamlConnection';
import { SSOConnectionDetailsScreen } from './SSOConnectionDetailsScreen';

const meta = {
  component: SSOConnectionDetailsScreen,
  parameters: {
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({ roles: ['stytch_admin', 'stytch_member'] }),
      },
    },
  },
} satisfies Meta<typeof SSOConnectionDetailsScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const GenericSAML = {
  args: {
    connectionId: 'saml-connection-test-fake-0',
  },
} satisfies Story;

export const GenericOIDC = {
  args: {
    connectionId: 'oidc-connection-test-fake-0',
  },
} satisfies Story;

export const GoogleSAML = {
  args: {
    connectionId: 'saml-connection-test-fake-google-workspace',
  },
} satisfies Story;

export const OktaSAML = {
  args: {
    connectionId: 'saml-connection-test-fake-okta',
  },
} satisfies Story;

export const OktaOIDC = {
  args: {
    connectionId: 'oidc-connection-test-fake-okta',
  },
} satisfies Story;

export const MicrosoftSAML = {
  args: {
    connectionId: 'saml-connection-test-fake-microsoft-entra',
  },
} satisfies Story;

export const MicrosoftOIDC = {
  args: {
    connectionId: 'oidc-connection-test-fake-microsoft-entra',
  },
} satisfies Story;

export const UnrecognizedSAML = {
  args: {
    connectionId: 'saml-connection-test-fake-unicorn',
  },
} satisfies Story;

export const UnrecognizedOIDC = {
  args: {
    connectionId: 'oidc-connection-test-fake-unicorn',
  },
} satisfies Story;

export const ExternalConnection = {
  args: {
    connectionId: 'external-connection-test-fake-0',
  },
} satisfies Story;

export const NoTestConnectionButton = {
  ...GenericSAML,
  parameters: {
    msw: {
      handlers: {
        b2bSso: http.get<never, never, DataResponse<B2BSSOGetConnectionsResponse>>(
          'https://api.stytch.com/sdk/v1/b2b/sso',
          () => {
            return HttpResponse.json({
              data: {
                oidc_connections: [],
                saml_connections: [
                  makeFakeSamlConnection({
                    status: 'pending',
                    connection_id: 'saml-connection-test-fake-0',
                  }),
                ],
                external_connections: [],
                request_id: 'request-id-test-602dffcd-603a-471d-b3ca-60f01f7215da',
                status_code: 200,
              },
            });
          },
        ),
      },
    },
  },
};

export const NoRoles = {
  ...GenericSAML,
  parameters: {
    msw: {
      handlers: {
        b2bSso: http.get<never, never, DataResponse<B2BSSOGetConnectionsResponse>>(
          'https://api.stytch.com/sdk/v1/b2b/sso',
          () => {
            return HttpResponse.json({
              data: {
                oidc_connections: [],
                saml_connections: [
                  makeFakeSamlConnection({
                    connection_id: 'saml-connection-test-fake-0',
                    saml_connection_implicit_role_assignments: [],
                    saml_group_implicit_role_assignments: [],
                  }),
                ],
                external_connections: [],
                request_id: 'request-id-test-602dffcd-603a-471d-b3ca-60f01f7215da',
                status_code: 200,
              },
            });
          },
        ),
      },
    },
  },
};

export const SeveralRoles = {
  ...GenericSAML,
  parameters: {
    msw: {
      handlers: {
        b2bSso: http.get<never, never, DataResponse<B2BSSOGetConnectionsResponse>>(
          'https://api.stytch.com/sdk/v1/b2b/sso',
          () => {
            return HttpResponse.json({
              data: {
                oidc_connections: [],
                external_connections: [],
                saml_connections: [
                  makeFakeSamlConnection({
                    connection_id: 'saml-connection-test-fake-0',
                    saml_connection_implicit_role_assignments: [
                      { role_id: 'limited_admin' },
                      { role_id: 'other_role' },
                    ],
                    saml_group_implicit_role_assignments: [
                      { group: 'Engineering', role_id: 'stytch_admin' },
                      { group: 'Engineering', role_id: 'stytch_member' },
                      { group: 'Sales', role_id: 'read_only' },
                    ],
                  }),
                ],
                request_id: 'request-id-test-602dffcd-603a-471d-b3ca-60f01f7215da',
                status_code: 200,
              },
            });
          },
        ),
      },
    },
  },
};

export const FirstNameLastNameAttributeMapping = {
  ...GenericSAML,
  parameters: {
    msw: {
      handlers: {
        b2bSso: http.get<never, never, DataResponse<B2BSSOGetConnectionsResponse>>(
          'https://api.stytch.com/sdk/v1/b2b/sso',
          () => {
            return HttpResponse.json({
              data: {
                oidc_connections: [],
                external_connections: [],
                saml_connections: [
                  makeFakeSamlConnection({
                    connection_id: 'saml-connection-test-fake-0',
                    attribute_mapping: {
                      first_name: 'first_name',
                      last_name: 'last_name',
                      email: 'email',
                    },
                  }),
                ],
                request_id: 'request-id-test-602dffcd-603a-471d-b3ca-60f01f7215da',
                status_code: 200,
              },
            });
          },
        ),
      },
    },
  },
};

export const CustomAttributeMapping = {
  ...GenericSAML,
  parameters: {
    msw: {
      handlers: {
        b2bSso: http.get<never, never, DataResponse<B2BSSOGetConnectionsResponse>>(
          'https://api.stytch.com/sdk/v1/b2b/sso',
          () => {
            return HttpResponse.json({
              data: {
                oidc_connections: [],
                external_connections: [],
                saml_connections: [
                  makeFakeSamlConnection({
                    connection_id: 'saml-connection-test-fake-0',
                    attribute_mapping: {
                      first_name: 'first_name',
                      last_name: 'last_name',
                      email: 'email',
                      custom_field: 'some_custom_mapping',
                      groups: '{eng, design}',
                    },
                  }),
                ],
                request_id: 'request-id-test-602dffcd-603a-471d-b3ca-60f01f7215da',
                status_code: 200,
              },
            });
          },
        ),
      },
    },
  },
};

export const JITProvisioningRestricted = {
  ...GenericSAML,
  parameters: {
    msw: {
      handlers: {
        b2bOrganizationMe: http.get<never, never, DataResponse<{ organization: Organization } & ResponseCommon>>(
          'https://api.stytch.com/sdk/v1/b2b/organizations/me',
          () => {
            return HttpResponse.json({
              data: {
                organization: { ...organizationMeResponse, sso_jit_provisioning: 'RESTRICTED' },
                request_id: 'request-id-test-896c625f-89a6-4a0d-8615-3dcbdf00314d',
                status_code: 200,
              },
            });
          },
        ),
      },
    },
  },
} satisfies Story;

export const JITProvisioningNotAllowed = {
  ...GenericSAML,
  parameters: {
    msw: {
      handlers: {
        b2bOrganizationMe: http.get<never, never, DataResponse<{ organization: Organization } & ResponseCommon>>(
          'https://api.stytch.com/sdk/v1/b2b/organizations/me',
          () => {
            return HttpResponse.json({
              data: {
                organization: { ...organizationMeResponse, sso_jit_provisioning: 'NOT_ALLOWED' },
                request_id: 'request-id-test-896c625f-89a6-4a0d-8615-3dcbdf00314d',
                status_code: 200,
              },
            });
          },
        ),
      },
    },
  },
} satisfies Story;

export const JITProvisioningAllAllowed = {
  ...GenericSAML,
  parameters: {
    msw: {
      handlers: {
        b2bOrganizationMe: http.get<never, never, DataResponse<{ organization: Organization } & ResponseCommon>>(
          'https://api.stytch.com/sdk/v1/b2b/organizations/me',
          () => {
            return HttpResponse.json({
              data: {
                organization: { ...organizationMeResponse, sso_jit_provisioning: 'ALL_ALLOWED' },
                request_id: 'request-id-test-896c625f-89a6-4a0d-8615-3dcbdf00314d',
                status_code: 200,
              },
            });
          },
        ),
      },
    },
  },
} satisfies Story;

export const Loading = {
  parameters: {
    msw: {
      handlers: {
        b2bSso: http.get<never, never, DataResponse<never>>('https://api.stytch.com/sdk/v1/b2b/sso', infiniteResolver),
      },
    },
  },
};

export const Error = {
  parameters: {
    msw: {
      handlers: {
        b2bSso: http.get<never, never, ErrorResponse>('https://api.stytch.com/sdk/v1/b2b/sso', async () => {
          await delay(300);

          return makeErrorResponse({
            errorType: 'unauthorized_credentials',
            statusCode: 401,
            message: 'Unauthorized credentials',
          });
        }),
      },
    },
  },
};
