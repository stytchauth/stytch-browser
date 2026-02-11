import { Callbacks } from '@stytch/core/public';
import React from 'react';
import { MockConfig, MockGlobalContextProvider, MockClient, render, screen, waitFor } from '../../testUtils';
import Container from '../b2c/Container';
import { BootstrapData } from '@stytch/core';
import userEvent from '@testing-library/user-event';
import { I18nProviderWrapper } from '../components/I18nProviderWrapper';
import { messages } from '../../messages/en';

type FlowDefinition = {
  config?: MockConfig;
  client?: MockClient;
  callbacks?: Callbacks;
  bootstrap?: BootstrapData;
};
const renderAppWithConfig = ({ config, client, callbacks, bootstrap }: FlowDefinition) => {
  return render(
    <MockGlobalContextProvider config={config} client={client} callbacks={callbacks} bootstrap={bootstrap}>
      <I18nProviderWrapper messages={messages}>
        <Container />
      </I18nProviderWrapper>
    </MockGlobalContextProvider>,
  );
};

export const renderFlow = (definition: FlowDefinition) => {
  return renderAppWithConfig(definition);
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

export const clickTryAgainButton = async () => {
  await userEvent.click(screen.getByText('Try again'));
};
