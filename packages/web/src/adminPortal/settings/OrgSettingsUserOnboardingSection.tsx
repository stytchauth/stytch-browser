import AddIcon from '@mui/icons-material/AddRounded';
import { B2BOrganizationsUpdateOptions, Organization } from '@stytch/core/public';
import React, { useCallback, useMemo, useState } from 'react';

import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { FlexBox } from '../components/FlexBox';
import { Input } from '../components/Input';
import { ListEditor } from '../components/ListEditor';
import { Modal, useModalState } from '../components/Modal';
import { PaddingLeft } from '../components/PaddingLeft';
import { RadioGroup } from '../components/RadioGroup';
import { Select } from '../components/Select';
import { SettingsContainer, useSettingsContainer } from '../components/SettingsContainer';
import { SettingsSection } from '../components/SettingsSection';
import { Switch } from '../components/Switch';
import { Typography } from '../components/Typography';
import { TableItemRenderer } from '../shared/components/types';
import { arraysHaveSameContents } from '../utils/arraysHaveSameContents';
import { Connection } from '../utils/Connection';
import { FormSectionBody } from '../utils/FormSectionBody';
import { getDisplayKnownTenantProvider, getDisplayStatus, getDisplayTenantProvider } from '../utils/getDisplay';
import { isOauthMethod } from '../utils/isOauthMethod';
import { NO_VALUE } from '../utils/noValue';
import { ALL_OAUTH_TENANT_PROVIDERS, getMethodFromProvider, KnownOAuthTenantProvider } from '../utils/oAuthProviders';
import { useAllowedAuthMethods } from '../utils/useAllowedAuthMethods';
import { useConnections } from '../utils/useConnections';
import { StateProps, useFormState } from '../utils/useFormState';
import { useMutateOrganization } from '../utils/useMutateOrganization';
import { useRbac } from '../utils/useRbac';
import { useSelf } from '../utils/useSelf';
import { useStateSliceSetter } from '../utils/useStateSliceSetter';
import { useOrgSettingsRouterController } from './AdminPortalOrgRouter';

const useMutateAuthSettings = () => {
  const { mutate } = useMutateOrganization();

  const setOrgAuthSettings = (mutatedProperties: Partial<B2BOrganizationsUpdateOptions>) => {
    return mutate(mutatedProperties, {
      errorMessage: 'Failed to update email domain details.',
    });
  };

  return { setOrgAuthSettings };
};

const emailAllowedDomainsRenderer: TableItemRenderer<string>[] = [
  {
    title: 'Domain',
    getValue: (email: string) => <Typography variant="body2">{email}</Typography>,
  },
];
const allowedConnectionsRenderers = ({ idToConnectionMap }: { idToConnectionMap: Record<string, Connection> }) => [
  {
    title: 'Connection display name',
    getValue: (id: string) => (
      <Typography variant="body2">{idToConnectionMap[id] ? idToConnectionMap[id].displayName : NO_VALUE}</Typography>
    ),
  },
  {
    title: 'Status',
    getValue: (id: string) => (
      <Typography variant="body2">
        {idToConnectionMap[id] ? getDisplayStatus(idToConnectionMap[id].status) : NO_VALUE}
      </Typography>
    ),
  },
];

interface UserOnboardingFormState {
  emailInvites: Organization['email_invites'];
  emailAllowedDomains: Organization['email_allowed_domains'];
  ssoJitProvisioning: Organization['sso_jit_provisioning'];
  isEmailJitProvisioningAllowed: boolean;
  ssoAllowedConnections: Organization['sso_jit_provisioning_allowed_connections'];
  isOauthTenantJitProvisioningAllowed: boolean;
  allowedOAuthTenants: Organization['allowed_oauth_tenants'];
}

const emailInvitesLabelMap: Record<'ALL_ALLOWED' | 'RESTRICTED', string> = {
  ALL_ALLOWED: 'Anybody',
  RESTRICTED: 'Users from allowed email domains',
};

const ssoJitProvisioningLabelMap: Record<'ALL_ALLOWED' | 'RESTRICTED', string> = {
  ALL_ALLOWED: 'All SSO connections',
  RESTRICTED: 'Allowed SSO connections',
};

