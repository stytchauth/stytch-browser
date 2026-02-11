import { AuthFlowType } from '@stytch/core/public';
import userEvent from '@testing-library/user-event';

import { screen, waitFor } from '../../../testUtils';
import { emailMagicLinks, sso } from '../../b2b/B2BProducts';
import {
  changeEmail,
  clickContinueWithEmail,
  clickTryAgainButton,
  MockClient,
  MockConfig,
  renderFlow,
  setWindowLocation,
  waitForConfirmationPage,
  waitForLoggedInPage,
  waitForMfaEnrollmentScreen,
} from './helpers';

const MOCK_EMAIL = 'example@email.com';

describe('Organization Flow', () => {
  const validOrganizationSlugAndId = 'organization';
  const invalidOrganizationSlug = 'bad-organization';
  const ssoAuthenticateMock = jest.fn();
  const magicLinkAuthenticateMock = jest.fn();
  const client = {
    organization: {
      getBySlug: jest.fn(({ organization_slug }: { organization_slug: string }) => {
        if (organization_slug === invalidOrganizationSlug) {
          return Promise.resolve({
            organization: null,
          });
        }

        // TODO: The config still causes the slug to be parsed out as `organization/authenticate` which doesn't seem right
        return Promise.resolve({
          organization: {
            organization_id: organization_slug,
            organization_name: organization_slug,
            sso_active_connections: [{ display_name: 'SSO', connection_id: organization_slug }],
            email_allowed_domains: ['example.com'],
            email_jit_provisioning: 'RESTRICTED',
          },
        });
      }),
    },
    magicLinks: {
      email: {
        loginOrSignup: jest.fn().mockResolvedValue(undefined),
      },
      authenticate: magicLinkAuthenticateMock,
    },
    sso: {
      start: jest.fn().mockResolvedValue(undefined),
      authenticate: ssoAuthenticateMock,
    },
  } satisfies MockClient;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Slug Handling', () => {
    const config: MockConfig = {
      products: [emailMagicLinks],
      authFlowType: AuthFlowType.Organization,
    };

    const bootstrap = {
      emailDomains: ['example.com'],
      slugPattern: 'http://localhost/{{slug}}',
    };

    it('Successfully handles a slug in the URL', async () => {
      setWindowLocation(`http://localhost/${validOrganizationSlugAndId}`);

      await renderFlow({ config, bootstrap, client });

      await waitFor(async () => {
        screen.getByText('Continue with email');
      });
    });

    it('Shows an error screen when the organization is not found', async () => {
      setWindowLocation(`http://localhost/${invalidOrganizationSlug}`);

      await renderFlow({ config, bootstrap, client });

      await waitFor(async () => {
        screen.getByText('The organization you are looking for could not be found.', { exact: false });
      });
    });

    it('Shows an error screen when no slug is specified', async () => {
      setWindowLocation('http://localhost/');

      await renderFlow({ config, bootstrap, client });

      await waitFor(async () => {
        screen.getByText('The organization you are looking for could not be found.', { exact: false });
      });
    });

    it('Shows an error screen when slug pattern does not match', async () => {
      setWindowLocation('http://localhost/not-a-match');

      await renderFlow({ config, bootstrap: { ...bootstrap, slugPattern: null }, client });

      await waitFor(async () => {
        screen.getByText('The organization you are looking for could not be found.', { exact: false });
      });
    });
  });

  describe('Magic Links Flow', () => {
    const config: MockConfig = {
      products: [emailMagicLinks],
      authFlowType: AuthFlowType.Organization,
      emailMagicLinksOptions: {
        loginRedirectURL: 'https://example.com/authenticate',
        signupRedirectURL: 'https://example.com/sign-up',
      },
      sessionOptions: {
        sessionDurationMinutes: 10,
      },
    };

    const bootstrap = {
      emailDomains: ['example.com'],
      slugPattern: 'http://localhost/{{slug}}',
    } as any;

    it('Successfully handles a magic link send', async () => {
      setWindowLocation(`http://localhost/${validOrganizationSlugAndId}`);

      await renderFlow({ config, client, bootstrap });

      await screen.findByLabelText('Email');

      await changeEmail(MOCK_EMAIL);
      await clickContinueWithEmail();
      await waitForConfirmationPage();

      expect(client.magicLinks.email.loginOrSignup).toHaveBeenCalledTimes(1);
      expect(client.magicLinks.email.loginOrSignup).toHaveBeenCalledWith({
        email_address: MOCK_EMAIL,
        organization_id: validOrganizationSlugAndId,
        login_redirect_url: 'https://example.com/authenticate',
        signup_redirect_url: 'https://example.com/sign-up',
      });
    });

    it('Returns to the main screen when the user clicks Try Again', async () => {
      setWindowLocation(`http://localhost/${validOrganizationSlugAndId}`);

      await renderFlow({ config, client, bootstrap });

      await screen.findByLabelText('Email');

      await changeEmail(MOCK_EMAIL);
      await clickContinueWithEmail();
      await waitForConfirmationPage();
      await clickTryAgainButton();

      await waitFor(async () => {
        screen.getByText('Continue with email');
      });
    });

    it('Successfully authenticates a magic link token', async () => {
      client.magicLinks.authenticate.mockResolvedValue({ member_session: {} });

      const stytchToken = 'token';

      setWindowLocation(
        `http://localhost/${validOrganizationSlugAndId}/authenticate?stytch_token_type=multi_tenant_magic_links&token=${stytchToken}`,
      );

      await renderFlow({ config, client, bootstrap });

      await waitForLoggedInPage();

      expect(client.magicLinks.authenticate).toHaveBeenCalledTimes(1);
      expect(client.magicLinks.authenticate).toHaveBeenCalledWith({
        magic_links_token: stytchToken,
        session_duration_minutes: 10,
      });
    });

    it('Shows the error screen when magic links authenticate does not return a session', async () => {
      client.magicLinks.authenticate.mockResolvedValue({
        member_session: null,
        member: {
          mfa_enrolled: false,
        },
        organization: { organization_id: validOrganizationSlugAndId, mfa_methods: 'ALL_ALLOWED' },
      });

      const stytchToken = 'token';

      setWindowLocation(
        `http://localhost/${validOrganizationSlugAndId}/authenticate?stytch_token_type=multi_tenant_magic_links&token=${stytchToken}`,
      );

      await renderFlow({ config, client, bootstrap });

      await waitForMfaEnrollmentScreen();

      expect(client.magicLinks.authenticate).toHaveBeenCalledTimes(1);
      expect(client.magicLinks.authenticate).toHaveBeenCalledWith({
        magic_links_token: stytchToken,
        session_duration_minutes: 10,
      });
    });
  });

  describe('SSO Flow', () => {
    const config: MockConfig = {
      products: [sso],
      authFlowType: AuthFlowType.Organization,
      ssoOptions: {
        loginRedirectURL: 'https://example.com/authenticate',
        signupRedirectURL: 'https://example.com/sign-up',
      },
      sessionOptions: {
        sessionDurationMinutes: 10,
      },
    };

    const bootstrap = {
      emailDomains: ['example.com'],
      slugPattern: 'http://localhost/{{slug}}',
    } as any;

    it('Successfully handles SSO start', async () => {
      setWindowLocation(`http://localhost/${validOrganizationSlugAndId}`);

      await renderFlow({ config, client, bootstrap });

      expect(await screen.findByText('Continue with SSO')).toBeTruthy();

      await userEvent.click(screen.getByRole('button', { name: 'Continue with SSO' }));

      expect(client.sso.start).toHaveBeenCalledTimes(1);
      expect(client.sso.start).toHaveBeenCalledWith({
        connection_id: validOrganizationSlugAndId,
        login_redirect_url: 'https://example.com/authenticate',
        signup_redirect_url: 'https://example.com/sign-up',
      });
    });

    it('Successfully authenticates an sso token', async () => {
      client.sso.authenticate.mockResolvedValue({ member_session: {} });

      const stytchToken = 'token';

      setWindowLocation(
        `http://localhost/${validOrganizationSlugAndId}/authenticate?stytch_token_type=sso&token=${stytchToken}`,
      );

      await renderFlow({ config, client, bootstrap });

      await waitForLoggedInPage();

      expect(client.sso.authenticate).toHaveBeenCalledTimes(1);
      expect(client.sso.authenticate).toHaveBeenCalledWith({
        sso_token: stytchToken,
        session_duration_minutes: 10,
      });
    });

    it('Shows the error screen when SSO authenticate does not return a session', async () => {
      client.sso.authenticate.mockResolvedValue({
        member_session: null,
        member: {
          mfa_enrolled: false,
        },
        organization: { organization_id: validOrganizationSlugAndId, mfa_methods: 'ALL_ALLOWED' },
      });

      const stytchToken = 'token';

      setWindowLocation(
        `http://localhost/${validOrganizationSlugAndId}/authenticate?stytch_token_type=sso&token=${stytchToken}`,
      );

      await renderFlow({ config, client, bootstrap });

      await waitForMfaEnrollmentScreen();

      expect(client.sso.authenticate).toHaveBeenCalledTimes(1);
      expect(client.sso.authenticate).toHaveBeenCalledWith({
        sso_token: stytchToken,
        session_duration_minutes: 10,
      });
    });
  });
});
