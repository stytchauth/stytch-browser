import { useLingui } from '@lingui/react/macro';
import * as React from 'react';
import styled from 'styled-components';
import { useStytch, useGlobalReducer, useConfig } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { ErrorType } from '../types/ErrorType';
import { useBootstrap, useMutate, onAuthenticateSuccess, StytchMutationKey } from '../utils';

import {
  B2BDiscoveryIntermediateSessionsExchangeResponse,
  B2BDiscoveryOrganizationsCreateResponse,
  DirectLoginForSingleMembershipConfig,
  DiscoveredOrganization,
  StytchAPIError,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';
import { Flex } from '../../components/Flex';
import { Text } from '../../components/Text';
import BackArrowIcon from '../../../assets/backArrow';
import { LoadingScreen, LoggingInScreen } from '../../components/Loading';
import Button from '../../components/Button';
import { Divider } from '../../components/Divider';
import { useCallback, useEffect } from 'react';

const isJoinViaJitType = (type: DiscoveredOrganization['membership']['type']) =>
  type === 'eligible_to_join_by_email_domain' || type === 'eligible_to_join_by_oauth_tenant';

const OrganizationsRow = styled(Flex)`
  cursor: pointer;
  gap: 8px;
  border: ${({ theme }) => theme.buttons.secondary.border};
  border-radius: ${({ theme }) => theme.buttons.secondary.borderRadius};
  background-color: ${({ theme }) => theme.buttons.secondary.backgroundColor};
  color: ${({ theme }) => theme.buttons.secondary.textColor};
`;

const LogoImage = styled.img`
  height: 40px;
  width: 40px;
  flex-shrink: 0;
  border-radius: 4px;
`;

const LogoText = styled(Flex)`
  height: 40px;
  width: 40px;
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.buttons.secondary.textColor};
  color: ${({ theme }) => theme.buttons.secondary.backgroundColor};
  border-radius: 4px;

  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 25px;
`;

const OrganizationName = styled.div`
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
`;

const ArrowText = styled.div`
  ${({ theme }) => theme.typography.body};
  text-align: right;
`;

const SvgNoShrink = styled.svg`
  flex-shrink: 0;
`;

const RightArrowSVG = () => (
  <SvgNoShrink width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 0.333313L5.825 1.50831L10.475 6.16665H0.333334V7.83331H10.475L5.825 12.4916L7 13.6666L13.6667 6.99998L7 0.333313Z"
      fill="currentColor"
    />
  </SvgNoShrink>
);

const Logo = ({ name, logo }: { name: string; logo: string }) => {
  if (logo !== '') {
    return <LogoImage src={logo} />;
  }

  return (
    <LogoText alignItems="center" justifyContent="center">
      {name[0]}
    </LogoText>
  );
};

const ActionText = ({ type }: { type: DiscoveredOrganization['membership']['type'] }) => {
  const { t } = useLingui();
  if (isJoinViaJitType(type) || type === 'pending_member')
    return <ArrowText>{t({ id: 'organizationDiscovery.join', message: 'Join' })}</ArrowText>;
  if (type === 'invited_member')
    return <ArrowText>{t({ id: 'organizationDiscovery.acceptInvite', message: 'Accept Invite' })}</ArrowText>;
  return <></>;
};

const DiscoverNoOrganizations = () => {
  const [state, dispatch] = useGlobalReducer();
  const stytchClient = useStytch();
  const config = useConfig();
  const { createOrganizationEnabled } = useBootstrap();
  const { t } = useLingui();
  const goBack = () => dispatch({ type: 'transition', screen: AppScreens.Main });

  const { trigger: stytchCreateOrganization, isMutating: isCreateLoading } = useMutate<
    B2BDiscoveryOrganizationsCreateResponse<StytchProjectConfigurationInput>,
    StytchAPIError,
    StytchMutationKey
  >(
    'stytch.discovery.organizations.create',
    () =>
      stytchClient.discovery.organizations.create({
        session_duration_minutes: config.sessionOptions.sessionDurationMinutes,
      }),
    {
      onSuccess: (data: B2BDiscoveryOrganizationsCreateResponse<StytchProjectConfigurationInput>) => {
        onAuthenticateSuccess(data, dispatch, config);
      },
      onError: (error) => {
        dispatch({
          type: 'set_error_message_and_transition',
          errorType:
            error.error_type === 'action_not_allowed_email_domain_is_claimed'
              ? ErrorType.OrganizationDiscoveryClaimedDomain
              : ErrorType.Default,
          canGoBack: true,
        });
      },
    },
  );

  const shouldAutomaticallyCreateOrganization =
    createOrganizationEnabled && config.directCreateOrganizationForNoMembership;

  useEffect(() => {
    if (shouldAutomaticallyCreateOrganization) {
      stytchCreateOrganization();
    }
  }, [shouldAutomaticallyCreateOrganization, stytchCreateOrganization]);

  if (shouldAutomaticallyCreateOrganization || isCreateLoading) {
    return <LoadingScreen />;
  }

  const email = state.formState.discoveryState.email;

  if (createOrganizationEnabled && !config.disableCreateOrganization) {
    return (
      <Flex direction="column" gap={24}>
        <BackArrowIcon onClick={goBack} />
        <Text size="header">
          {t({ id: 'organizationDiscovery.noOrgs.create.title', message: 'Create an organization to get started' })}
        </Text>
        <Button type="button" onClick={() => stytchCreateOrganization()}>
          {t({ id: 'button.createAnOrganization', message: 'Create an organization' })}
        </Button>
        <Text>
          {t({
            id: 'organizationDiscovery.noOrgs.create.content',
            message: `${email} does not have an account. Think this is a mistake? Try a different email address, or contact your admin.`,
          })}
        </Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap={24}>
      <BackArrowIcon onClick={goBack} />
      <Text size="header">
        {t({
          id: 'organizationDiscovery.noOrgs.title',
          message: `${email} does not belong to any organizations.`,
        })}
      </Text>
      <Text>
        {t({
          id: 'organizationDiscovery.noOrgs.content',
          message: 'Make sure your email address is correct. Otherwise, you might need to be invited by your admin.',
        })}
      </Text>
      <Button type="button" variant="outlined" onClick={goBack}>
        {t({ id: 'button.tryDifferentEmailAddress', message: 'Try a different email address' })}
      </Button>
    </Flex>
  );
};

const shouldAllowDirectLoginToOrganization = (
  organizations: DiscoveredOrganization[],
  config?: DirectLoginForSingleMembershipConfig,
): DiscoveredOrganization | null => {
  // If direct login is not enabled, return false
  if (!config?.status) {
    return null;
  }

  // Count active memberships
  const activeOrganizations = organizations.filter((org) => org.membership.type === 'active_member');

  // Check for pending invites or JIT provisioning, depending on config
  const hasBlockingConditions = organizations.some(
    (org) =>
      ((org.membership.type === 'pending_member' || org.membership.type === 'invited_member') &&
        !config.ignoreInvites) ||
      (isJoinViaJitType(org.membership.type) && !config.ignoreJitProvisioning),
  );

  // Allow direct login if there is exactly one active membership and no blocking conditions
  return activeOrganizations.length === 1 && !hasBlockingConditions ? activeOrganizations[0] : null;
};

export const Discovery = () => {
  const [state, dispatch] = useGlobalReducer();
  const stytchClient = useStytch();
  const config = useConfig();
  const { t } = useLingui();
  const shouldDirectLoginConfigEnabled = !!config.directLoginForSingleMembership?.status;
  const { createOrganizationEnabled } = useBootstrap();

  useEffect(() => {
    if (isExchangeInProgress) {
      // If there is already an exchange in progress, don't do anything
      return;
    }

    const directLoginOrganization = shouldAllowDirectLoginToOrganization(
      state.formState.discoveryState.discoveredOrganizations,
      config.directLoginForSingleMembership,
    );

    if (shouldDirectLoginConfigEnabled && directLoginOrganization !== null) {
      handleDiscoveryOrganizationStart(directLoginOrganization);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- SDK-1354
  }, [
    shouldDirectLoginConfigEnabled,
    state.formState.discoveryState.discoveredOrganizations,
    config.directLoginForSingleMembership,
  ]);

  const handleDiscoveryOrganizationStart = (discoveredOrganization: DiscoveredOrganization) => {
    const organization = discoveredOrganization.organization;

    if (discoveredOrganization.primary_required) {
      const allowedAuthMethods = discoveredOrganization.primary_required.allowed_auth_methods;
      if (
        allowedAuthMethods &&
        allowedAuthMethods.length === 1 &&
        allowedAuthMethods[0] === 'sso' &&
        organization.sso_default_connection_id
      ) {
        startSso(organization.sso_default_connection_id);
      } else {
        dispatch({
          type: 'select_discovered_organization',
          discoveredOrganization,
        });
      }
    } else {
      stytchDiscoveryExchange({ organizationId: organization.organization_id });
    }
  };

  const startSso = useCallback(
    (connectionId: string) => {
      stytchClient.sso.start({
        connection_id: connectionId,
        login_redirect_url: config.ssoOptions?.loginRedirectURL,
        signup_redirect_url: config.ssoOptions?.signupRedirectURL,
      });
    },
    [stytchClient, config.ssoOptions],
  );

  const { trigger: stytchDiscoveryExchange, isMutating: isExchangeInProgress } = useMutate<
    B2BDiscoveryIntermediateSessionsExchangeResponse<StytchProjectConfigurationInput>,
    StytchAPIError,
    StytchMutationKey,
    { organizationId: string }
  >(
    `stytch.discovery.intermediateSessions.exchange`,
    (_: string, { arg: { organizationId } }: { arg: { organizationId: string } }) =>
      stytchClient.discovery.intermediateSessions.exchange({
        organization_id: organizationId,
        session_duration_minutes: config.sessionOptions.sessionDurationMinutes,
      }),
    {
      onSuccess: (data: B2BDiscoveryIntermediateSessionsExchangeResponse<StytchProjectConfigurationInput>) => {
        onAuthenticateSuccess(data, dispatch, config);
      },
      onError: (error) => {
        dispatch({
          type: 'set_error_message_and_transition',
          errorType:
            error.error_type === 'action_not_allowed_email_domain_is_claimed'
              ? ErrorType.OrganizationDiscoveryClaimedDomain
              : ErrorType.Default,
          canGoBack: true,
        });
      },
    },
  );

  const { trigger: stytchCreateOrganization, isMutating: isCreateLoading } = useMutate<
    B2BDiscoveryOrganizationsCreateResponse<StytchProjectConfigurationInput>,
    StytchAPIError,
    StytchMutationKey
  >(
    'stytch.discovery.organizations.create',
    () =>
      stytchClient.discovery.organizations.create({
        session_duration_minutes: config.sessionOptions.sessionDurationMinutes,
      }),
    {
      onSuccess: (data: B2BDiscoveryOrganizationsCreateResponse<StytchProjectConfigurationInput>) => {
        onAuthenticateSuccess(data, dispatch, config);
      },
      onError: (error) => {
        dispatch({
          type: 'set_error_message_and_transition',
          errorType:
            error.error_type === 'action_not_allowed_email_domain_is_claimed'
              ? ErrorType.OrganizationDiscoveryClaimedDomain
              : ErrorType.Default,
          canGoBack: true,
        });
      },
    },
  );

  if (isExchangeInProgress) {
    return <LoggingInScreen />;
  }

  if (isCreateLoading) {
    return <LoadingScreen />;
  }

  if (state.formState.discoveryState.discoveredOrganizations.length === 0) {
    return <DiscoverNoOrganizations />;
  }

  const showCreateOrganization = createOrganizationEnabled && !config.disableCreateOrganization;

  return (
    <Flex direction="column" gap={24}>
      <BackArrowIcon onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })} />
      <Text size="header">
        {t({ id: 'organizationDiscovery.title', message: 'Select an organization to continue' })}
      </Text>
      <Flex direction="column" gap={8}>
        {state.formState.discoveryState.discoveredOrganizations.map((discoveredOrganization) => {
          const { organization, membership } = discoveredOrganization;
          return (
            <OrganizationsRow
              padding={8}
              justifyContent="space-between"
              key={organization.organization_id}
              alignItems="center"
              onClick={() => handleDiscoveryOrganizationStart(discoveredOrganization)}
            >
              <Flex gap={8} alignItems="center">
                <Logo name={organization.organization_name} logo={organization.organization_logo_url} />
                <OrganizationName>{organization.organization_name}</OrganizationName>
              </Flex>

              <Flex gap={8} alignItems="center">
                <ActionText type={membership.type} />
                <RightArrowSVG />
              </Flex>
            </OrganizationsRow>
          );
        })}
      </Flex>
      {showCreateOrganization && (
        <Flex direction="column" gap={8}>
          <Divider />
          <Button type="button" variant="outlined" onClick={() => stytchCreateOrganization()}>
            {t({ id: 'button.createAnOrganization', message: 'Create an organization' })}
          </Button>
        </Flex>
      )}
    </Flex>
  );
};