interface OrgSettingsUserOnboardingBodyProps extends FormSectionBody<UserOnboardingFormState> {
  canSetEmailJitProvisioning: boolean | undefined;
  canSetEmailInvites: boolean | undefined;
  canSetAllowedDomains: boolean | undefined;
  canSetSsoJitProvisioning: boolean | undefined;
  canSetOAuthTenantJitProvisioning: boolean | undefined;
  canSetOAuthTenants: boolean | undefined;
}
interface BaseTableProps extends StateProps<UserOnboardingFormState> {
  editing: boolean;
}

interface EmailDomainsTableProps extends BaseTableProps {
  canSetAllowedDomains: boolean | undefined;
}

interface SsoConnectionsTableProps extends BaseTableProps {
  canSetSsoJitProvisioning: boolean | undefined;
}

interface OAuthTenantsTableProps extends BaseTableProps {
  canSetOAuthTenants: boolean | undefined;
}

type OAuthTenant = { provider: string; tenantId: string };

const PROVIDER_TENANT_ID_SEPARATOR = ':';

const serializeProviderAndTenantId = (providerType: string, tenantId: string) =>
  `${providerType}${PROVIDER_TENANT_ID_SEPARATOR}${tenantId}`;

const parseProviderAndTenantId = (providerAndTenantId: string) => {
  const [provider, tenantId] = providerAndTenantId.split(PROVIDER_TENANT_ID_SEPARATOR, 2) as [
    string | undefined,
    string | undefined,
  ];
  return { provider, tenantId };
};

