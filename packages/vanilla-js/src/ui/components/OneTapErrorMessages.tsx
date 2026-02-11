/* eslint-disable lingui/no-unlocalized-strings -- messages are only shown in test environments */

import React from 'react';
import { Text } from './Text';

const OAuthErrorMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div key="oauth-error-message">
    <Text color="error">{children}</Text>
  </div>
);

export const OneTapNoConfiguredClientsErrorMessage = () => (
  <OAuthErrorMessage>
    One Tap cannot render because no Google OAuth client configuration could be found for this project. Please make sure
    a client is configured in the&nbsp;
    <a href="https://stytch.com/dashboard/oauth">dashboard.</a>
  </OAuthErrorMessage>
);

const RedirectUrlsErrorMessage = ({ niceName, variableName }: { niceName: string; variableName: string }) => (
  <OAuthErrorMessage>
    One Tap cannot render because there are no {niceName} set for this project so we are unable to verify the{' '}
    <code>{variableName}</code>&nbsp; provided in the configuration. To set {niceName} for this project please
    visit&nbsp;
    <a href="https://stytch.com/dashboard/redirect-urls">the Stytch dashboard.</a>&nbsp; For more information on why
    this validation is necessary please visit&nbsp;
    <a href="https://stytch.com/docs/api/url-validation">https://stytch.com/docs/api/url-validation.</a>
  </OAuthErrorMessage>
);

export const OneTapNoConfiguredLoginRedirectUrlsErrorMessage = () => (
  <RedirectUrlsErrorMessage niceName="login redirect URLs" variableName="oauthOptions.loginRedirectURL" />
);

export const OneTapNoConfiguredSignupRedirectUrlsErrorMessage = () => (
  <RedirectUrlsErrorMessage niceName="signup redirect URLs" variableName="oauthOptions.signupRedirectURL" />
);

export const OneTapJSOriginErrorMessage = () => (
  <OAuthErrorMessage>
    One Tap cannot render because the current host&nbsp;
    <code>{`"${window.location.host}"`}</code> is not allowed for this project. Make sure to put your project&apos;s
    host into the Google API console. When using localhost for development, you must add both&nbsp;
    <code>http://localhost</code> and&nbsp;
    <code>{`http://localhost:<port_number>`}</code>&nbsp; to the Authorized JavaScript origins box. You can learn
    more&nbsp;
    <a href="https://stytch.com/docs/sdks">here.</a>
  </OAuthErrorMessage>
);

export const OneTapInvalidOAuthClient = () => (
  <OAuthErrorMessage>
    One Tap cannot render because the client ID configured for your project is not recognized by Google. &nbsp; Please
    check that the client ID saved in <a href="https://stytch.com/dashboard/oauth/google">the Stytch Dashboard</a>&nbsp;
    matches the client ID in your Google Cloud Console.
  </OAuthErrorMessage>
);

export const OneTapNoDefaultProviderAllowedErrorMessage = () => (
  <OAuthErrorMessage>
    One Tap cannot render because the Stytch Default OAuth Provider is not compatible with One Tap. Please configure
    your own Google client in the&nbsp;
    <a href="https://stytch.com/dashboard/oauth">dashboard.</a>
  </OAuthErrorMessage>
);
