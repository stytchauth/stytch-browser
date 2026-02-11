import React, { useCallback, useMemo } from 'react';
import { SettingsContainer, useSettingsContainer } from '../components/SettingsContainer';
import { useFormState } from '../utils/useFormState';
import { useOrgSettingsRouterController } from './AdminPortalOrgRouter';
import { useRbac } from '../utils/useRbac';
import { FlexBox } from '../components/FlexBox';
import { Switch } from '../components/Switch';
import { Typography } from '../components/Typography';
import { FormSectionBody } from '../utils/FormSectionBody';
import { Checkbox } from '../components/Checkbox';
import { Alert } from '../components/Alert';
import { useMutateOrganization } from '../utils/useMutateOrganization';
import {
  Organization,
  B2BAllowedAuthMethods,
  B2BAllowedMFAMethods,
  B2BOrganizationsUpdateOptions,
} from '@stytch/core/public';
import { PaddingLeft } from '../components/PaddingLeft';
import { arraysHaveSameContents } from '../utils/arraysHaveSameContents';
import { SettingsSection } from '../components/SettingsSection';
import { useAdminPortalConfig } from '../utils/useAdminPortalConfig';
import { useAllowedAuthMethods } from '../utils/useAllowedAuthMethods';
import { useAllowedMfaMethods } from '../utils/useAllowedMfaMethods';

interface AuthSettingsFormState {
  // Primary
  authMethods: Organization['auth_methods'];
  allowedAuthMethods: Organization['allowed_auth_methods'];
  // Secondary
  mfaPolicy: Organization['mfa_policy'];
  mfaMethods: Organization['mfa_methods'];
  allowedMfaMethods: Organization['allowed_mfa_methods'];

  isPrimaryAuthAllAllowed: boolean;
  isMfaPolicyRequiredForAll: boolean;
  isSecondaryAuthAllAllowed: boolean;
}

interface OrgSettingsAuthenticationSettingsBodyProps extends FormSectionBody<AuthSettingsFormState> {
  canSetAllowedAuthMethods: boolean | undefined;
  canSetMfaPolicy: boolean | undefined;
  canSetAllowedMfaMethods: boolean | undefined;
  orgConfigAuthMethods: B2BAllowedAuthMethods[];
  orgConfigMfaMethods: B2BAllowedMFAMethods[];
  mfaPolicyConfig: boolean | undefined;
}

const allowedAuthMethodsLabelMap: Record<B2BAllowedAuthMethods, string> = {
  magic_link: 'Email Magic Links',
  sso: 'Single Sign-On',
  google_oauth: 'Google OAuth',
  microsoft_oauth: 'Microsoft OAuth',
  hubspot_oauth: 'HubSpot OAuth',
  slack_oauth: 'Slack OAuth',
  github_oauth: 'GitHub OAuth',
  password: 'Password',
  email_otp: 'Email OTP',
};

const allowedMfaMethodsLabelMap: Record<B2BAllowedMFAMethods, string> = {
  sms_otp: 'SMS OTP',
  totp: 'TOTP',
};

const useMutateAuthSettings = () => {
  const { mutate } = useMutateOrganization();

  const setOrgAuthSettings = (mutatedProperties: Partial<B2BOrganizationsUpdateOptions>) => {
    return mutate(mutatedProperties, {
      errorMessage: 'Failed to update authorization details.',
    });
  };

  return { setOrgAuthSettings };
};

