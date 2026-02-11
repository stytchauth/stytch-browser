import { AuthFlowType, B2BProducts } from '@stytch/core/public';
import { screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { MockClient, MockConfig, changeEmail, clickContinue, renderFlow } from './helpers';

describe('B2B SSO Discovery Flow', () => {
  const MOCK_EMAIL = 'test@example.com';

  const config = {
    products: [B2BProducts.sso],
    authFlowType: AuthFlowType.Discovery,
    ssoOptions: {
      loginRedirectURL: 'https://example.com/authenticate',
      signupRedirectURL: 'https://example.com/sign-up',
    },
  } satisfies MockConfig;

  afterEach(() => {
    jest.clearAllMocks();
  });

  const startSSOFlow = async () => {
    const ssoButton = await screen.findByText('Continue with SSO');
    await userEvent.click(ssoButton);
  };

  const client = {
    sso: {
      start: jest.fn().mockResolvedValue({}),
      discoverConnections: jest.fn().mockResolvedValue({}),
    },
  } satisfies MockClient;

  it('Successfully redirects to SSO provider with single connection', async () => {
    const mockConnection = {
      connection_id: 'sso-conn-test123',
      display_name: 'Test SSO Provider',
      identity_provider: 'okta',
    };

    client.sso.discoverConnections.mockResolvedValue({
      connections: [mockConnection],
      status_code: 200,
      request_id: 'test-request-id',
    });

    await renderFlow({ config, client });

    await startSSOFlow();
    await changeEmail(MOCK_EMAIL);
    await clickContinue();

    expect(client.sso.start).toHaveBeenCalledWith({
      connection_id: mockConnection.connection_id,
      login_redirect_url: config.ssoOptions.loginRedirectURL,
      signup_redirect_url: config.ssoOptions.signupRedirectURL,
    });
  });

  it('Successfully handles multiple SSO connections', async () => {
    const mockConnections = [
      {
        connection_id: 'sso-conn-okta',
        display_name: 'Test Okta Provider',
        identity_provider: 'okta',
      },
      {
        connection_id: 'sso-conn-google',
        display_name: 'Test Google Workspace Provider',
        identity_provider: 'google_workspace',
      },
    ];

    client.sso.discoverConnections.mockResolvedValue({
      connections: mockConnections,
      status_code: 200,
      request_id: 'test-request-id',
    });

    await renderFlow({ config, client });

    await startSSOFlow();
    await changeEmail(MOCK_EMAIL);
    await clickContinue();

    const oktaButton = await screen.findByRole('button', { name: 'Continue with Test Okta Provider' });
    await userEvent.click(oktaButton);

    expect(client.sso.start).toHaveBeenCalledWith({
      connection_id: mockConnections[0].connection_id,
      login_redirect_url: config.ssoOptions.loginRedirectURL,
      signup_redirect_url: config.ssoOptions.signupRedirectURL,
    });
  });

  it('Successfully redirects to SSO provider with single connection after manual org slug entry', async () => {
    const mockConnection = {
      connection_id: 'sso-conn-fallback',
      display_name: 'Fallback SSO Provider',
      identity_provider: 'okta',
    };

    const internals = {
      networkClient: {
        fetchSDK: jest.fn().mockImplementation(({ url }) => {
          if (url.startsWith('/b2b/sso/discovery/connections')) {
            return Promise.resolve({
              connections: [],
              status_code: 200,
              request_id: 'test-request-id',
            });
          }
          return Promise.resolve({});
        }),
      },
    };

    const mockOrganization = {
      sso_active_connections: [mockConnection],
      name: 'Example Org Inc.',
    };

    const client = {
      sso: {
        start: jest.fn(),
        discoverConnections: jest.fn(),
      },
      organization: {
        getBySlug: jest.fn().mockResolvedValue({ organization: mockOrganization }),
      },
    };

    await renderFlow({ config, client, internals });

    await startSSOFlow();
    await changeEmail(MOCK_EMAIL);
    await clickContinue();

    const slugInput = await screen.findByPlaceholderText('Enter org slug');
    await userEvent.type(slugInput, 'single-sso-fallback');
    const continueButton = await screen.findByText('Continue');
    await userEvent.click(continueButton);

    expect(client.organization.getBySlug).toHaveBeenCalledWith({ organization_slug: 'single-sso-fallback' });
    expect(client.sso.start).toHaveBeenCalledWith({
      connection_id: mockConnection.connection_id,
      login_redirect_url: config.ssoOptions.loginRedirectURL,
      signup_redirect_url: config.ssoOptions.signupRedirectURL,
    });
  });
});
