import { useLingui } from '@lingui/react/macro';
import React from 'react';
import styled, { useTheme } from 'styled-components';
import { EmailDiscoveryForm, EmailForm } from './EmailForm';
import { Flex } from '../../components/Flex';
import { Text } from '../../components/Text';
import { useGlobalReducer } from '../GlobalContextProvider';
import { Divider } from '../../components/Divider';
import { LoadingScreen } from '../../components/Loading';
import { AuthFlowType } from '@stytch/core/public';
import { PasswordsEmailForm } from './PasswordEmailForm';
import { SsoAndOAuthButtons } from './SsoAndOAuthButtons';
import { Component, generateProductComponentsOrdering, isButtonsComponent } from '../generateProductComponentsOrdering';
import { useEffectiveAuthConfig } from '../hooks/useEffectiveAuthConfig';

const LogoImage = styled.img`
  max-height: 50px;
  max-width: 100px;
`;

const Header = styled(Text)`
  text-align: center;
`;

const Logo = ({ orgLogo, appLogo }: { orgLogo: string; appLogo: string }) => {
  if (!orgLogo && !appLogo) return <></>;
  return (
    <Flex justifyContent="center" gap={8}>
      {!!orgLogo && <LogoImage src={orgLogo} />}
      {!!appLogo && <LogoImage src={appLogo} />}
    </Flex>
  );
};

function isButtonGroup(group: Component[]): group is (Component.OAuthButtons | Component.SSOButtons)[] {
  return group.every(isButtonsComponent);
}

const ProductComponents = ({ components }: { components: Component[][] }) => {
  const renderedComponents = components.map((group) => (
    <Flex key={group.join('-')} direction="column" gap={8}>
      {isButtonGroup(group) ? (
        <SsoAndOAuthButtons buttons={group} />
      ) : (
        group.map((component) => {
          switch (component) {
            case Component.EmailForm:
              return <EmailForm key={component} showPasswordButton={false} />;
            case Component.EmailDiscoveryForm:
              return <EmailDiscoveryForm key={component} showPasswordButton={false} />;
            case Component.PasswordsEmailForm:
              return <PasswordsEmailForm key={component} />;
            case Component.PasswordEmailCombined:
              return <EmailForm key={component} showPasswordButton />;
            case Component.PasswordEmailCombinedDiscovery:
              return <EmailDiscoveryForm key={component} showPasswordButton />;
            case Component.Divider:
              return <Divider key="divider" />;
          }
        })
      )}
    </Flex>
  ));
  return <>{renderedComponents}</>;
};

export const MainScreen = () => {
  const { displayHeader, logo } = useTheme();
  const [state] = useGlobalReducer();
  const { t } = useLingui();

  const { primaryAuthMethods, email, emailVerified } = state.primary;

  const { products } = useEffectiveAuthConfig();

  const isLoading = state.flowState.type === AuthFlowType.Organization && !state.flowState.organization;

  // Generate ordering and types of product components
  const productComponentsOrdering = generateProductComponentsOrdering(products, state.flowState);

  const organizationName = state.flowState.organization?.organization_name;
  let title: string;
  switch (state.flowState.type) {
    case AuthFlowType.Discovery:
      title = t({ id: 'login.title', message: 'Sign up or log in' });
      break;
    case AuthFlowType.PasswordReset:
      title = '';
      break;
    default:
      title = organizationName
        ? t({
            id: 'organizationLogin.title',
            message: `Continue to ${organizationName}`,
          })
        : t({
            id: 'organizationLogin.titleUnknown',
            message: 'Continue to ...',
            comment: 'Used instead of organizationLogin.title when the organization name is not available',
          });
      break;
  }

  // Show a targeted message if the member has an unverified email address and
  // additional primary auth is required
  const showVerifyEmailCopy = email && emailVerified === false && primaryAuthMethods;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Flex gap={24} direction="column">
      <Logo appLogo={logo.logoImageUrl} orgLogo={state.flowState.organization?.organization_logo_url ?? ''} />
      {displayHeader &&
        (showVerifyEmailCopy ? (
          <Flex justifyContent="center" direction="column" gap={24}>
            <Text size="header">{t({ id: 'emailVerification.title', message: 'Verify your email' })}</Text>
            <Text>
              {t({
                id: 'emailVerification.content',
                message: 'Confirm your email address with one of the following:',
              })}
            </Text>
          </Flex>
        ) : (
          title && (
            <Flex justifyContent="center">
              <Header size="header">{title}</Header>
            </Flex>
          )
        ))}

      <ProductComponents components={productComponentsOrdering} />
    </Flex>
  );
};
