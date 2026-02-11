import { AuthFlowType } from '@stytch/core/public';
import React, { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';

import { B2BErrorType } from '../../shared/types';
import { DividerWithText } from '../components/DividerWithText';
import { EmailForm } from '../components/EmailForm';
import { OAuthButtons } from '../components/OAuthButtons';
import { PageTitle } from '../components/PageTitle';
import { PasswordsEmailForm } from '../components/PasswordsEmailForm';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { SSOButtons } from '../components/SSOButtons';
import { UsePasswordButton } from '../components/UsePasswordButton';
import { useGlobalReducer, useTheme } from '../ContextProvider';
import { Component, generateProductComponentsOrdering } from '../generateProductComponentsOrdering';
import { useEffectiveAuthConfig } from '../hooks/useEffectiveAuthConfig';
import { Screen } from '.';

const ProductComponents = ({ components }: { components: Component[] }) => {
  const renderedComponents = components.map((component: Component, index: number) => {
    switch (component) {
      case Component.EmailForm:
        return <EmailForm key={component} action="loginOrSignup" />;
      case Component.EmailDiscoveryForm:
        return <EmailForm key={component} action="discoverySend" />;
      case Component.OAuthButtons:
        return <OAuthButtons key={component} />;
      case Component.SSOButtons:
        return <SSOButtons key={component} />;
      case Component.PasswordsEmailForm:
        return <PasswordsEmailForm key={component} />;
      case Component.PasswordEmailCombined:
        return (
          <View style={{ flexDirection: 'column', gap: 12 }} key="email_password">
            <EmailForm key={'email'} action="loginOrSignup" />
            <UsePasswordButton key={'password'} />
          </View>
        );
      case Component.PasswordEmailCombinedDiscovery:
        return (
          <View style={{ flexDirection: 'column', gap: 12 }} key="email_password_discovery">
            <EmailForm key={'email'} action="discoverySend" />
            <UsePasswordButton key={'password'} />
          </View>
        );
      case Component.Divider:
        return <DividerWithText key={`divider-${index}`} text="or" />;
    }
  });
  return <>{renderedComponents}</>;
};

const Logo = ({ orgLogo, appLogo }: { orgLogo: string; appLogo: string }) => {
  const [orgLogoSize, setOrgLogoSize] = useState({ width: 100, height: 50 });
  const [appLogoSize, setAppLogoSize] = useState({ width: 100, height: 50 });
  useEffect(() => {
    if (orgLogo) {
      Image.getSize(orgLogo, (width, height) => {
        setOrgLogoSize({ width: Math.min(100, width), height: Math.min(50, height) });
      });
    }
    if (appLogo) {
      Image.getSize(appLogo, (width, height) => {
        setAppLogoSize({ width: Math.min(100, width), height: Math.min(50, height) });
      });
    }
  }, [orgLogo, appLogo, setOrgLogoSize, setAppLogoSize]);
  if (!orgLogo && !appLogo) return <></>;
  return (
    <View style={{ justifyContent: 'center', alignItems: 'center', gap: 8 }}>
      {!!orgLogo && (
        <Image source={{ uri: orgLogo, width: orgLogoSize.width, height: orgLogoSize.height }} resizeMode="contain" />
      )}
      {!!appLogo && (
        <Image source={{ uri: appLogo, width: appLogoSize.width, height: appLogoSize.height }} resizeMode="contain" />
      )}
    </View>
  );
};

export const MainScreen = () => {
  const [state, dispatch] = useGlobalReducer();
  const theme = useTheme();
  const { primaryAuthMethods, email, emailVerified } = state.primaryAuthState;

  const { products } = useEffectiveAuthConfig();

  useEffect(() => {
    if (products.length === 0) {
      dispatch({ type: 'navigate/to', screen: Screen.Error, error: { internalError: B2BErrorType.NoValidProducts } });
    }
  }, [products, dispatch]);

  // Generate ordering and types of product components
  const ProductComponentsOrdering = generateProductComponentsOrdering(products, state.authenticationState);

  let title: string;
  switch (state.authenticationState.authFlowType) {
    case AuthFlowType.Discovery:
      title = 'Sign up or log in';
      break;
    case AuthFlowType.PasswordReset:
      title = '';
      break;
    default:
      title = `Continue to ${state.authenticationState.organization?.organization_name ?? '...'}`;
      break;
  }

  // Show a targeted message if the member has an unverified email address and
  // additional primary auth is required
  const showVerifyEmailCopy = email && emailVerified === false && primaryAuthMethods;
  return (
    <ScreenWrapper testID="MainScreen">
      <Logo
        appLogo={theme.logoUrl ?? ''}
        orgLogo={state.authenticationState.organization?.organization_logo_url ?? ''}
      />
      {!theme.hideHeaderText &&
        (showVerifyEmailCopy ? (
          <View style={{ flexDirection: 'column', justifyContent: 'center', gap: 24 }}>
            <PageTitle title={'Verify your email'} textAlign="center" />
            <Text style={{ color: theme.primaryTextColor }}>Confirm your email address with one of the following:</Text>
          </View>
        ) : (
          title && <PageTitle title={title} textAlign="center" />
        ))}
      <ProductComponents components={ProductComponentsOrdering} />
    </ScreenWrapper>
  );
};
