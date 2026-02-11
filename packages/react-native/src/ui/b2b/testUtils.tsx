import { BootstrapData } from '@stytch/core';
import { AuthFlowType } from '@stytch/core/public';
import { render, RenderOptions } from '@testing-library/react-native';
import merge from 'lodash.merge';
import React, { useMemo, useReducer } from 'react';

import { StytchB2BClient } from '../../b2b/StytchB2BClient';
import { DEFAULT_BOOTSTRAP } from '../../BootstrapDataManager';
import { B2BInternals, writeB2BInternals } from '../../internals';
import { DEFAULT_DARK_THEME } from '../shared/config';
import { DEFAULT_UI_CONFIG, StytchRNB2BUIConfig } from './config';
import { AppContext, GlobalContext } from './ContextProvider';
import { GlobalReducer as reducer } from './reducers';
import { Screen } from './screens';
import { DEFAULT_UI_STATE, UIState } from './states';

export type ProviderProps = AppContext & {
  children: React.ReactNode;
};

const TestProvider = ({ client, config, theme, state, bootstrapData, platform, children }: ProviderProps) => {
  return (
    <GlobalContext.Provider value={{ client, state, config, theme, bootstrapData, platform }}>
      {children}
    </GlobalContext.Provider>
  );
};

const customRender = (props: ProviderProps) => (ui: React.ReactElement, options?: RenderOptions) => {
  render(<TestProvider {...props}>{ui}</TestProvider>, { ...options });
};

export * from '@testing-library/react-native';

// override render method
export { customRender as render };

export const DEFAULT_RENDER_PROPS: ProviderProps = {
  client: {} as StytchB2BClient,
  config: DEFAULT_UI_CONFIG,
  state: [DEFAULT_UI_STATE, () => null],
  theme: DEFAULT_UI_CONFIG.styles!.lightTheme,
  bootstrapData: {} as BootstrapData,
  platform: undefined,
  children: <></>,
};

export function flushPromises(): Promise<void> {
  return new Promise(jest.requireActual('timers').setImmediate);
}

export type DeepPartial<K> = {
  [attr in keyof K]?: K[attr] extends object ? DeepPartial<K[attr]> : K[attr];
};

export type MockConfig = DeepPartial<StytchRNB2BUIConfig>;
export type MockClient = DeepPartial<StytchB2BClient>;
export type MockState = DeepPartial<UIState>;
export type MockBootstrap = DeepPartial<BootstrapData>;
const defaultClient = {} as StytchB2BClient;
export const MockGlobalContextProvider = ({
  children,
  config,
  state,
  client,
  bootstrap,
  internals,
}: {
  children: React.ReactNode;
  config?: MockConfig;
  state?: MockState;
  client?: MockClient;
  bootstrap?: BootstrapData;
  internals?: DeepPartial<B2BInternals>;
}) => {
  const finalConfig = useMemo(() => merge({}, DEFAULT_UI_CONFIG, config), [config]);
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
    return cli;
  }, [client, bootstrap, internals]);

  const initialState: UIState = {
    ...DEFAULT_UI_STATE,
    screen:
      state?.authenticationState?.authFlowType === AuthFlowType.PasswordReset ? Screen.PasswordResetForm : Screen.Main,
    authenticationState: {
      ...DEFAULT_UI_STATE.authenticationState,
      authFlowType: state?.authenticationState?.authFlowType ?? AuthFlowType.Organization,
    },
  };
  const appState = useReducer(reducer, merge({}, initialState, state));
  const AppContext = {
    config: finalConfig,
    state: appState,
    client: stytchClient,
    theme: DEFAULT_DARK_THEME,
    bootstrapData: DEFAULT_BOOTSTRAP(),
  };

  return <GlobalContext.Provider value={AppContext}>{children}</GlobalContext.Provider>;
};
