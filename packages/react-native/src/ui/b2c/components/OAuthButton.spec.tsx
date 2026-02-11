import React from 'react';
import { OAuthButton } from './OAuthButton';
import { render, DEFAULT_RENDER_PROPS, screen } from '../testUtils';
import { OAuthProviders } from '@stytch/core/public';

const DEPRECATED_OPTIONS = { providers: [] };

describe('OAuthButton', () => {
  it('Renders the appropriate image for a given provider', () => {
    render(DEFAULT_RENDER_PROPS)(
      <OAuthButton provider={OAuthProviders.Amazon} deprecatedOptions={DEPRECATED_OPTIONS} />,
    );
    expect(screen.getByTestId('Amazon')).toBeTruthy();
    render(DEFAULT_RENDER_PROPS)(
      <OAuthButton provider={OAuthProviders.Apple} deprecatedOptions={DEPRECATED_OPTIONS} />,
    );
    expect(screen.getByTestId('Apple')).toBeTruthy();
    render(DEFAULT_RENDER_PROPS)(
      <OAuthButton provider={OAuthProviders.Bitbucket} deprecatedOptions={DEPRECATED_OPTIONS} />,
    );
    expect(screen.getByTestId('Bitbucket')).toBeTruthy();
    render(DEFAULT_RENDER_PROPS)(
      <OAuthButton provider={OAuthProviders.Coinbase} deprecatedOptions={DEPRECATED_OPTIONS} />,
    );
    expect(screen.getByTestId('Coinbase')).toBeTruthy();
    render(DEFAULT_RENDER_PROPS)(
      <OAuthButton provider={OAuthProviders.Discord} deprecatedOptions={DEPRECATED_OPTIONS} />,
    );
    expect(screen.getByTestId('Discord')).toBeTruthy();
    render(DEFAULT_RENDER_PROPS)(
      <OAuthButton provider={OAuthProviders.Facebook} deprecatedOptions={DEPRECATED_OPTIONS} />,
    );
    expect(screen.getByTestId('Facebook')).toBeTruthy();
    render(DEFAULT_RENDER_PROPS)(
      <OAuthButton provider={OAuthProviders.Figma} deprecatedOptions={DEPRECATED_OPTIONS} />,
    );
    expect(screen.getByTestId('Figma')).toBeTruthy();
    render(DEFAULT_RENDER_PROPS)(
      <OAuthButton provider={OAuthProviders.GitLab} deprecatedOptions={DEPRECATED_OPTIONS} />,
    );
    expect(screen.getByTestId('Gitlab')).toBeTruthy();
    render(DEFAULT_RENDER_PROPS)(
      <OAuthButton provider={OAuthProviders.Github} deprecatedOptions={DEPRECATED_OPTIONS} />,
    );
    expect(screen.getByTestId('Github')).toBeTruthy();
    render(DEFAULT_RENDER_PROPS)(
      <OAuthButton provider={OAuthProviders.Google} deprecatedOptions={DEPRECATED_OPTIONS} />,
    );
    expect(screen.getByTestId('Google')).toBeTruthy();
    render(DEFAULT_RENDER_PROPS)(
      <OAuthButton provider={OAuthProviders.LinkedIn} deprecatedOptions={DEPRECATED_OPTIONS} />,
    );
    expect(screen.getByTestId('Linkedin')).toBeTruthy();
    render(DEFAULT_RENDER_PROPS)(
      <OAuthButton provider={OAuthProviders.Microsoft} deprecatedOptions={DEPRECATED_OPTIONS} />,
    );
    expect(screen.getByTestId('Microsoft')).toBeTruthy();
    render(DEFAULT_RENDER_PROPS)(
      <OAuthButton provider={OAuthProviders.Salesforce} deprecatedOptions={DEPRECATED_OPTIONS} />,
    );
    expect(screen.getByTestId('Salesforce')).toBeTruthy();
    render(DEFAULT_RENDER_PROPS)(
      <OAuthButton provider={OAuthProviders.Slack} deprecatedOptions={DEPRECATED_OPTIONS} />,
    );
    expect(screen.getByTestId('Slack')).toBeTruthy();
    render(DEFAULT_RENDER_PROPS)(
      <OAuthButton provider={OAuthProviders.Snapchat} deprecatedOptions={DEPRECATED_OPTIONS} />,
    );
    expect(screen.getByTestId('Snapchat')).toBeTruthy();
    render(DEFAULT_RENDER_PROPS)(
      <OAuthButton provider={OAuthProviders.TikTok} deprecatedOptions={DEPRECATED_OPTIONS} />,
    );
    expect(screen.getByTestId('Tiktok')).toBeTruthy();
    render(DEFAULT_RENDER_PROPS)(
      <OAuthButton provider={OAuthProviders.Twitch} deprecatedOptions={DEPRECATED_OPTIONS} />,
    );
    expect(screen.getByTestId('Twitch')).toBeTruthy();
    render(DEFAULT_RENDER_PROPS)(
      <OAuthButton provider={OAuthProviders.Twitter} deprecatedOptions={DEPRECATED_OPTIONS} />,
    );
    expect(screen.getByTestId('Twitter')).toBeTruthy();
    render(DEFAULT_RENDER_PROPS)(
      <OAuthButton provider={OAuthProviders.Yahoo} deprecatedOptions={DEPRECATED_OPTIONS} />,
    );
    expect(screen.getByTestId('Yahoo')).toBeTruthy();
  });
});
