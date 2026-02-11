/* eslint-disable lingui/no-unlocalized-strings -- messages are only shown in test environments */

import React from 'react';

import { Values } from '../../../utils/types';
import Typography from '../atoms/Typography';

const RedirectUrlsErrorMessage = ({ niceName, variableName }: { niceName: string; variableName: string }) => (
  <Typography variant="body" color="destructive">
    One Tap cannot render because there are no {niceName} set for this project so we are unable to verify the{' '}
    <code>{variableName}</code>&nbsp; provided in the configuration. To set {niceName} for this project please
    visit&nbsp;
    <a href="https://stytch.com/dashboard/redirect-urls">the Stytch dashboard.</a>&nbsp; For more information on why
    this validation is necessary please visit&nbsp;
    <a href="https://stytch.com/docs/api/url-validation">https://stytch.com/docs/api/url-validation.</a>
  </Typography>
);

export const OneTapErrors = {
  // These come from the Google GSI Client
  OriginNotAllowedForClient: 'origin_not_allowed_for_client',
  InvalidOAuthClient: 'invalid_client',
  // These come from the API directly - err.error_type
  NoConfiguredOAuthClient: 'oauth_config_not_found',
  NoConfiguredLoginRedirectUrls: 'no_login_redirect_urls_set',
  NoConfiguredSignupRedirectUrls: 'no_signup_redirect_urls_set',
  DefaultProviderNotAllowed: 'default_provider_not_allowed',
};

export type OneTapErrors = Values<typeof OneTapErrors>;

export const ErrorMessages = ({ error }: { error: OneTapErrors }) => {
  switch (error) {
    case OneTapErrors.OriginNotAllowedForClient:
      return (
        <Typography variant="body" color="destructive">
          One Tap cannot render because the current host&nbsp;
          <code>{window.location.host}</code> is not allowed for this project. Make sure to put your project&apos;s host
          into the Google API console. When using localhost for development, you must add both&nbsp;
          <code>http://localhost</code> and&nbsp;
          <code>{`http://localhost:<port_number>`}</code>&nbsp; to the Authorized JavaScript origins box. You can learn
          more&nbsp;
          <a href="https://stytch.com/docs/sdks">here.</a>
        </Typography>
      );
    case OneTapErrors.InvalidOAuthClient:
      return (
        <Typography variant="body" color="destructive">
          One Tap cannot render because the client ID configured for your project is not recognized by Google. &nbsp;
          Please check that the client ID saved in{' '}
          <a href="https://stytch.com/dashboard/oauth/google">the Stytch Dashboard</a>&nbsp; matches the client ID in
          your Google Cloud Console.
        </Typography>
      );
    case OneTapErrors.NoConfiguredOAuthClient:
      return (
        <Typography variant="body" color="destructive">
          One Tap cannot render because no Google OAuth client configuration could be found for this project. Please
          make sure a client is configured in the&nbsp;
          <a href="https://stytch.com/dashboard/oauth">dashboard.</a>
        </Typography>
      );
    case OneTapErrors.NoConfiguredLoginRedirectUrls:
      return <RedirectUrlsErrorMessage niceName="login redirect URLs" variableName="oauthOptions.loginRedirectURL" />;
    case OneTapErrors.NoConfiguredSignupRedirectUrls:
      return <RedirectUrlsErrorMessage niceName="signup redirect URLs" variableName="oauthOptions.signupRedirectURL" />;
    case OneTapErrors.DefaultProviderNotAllowed:
      return (
        <Typography variant="body" color="destructive">
          One Tap cannot render because the Stytch Default OAuth Provider is not compatible with One Tap. Please
          configure your own Google client in the&nbsp;
          <a href="https://stytch.com/dashboard/oauth">dashboard.</a>
        </Typography>
      );
  }
};
