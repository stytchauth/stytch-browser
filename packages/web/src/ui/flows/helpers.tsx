import { BootstrapData } from '@stytch/core';
import { Callbacks } from '@stytch/core/public';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { messages } from '../../messages/en';
import { MockClient, MockConfig, MockGlobalContextProvider, render, screen, waitFor } from '../../testUtils';
import { IconNames } from '../b2c/components/Icons';
import Container from '../b2c/Container';
import { I18nProviderWrapper } from '../components/atoms/I18nProviderWrapper';
import { IconRegistry } from '../components/IconRegistry';
import { PresentationContext, usePresentationWithDefault } from '../components/PresentationConfig';

type FlowDefinition = {
  config?: MockConfig;
  client?: MockClient;
  callbacks?: Callbacks;
  bootstrap?: BootstrapData;
};

const ContainerWithProviders = ({ config, client, callbacks, bootstrap }: FlowDefinition) => {
  const presentationValue = usePresentationWithDefault(undefined, false, {
    products: (config?.products as { id: string; icons?: Partial<IconRegistry<IconNames>> }[]) ?? [],
    enableShadowDOM: false,
  });

  return (
    <MockGlobalContextProvider config={config} client={client} callbacks={callbacks} bootstrap={bootstrap}>
      <I18nProviderWrapper messages={messages}>
        <PresentationContext.Provider value={presentationValue}>
          <Container />
        </PresentationContext.Provider>
      </I18nProviderWrapper>
    </MockGlobalContextProvider>
  );
};

export const renderFlow = ({ config, client, callbacks, bootstrap }: FlowDefinition) => {
  return render(<ContainerWithProviders config={config} client={client} callbacks={callbacks} bootstrap={bootstrap} />);
};

export const changeEmail = async (email: string) => {
  await userEvent.type(screen.getByPlaceholderText('example@email.com'), email);
};

export const clickContinueWithEmail = async () => {
  await userEvent.click(screen.getByText('Continue with email'));
};

export const waitForConfirmationPage = async () => {
  await waitFor(() => {
    screen.getByText('Check your email');
  });
};

export const clickGoBackButton = async () => {
  await userEvent.click(screen.getByText('Go back'));
};