const EmailDomainsTable = ({
  localState,
  remoteState,
  setLocalState,
  canSetAllowedDomains,
  editing,
}: EmailDomainsTableProps) => {
  const emailAllowedDomains = editing ? localState.emailAllowedDomains : remoteState.emailAllowedDomains;

  const [email, setEmail] = useState('');
  const addEmailModalProps = useModalState(() => {
    setLocalState((state) => ({
      ...state,
      emailAllowedDomains: [...new Set([...localState.emailAllowedDomains, email])],
    }));
    setEmail('');
  });

  return (
    <SettingsSection
      title="Email domains"
      titleVariant="h5"
      tooltipText="Corporate email domains trusted by your company (e.g. acmecorp.com); used for both domain-restrictions on invites and JIT Provisioning by email domain if enabled."
    >
      <Modal {...addEmailModalProps} title="Add allowed email domain" confirmButtonText="Save">
        <Input label="Domain" onChange={setEmail} placeholder="Enter domain" value={email} />
      </Modal>
      <ListEditor
        items={emailAllowedDomains ?? []}
        itemRenderer={emailAllowedDomainsRenderer}
        onAdd={() => {
          addEmailModalProps.open();
        }}
        emptyText="No domains added."
        getItemActionProps={
          editing && canSetAllowedDomains
            ? (item) => ({
                warningAction: {
                  text: 'Delete',
                  onClick: () => {
                    setEmail('');
                    setLocalState((prevState) => ({
                      ...prevState,
                      emailAllowedDomains: localState.emailAllowedDomains.filter((domain) => domain !== item),
                    }));
                  },
                },
              })
            : undefined
        }
        hideAddButton={!canSetAllowedDomains || !editing}
        addButtonText="Add domain"
      />
    </SettingsSection>
  );
};
const SsoConnectionsTable = ({
  localState,
  remoteState,
  setLocalState,
  editing,
  canSetSsoJitProvisioning,
}: SsoConnectionsTableProps) => {
  const { data: canGetConnectionPerm } = useRbac('stytch.sso', 'get');
  const canGetConnection = !!canGetConnectionPerm;
  const { connections } = useConnections(canGetConnection);

  const { ssoAllowedConnections, ssoJitProvisioning } = editing ? localState : remoteState;
  const handleSsoJitProvisioningChange = useStateSliceSetter(setLocalState, 'ssoJitProvisioning');

  const [selectedSsoConnectionId, setSelectedSsoConnectionId] = useState<string | null>(null);

  const idToConnectionMap = connections.reduce(
    (acc, connection) => {
      acc[connection.id] = connection;
      return acc;
    },
    {} as Record<string, Connection>,
  );
  const selectedConnections = new Set(localState.ssoAllowedConnections);
  const availableConnections = connections.filter((val) => !selectedConnections.has(val.id));

  const { open: openAddSsoConnectionModal, ...addSsoConnectionModalProps } = useModalState(() => {
    if (selectedSsoConnectionId) {
      setLocalState((state) => ({
        ...state,
        ssoAllowedConnections: [...ssoAllowedConnections, selectedSsoConnectionId],
      }));
      setSelectedSsoConnectionId(null);
    }
  });

  const ssoSelectItems = availableConnections.map((val) => {
    return { label: val.displayName, value: val.id };
  });
  const ssoAllowedConnectionsRenderers = allowedConnectionsRenderers({ idToConnectionMap });

  const showTable = ssoJitProvisioning === 'RESTRICTED';

  const renderAlert = () => {
    if (!canGetConnection) {
      return (
        <Alert>
          You do not have permission to view SSO Connections. Please contact your admin if you think this is a mistake.
        </Alert>
      );
    }

    return null;
  };

  const renderListEditor = () => {
    if (!showTable) return null;

    return (
      <ListEditor
        items={ssoAllowedConnections}
        itemRenderer={ssoAllowedConnectionsRenderers}
        onAdd={openAddSsoConnectionModal}
        emptyText="No connections selected."
        getItemActionProps={
          editing && canSetSsoJitProvisioning
            ? (item) => ({
                warningAction: {
                  text: 'Remove',
                  onClick: () => {
                    setLocalState((prevState) => ({
                      ...prevState,
                      ssoAllowedConnections: prevState.ssoAllowedConnections.filter((val) => val !== item),
                    }));
                  },
                },
              })
            : undefined
        }
        hideAddButton={!canSetSsoJitProvisioning || !editing}
        addButtonText="Select connection"
      />
    );
  };
  return (
    <SettingsSection
      title="SSO connections"
      titleVariant="h5"
      tooltipText="SAML or OIDC SSO Connections configured with your Workforce Identity Provider (e.g. Okta, Entra)"
    >
      <RadioGroup
        onChange={(val) => handleSsoJitProvisioningChange(val as keyof typeof ssoJitProvisioningLabelMap)}
        value={ssoJitProvisioning}
        readOnly={!editing || !canSetSsoJitProvisioning}
        items={Object.entries(ssoJitProvisioningLabelMap).map(([value, label]) => {
          return {
            value,
            label,
          };
        })}
      />
      <Modal
        {...addSsoConnectionModalProps}
        title="Add allowed SSO connection"
        confirmButtonText="Save"
        disableConfirm={!selectedSsoConnectionId}
      >
        <Select
          label="SSO connection"
          selectItems={ssoSelectItems}
          value={selectedSsoConnectionId}
          onChange={setSelectedSsoConnectionId}
          placeholder="Select"
        />
      </Modal>
      {renderAlert()}
      {renderListEditor()}
    </SettingsSection>
  );
};

