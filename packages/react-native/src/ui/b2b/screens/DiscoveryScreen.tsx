import { DirectLoginForSingleMembershipConfig, DiscoveredOrganization } from '@stytch/core/public';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableWithoutFeedback, useColorScheme, View } from 'react-native';

import { Divider } from '../components/Divider';
import { PageTitle } from '../components/PageTitle';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { StytchButton } from '../components/StytchButton';
import { useBootStrapData, useConfig, useGlobalReducer, useTheme } from '../ContextProvider';
import { useGoBack } from '../hooks/goBack';
import { useDiscoveryIntermediateSessionsExchange } from '../hooks/useDiscoveryIntermediateSessionsExchange';
import { useDiscoveryOrganizationsCreate } from '../hooks/useDiscoveryOrganizationsCreate';
import { useSSOStart } from '../hooks/useSSOStart';

const LoggingInView = () => {
  const theme = useTheme();
  const [state] = useGlobalReducer();
  return (
    <View style={{ flexDirection: 'column', alignItems: 'center', gap: 36 }}>
      <PageTitle title="Logging in..." />
      {!state.screenState.isSubmitting && <ActivityIndicator size="large" color={theme.inputTextColor} />}
    </View>
  );
};

const LoadingView = () => {
  const theme = useTheme();
  const [state] = useGlobalReducer();
  return (
    <View style={{ flexDirection: 'column', alignItems: 'center', gap: 36 }}>
      {!state.screenState.isSubmitting && <ActivityIndicator size="large" color={theme.inputTextColor} />}
    </View>
  );
};

const isJoinViaJitType = (type: DiscoveredOrganization['membership']['type']) =>
  type === 'eligible_to_join_by_email_domain' || type === 'eligible_to_join_by_oauth_tenant';

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

const DiscoverNoOrganizations = () => {
  const [state] = useGlobalReducer();
  const config = useConfig().productConfig;
  const { createOrganizationEnabled } = useBootStrapData();
  const { discoveryOrganizationsCreate } = useDiscoveryOrganizationsCreate();
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const { goBack } = useGoBack();

  const handleDiscoveryOrganizationCreate = useCallback(() => {
    if (isCreateLoading) return;
    setIsCreateLoading(true);
    discoveryOrganizationsCreate().finally(() => setIsCreateLoading(false));
  }, [isCreateLoading, discoveryOrganizationsCreate]);

  const theme = useTheme();

  const shouldAutomaticallyCreateOrganization =
    createOrganizationEnabled && config.directCreateOrganizationForNoMembership;

  useEffect(() => {
    if (shouldAutomaticallyCreateOrganization) {
      handleDiscoveryOrganizationCreate();
    }
  }, [shouldAutomaticallyCreateOrganization, handleDiscoveryOrganizationCreate]);

  if (shouldAutomaticallyCreateOrganization || isCreateLoading) {
    return <LoadingView />;
  }

  if (createOrganizationEnabled && !config.disableCreateOrganization) {
    return (
      <View style={{ flexDirection: 'column', gap: 24 }}>
        <PageTitle title="Create an organization to get started" />
        <StytchButton
          onPress={() => handleDiscoveryOrganizationCreate()}
          text="Create an organization"
          enabled={true}
        />
        <Text style={{ color: theme.primaryTextColor }}>
          {state.discoveryState.email} does not have an account. Think this is a mistake? Try a different email address,
          or contact your admin.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'column', gap: 24 }}>
      <PageTitle title={`${state.discoveryState.email} does not belong to any organizations.`} />
      <Text style={{ color: theme.primaryTextColor }}>
        Make sure your email address is correct. Otherwise, you might need to be invited by your admin.
      </Text>
      <StytchButton enabled={true} onPress={goBack} text="Try a different email address" />
    </View>
  );
};

