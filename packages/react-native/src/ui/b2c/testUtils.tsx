import { BootstrapData } from '@stytch/core';
import { StytchProjectConfigurationInput } from '@stytch/core/public';
import { render, RenderOptions } from '@testing-library/react-native';
import React from 'react';

import { StytchClient } from '../../StytchClient';
import { DEFAULT_UI_CONFIG } from './config';
import { AppContext, GlobalContext } from './ContextProvider';
import { DEFAULT_UI_STATE } from './states';

export type ProviderProps = AppContext<StytchProjectConfigurationInput> & {
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
  client: {} as StytchClient<StytchProjectConfigurationInput>,
  config: DEFAULT_UI_CONFIG.productConfig,
  state: [DEFAULT_UI_STATE, () => null],
  theme: DEFAULT_UI_CONFIG.styles!.lightTheme,
  bootstrapData: {} as BootstrapData,
  platform: undefined,
  children: <></>,
};

export function flushPromises(): Promise<void> {
  return new Promise(jest.requireActual('timers').setImmediate);
}