const useOAuthAccountModal = ({
  allowedOAuthTenants,
  onAddTenant,
}: {
  allowedOAuthTenants: Record<string, string[]>;
  onAddTenant: (params: OAuthTenant) => void;
}) => {
  const { self } = useSelf();
  const orgConfigAuthMethods = useAllowedAuthMethods();
  const linkedAccounts = useMemo(
    () =>
      self?.oauth_registrations
        .filter((registration) =>
          orgConfigAuthMethods.includes(
            getMethodFromProvider(registration.provider_type.toLowerCase() as KnownOAuthTenantProvider),
          ),
        )
        .flatMap((registration) => {
          const provider = registration.provider_type.toLowerCase();
          return registration.provider_tenants
            .filter((tenant) => !allowedOAuthTenants[provider]?.some((tenantId) => tenantId === tenant.tenant_id))
            .map((tenant) => ({
              label: `${getDisplayTenantProvider(provider)} ${tenant.tenant_name} [${tenant.tenant_id}]`,
              value: serializeProviderAndTenantId(provider, tenant.tenant_id),
              provider,
              tenantId: tenant.tenant_id,
            }));
        }) ?? [],
    [allowedOAuthTenants, orgConfigAuthMethods, self?.oauth_registrations],
  );
  const defaultManualMode = linkedAccounts.length === 0;
  const [isManualMode, setIsManualMode] = useState(defaultManualMode);

  // Inputs for manual mode
  const [manualInputProvider, setManualInputProvider] = useState<KnownOAuthTenantProvider>();
  const [manualInputTenantId, setManualInputTenantId] = useState<string>();

  // Input for linked account mode
  const [selectedLinkedAccountId, setSelectedLinkedAccountId] = useState<string>();

  const { open, ...modalProps } = useModalState(() => {
    const getInput = () => {
      if (isManualMode) {
        return { provider: manualInputProvider, tenantId: manualInputTenantId };
      } else if (selectedLinkedAccountId) {
        return parseProviderAndTenantId(selectedLinkedAccountId);
      }
    };

    const { provider, tenantId } = getInput() ?? {};
    if (provider && tenantId) {
      onAddTenant({ provider, tenantId });
    }
  });

  const reset = () => {
    setManualInputProvider(undefined);
    setManualInputTenantId(undefined);
    setSelectedLinkedAccountId(undefined);
    setIsManualMode(defaultManualMode);
  };

  return {
    props: {
      ...modalProps,
      linkedAccounts,
      isManualMode,
      setIsManualMode,
      manualInputProvider,
      manualInputTenantId,
      setManualInputProvider,
      setManualInputTenantId,
      selectedLinkedAccountId,
      setSelectedLinkedAccountId,
    },
    open,
    reset,
  };
};

interface LinkedAccount {
  label: string;
  provider: string;
  tenantId: string;
}

type OAuthAccountModalProps = ReturnType<typeof useOAuthAccountModal>['props'] & {
  availableOAuthProviderSelectItems: { label: string; value: KnownOAuthTenantProvider }[];
  linkedAccounts: LinkedAccount[];
};

const OAuthAccountModal = ({
  availableOAuthProviderSelectItems,
  linkedAccounts,
  isManualMode,
  setIsManualMode,
  manualInputProvider,
  manualInputTenantId,
  setManualInputProvider,
  setManualInputTenantId,
  selectedLinkedAccountId,
  setSelectedLinkedAccountId,
  ...modalProps
}: OAuthAccountModalProps) => {
  const hasLinkedAccounts = linkedAccounts.length > 0;

  const linkedAccountSelectItems = useMemo(
    () =>
      linkedAccounts.map((account) => ({
        label: account.label,
        value: serializeProviderAndTenantId(account.provider, account.tenantId),
      })),
    [linkedAccounts],
  );

  return (
    <Modal {...modalProps} title="Add allowed OAuth account" confirmButtonText="Save">
      {isManualMode ? (
        <FlexBox gap={2} flexDirection="column">
          <Typography variant="body2">
            Add an OAuth account manually by selecting the OAuth provider and inputting the account ID.
          </Typography>
          <FlexBox gap={2}>
            <Select
              selectItems={availableOAuthProviderSelectItems}
              label="OAuth Provider"
              value={manualInputProvider}
              onChange={setManualInputProvider}
            />
            <Input
              label="Account ID"
              placeholder="Enter account ID"
              value={manualInputTenantId ?? ''}
              onChange={setManualInputTenantId}
            />
          </FlexBox>
          {hasLinkedAccounts && (
            <Button variant="text" startIcon={<AddIcon />} onClick={() => setIsManualMode(false)} compact>
              Add from linked accounts
            </Button>
          )}
        </FlexBox>
      ) : (
        <FlexBox gap={2} flexDirection="column">
          <Typography variant="body2">Select from the list of linked accounts.</Typography>
          <Select
            selectItems={linkedAccountSelectItems}
            label="Account"
            value={selectedLinkedAccountId}
            onChange={setSelectedLinkedAccountId}
            fullWidth
          />
          <Button variant="text" startIcon={<AddIcon />} onClick={() => setIsManualMode(true)} compact>
            Add manually
          </Button>
        </FlexBox>
      )}
    </Modal>
  );
};

