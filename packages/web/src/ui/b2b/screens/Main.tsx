import { useLingui } from '@lingui/react/macro';
import { AuthFlowType } from '@stytch/core/public';
import React from 'react';

import Column from '../../components/atoms/Column';
import Typography from '../../components/atoms/Typography';
import Divider from '../../components/molecules/Divider';
import { LoadingScreen } from '../../components/molecules/Loading';
import { usePresentation } from '../../components/PresentationConfig';
import { generateProductComponentsOrdering, isButtonsComponent } from '../generateProductComponentsOrdering';
import { useConfig, useGlobalReducer } from '../GlobalContextProvider';
import { useEffectiveAuthConfig } from '../hooks/useEffectiveAuthConfig';
import { ButtonComponent, MainScreenComponent } from '../types/AppScreens';
import { useProductComponents } from '../utils';

function isButtonGroup(group: MainScreenComponent[]): group is ButtonComponent[] {
  return group.every(isButtonsComponent);
}

export const MainScreen = () => {
  const { options } = usePresentation();
  const [state] = useGlobalReducer();
  const { t } = useLingui();

  const { primaryAuthMethods, email, emailVerified } = state.primary;

  const config = useConfig();
  const { products } = useEffectiveAuthConfig();

  const isLoading = state.flowState.type === AuthFlowType.Organization && !state.flowState.organization;

  // Generate ordering and types of product components
  const productComponentsOrdering = generateProductComponentsOrdering(products, state.flowState);
  const mainScreenComponents = useProductComponents(config, 'mainScreen')!;
  const { SsoAndOAuthButtons } = useProductComponents(config, 'ssoAndOAuthButtons')!;

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
    <Column gap={6}>
      {!options.hideHeaderText &&
        (showVerifyEmailCopy ? (
          <>
            <Typography variant="header">
              {t({ id: 'emailVerification.title', message: 'Verify your email' })}
            </Typography>

            <Typography>
              {t({
                id: 'emailVerification.content',
                message: 'Confirm your email address with one of the following:',
              })}
            </Typography>
          </>
        ) : (
          title && (
            <Typography variant="header" align="center">
              {title}
            </Typography>
          )
        ))}

      <Column gap={4}>
        {productComponentsOrdering.map((group) =>
          isButtonGroup(group) ? (
            <SsoAndOAuthButtons key="buttons" buttons={group} />
          ) : (
            group.map((component, index) => {
              const Component = mainScreenComponents[component];
              if (Component) {
                return <Component key={component} />;
              }
              if (component === MainScreenComponent.Divider) {
                return <Divider key={'divider' + index} />;
              }
              return null;
            })
          ),
        )}
      </Column>
    </Column>
  );
};