const OrgSettingsAuthenticationSettingsBody = ({
  orgConfigAuthMethods,
  orgConfigMfaMethods,
  canSetAllowedAuthMethods,
  canSetMfaPolicy,
  canSetAllowedMfaMethods,
  mfaPolicyConfig,
  localState,
  setLocalState,
}: OrgSettingsAuthenticationSettingsBodyProps) => {
  const { editing } = useSettingsContainer();

  const handlePrimaryAuthChange = (value: boolean) => {
    setLocalState((prevState) => ({
      ...prevState,
      isPrimaryAuthAllAllowed: value,
    }));
  };
  const handleMfaPolicyChange = (value: boolean) => {
    setLocalState((prevState) => ({
      ...prevState,
      isMfaPolicyRequiredForAll: value,
    }));
  };
  const handleSecondaryAuthChange = (value: boolean) => {
    setLocalState((prevState) => ({
      ...prevState,
      isSecondaryAuthAllAllowed: value,
    }));
  };

  const isAuthMethodChecked = (authMethod: B2BAllowedAuthMethods) => {
    return localState.allowedAuthMethods?.includes(authMethod);
  };
  const isMfaMethodChecked = (mfaMethod: B2BAllowedMFAMethods) => {
    return localState.allowedMfaMethods?.includes(mfaMethod);
  };

  const handleAllowedAuthMethodClick = (authMethod: B2BAllowedAuthMethods) => {
    if (localState.allowedAuthMethods!.includes(authMethod)) {
      setLocalState((prevState) => ({
        ...prevState,
        allowedAuthMethods: prevState.allowedAuthMethods!.filter((method) => method !== authMethod),
      }));
    } else {
      setLocalState((prevState) => ({
        ...prevState,
        allowedAuthMethods: [...prevState.allowedAuthMethods!, authMethod],
      }));
    }
  };

  const handleAllowedMfaMethodClick = (mfaMethod: B2BAllowedMFAMethods) => {
    if (localState.allowedMfaMethods!.includes(mfaMethod)) {
      setLocalState((prevState) => ({
        ...prevState,
        allowedMfaMethods: prevState.allowedMfaMethods?.filter((method) => method !== mfaMethod),
      }));
    } else {
      setLocalState((prevState) => ({
        ...prevState,
        allowedMfaMethods: [...(prevState?.allowedMfaMethods ?? []), mfaMethod],
      }));
    }
  };
  return (
    <FlexBox flexDirection="column" gap={2}>
      <SettingsSection title="Primary authentication">
        {editing &&
          !localState.isPrimaryAuthAllAllowed &&
          !!localState.allowedAuthMethods &&
          localState.allowedAuthMethods!.length === 0 && (
            <Alert>{'Please select at least one primary authentication method.'}</Alert>
          )}
        <Switch
          readOnly={!editing || !canSetAllowedAuthMethods}
          label={'Allow all primary auth methods'}
          checked={localState.isPrimaryAuthAllAllowed}
          onChange={handlePrimaryAuthChange}
        />
        {!localState.isPrimaryAuthAllAllowed && (
          <PaddingLeft>
            <FlexBox flexDirection="row" flexWrap="wrap">
              {orgConfigAuthMethods.map((authMethod) => {
                const label = allowedAuthMethodsLabelMap[authMethod];
                return (
                  <Checkbox
                    key={authMethod}
                    label={label}
                    disabled={!editing}
                    checked={isAuthMethodChecked(authMethod)}
                    onClick={() => handleAllowedAuthMethodClick(authMethod)}
                  />
                );
              })}
            </FlexBox>
          </PaddingLeft>
        )}
      </SettingsSection>
      {mfaPolicyConfig && (
        <SettingsSection title="Secondary authentication">
          {editing &&
            !localState.isSecondaryAuthAllAllowed &&
            !!localState.allowedMfaMethods &&
            localState.allowedMfaMethods!.length === 0 && (
              <Alert>{'Please select at least one secondary authentication method.'}</Alert>
            )}
          <Typography variant={'body2'}>
            {'All members logging in will be required to set up one of the allowed secondary auth methods.'}
          </Typography>
          <Switch
            readOnly={!editing || !canSetMfaPolicy}
            label={'Require MFA for all users'}
            checked={localState.isMfaPolicyRequiredForAll}
            onChange={handleMfaPolicyChange}
          />
          <Switch
            readOnly={!editing || !canSetAllowedMfaMethods}
            label={'Allow all secondary auth methods'}
            checked={localState.isSecondaryAuthAllAllowed}
            onChange={handleSecondaryAuthChange}
          />
          {!localState.isSecondaryAuthAllAllowed && (
            <PaddingLeft>
              <FlexBox flexDirection="row" flexWrap="wrap">
                {orgConfigMfaMethods.map((authMethod) => {
                  const label = allowedMfaMethodsLabelMap[authMethod];
                  return (
                    <Checkbox
                      key={authMethod}
                      label={label}
                      disabled={!editing || !canSetAllowedMfaMethods}
                      checked={isMfaMethodChecked(authMethod)}
                      onClick={() => handleAllowedMfaMethodClick(authMethod)}
                    />
                  );
                })}
              </FlexBox>
            </PaddingLeft>
          )}
        </SettingsSection>
      )}
    </FlexBox>
  );
};

