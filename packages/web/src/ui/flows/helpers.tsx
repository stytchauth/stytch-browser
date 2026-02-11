import { BootstrapData } from '@stytch/core';
import { Callbacks } from '@stytch/core/public';
import type { RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { messages } from '../../messages/en';
import { MockClient, MockConfig, MockGlobalContextProvider, render, screen, waitFor } from '../../testUtils';
import Container from '../b2c/Container';
import { I18nProviderWrapper } from '../components/atoms/I18nProviderWrapper';

type FlowDefinition = {
  config?: MockConfig;
  client?: MockClient;
  callbacks?: Callbacks;
  bootstrap?: BootstrapData;
};
const renderAppWithConfig = ({ config, client, callbacks, bootstrap }: FlowDefinition): RenderResult =>
  render(
    <MockGlobalContextProvider config={config} client={client} callbacks={callbacks} bootstrap={bootstrap}>
      <I18nProviderWrapper messages={messages}>
        <Container />
      </I18nProviderWrapper>
    </MockGlobalContextProvider>,
  );

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

export const clickGoBackButton = async () => {
  await userEvent.click(screen.getByText('Go back'));
};
