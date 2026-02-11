import { BootstrapData } from '@stytch/core';
import { AuthFlowType, Callbacks } from '@stytch/core/public';
import userEvent from '@testing-library/user-event';
import merge from 'lodash.merge';
import React, { useMemo, useReducer } from 'react';

import { HandledTokenType, StytchB2BClient } from '../../../b2b/StytchB2BClient';
import { messages } from '../../../messages/b2b/en';
import { MOCK_BOOTSTRAP_DATA, render, screen, waitFor } from '../../../testUtils';
import { StytchB2BExtendedLoginConfig } from '../../../types';
import { createAuthUrlHandler } from '../../../utils/createAuthUrlHandler';
import { B2BInternals, writeB2BInternals } from '../../../utils/internal';
import * as B2BProducts from '../../b2b/B2BProducts';
import Container from '../../b2b/Container';
import { DEFAULT_STATE, GlobalContext } from '../../b2b/GlobalContextProvider';
import { reducer } from '../../b2b/reducer';
import { AppScreens } from '../../b2b/types/AppScreens';
import { AppState } from '../../b2b/types/AppState';
import { I18nProviderWrapper } from '../../components/atoms/I18nProviderWrapper';

export const DEFAULT_CONFIG: StytchB2BExtendedLoginConfig = {
  products: [B2BProducts.emailMagicLinks],
  organizationProducts: Object.values(B2BProducts),
  authFlowType: AuthFlowType.Organization,
  sessionOptions: {
    sessionDurationMinutes: 60,
  },
};

type DeepPartial<K> = {
  [attr in keyof K]?: K[attr] extends object ? DeepPartial<K[attr]> : K[attr];
};

export type MockConfig = DeepPartial<StytchB2BExtendedLoginConfig>;
export type MockClient = DeepPartial<StytchB2BClient>;
export type MockState = DeepPartial<AppState>;
export type MockBootstrap = DeepPartial<BootstrapData>;

export type FlowDefinition = {
  config?: MockConfig;
  client?: MockClient;
  callbacks?: Callbacks;
  bootstrap?: MockBootstrap;
  internals?: DeepPartial<B2BInternals>;
  state?: MockState;
};
const defaultClient = {} as StytchB2BClient;

export const MockGlobalContextProvider = ({
  children,
  config,
  state,
  client,
  callbacks,
  bootstrap,
  internals,
}: {
  children: React.ReactNode;
  config?: MockConfig;
  state?: MockState;
  client?: MockClient;
  callbacks?: Callbacks;
  bootstrap?: BootstrapData;
  internals?: DeepPartial<B2BInternals>;
}) => {
  const finalConfig = useMemo(() => merge({}, DEFAULT_CONFIG, config), [config]);
  const stytchClient = useMemo(() => {
    const cli = merge({}, defaultClient, client);
    writeB2BInternals(
      cli,
      merge(
        {},
        {
          bootstrap: {
            getAsync: () => Promise.resolve(bootstrap),
            getSync: () => bootstrap,
          },
          searchManager: {
            searchMember: (email: string, organization_id: string) =>
              Promise.resolve({
                member: {
                  member_password_id: 'member-password-id',
                  organization_id: organization_id,
                  email_address: email,
                },
              }),
          },
          dataLayer: {
            getItem: (key: string) => {
              return key;
            },
          },
        } as DeepPartial<B2BInternals>,
        internals,
      ) as B2BInternals,
    );

    Object.assign(
      cli,
      createAuthUrlHandler<HandledTokenType>({
        discovery: (token) => cli.magicLinks.discovery.authenticate({ discovery_magic_links_token: token }),
        discovery_oauth: (token) => cli.oauth.discovery.authenticate({ discovery_oauth_token: token }),
        oauth: (token, options) => cli.sso.authenticate({ sso_token: token, ...options }),
        sso: (token, options) => cli.sso.authenticate({ sso_token: token, ...options }),
        multi_tenant_magic_links: (token, options) =>
          cli.magicLinks.authenticate({ magic_links_token: token, ...options }),
        multi_tenant_impersonation: (token) => cli.impersonation.authenticate({ impersonation_token: token }),
      }),
    );

    return cli;
  }, [client, bootstrap, internals]);

  const initialState: AppState = {
    ...DEFAULT_STATE,
    screen: config?.authFlowType === AuthFlowType.PasswordReset ? AppScreens.PasswordResetForm : AppScreens.Main,
    flowState: {
      ...DEFAULT_STATE.flowState,
      type: config?.authFlowType ?? AuthFlowType.Organization,
    },
  };
  const appState = useReducer(reducer, merge({}, initialState, state));
  const AppContext = {
    config: finalConfig,
    state: appState,
    client: stytchClient,
    callbacks,
  };

  return <GlobalContext.Provider value={AppContext}>{children}</GlobalContext.Provider>;
};