export const OrgSettingsAuthenticationSettingsSection = ({ orgInfo }: { orgInfo: Organization }) => {
  const { data: canSetAllowedAuthMethods } = useRbac('stytch.organization', 'update.settings.allowed-auth-methods');
  const { data: canSetMfaPolicy } = useRbac('stytch.organization', 'update.settings.mfa-policy');
  const { data: canSetAllowedMfaMethods } = useRbac('stytch.organization', 'update.settings.allowed-mfa-methods');
  const { setOrgAuthSettings } = useMutateAuthSettings();
  const { data: adminPortalConfig } = useAdminPortalConfig({ shouldFetch: true });
  const mfaPolicyConfig = adminPortalConfig?.organization_config.mfa_controls_enabled;

  const orgConfigAuthMethods = useAllowedAuthMethods();
  const orgConfigMfaMethods = useAllowedMfaMethods();

  const remoteState = useMemo<AuthSettingsFormState>(
    () => ({
      authMethods: orgInfo.auth_methods,
      allowedAuthMethods: orgInfo.allowed_auth_methods,
      mfaPolicy: orgInfo.mfa_policy,
      mfaMethods: orgInfo.mfa_methods,
      allowedMfaMethods: orgInfo.allowed_mfa_methods,
      isPrimaryAuthAllAllowed: orgInfo.auth_methods === 'ALL_ALLOWED',
      isSecondaryAuthAllAllowed: orgInfo.mfa_methods === 'ALL_ALLOWED',
      isMfaPolicyRequiredForAll: orgInfo.mfa_policy === 'REQUIRED_FOR_ALL',
    }),
    [
      orgInfo.allowed_auth_methods,
      orgInfo.allowed_mfa_methods,
      orgInfo.auth_methods,
      orgInfo.mfa_methods,
      orgInfo.mfa_policy,
    ],
  );
  const { localState, setLocalState, editing, handleSetEditing } = useFormState({ remoteState });

  const { useBlockNavigation } = useOrgSettingsRouterController();

  const handleSave = useCallback(async () => {
    const mutatedProperties: Partial<B2BOrganizationsUpdateOptions> = {};
    if (localState.isPrimaryAuthAllAllowed !== remoteState.isPrimaryAuthAllAllowed) {
      mutatedProperties.auth_methods = localState.isPrimaryAuthAllAllowed ? 'ALL_ALLOWED' : 'RESTRICTED';
    }
    if (!arraysHaveSameContents(localState.allowedAuthMethods, remoteState.allowedAuthMethods)) {
      mutatedProperties.allowed_auth_methods = localState.allowedAuthMethods;
    }
    if (localState.isSecondaryAuthAllAllowed !== remoteState.isSecondaryAuthAllAllowed) {
      mutatedProperties.mfa_methods = localState.isSecondaryAuthAllAllowed ? 'ALL_ALLOWED' : 'RESTRICTED';
    }
    if (!arraysHaveSameContents(localState.allowedMfaMethods, remoteState.allowedMfaMethods)) {
      mutatedProperties.allowed_mfa_methods = localState.allowedMfaMethods;
    }
    if (localState.isMfaPolicyRequiredForAll !== remoteState.isMfaPolicyRequiredForAll) {
      mutatedProperties.mfa_policy = localState.isMfaPolicyRequiredForAll ? 'REQUIRED_FOR_ALL' : 'OPTIONAL';
    }
    if (Object.keys(mutatedProperties).length > 0) {
      await setOrgAuthSettings(mutatedProperties);
    }
  }, [localState, remoteState, setOrgAuthSettings]);

  const handleCancel = useCallback(() => {
    setLocalState(remoteState);
  }, [remoteState, setLocalState]);

  const disableSave = useMemo(() => {
    const isDeepEqual =
      arraysHaveSameContents(localState.allowedAuthMethods, remoteState.allowedAuthMethods) &&
      arraysHaveSameContents(localState.allowedMfaMethods, remoteState.allowedMfaMethods) &&
      localState.isPrimaryAuthAllAllowed === remoteState.isPrimaryAuthAllAllowed &&
      localState.isMfaPolicyRequiredForAll === remoteState.isMfaPolicyRequiredForAll &&
      localState.isSecondaryAuthAllAllowed === remoteState.isSecondaryAuthAllAllowed;
    const allowPrimaryAuth =
      !localState.isPrimaryAuthAllAllowed &&
      !!localState.allowedAuthMethods &&
      localState.allowedAuthMethods!.length === 0;

    const allowSecondaryAuth =
      !localState.isSecondaryAuthAllAllowed &&
      localState.allowedMfaMethods &&
      localState.allowedMfaMethods!.length === 0;

    return isDeepEqual || allowPrimaryAuth || allowSecondaryAuth;
  }, [remoteState, localState]);
  return (
    <SettingsContainer
      title="Authentication settings"
      hasCTA={canSetAllowedAuthMethods || canSetMfaPolicy || canSetAllowedMfaMethods}
      onSave={handleSave}
      useBlockNavigation={useBlockNavigation}
      editing={editing}
      setEditing={handleSetEditing}
      disableSave={disableSave}
      onCancel={handleCancel}
    >
      <OrgSettingsAuthenticationSettingsBody
        canSetAllowedAuthMethods={canSetAllowedAuthMethods}
        canSetMfaPolicy={canSetMfaPolicy}
        canSetAllowedMfaMethods={canSetAllowedMfaMethods}
        localState={localState}
        setLocalState={setLocalState}
        remoteState={remoteState}
        orgConfigAuthMethods={orgConfigAuthMethods}
        orgConfigMfaMethods={orgConfigMfaMethods}
        mfaPolicyConfig={mfaPolicyConfig}
      />
    </SettingsContainer>
  );
};