const OAuthTenantsTable = ({
  localState,
  remoteState,
  setLocalState,
  canSetOAuthTenants,
  editing,
}: OAuthTenantsTableProps) => {
  const { allowedOAuthTenants } = editing ? localState : remoteState;

  const orgConfigAuthMethods = useAllowedAuthMethods();

  const allowedOAuthTenantsList: OAuthTenant[] = Object.entries(allowedOAuthTenants).flatMap(([provider, tenants]) =>
    tenants.map((tenant) => ({ provider, tenantId: tenant })),
  );
  allowedOAuthTenantsList.sort((a, b) => a.provider.localeCompare(b.provider));

  const {
    props: oauthModalProps,
    open,
    reset,
  } = useOAuthAccountModal({
    allowedOAuthTenants,
    onAddTenant: ({ provider, tenantId }) => {
      setLocalState((prevState) => ({
        ...prevState,
        allowedOAuthTenants: {
          ...allowedOAuthTenants,
          [provider]: [...(allowedOAuthTenants[provider] || []), tenantId],
        },
      }));
    },
  });

  const availableOAuthProviderSelectItems = ALL_OAUTH_TENANT_PROVIDERS.filter((provider) =>
    orgConfigAuthMethods.includes(getMethodFromProvider(provider)),
  ).map((provider) => ({
    label: getDisplayKnownTenantProvider(provider),
    value: provider,
  }));

  const areOAuthProvidersAvailableToAdd = availableOAuthProviderSelectItems.length > 0;

  return (
    <SettingsSection
      title="OAuth accounts"
      titleVariant="h5"
      tooltipText="Your company's instance/organization/workspace on common OAuth providers (e.g. Slack workspace, Github organization)."
    >
      <OAuthAccountModal {...oauthModalProps} availableOAuthProviderSelectItems={availableOAuthProviderSelectItems} />
      <ListEditor
        items={allowedOAuthTenantsList}
        rowKeyExtractor={(item) => serializeProviderAndTenantId(item.provider, item.tenantId)}
        emptyText="No accounts added."
        itemRenderer={[
          {
            title: 'OAuth Provider',
            getValue: (item) => <Typography variant="body2">{getDisplayTenantProvider(item.provider)}</Typography>,
          },
          {
            title: 'Allowed Tenants',
            getValue: (item) => <Typography variant="body2">{item.tenantId}</Typography>,
          },
        ]}
        onAdd={() => {
          reset();
          open();
        }}
        getItemActionProps={
          editing && canSetOAuthTenants
            ? ({ provider, tenantId }) => ({
                warningAction: {
                  text: 'Delete',
                  onClick: () => {
                    setLocalState((prevState) => {
                      return {
                        ...prevState,
                        allowedOAuthTenants: {
                          ...prevState.allowedOAuthTenants,
                          [provider]: prevState.allowedOAuthTenants[provider].filter((val) => val !== tenantId),
                        },
                      };
                    });
                  },
                },
              })
            : undefined
        }
        hideAddButton={!canSetOAuthTenants || !editing || !areOAuthProvidersAvailableToAdd}
        addButtonText="Add account"
      />
    </SettingsSection>
  );
};

