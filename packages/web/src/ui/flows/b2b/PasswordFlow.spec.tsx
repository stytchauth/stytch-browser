import { AuthFlowType, Callbacks, StytchEventType } from '@stytch/core/public';
import { MOCK_DISCOVERED_ORGANIZATION } from '@stytch/internal-mocks';
import { waitFor } from '@testing-library/react';

import { screen } from '../../../testUtils';
import { emailMagicLinks, passwords } from '../../b2b/B2BProducts';
import {
  changeEmail,
  changePassword,
  clickContinue,
  clickGetHelpButton,
  clickUsePasswordInstead,
  MockBootstrap,
  MockClient,
  MockConfig,
  renderFlow,
  setWindowLocation,
  waitForEmailPasswordLoginScreen,
  waitForLoggedInPage,
  waitForMfaEnrollmentScreen,
} from './helpers';

describe('B2B Password Flow', () => {
  const MOCK_EMAIL = 'example@email.com';
  const MOCK_PASSWORD = 'lIzE9onk56$*';

  const config: MockConfig = {
    products: [emailMagicLinks, passwords],
    authFlowType: AuthFlowType.Organization,
    emailMagicLinksOptions: {
      loginRedirectURL: 'https://example.com/authenticate',
      signupRedirectURL: 'https://example.com/sign-up',
    },
    passwordOptions: {
      loginRedirectURL: 'https://example.com/authenticate',
      resetPasswordRedirectURL: 'https://example.com/reset',
      resetPasswordExpirationMinutes: 60,
    },
  };

  const callbacks: Callbacks = {
    onEvent: jest.fn(),
    onError: jest.fn(),
  };

  const bootstrap = {
    emailDomains: ['example.com'],
    slugPattern: 'http://localhost/{{slug}}',
  } as any;

  afterEach(() => {
    jest.resetAllMocks();
  });

  const baseClient = {
    organization: {
      getBySlug: ({ organization_slug }: { organization_slug: string }) =>
        Promise.resolve({
          organization: {
            organization_id: organization_slug,
            organization_name: organization_slug,
            sso_active_connections: [{ display_name: 'SSO', connection_id: organization_slug }],
            email_allowed_domains: ['example.com'],
            email_jit_provisioning: 'RESTRICTED',
          },
        }),
    },
  } satisfies MockClient;

  it('Successfully logs in as an existing user', async () => {
    const mockAuthResponse = { member_email_id: 'email-12345', member_session: {} };
    const client = {
      ...baseClient,
      passwords: {
        authenticate: jest.fn().mockResolvedValue(mockAuthResponse),
      },
    } satisfies MockClient;
    const organizationSlugAndId = 'organization';

    setWindowLocation(`http://localhost/${organizationSlugAndId}`);

    await renderFlow({ config, client, bootstrap, callbacks });

    await clickUsePasswordInstead();
    await waitForEmailPasswordLoginScreen();

    expect(callbacks.onEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: StytchEventType.B2BOrganizationsGetBySlug,
        data: {
          organization: expect.objectContaining({
            organization_id: organizationSlugAndId,
          }),
        },
      }),
    );
    expect(callbacks.onEvent).toHaveBeenCalledTimes(1);
    jest.mocked(callbacks.onEvent)!.mockClear();

    await changeEmail(MOCK_EMAIL);
    await changePassword(MOCK_PASSWORD);
    await clickContinue();
    await waitForLoggedInPage();

    expect(client.passwords?.authenticate).toHaveBeenCalledWith({
      email_address: MOCK_EMAIL,
      organization_id: organizationSlugAndId,
      password: MOCK_PASSWORD,
      session_duration_minutes: 60,
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

  it('Shows MFA enrollment screen if password authenticate does not return a session', async () => {
    const organizationSlugAndId = 'organization';

    const client = {
      ...baseClient,
      passwords: {
        authenticate: jest.fn().mockResolvedValue({
          member_email_id: 'email-12345',
          member_session: null,
          member: {
            mfa_enrolled: false,
          },
          organization: { organization_id: organizationSlugAndId, mfa_methods: 'ALL_ALLOWED' },
        }),
      },
    } satisfies MockClient;

    setWindowLocation(`http://localhost/${organizationSlugAndId}`);

    await renderFlow({ config, client, bootstrap, callbacks });

    await clickUsePasswordInstead();
    await waitForEmailPasswordLoginScreen();

    expect(callbacks.onEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: StytchEventType.B2BOrganizationsGetBySlug,
        data: {
          organization: expect.objectContaining({
            organization_id: organizationSlugAndId,
          }),
        },
      }),
    );
    expect(callbacks.onEvent).toHaveBeenCalledTimes(1);
    jest.mocked(callbacks.onEvent)!.mockClear();

    await changeEmail(MOCK_EMAIL);
    await changePassword(MOCK_PASSWORD);
    await clickContinue();
    await waitForMfaEnrollmentScreen();

    expect(client.passwords?.authenticate).toHaveBeenCalledWith({
      email_address: MOCK_EMAIL,
      organization_id: organizationSlugAndId,
      password: MOCK_PASSWORD,
      session_duration_minutes: 60,
    });
    expect(callbacks.onEvent).toHaveBeenCalledTimes(1);
  });

  it('Successfully starts the reset password flow', async () => {
    const client = {
      ...baseClient,
      passwords: {
        resetByEmailStart: jest.fn().mockResolvedValue({}),
      },
    } satisfies MockClient;

    const organizationSlugAndId = 'organization';

    setWindowLocation(`http://localhost/${organizationSlugAndId}`);

    await renderFlow({ config, client, bootstrap, callbacks });

    await clickUsePasswordInstead();
    await waitForEmailPasswordLoginScreen();
    await clickGetHelpButton();
    await changeEmail(MOCK_EMAIL);
    await clickContinue();

    expect(client.passwords.resetByEmailStart).toHaveBeenCalled();
    expect(client.passwords.resetByEmailStart).toHaveBeenCalledWith({
      email_address: MOCK_EMAIL,
      organization_id: organizationSlugAndId,
      login_redirect_url: config.passwordOptions?.loginRedirectURL,
      reset_password_expiration_minutes: config.passwordOptions?.resetPasswordExpirationMinutes,
      reset_password_redirect_url: config.passwordOptions?.resetPasswordRedirectURL,
      reset_password_template_id: config.passwordOptions?.resetPasswordTemplateId,
      verify_email_template_id: config.passwordOptions?.verifyEmailTemplateId,
    });
    expect(callbacks.onEvent).toHaveBeenCalled();
  });

  it('Successfully resets password', async () => {
    const client: MockClient = {
      passwords: {
        resetByEmail: jest.fn().mockResolvedValue({ member_session: {} }),
        strengthCheck: jest.fn().mockResolvedValue({
          valid_password: true,
          zxcvbn_feedback: {
            suggestions: [],
            warning: '',
          },
        }),
      },
    };
    const resetConfig: MockConfig = {
      products: [passwords],
      authFlowType: AuthFlowType.PasswordReset,
      emailMagicLinksOptions: {
        loginRedirectURL: 'https://example.com/authenticate',
        signupRedirectURL: 'https://example.com/sign-up',
      },
      passwordOptions: {
        loginRedirectURL: 'https://example.com/authenticate',
        resetPasswordRedirectURL: 'https://example.com/reset',
        resetPasswordExpirationMinutes: 60,
      },
    };

    const organizationSlugAndId = 'organization';

    setWindowLocation(
      `http://localhost/${organizationSlugAndId}?slug=pwd-test&stytch_token_type=multi_tenant_passwords&token=bR6xBruZ4rULG-k81hy5hASuJErQ2B8a_fFzqSh8ci3V`,
    );

    await renderFlow({ config: resetConfig, client, bootstrap, callbacks });
    await changePassword(MOCK_PASSWORD);
    await waitFor(async () => {
      expect(client.passwords?.strengthCheck).toHaveBeenCalledWith({
        password: MOCK_PASSWORD,
      });
    });
    await clickContinue();
    await waitForLoggedInPage();

    expect(client.passwords?.resetByEmail).toHaveBeenCalledWith({
      password: MOCK_PASSWORD,
      session_duration_minutes: 60,
      password_reset_token: 'bR6xBruZ4rULG-k81hy5hASuJErQ2B8a_fFzqSh8ci3V',
    });
  });

  it('Successfully resets password from magic link flow', async () => {
    const client: MockClient = {
      magicLinks: {
        authenticate: jest.fn().mockResolvedValue({ member_session: {} }),
      },
      passwords: {
        resetBySession: jest.fn().mockResolvedValue({ member_session: {} }),
        strengthCheck: jest.fn().mockResolvedValue({
          valid_password: true,
          zxcvbn_feedback: {
            suggestions: [],
            warning: '',
          },
        }),
      },
    };
    const resetConfig: MockConfig = {
      products: [passwords],
      authFlowType: AuthFlowType.PasswordReset,
      emailMagicLinksOptions: {
        loginRedirectURL: 'https://example.com/authenticate',
        signupRedirectURL: 'https://example.com/sign-up',
      },
      passwordOptions: {
        loginRedirectURL: 'https://example.com/authenticate',
        resetPasswordRedirectURL: 'https://example.com/reset',
        resetPasswordExpirationMinutes: 60,
      },
    };

    const organizationSlugAndId = 'organization';

    setWindowLocation(
      `http://localhost/${organizationSlugAndId}?slug=pwd-test&stytch_token_type=multi_tenant_magic_links&token=bR6xBruZ4rULG-k81hy5hASuJErQ2B8a_fFzqSh8ci3V`,
    );

    await renderFlow({ config: resetConfig, client, bootstrap, callbacks });
    await changePassword(MOCK_PASSWORD);
    await waitFor(async () => {
      expect(client.passwords?.strengthCheck).toHaveBeenCalledWith({
        password: MOCK_PASSWORD,
      });
    });
    await clickContinue();
    await waitForLoggedInPage();

    expect(client.passwords?.resetBySession).toHaveBeenCalledWith({
      password: MOCK_PASSWORD,
    });
  });

  it('Shows MFA enrollment screen if reset password does not return a session', async () => {
    const organizationSlugAndId = 'organization';

    const client: MockClient = {
      passwords: {
        resetByEmail: jest.fn().mockResolvedValue({
          member_session: null,
          member: {
            mfa_enrolled: false,
          },
          organization: { organization_id: organizationSlugAndId, mfa_methods: 'ALL_ALLOWED' },
        }),
        strengthCheck: jest.fn().mockResolvedValue({
          valid_password: true,
          zxcvbn_feedback: {
            suggestions: [],
            warning: '',
          },
        }),
      },
    };
    const resetConfig: MockConfig = {
      products: [passwords],
      authFlowType: AuthFlowType.PasswordReset,
      emailMagicLinksOptions: {
        loginRedirectURL: 'https://example.com/authenticate',
        signupRedirectURL: 'https://example.com/sign-up',
      },
      passwordOptions: {
        loginRedirectURL: 'https://example.com/authenticate',
        resetPasswordRedirectURL: 'https://example.com/reset',
        resetPasswordExpirationMinutes: 60,
      },
    };

    setWindowLocation(
      `http://localhost/${organizationSlugAndId}?slug=pwd-test&stytch_token_type=multi_tenant_passwords&token=bR6xBruZ4rULG-k81hy5hASuJErQ2B8a_fFzqSh8ci3V`,
    );

    await renderFlow({ config: resetConfig, client, bootstrap, callbacks });
    await changePassword(MOCK_PASSWORD);
    await waitFor(async () => {
      expect(client.passwords?.strengthCheck).toHaveBeenCalledWith({
        password: MOCK_PASSWORD,
      });
    });
    await clickContinue();
    await waitForMfaEnrollmentScreen();

    expect(client.passwords?.resetByEmail).toHaveBeenCalledWith({
      password: MOCK_PASSWORD,
      session_duration_minutes: 60,
      password_reset_token: 'bR6xBruZ4rULG-k81hy5hASuJErQ2B8a_fFzqSh8ci3V',
    });
  });

  it('should not automatically create organization when directCreateOrganizationForNoMembership is enabled and there are orgs', async () => {
    const istToken = 'ist_token';

    const discoveryClient = {
      magicLinks: {
        discovery: {
          authenticate: jest.fn().mockResolvedValue({
            intermediate_session_token: istToken,
            email: MOCK_EMAIL,
            discovered_organizations: [MOCK_DISCOVERED_ORGANIZATION],
          }),
        },
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

    const discoveryConfig: MockConfig = {
      products: [passwords],
      authFlowType: AuthFlowType.Discovery,
      passwordOptions: {
        loginRedirectURL: 'https://example.com/authenticate',
        resetPasswordRedirectURL: 'https://example.com/reset-password',
      },
      directCreateOrganizationForNoMembership: true,
    };

    const bootstrapCreateEnabled = {
      createOrganizationEnabled: true,
    } satisfies MockBootstrap;

    const stytchToken = 'token';
    setWindowLocation(`http://localhost/authenticate?stytch_token_type=discovery&token=${stytchToken}`);

    await renderFlow({
      config: discoveryConfig,
      client: discoveryClient,
      bootstrap: bootstrapCreateEnabled,
    });

    await waitFor(() => {
      screen.getByText('Select an organization to continue');
    });

    expect(discoveryClient.discovery.organizations.create).not.toHaveBeenCalled();
  });
});
