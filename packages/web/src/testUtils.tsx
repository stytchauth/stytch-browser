import { BootstrapData, ISyncPKCEManager } from '@stytch/core';
import { Callbacks, OrganizationBySlugMatch } from '@stytch/core/public';
import {
  createTestFixtures as coreCreateTestFixtures,
  IConsumerSubscriptionServiceMock,
  INetworkClientMock,
} from '@stytch/core/testUtils';
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  RenderOptions,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import merge from 'lodash.merge';
import React, { useMemo, useReducer } from 'react';

import { B2BOneTapProvider } from './b2b/oneTap/B2BOneTapProvider';
import { messages } from './messages/en';
import { OneTapProvider } from './oneTap/OneTapProvider';
import { StytchClient } from './StytchClient';
import { StytchLoginConfig } from './types';
import { AppState, DEFAULT_STATE, GlobalContext } from './ui/b2c/GlobalContextProvider';
import { emailMagicLinks } from './ui/b2c/Products';
import { reducer } from './ui/b2c/reducer';
import { I18nProviderWrapper } from './ui/components/atoms/I18nProviderWrapper';
import { PresentationContext, usePresentationWithDefault } from './ui/components/PresentationConfig';
import { createAuthUrlHandler } from './utils/createAuthUrlHandler';
import { writeB2CInternals } from './utils/internal';

export type DeepPartial<K> = {
  [attr in keyof K]?: K[attr] extends object ? DeepPartial<K[attr]> : K[attr];
};

export const MOCK_VERIFIER = '00000000000000000000000000000000';
export const MOCK_CHALLENGE = 'hODA6vqpWjTCk_J4rFLkXOU3urXnUqAOaVmhOuEDtlo';

export const MOCK_KEYPAIR = {
  code_challenge: MOCK_CHALLENGE,
  code_verifier: MOCK_VERIFIER,
};

export const MOCK_BOOTSTRAP_DATA = {
  projectName: 'test-project',
  displayWatermark: false,
  cnameDomain: null,
  emailDomains: ['stytch.com'],
  captchaSettings: { enabled: false },
  pkceRequiredForEmailMagicLinks: false,
  pkceRequiredForPasswordResets: false,
  pkceRequiredForOAuth: false,
  pkceRequiredForSso: false,
  slugPattern: null,
  createOrganizationEnabled: false,
  passwordConfig: null,
  runDFPProtectedAuth: false,
  rbacPolicy: null,
  siweRequiredForCryptoWallets: false,
  vertical: null,
} satisfies BootstrapData;

export const MOCK_TOTP_SECRET = 'WG2SAK2FPOPZRCWLOMELWTBCPAEGBFUO';
export const MOCK_QR_CODE_PNG_DATA =
  'data:image/png;base64,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';

export const MOCK_TOTP_RECOVERY_CODES = [
  '22o0-e6e9-plwt',
  'op50-5jj9-vojv',
  '7op2-cvtv-01r6',
  'ovlh-czcv-dppg',
  '1qnv-vdj8-eudw',
  'zwcn-dgu0-6dm9',
  'yxz5-fj6f-vc1u',
  '37ur-aflw-6o7n',
  '5wa5-0jgq-j40k',
  'md90-rqeo-ti2f',
];

export const MOCK_ORGANIZATION = {
  allowed_auth_methods: [],
  auth_methods: 'ALL_ALLOWED',
  email_allowed_domains: ['example.com'],
  email_jit_provisioning: 'RESTRICTED',
  organization_id: 'fake-organization-id',
  organization_logo_url: '',
  organization_name: 'Fake Organization',
  organization_slug: 'fake-organization',
  sso_active_connections: [],
  sso_default_connection_id: null,
  mfa_policy: 'OPTIONAL',
  allowed_oauth_tenants: {},
  oauth_tenant_jit_provisioning: 'RESTRICTED',
} as const satisfies OrganizationBySlugMatch;

const createOneTap = () =>
  ({
    createOneTapClient: jest.fn(() => ({
      success: true,
      client: {
        render: jest.fn(() => ({ success: true })),
        cancel: jest.fn(),
      },
    })),
    createOnSuccessHandler: jest.fn(),
    fetchGoogleStart: jest.fn(),
    submitGoogleOneTapToken: jest.fn(),
    redirectOnSuccess: jest.fn(),
  }) as unknown as OneTapProvider;