const OrgSettingsUserOnboardingBody = ({
  canSetEmailInvites,
  canSetEmailJitProvisioning,
  canSetAllowedDomains,
  canSetSsoJitProvisioning,
  canSetOAuthTenants,
  canSetOAuthTenantJitProvisioning,
  localState,
  remoteState,
  setLocalState,
}: OrgSettingsUserOnboardingBodyProps) => {
  const { editing } = useSettingsContainer();

  const {
    emailInvites,
    isEmailJitProvisioningAllowed,
    ssoJitProvisioning,
    isOauthTenantJitProvisioningAllowed,
    allowedOAuthTenants,
  } = editing ? localState : remoteState;

  const handleEmailJitProvisioningChange = useStateSliceSetter(setLocalState, 'isEmailJitProvisioningAllowed');
  const handleEmailInvitesChange = useStateSliceSetter(setLocalState, 'emailInvites');
  const handleSsoJitProvisioningChange = useStateSliceSetter(setLocalState, 'ssoJitProvisioning');
  const handleOAuthTenantJitProvisioningChange = useStateSliceSetter(
    setLocalState,
    'isOauthTenantJitProvisioningAllowed',
  );

  const orgConfigAuthMethods = useAllowedAuthMethods();
  const ssoIsAllowedAuthMethod = useMemo(() => orgConfigAuthMethods.includes('sso'), [orgConfigAuthMethods]);
  const oauthIsAllowedAuthMethod = useMemo(() => orgConfigAuthMethods.some(isOauthMethod), [orgConfigAuthMethods]);

  const areOAuthProvidersAvailableToAdd = useMemo(() => {
    return ALL_OAUTH_TENANT_PROVIDERS.some((provider) =>
      orgConfigAuthMethods.includes(getMethodFromProvider(provider)),
    );
  }, [orgConfigAuthMethods]);
  const oauthProvidersExist = Object.keys(allowedOAuthTenants).length > 0;

  const showEmailTable = emailInvites === 'RESTRICTED' || isEmailJitProvisioningAllowed;
  const showOAuthTable =
    isOauthTenantJitProvisioningAllowed &&
    oauthIsAllowedAuthMethod &&
    (areOAuthProvidersAvailableToAdd || oauthProvidersExist);
  const showSsoComponents = ssoJitProvisioning !== 'NOT_ALLOWED' && ssoIsAllowedAuthMethod;

  const showOAuthJitCheckbox = oauthIsAllowedAuthMethod && (areOAuthProvidersAvailableToAdd || oauthProvidersExist);
  const showSsoJitCheckbox = ssoIsAllowedAuthMethod;

  return (
    <FlexBox flexDirection="column" gap={2}>
      <SettingsSection title="Invites">
        <Switch
          readOnly={!editing || !canSetEmailInvites}
          label={'Allow members to be invited by email'}
          checked={emailInvites !== 'NOT_ALLOWED'}
          onChange={(value) => handleEmailInvitesChange(value ? 'ALL_ALLOWED' : 'NOT_ALLOWED')}
        />
        {emailInvites !== 'NOT_ALLOWED' && (
          <PaddingLeft>
            <FlexBox flexDirection="row" flexWrap="wrap">
              <RadioGroup
                onChange={handleEmailInvitesChange}
                value={emailInvites}
                readOnly={!editing || !canSetEmailInvites}
                items={Object.entries(emailInvitesLabelMap).map(([value, label]) => {
                  return {
                    value,
                    label,
                  };
                })}
              />
            </FlexBox>
          </PaddingLeft>
        )}
      </SettingsSection>
      <SettingsSection
        title="JIT Provisioning"
        tooltipText="If JIT provisioning is enabled, users who successfully authenticate using the specified methods will be automatically granted an account if they do not already exist."
      >
        <Typography variant="body2">Allow users to automatically join based on your access control list</Typography>
        <PaddingLeft>
          <FlexBox flexDirection="row" flexWrap="wrap">
            <Checkbox
              disabled={!editing || !canSetEmailJitProvisioning}
              label="Email domains"
              checked={isEmailJitProvisioningAllowed}
              onClick={handleEmailJitProvisioningChange}
            />
            {showOAuthJitCheckbox && (
              <Checkbox
                disabled={!editing || !canSetOAuthTenantJitProvisioning}
                label="OAuth accounts"
                checked={isOauthTenantJitProvisioningAllowed}
                onClick={handleOAuthTenantJitProvisioningChange}
              />
            )}
            {showSsoJitCheckbox && (
              <Checkbox
                disabled={!editing || !canSetSsoJitProvisioning}
                label="SSO connections"
                checked={ssoJitProvisioning !== 'NOT_ALLOWED'}
                onClick={(value) => handleSsoJitProvisioningChange(value ? 'RESTRICTED' : 'NOT_ALLOWED')}
              />
            )}
          </FlexBox>
        </PaddingLeft>
      </SettingsSection>
      {(showEmailTable || showOAuthTable || showSsoComponents) && (
        <SettingsSection title="Access control list">
          <FlexBox flexDirection="column" gap={editing ? 1 : 3}>
            {showEmailTable && (
              <EmailDomainsTable
                localState={localState}
                remoteState={remoteState}
                setLocalState={setLocalState}
                canSetAllowedDomains={canSetAllowedDomains}
                editing={editing}
              />
            )}
            {showOAuthTable && (
              <OAuthTenantsTable
                localState={localState}
                remoteState={remoteState}
                setLocalState={setLocalState}
                canSetOAuthTenants={canSetOAuthTenants}
                editing={editing}
              />
            )}
            {showSsoComponents && (
              <SsoConnectionsTable
                localState={localState}
                remoteState={remoteState}
                setLocalState={setLocalState}
                canSetSsoJitProvisioning={canSetSsoJitProvisioning}
                editing={editing}
              />
            )}
          </FlexBox>
        </SettingsSection>
      )}
    </FlexBox>
  );
};