const Logo = ({ name, logo }: { name: string; logo: string }) => {
  const theme = useTheme();
  if (logo !== '') {
    return (
      <View
        style={{
          height: 40,
          width: 40,
          flexShrink: 0,
          borderRadius: 4,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image source={{ uri: logo, width: 40, height: 40 }} />
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        width: 40,
        flexShrink: 0,
        backgroundColor: theme.backgroundColor,
        borderRadius: 4,
      }}
    >
      <Text
        style={{
          color: theme.primaryTextColor,
          fontWeight: '400',
          fontSize: 18,
          lineHeight: 25,
        }}
      >
        {name[0]}
      </Text>
    </View>
  );
};

const ArrowText = ({ type }: { type: DiscoveredOrganization['membership']['type'] }) => {
  const theme = useTheme();
  let text = undefined;
  if (isJoinViaJitType(type) || type === 'pending_member') {
    text = 'Join';
  } else if (type === 'invited_member') {
    text = 'Accept Invite';
  } else {
    return <></>;
  }
  return <Text style={{ color: theme.primaryTextColor }}>{text}</Text>;
};

export const DiscoveryScreen = () => {
  const [state, dispatch] = useGlobalReducer();
  const config = useConfig();
  const theme = useTheme();
  const shouldDirectLoginConfigEnabled = !!config.productConfig.directLoginForSingleMembership?.status;
  const { createOrganizationEnabled } = useBootStrapData();
  const { ssoStart } = useSSOStart();
  const { discoveryIntermediateSessionsExchange } = useDiscoveryIntermediateSessionsExchange();
  const { discoveryOrganizationsCreate } = useDiscoveryOrganizationsCreate();
  const [isExchangeLoading, setIsExchangeLoading] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);

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
        ssoStart(organization.sso_default_connection_id);
      } else {
        dispatch({
          type: 'discovery/selectDiscoveredOrganization',
          organization: discoveredOrganization,
        });
      }
    } else {
      if (isExchangeLoading) return;
      setIsExchangeLoading(true);
      discoveryIntermediateSessionsExchange(organization.organization_id).finally(() => setIsExchangeLoading(false));
    }
  };

  const handleDiscoveryOrganizationCreate = () => {
    if (isCreateLoading) return;
    setIsCreateLoading(true);
    discoveryOrganizationsCreate().finally(() => setIsCreateLoading(false));
  };

  const darkMode = useColorScheme() == 'dark';

  useEffect(() => {
    const directLoginOrganization = shouldAllowDirectLoginToOrganization(
      state.discoveryState.discoveredOrganizations,
      config.productConfig.directLoginForSingleMembership,
    );

    if (shouldDirectLoginConfigEnabled && directLoginOrganization !== null) {
      handleDiscoveryOrganizationStart(directLoginOrganization);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- SDK-1354
  }, [
    shouldDirectLoginConfigEnabled,
    state.discoveryState.discoveredOrganizations,
    config.productConfig.directLoginForSingleMembership,
  ]);

  if (isExchangeLoading) {
    return (
      <ScreenWrapper testID="DiscoveryScreen">
        <LoggingInView />
      </ScreenWrapper>
    );
  }

  if (isCreateLoading) {
    return (
      <ScreenWrapper testID="DiscoveryScreen">
        <LoadingView />
      </ScreenWrapper>
    );
  }

  if (state.discoveryState.discoveredOrganizations.length === 0) {
    return (
      <ScreenWrapper testID="DiscoveryScreen">
        <DiscoverNoOrganizations />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper testID="DiscoveryScreen">
      <View style={{ flexDirection: 'column', gap: 24 }}>
        <PageTitle title="Select an organization to continue" />
        <View
          style={{
            flexDirection: 'column',
            borderColor: theme.inputBorderColor,
            borderWidth: 1,
            borderRadius: theme.inputBorderRadius,
          }}
        >
          {state.discoveryState.discoveredOrganizations.map((discoveredOrganization, index: number) => {
            const { organization, membership } = discoveredOrganization;
            return (
              <TouchableWithoutFeedback
                key={organization.organization_id}
                onPress={() => handleDiscoveryOrganizationStart(discoveredOrganization)}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 8,
                    gap: 8,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTopColor: theme.inputBorderColor,
                    borderTopWidth: index === 0 ? 0 : 1,
                    borderRadius: theme.inputBorderRadius,
                  }}
                >
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, overflow: 'hidden' }}>
                    <Logo name={organization.organization_name} logo={organization.organization_logo_url} />
                    <Text numberOfLines={2} textBreakStrategy="balanced" style={{ color: theme.primaryTextColor }}>
                      {organization.organization_name}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <ArrowText type={membership.type} />
                    <Image
                      style={{ width: 24, height: 24 }}
                      testID="KeyboardArrowRight"
                      source={
                        darkMode
                          ? require('../../assets/keyboard_arrow_right_dark.png')
                          : require('../../assets/keyboard_arrow_right.png')
                      }
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            );
          })}
        </View>
        {createOrganizationEnabled && (
          <View style={{ flexDirection: 'column', gap: 8 }}>
            <Divider />
            <StytchButton enabled={true} onPress={handleDiscoveryOrganizationCreate} text="Create an organization" />
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};
