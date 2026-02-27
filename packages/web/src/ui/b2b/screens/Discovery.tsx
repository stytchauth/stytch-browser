import { useLingui } from '@lingui/react/macro';
import {
  B2BDiscoveryIntermediateSessionsExchangeResponse,
  B2BDiscoveryOrganizationsCreateResponse,
  DirectLoginForSingleMembershipConfig,
  DiscoveredOrganization,
  StytchAPIError,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';
import React, { useCallback, useEffect } from 'react';

import Button from '../../components/atoms/Button';
import Column from '../../components/atoms/Column';
import Typography from '../../components/atoms/Typography';
import ButtonColumn from '../../components/molecules/ButtonColumn';
import { LoadingScreen, LoggingInScreen } from '../../components/molecules/Loading';
import OrganizationRow from '../components/OrganizationRow';
import { useConfig, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { ErrorType } from '../types/ErrorType';
import { onAuthenticateSuccess, StytchMutationKey, useBootstrap, useMutate } from '../utils';

const isJoinViaJitType = (type: DiscoveredOrganization['membership']['type']) =>
  type === 'eligible_to_join_by_email_domain' || type === 'eligible_to_join_by_oauth_tenant';

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
      <Column gap={6}>
        <Typography variant="header">
          {t({ id: 'organizationDiscovery.noOrgs.create.title', message: 'Create an organization to get started' })}
        </Typography>

        <Typography variant="body">
          {t({
            id: 'organizationDiscovery.noOrgs.create.content',
            message: `${email} does not have an account. Think this is a mistake? Try a different email address, or contact your admin.`,
          })}
        </Typography>

        <ButtonColumn>
          <Button variant="primary" onClick={() => stytchCreateOrganization()}>
            {t({ id: 'button.createAnOrganization', message: 'Create an organization' })}
          </Button>
          <Button variant="ghost" onClick={goBack}>
            {t({ id: 'button.goBack', message: 'Go back' })}
          </Button>
        </ButtonColumn>
      </Column>
    );
  }

  return (
    <Column gap={6}>
      <Typography variant="header">
        {t({
          id: 'organizationDiscovery.noOrgs.title',
          message: `${email} does not belong to any organizations.`,
        })}
      </Typography>
      <Typography variant="body">
        {t({
          id: 'organizationDiscovery.noOrgs.content',
          message: 'Make sure your email address is correct. Otherwise, you might need to be invited by your admin.',
        })}
      </Typography>
      <Button variant="outline" onClick={goBack}>
        {t({ id: 'button.tryDifferentEmailAddress', message: 'Try a different email address' })}
      </Button>
    </Column>
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

  const organizationButtons = state.formState.discoveryState.discoveredOrganizations.map((discoveredOrganization) => {
    const { organization, membership } = discoveredOrganization;

    let action: string | undefined;
    if (isJoinViaJitType(membership.type) || membership.type === 'pending_member')
      action = t({ id: 'organizationDiscovery.join', message: 'Join' });
    else if (membership.type === 'invited_member')
      action = t({ id: 'organizationDiscovery.acceptInvite', message: 'Accept Invite' });

    return (
      <OrganizationRow
        key={organization.organization_id}
        organization={organization}
        action={action}
        onClick={() => handleDiscoveryOrganizationStart(discoveredOrganization)}
      ></OrganizationRow>
    );
  });

  const createOrganizationButton =
    createOrganizationEnabled && !config.disableCreateOrganization ? (
      <Button variant="outline" onClick={() => stytchCreateOrganization()}>
        {t({ id: 'button.createAnOrganization', message: 'Create an organization' })}
      </Button>
    ) : null;

  const goBackButton = (
    <Button variant="ghost" onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })}>
      {t({ id: 'button.goBack', message: 'Go back' })}
    </Button>
  );

  return (
    <Column gap={6}>
      <Typography variant="header">
        {t({ id: 'organizationDiscovery.title', message: 'Select an organization to continue' })}
      </Typography>

      {createOrganizationButton ? (
        // Display with divider if the Create Organization Button can be shown,
        // otherwise just show everything together
        <ButtonColumn
          top={organizationButtons}
          bottom={
            <>
              {createOrganizationButton}
              {goBackButton}
            </>
          }
        />
      ) : (
        <Column gap={4}>
          <ButtonColumn>{organizationButtons}</ButtonColumn>
          {goBackButton}
        </Column>
      )}
    </Column>
  );
};