export const OrgSettingsUserOnboardingSection = ({ orgInfo }: { orgInfo: Organization }) => {
  const { data: canSetEmailJitProvisioning } = useRbac('stytch.organization', 'update.settings.email-jit-provisioning');
  const { data: canSetSsoJitProvisioning } = useRbac('stytch.organization', 'update.settings.sso-jit-provisioning');
  const { data: canSetOAuthTenantJitProvisioning } = useRbac(
    'stytch.organization',
    'update.settings.oauth-tenant-jit-provisioning',
  );
  const { data: canSetEmailInvites } = useRbac('stytch.organization', 'update.settings.email-invites');
  const { data: canSetAllowedDomains } = useRbac('stytch.organization', 'update.settings.allowed-domains');
  const { data: canSetOAuthTenants } = useRbac('stytch.organization', 'update.settings.allowed-oauth-tenants');

  const remoteState = useMemo<UserOnboardingFormState>(
    () => ({
      emailInvites: orgInfo.email_invites,
      emailAllowedDomains: orgInfo.email_allowed_domains,
      isEmailJitProvisioningAllowed: orgInfo.email_jit_provisioning !== 'NOT_ALLOWED',
      ssoJitProvisioning: orgInfo.sso_jit_provisioning,
      ssoAllowedConnections: orgInfo.sso_jit_provisioning_allowed_connections,
      isOauthTenantJitProvisioningAllowed: orgInfo.oauth_tenant_jit_provisioning !== 'NOT_ALLOWED',
      allowedOAuthTenants: orgInfo.allowed_oauth_tenants,
    }),
    [orgInfo],
  );
  const { localState, setLocalState, editing, handleSetEditing } = useFormState({ remoteState });
  const { setOrgAuthSettings } = useMutateAuthSettings();
  const { useBlockNavigation } = useOrgSettingsRouterController();
  const handleSave = useCallback(async () => {
    const mutatedProperties: Partial<B2BOrganizationsUpdateOptions> = {};
    if (localState.isEmailJitProvisioningAllowed !== remoteState.isEmailJitProvisioningAllowed) {
      mutatedProperties.email_jit_provisioning = localState.isEmailJitProvisioningAllowed
        ? 'RESTRICTED'
        : 'NOT_ALLOWED';
    }
    if (localState.emailInvites !== remoteState.emailInvites) {
      mutatedProperties.email_invites = localState.emailInvites;
    }
    if (!arraysHaveSameContents(localState.emailAllowedDomains, remoteState.emailAllowedDomains)) {
      mutatedProperties.email_allowed_domains = localState.emailAllowedDomains;
    }
    if (localState.ssoJitProvisioning !== remoteState.ssoJitProvisioning) {
      mutatedProperties.sso_jit_provisioning = localState.ssoJitProvisioning;
    }
    if (!arraysHaveSameContents(localState.ssoAllowedConnections, remoteState.ssoAllowedConnections)) {
      mutatedProperties.sso_jit_provisioning_allowed_connections = localState.ssoAllowedConnections;
    }
    if (localState.isOauthTenantJitProvisioningAllowed !== remoteState.isOauthTenantJitProvisioningAllowed) {
      mutatedProperties.oauth_tenant_jit_provisioning = localState.isOauthTenantJitProvisioningAllowed
        ? 'RESTRICTED'
        : 'NOT_ALLOWED';
    }
    if (
      !arraysHaveSameContents(
        Object.entries(localState.allowedOAuthTenants),
        Object.entries(remoteState.allowedOAuthTenants),
      )
    ) {
      mutatedProperties.allowed_oauth_tenants = localState.allowedOAuthTenants;
    }

    if (Object.keys(mutatedProperties).length > 0) {
      await setOrgAuthSettings(mutatedProperties);
    }
  }, [
    localState.allowedOAuthTenants,
    localState.emailAllowedDomains,
    localState.emailInvites,
    localState.isEmailJitProvisioningAllowed,
    localState.isOauthTenantJitProvisioningAllowed,
    localState.ssoAllowedConnections,
    localState.ssoJitProvisioning,
    remoteState.allowedOAuthTenants,
    remoteState.emailAllowedDomains,
    remoteState.emailInvites,
    remoteState.isEmailJitProvisioningAllowed,
    remoteState.isOauthTenantJitProvisioningAllowed,
    remoteState.ssoAllowedConnections,
    remoteState.ssoJitProvisioning,
    setOrgAuthSettings,
  ]);

  const disableSave = useMemo(() => {
    return (
      arraysHaveSameContents(localState.emailAllowedDomains, remoteState.emailAllowedDomains) &&
      localState.emailInvites === remoteState.emailInvites &&
      localState.isEmailJitProvisioningAllowed === remoteState.isEmailJitProvisioningAllowed &&
      localState.ssoJitProvisioning === remoteState.ssoJitProvisioning &&
      arraysHaveSameContents(localState.ssoAllowedConnections, remoteState.ssoAllowedConnections) &&
      localState.isOauthTenantJitProvisioningAllowed === remoteState.isOauthTenantJitProvisioningAllowed &&
      arraysHaveSameContents(
        Object.entries(localState.allowedOAuthTenants),
        Object.entries(remoteState.allowedOAuthTenants),
      )
    );
  }, [
    localState.allowedOAuthTenants,
    localState.emailAllowedDomains,
    localState.emailInvites,
    localState.isEmailJitProvisioningAllowed,
    localState.isOauthTenantJitProvisioningAllowed,
    localState.ssoAllowedConnections,
    localState.ssoJitProvisioning,
    remoteState.allowedOAuthTenants,
    remoteState.emailAllowedDomains,
    remoteState.emailInvites,
    remoteState.isEmailJitProvisioningAllowed,
    remoteState.isOauthTenantJitProvisioningAllowed,
    remoteState.ssoAllowedConnections,
    remoteState.ssoJitProvisioning,
  ]);
  return (
    <SettingsContainer
      hasCTA={
        canSetEmailJitProvisioning ||
        canSetEmailInvites ||
        canSetAllowedDomains ||
        canSetSsoJitProvisioning ||
        canSetOAuthTenants ||
        canSetOAuthTenantJitProvisioning
      }
      title="User onboarding"
      onSave={handleSave}
      useBlockNavigation={useBlockNavigation}
      editing={editing}
      setEditing={handleSetEditing}
      disableSave={disableSave}
    >
      <OrgSettingsUserOnboardingBody
        canSetEmailJitProvisioning={canSetEmailJitProvisioning}
        canSetEmailInvites={canSetEmailInvites}
        canSetAllowedDomains={canSetAllowedDomains}
        canSetSsoJitProvisioning={canSetSsoJitProvisioning}
        canSetOAuthTenantJitProvisioning={canSetOAuthTenantJitProvisioning}
        canSetOAuthTenants={canSetOAuthTenants}
        localState={localState}
        remoteState={remoteState}
        setLocalState={setLocalState}
      />
    </SettingsContainer>
  );
};
