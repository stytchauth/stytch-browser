import { AuthFlowType, StytchEventType } from '@stytch/core/public';
import userEvent from '@testing-library/user-event';

import { screen, waitFor } from '../../../testUtils';
import { emailMagicLinks, passwords, sso } from '../../b2b/B2BProducts';
import {
  changeEmail,
  changePassword,
  clickContinue,
  clickContinueWithEmail,
  clickCreateOrganization,
  clickOkta,
  clickSSOOnlyOrg,
  MockBootstrap,
  MockClient,
  MockConfig,
  renderFlow,
  setWindowLocation,
  waitForConfirmationPage,
  waitForLoggedInPage,
  waitForMfaEnrollmentScreen,
  waitForNoOrganizationCreateDisabled,
  waitForNoOrganizationCreateEnabled,
} from './helpers';

const MOCK_EMAIL = 'example@email.com';
const MOCK_PASSWORD = 'lIzE9onk56$*';

describe('Discovery Flow', () => {
  const config = {
    products: [emailMagicLinks],
    authFlowType: AuthFlowType.Discovery,
    emailMagicLinksOptions: {
      discoveryRedirectURL: 'https://example.com/authenticate',
    },
    sessionOptions: {
      sessionDurationMinutes: 10,
    },
    passwordOptions: {
      loginRedirectURL: 'https://example.com/authenticate',
      resetPasswordRedirectURL: 'https://example.com/reset-password',
    },
    ssoOptions: {
      loginRedirectURL: 'https://example.com/sso-login',
      signupRedirectURL: 'https://example.com/sso-signup',
    },
  } satisfies MockConfig;

  const bootstrapCreateEnabled = {
    createOrganizationEnabled: true,
  } satisfies MockBootstrap;

  const discoveryAuthenticateSpy = jest.fn();
  const client = {
    magicLinks: {
      email: {
        discovery: { send: jest.fn() },
      },
      authenticate: jest.fn(),
      discovery: {
        authenticate: discoveryAuthenticateSpy,
      },
    },
    sso: {
      start: jest.fn(),
    },
    passwords: {
      authenticate: jest.fn(),
    },
    discovery: {
      intermediateSessions: {
        exchange: jest.fn(),
      },
      organizations: {
        create: jest.fn(),
      },
    },
  } satisfies MockClient;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Successfully handles a magic link discovery send', async () => {
    client.magicLinks.email.discovery.send.mockResolvedValue(void 0);

    await renderFlow({ config, client });
    await changeEmail(MOCK_EMAIL);
    await clickContinueWithEmail();
    await waitForConfirmationPage();

    expect(client.magicLinks.email.discovery.send).toHaveBeenCalledTimes(1);
    expect(client.magicLinks.email.discovery.send).toHaveBeenCalledWith({
      email_address: MOCK_EMAIL,
      discovery_redirect_url: 'https://example.com/authenticate',
    });
  });

  it('Successfully authenticates a discovery token: create disabled: no organizations available', async () => {
    client.magicLinks.discovery.authenticate.mockResolvedValue({
      intermediate_session_token: 'ist_token',
      email: MOCK_EMAIL,
      discovered_organizations: [],
    });

    const stytchToken = 'token';

    setWindowLocation(`http://localhost/authenticate?stytch_token_type=discovery&token=${stytchToken}`);

    await renderFlow({ config, client });

    await waitForNoOrganizationCreateDisabled();

    expect(client.magicLinks.discovery.authenticate).toHaveBeenCalledTimes(1);
    expect(client.magicLinks.discovery.authenticate).toHaveBeenCalledWith({
      discovery_magic_links_token: 'token',
    });
  });

  it('Successfully authenticates a discovery token: create disabled via UI: no organizations available', async () => {
    client.magicLinks.discovery.authenticate.mockResolvedValue({
      intermediate_session_token: 'ist_token',
      email: MOCK_EMAIL,
      discovered_organizations: [],
    });

    const configCreateDisabled = {
      ...config,
      disableCreateOrganization: true,
    } satisfies MockConfig;

    const stytchToken = 'token';

    setWindowLocation(`http://localhost/authenticate?stytch_token_type=discovery&token=${stytchToken}`);

    await renderFlow({ config: configCreateDisabled, client, bootstrap: bootstrapCreateEnabled });

    await waitForNoOrganizationCreateDisabled();

    expect(client.magicLinks.discovery.authenticate).toHaveBeenCalledTimes(1);
    expect(client.magicLinks.discovery.authenticate).toHaveBeenCalledWith({
      discovery_magic_links_token: 'token',
    });
  });

  it('Successfully authenticates a discovery token: create disabled: organizations available', async () => {
    const istToken = 'ist_token';
    const orgId = 'org-1234';

    client.magicLinks.discovery.authenticate.mockResolvedValue({
      intermediate_session_token: istToken,
      email: MOCK_EMAIL,
      discovered_organizations: [
        {
          organization: { organization_id: orgId, organization_name: 'Okta' },
          membership: {
            type: 'active_member',
            member: { member_id: 'mock_user_id' },
          },
          member_authenticated: true,
        },
      ],
    });
    client.discovery.intermediateSessions.exchange.mockResolvedValue({ member_session: {} });

    const stytchToken = 'token';

    setWindowLocation(`http://localhost/authenticate?stytch_token_type=discovery&token=${stytchToken}`);

    await renderFlow({ config, client });

    await waitFor(() => {
      screen.getByText('Select an organization to continue');
    });

    expect(client.magicLinks.discovery.authenticate).toHaveBeenCalledTimes(1);
    expect(client.magicLinks.discovery.authenticate).toHaveBeenCalledWith({
      discovery_magic_links_token: 'token',
    });

    await clickOkta();

    expect(client.discovery.intermediateSessions.exchange).toHaveBeenCalledTimes(1);
    expect(client.discovery.intermediateSessions.exchange).toHaveBeenCalledWith({
      organization_id: orgId,
      session_duration_minutes: 10,
    });

    await waitForLoggedInPage();
  });

  it('Starts MFA enrollment: create disabled, organizations available, MFA', async () => {
    const istToken = 'ist_token';
    const orgId = 'org-1234';

    client.magicLinks.discovery.authenticate.mockResolvedValue({
      intermediate_session_token: istToken,
      email: MOCK_EMAIL,
      discovered_organizations: [
        {
          organization: { organization_id: orgId, organization_name: 'Okta' },
          membership: {
            type: 'active_member',
            member: { member_id: 'mock_user_id' },
          },
          mfa_required: {},
          member_authenticated: false,
          primary_required: null,
        },
      ],
    });
    client.discovery.intermediateSessions.exchange.mockResolvedValue({
      member_session: null,
      member: {
        mfa_enrolled: false,
      },
      organization: { organization_id: orgId, mfa_methods: 'ALL_ALLOWED' },
    });

    const stytchToken = 'token';

    setWindowLocation(`http://localhost/authenticate?stytch_token_type=discovery&token=${stytchToken}`);

    await renderFlow({ config, client });

    await waitFor(() => {
      screen.getByText('Select an organization to continue');
    });

    expect(client.magicLinks.discovery.authenticate).toHaveBeenCalledTimes(1);
    expect(client.magicLinks.discovery.authenticate).toHaveBeenCalledWith({
      discovery_magic_links_token: 'token',
    });

    await clickOkta();

    expect(client.discovery.intermediateSessions.exchange).toHaveBeenCalledTimes(1);
    expect(client.discovery.intermediateSessions.exchange).toHaveBeenCalledWith({
      organization_id: orgId,
      session_duration_minutes: 10,
    });

    await waitForMfaEnrollmentScreen();
  });

  it('Successfully authenticates a discovery token: create enabled: no organizations available', async () => {
    const istToken = 'ist_token';

    client.magicLinks.discovery.authenticate.mockResolvedValue({
      intermediate_session_token: istToken,
      email: MOCK_EMAIL,
      discovered_organizations: [],
    });
    client.discovery.organizations.create.mockResolvedValue({ member_session: {} });

    const stytchToken = 'token';

    setWindowLocation(`http://localhost/authenticate?stytch_token_type=discovery&token=${stytchToken}`);

    await renderFlow({ config, client, bootstrap: bootstrapCreateEnabled });

    await waitForNoOrganizationCreateEnabled();

    expect(client.magicLinks.discovery.authenticate).toHaveBeenCalledTimes(1);
    expect(client.magicLinks.discovery.authenticate).toHaveBeenCalledWith({
      discovery_magic_links_token: 'token',
    });

    await clickCreateOrganization();

    expect(client.discovery.organizations.create).toHaveBeenCalledTimes(1);
    expect(client.discovery.organizations.create).toHaveBeenCalledWith({
      session_duration_minutes: 10,
    });

    await waitForLoggedInPage();
  });

  it('handles SSO-only organization click', async () => {
    // Mocked dependencies and data
    const istToken = 'ist_token';

    const organization = {
      organization_id: 'org-id-123',
      organization_slug: 'sso-org-slug',
      allowed_auth_methods: ['sso'],
      sso_default_connection_id: 'sso-conn-id',
      organization_name: 'SSO Only Org',
    };

    client.magicLinks.discovery.authenticate.mockResolvedValue({
      intermediate_session_token: istToken,
      email: MOCK_EMAIL,
      discovered_organizations: [
        {
          organization: organization,
          membership: {
            type: 'active_member',
            member: { member_id: 'mock_user_id', email_address: MOCK_EMAIL },
          },
          member_authenticated: false,
          mfa_required: {},
          primary_required: {
            allowed_auth_methods: ['sso'],
          },
        },
      ],
    });

    const stytchToken = 'token';
    setWindowLocation(`http://localhost/authenticate?stytch_token_type=discovery&token=${stytchToken}`);

    // Render the component
    await renderFlow({
      config: {
        ...config,
        products: [emailMagicLinks, sso, passwords],
      },
      client,
    });

    // Wait for the organization selection screen
    await waitFor(() => {
      screen.getByText('Select an organization to continue');
    });

    // Click on the organization
    await clickSSOOnlyOrg();

    // Assert that the correct SSO function is called
    expect(client.sso.start).toHaveBeenCalledTimes(1);
    expect(client.sso.start).toHaveBeenCalledWith({
      connection_id: 'sso-conn-id',
      login_redirect_url: config.ssoOptions.loginRedirectURL,
      signup_redirect_url: config.ssoOptions.signupRedirectURL,
    });
  });

  it('handles unauthenticated discovery (SSO + passwords)', async () => {
    // Mocked dependencies and data
    const istToken = 'ist_token';

    const organization = {
      organization_id: 'org-id-123',
      organization_slug: 'org-slug',
      allowed_auth_methods: ['sso', 'password'],
      sso_default_connection_id: 'sso-conn-id',
      organization_name: 'Mock Org',
      auth_methods: 'RESTRICTED',
      sso_active_connections: [],
    };

    const mockAuthResponse = { member_email_id: 'email-12345', member_session: {} };

    client.magicLinks.discovery.authenticate.mockResolvedValue({
      intermediate_session_token: istToken,
      email: MOCK_EMAIL,
      discovered_organizations: [
        {
          organization: organization,
          membership: {
            type: 'active_member',
            member: {
              member_id: 'mock_user_id',
              email_address: MOCK_EMAIL,
              member_password_id: 'mock_password_id',
            },
          },
          member_authenticated: false,
          mfa_required: {},
          primary_required: {
            allowed_auth_methods: organization.allowed_auth_methods,
          },
        },
      ],
    });
    client.passwords.authenticate.mockResolvedValue(mockAuthResponse);

    const callbacks = {
      onEvent: jest.fn(),
      onError: jest.fn(),
    };

    const stytchToken = 'token';
    setWindowLocation(`http://localhost/authenticate?stytch_token_type=discovery&token=${stytchToken}`);

    // Render the component
    await renderFlow({
      config: {
        ...config,
        products: [emailMagicLinks, sso, passwords],
      },
      client,
      callbacks,
    });

    expect(callbacks.onEvent).toHaveBeenCalledTimes(1);
    expect(callbacks.onEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'B2B_MAGIC_LINK_DISCOVERY_AUTHENTICATE' }),
    );
    callbacks.onEvent.mockClear();

    // Wait for the organization selection screen
    await waitFor(() => {
      screen.getByText('Select an organization to continue');
    });

    // Click on the organization
    await userEvent.click(screen.getByRole('button', { name: /Mock Org/ }));

    await waitFor(() => {
      screen.getByText('Continue to Mock Org');
    });

    expect(screen.getByRole<HTMLInputElement>('textbox').value).toBe(MOCK_EMAIL);

    await changePassword(MOCK_PASSWORD);
    await clickContinue();
    await waitForLoggedInPage();

    expect(client.sso.start).not.toHaveBeenCalled();

    expect(client.passwords.authenticate).toHaveBeenCalledWith({
      email_address: MOCK_EMAIL,
      organization_id: organization.organization_id,
      password: MOCK_PASSWORD,
      session_duration_minutes: 10,
    });

    expect(callbacks.onEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: StytchEventType.B2BPasswordAuthenticate, data: mockAuthResponse }),
    );
    await waitFor(() => {
      expect(callbacks.onEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: StytchEventType.AuthenticateFlowComplete, data: {} }),
      );
    });
    expect(callbacks.onEvent).toHaveBeenCalledTimes(2);
  });
});