export const renderWithConfig = (
  children: React.ReactNode,
  { bootstrap, ...props }: FlowDefinition,
): ReturnType<typeof render> => {
  const bootstrapDataMerged = merge({}, MOCK_BOOTSTRAP_DATA, bootstrap);
  return render(
    <MockGlobalContextProvider {...props} bootstrap={bootstrapDataMerged}>
      <I18nProviderWrapper messages={messages}>{children}</I18nProviderWrapper>
    </MockGlobalContextProvider>,
  );
};

const renderAppWithConfig = ({
  config,
  client,
  callbacks,
  bootstrap,
  internals,
}: FlowDefinition): ReturnType<typeof render> => {
  return renderWithConfig(<Container />, { config, client, callbacks, bootstrap, internals });
};

export const renderFlow = async (definition: FlowDefinition) => {
  renderAppWithConfig(definition);
  await new Promise(process.nextTick);
};

export const changeEmail = async (email: string) => {
  await userEvent.type(screen.getByPlaceholderText('example@email.com'), email);
};

export const changePassword = async (password: string) => {
  await userEvent.type(screen.getByLabelText('Password'), password);
};

export const clickContinueWithEmail = async () => {
  await userEvent.click(screen.getByText('Continue with email'));
};

export const clickSSOOnlyOrg = async () => {
  await userEvent.click(screen.getByText('SSO Only Org'));
};

export const clickOkta = async () => {
  await userEvent.click(screen.getByText('Okta'));
};

export const clickCreateOrganization = async () => {
  await userEvent.click(screen.getByText('Create an organization'));
};

export const waitForConfirmationPage = async () => {
  await waitFor(() => {
    screen.getByText('Check your email');
  });
};

export const waitForLoggedInPage = async () => {
  await waitFor(() => {
    screen.getByText('You have successfully logged in.');
  });
};

export const waitForNoOrganizationCreateDisabled = async () => {
  await waitFor(() => {
    screen.getByText('Make sure your email address is correct. Otherwise, you might need to be invited by your admin.');
  });
};

export const waitForNoOrganizationCreateEnabled = async () => {
  await waitFor(() => {
    screen.getByText('Create an organization to get started');
  });
};

export const clickTryAgainButton = async () => {
  await userEvent.click(screen.getByText('Go back'));
};

export const clickUsePasswordInstead = async () => {
  await waitFor(() => {
    screen.getByText('Use a password instead');
  });
  await userEvent.click(await screen.findByText('Use a password instead'));
};

export const clickGetHelpButton = async () => {
  await userEvent.click(screen.getByText('Sign up or reset password'));
};

export const waitForEmailPasswordLoginScreen = async () => {
  await new Promise(process.nextTick);
  await waitFor(() => {
    screen.getByText('Log in with email and password');
  });
};

export const waitForMfaEnrollmentScreen = async () => {
  await new Promise(process.nextTick);
  await waitFor(() => {
    screen.getByText('Set up Multi-Factor Authentication');
  });
};

/**
 * TODO: Remove the manual enabling of the button.
 * Currently the state property is not being toggled when the mock client returns a valid password.
 */
export const clickContinue = async () => {
  const button = screen.getByRole('button', { name: 'Continue' });
  (button as HTMLButtonElement).disabled = false;
  await userEvent.click(button);
};

export const setWindowLocation = (location: string) => {
  jsdom.reconfigure({ url: location });
};