const createB2BOneTap = () =>
  ({
    createOneTapClient: jest.fn(),
    createOnDiscoverySuccessHandler: jest.fn(),
    fetchGoogleStart: jest.fn(),
    submitGoogleOneTapTokenDiscovery: jest.fn(),
    submitGoogleOneTapToken: jest.fn(),
    createOnSuccessHandler: jest.fn(),
    redirectOnSuccess: jest.fn(),
  }) as unknown as B2BOneTapProvider;

export const createTestFixtures = (): {
  networkClient: INetworkClientMock;
  subscriptionService: IConsumerSubscriptionServiceMock;
  pkceManager: ISyncPKCEManager;
  oneTap: OneTapProvider;
  b2bOneTap: B2BOneTapProvider;
} => {
  const { networkClient, subscriptionService, pkceManager } = coreCreateTestFixtures();

  return {
    networkClient,
    subscriptionService,
    pkceManager,
    oneTap: createOneTap(),
    b2bOneTap: createB2BOneTap(),
  };
};

export const setupSingleEthereumWallet = ({ metamask }: { metamask: boolean }) => {
  window.ethereum = { isMetaMask: metamask, request: jest.fn() };
};

export const setupSingleSolanaWallet = ({ phantom }: { phantom: boolean }) => {
  window.solana = {
    isPhantom: phantom,
    request: jest.fn(),
    connect: jest.fn(),
  };
};

export const setupSingleBinanceWallet = () => {
  window.BinanceChain = {
    request: jest.fn(),
  };
};

export const setupMultipleEthereumWallets = () => {
  window.ethereum = {
    providers: [
      {
        isMetaMask: true,
        request: jest.fn(),
      },
      {
        isCoinbaseWallet: true,
        request: jest.fn(),
      },
      {
        request: jest.fn(),
      },
    ],
  };
};

const defaultClient = {} as StytchClient;

export type MockConfig = DeepPartial<StytchLoginConfig>;
export type MockState = DeepPartial<AppState>;
export type MockClient = DeepPartial<StytchClient>;

export const DEFAULT_CONFIG: StytchLoginConfig = {
  products: [emailMagicLinks],
  emailMagicLinksOptions: {
    loginRedirectURL: '',
    loginExpirationMinutes: 30,
    signupRedirectURL: '',
    signupExpirationMinutes: 30,
    createUserAsPending: false,
  },
};

export const MockGlobalContextProvider = ({
  children,
  config,
  state,
  client,
  callbacks,
  bootstrap,
}: {
  children: React.ReactNode;
  config?: MockConfig;
  state?: MockState;
  client?: MockClient;
  callbacks?: Callbacks;
  bootstrap?: BootstrapData;
}) => {
  const finalConfig = useMemo(() => merge({}, DEFAULT_CONFIG, config), [config]);
  const stytchClient = useMemo(() => {
    const cli = merge({}, defaultClient, client);
    writeB2CInternals(cli, {
      bootstrap: {
        getAsync: () => Promise.resolve(bootstrap),
        getSync: () => bootstrap,
      },
      oneTap: createOneTap(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    Object.assign(
      cli,
      createAuthUrlHandler({
        magic_links: (token, options) => cli.magicLinks.authenticate(token, options),
        oauth: (token, options) => cli.oauth.authenticate(token, options),
        impersonation: (token: string) => cli.impersonation.authenticate({ impersonation_token: token }),
      }),
    );

    return cli;
  }, [client, bootstrap]);
  const appState = useReducer(reducer, merge({}, DEFAULT_STATE, state));
  const AppContext = {
    config: finalConfig,
    state: appState,
    client: stytchClient,
    callbacks,
  };

  return <GlobalContext.Provider value={AppContext}>{children}</GlobalContext.Provider>;
};

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const presentationValue = usePresentationWithDefault(undefined, false, { products: [] });

  return (
    <PresentationContext.Provider value={presentationValue}>
      <I18nProviderWrapper messages={messages}>{children}</I18nProviderWrapper>
    </PresentationContext.Provider>
  );
};

const customRender = (ui: React.ReactNode, options: RenderOptions = {}): ReturnType<typeof render> =>
  render(ui, { wrapper: AllTheProviders, ...options });

// No customization here yet, but this is a useful placeholder for the future
const customRenderHook = renderHook;

export { customRender as render, customRenderHook as renderHook };
export { act, cleanup, fireEvent, screen, waitFor, within };

export {
  createB2BTestFixtures,
  createResolvablePromise,
  MockDFPProtectedAuth,
  MockDFPProtectedAuthCaptchaOnly,
  MockDFPProtectedAuthDFPAndCaptcha,
  MockDFPProtectedAuthDFPOnly,
  MockDFPProtectedAuthDisabled,
} from '@stytch/core/testUtils';
