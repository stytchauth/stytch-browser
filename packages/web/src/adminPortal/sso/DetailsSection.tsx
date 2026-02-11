import {
  B2BSSOOIDCUpdateConnectionOptions,
  B2BSSOSAMLUpdateConnectionOptions,
  B2BSSOUpdateExternalConnectionOptions,
  StytchSDKAPIError,
  X509Certificate,
} from '@stytch/core/public';
import React, { useCallback, useMemo, useState } from 'react';

import { deepEqual } from '../../utils/deepEqual';
import { Button } from '../components/Button';
import { CopyableText } from '../components/CopyableText';
import { FlexBox } from '../components/FlexBox';
import { Input } from '../components/Input';
import { ListEditor } from '../components/ListEditor';
import { Modal, useModalState } from '../components/Modal';
import { Select } from '../components/Select';
import { SettingsContainer, useSettingsContainer } from '../components/SettingsContainer';
import { SettingsList } from '../components/SettingsList';
import { SettingsListItem } from '../components/SettingsListItem';
import { SettingsSection } from '../components/SettingsSection';
import { Typography } from '../components/Typography';
import { TableItemRenderer } from '../shared/components/types';
import { StateProps, useFormState } from '../utils/useFormState';
import {
  useDeleteSsoConnectionCert,
  useMutateSsoConnection,
  useMutateSsoConnectionByUrl,
} from '../utils/useMutateSsoConnection';
import { useStateSliceSetter } from '../utils/useStateSliceSetter';
import { DefaultAppDetails } from './AppDetails';
import { AttributeMappingTable } from './AttributeMappingTable';
import { getIdpAndConnectionInfo } from './IdpInfo';
import { oidcIdpSelectItems, samlIdpSelectItems } from './IdpSelect';
import { useSsoRouterController } from './SSORouter';
import { TaggedConnection } from './TaggedConnection';

const certItemRenderer: TableItemRenderer<CertificateListItem>[] = [
  {
    title: 'Issuer',
    getValue: (item) => <Typography variant="body2">{'issuer' in item ? item.issuer : 'Pending'}</Typography>,
  },
  {
    title: 'Created',
    getValue: (item) => (
      <Typography variant="body2">
        {'created_at' in item ? new Date(item.created_at).toLocaleString() : 'Pending'}
      </Typography>
    ),
  },
  {
    title: 'Expires',
    getValue: (item) => (
      <Typography variant="body2">
        {'expires_at' in item ? new Date(item.expires_at).toLocaleString() : 'Pending'}
      </Typography>
    ),
  },
];

const certKeyExtractor = (item: CertificateListItem): string =>
  'certificate_id' in item ? item.certificate_id : 'new-certificate-id-pending';

interface SamlDetailsFormState {
  identityProvider: string;
  metadataUrl?: string;
  ssoUrl?: string;
  entityId?: string;
  certificate?: string;
  deletedCertificateIds?: string[];
}

interface OidcDetailsFormState {
  identityProvider: string;
  clientId: string;
  clientSecret: string;
  issuer?: string;
  issuerDerivedValue?: string;
  authorizationUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
  jwksUrl?: string;
}

interface DetailsFormState extends Partial<SamlDetailsFormState>, Partial<OidcDetailsFormState> {
  displayName: string;
  attributeMapping: Record<string, string>;
  manualConfiguration: boolean;
}

interface FormSectionBody<TFormState> {
  localState: TFormState;
  remoteState: TFormState;
  setLocalState: (state: React.SetStateAction<TFormState>) => void;
}

interface DetailsSectionBodyProps extends FormSectionBody<DetailsFormState> {
  connection: TaggedConnection;
}

type X509CertificateListItem = X509Certificate & Record<string, unknown>;

type CertificateListItem = X509CertificateListItem | { certificate: string; isPending: true };

interface CertificateTableState {
  certificate?: string | undefined;
  deletedCertificateIds?: string[];
}

interface CertificateTableProps<TState> extends StateProps<TState, X509Certificate[] | undefined> {
  editing: boolean;
  manualConfiguration: boolean;
}

const CertificateTable = <TState extends CertificateTableState>({
  editing,
  localState,
  manualConfiguration,
  remoteState,
  setLocalState,
}: CertificateTableProps<TState>) => {
  const certificates = useMemo<CertificateListItem[] | undefined>(() => {
    if (!remoteState) {
      return undefined;
    }

    const remoteCertificates = remoteState as X509CertificateListItem[];

    if (!editing) {
      return remoteCertificates;
    }

    return [
      ...remoteCertificates.filter((cert) => !localState.deletedCertificateIds?.includes(cert.certificate_id)),
      ...(localState.certificate
        ? [
            {
              certificate: localState.certificate,
              isPending: true,
            } satisfies CertificateListItem,
          ]
        : []),
    ];
  }, [editing, localState, remoteState]);

  const viewCertModalProps = useModalState();
  const [viewCertificateContents, setViewCertificateContents] = useState<string>();

  const persistPendingCertificate = useStateSliceSetter(setLocalState, 'certificate');
  const addCertModalProps = useModalState(() => {
    persistPendingCertificate(pendingCert);
  });
  const [pendingCert, setPendingCert] = useState('');

  const remoteCertificateCount = remoteState?.length ?? 0;
  const remoteCertificatePendingDeletionCount = localState.deletedCertificateIds?.length ?? 0;

  const minimumRequiredCertificates = 1;
  const maximumAllowedCertificates = 5;

  const canDeleteCertificates =
    remoteCertificateCount - remoteCertificatePendingDeletionCount > minimumRequiredCertificates;

  const canAddCertificate =
    editing &&
    manualConfiguration &&
    !localState.certificate &&
    remoteCertificateCount - remoteCertificatePendingDeletionCount < maximumAllowedCertificates;

  return (
    <>
      <Modal {...viewCertModalProps} title="View x509 Certificate" confirmButtonText="Close" noCancelButton>
        <CopyableText whiteSpace="pre-wrap">{viewCertificateContents}</CopyableText>
      </Modal>
      <Modal {...addCertModalProps} title="Add Certificate">
        <Input
          label="x509 Certificate"
          multiline
          onChange={(value) => {
            setPendingCert(value);
          }}
          placeholder="Enter certificate"
          value={pendingCert}
        />
      </Modal>
      <ListEditor
        items={certificates ?? []}
        itemRenderer={certItemRenderer}
        rowKeyExtractor={certKeyExtractor}
        onAdd={() => {
          setPendingCert('');
          addCertModalProps.open();
        }}
        getItemActionProps={(item) => ({
          action: {
            text: item.isPending ? 'Edit' : 'View',
            onClick: () => {
              if (item.isPending) {
                setPendingCert(item.certificate);
                addCertModalProps.open();
              } else {
                setViewCertificateContents(item.certificate);
                viewCertModalProps.open();
              }
            },
          },
          warningAction:
            editing && (item.isPending || canDeleteCertificates)
              ? {
                  text: 'Delete',
                  onClick: () => {
                    if (item.isPending) {
                      persistPendingCertificate(undefined);
                    } else if ('certificate_id' in item) {
                      setLocalState((state) => {
                        return {
                          ...state,
                          deletedCertificateIds: [...(state.deletedCertificateIds ?? []), item.certificate_id],
                        };
                      });
                    }
                  },
                }
              : undefined,
        })}
        hideAddButton={!canAddCertificate}
      />
    </>
  );
};

const DetailsSectionBody = ({
  connection: taggedConnection,
  localState,
  remoteState,
  setLocalState,
}: DetailsSectionBodyProps) => {
  const { editing } = useSettingsContainer();

  const { displayName, identityProvider } = editing ? localState : remoteState;

  const handleDisplayNameChange = useStateSliceSetter(setLocalState, 'displayName');
  const handleIdentityProviderChange = useStateSliceSetter(setLocalState, 'identityProvider');

  const handleMetadataUrlChange = useStateSliceSetter(setLocalState, 'metadataUrl');
  const handleSsoUrlChange = useStateSliceSetter(setLocalState, 'ssoUrl');
  const handleEntityIdChange = useStateSliceSetter(setLocalState, 'entityId');

  const handleClientIdChange = useStateSliceSetter(setLocalState, 'clientId');
  const handleClientSecretChange = useStateSliceSetter(setLocalState, 'clientSecret');
  const handleIssuerChange = useStateSliceSetter(setLocalState, 'issuer');
  const handleIssuerDerivedValueChange = useStateSliceSetter(setLocalState, 'issuerDerivedValue');
  const handleAuthorizationUrlChange = useStateSliceSetter(setLocalState, 'authorizationUrl');
  const handleTokenUrlChange = useStateSliceSetter(setLocalState, 'tokenUrl');
  const handleUserInfoUrlChange = useStateSliceSetter(setLocalState, 'userInfoUrl');
  const handleJwksUrlChange = useStateSliceSetter(setLocalState, 'jwksUrl');

  const { connection, idp, type } = getIdpAndConnectionInfo(taggedConnection);

  const idpRequiresManualConfig = type === 'saml' && idp.metadataUrlLabel === false;
  const manualConfiguration = localState.manualConfiguration || idpRequiresManualConfig;
  const setManualConfiguration = useStateSliceSetter(setLocalState, 'manualConfiguration');

  return (
    <FlexBox flexDirection="column" gap={2}>
      <SettingsSection title="Display Name">
        {editing ? (
          <Input value={displayName} onChange={handleDisplayNameChange} />
        ) : (
          <Typography variant="body2">{displayName}</Typography>
        )}
      </SettingsSection>
      {connection.connectionType === 'external' && (
        <>
          <SettingsSection title="Source Organization ID">
            <CopyableText>{connection.external_organization_id}</CopyableText>
          </SettingsSection>
          <SettingsSection title="Connection ID">
            <CopyableText>{connection.connection_id}</CopyableText>
          </SettingsSection>
          <SettingsSection title="External Connection ID">
            <CopyableText>{connection.external_connection_id}</CopyableText>
          </SettingsSection>
        </>
      )}
      {(type === 'saml' || type === 'oidc') && (
        <>
          <SettingsSection title="IdP">
            {editing ? (
              <Select
                width={360}
                placeholder="Select"
                selectItems={type === 'saml' ? samlIdpSelectItems : oidcIdpSelectItems}
                value={identityProvider}
                onChange={handleIdentityProviderChange}
              />
            ) : (
              <Typography variant="body2">{idp.displayName}</Typography>
            )}
          </SettingsSection>
          <SettingsSection title="App Values" tooltipText="Copy these App (Service Provider) Values into your IdP.">
            <SettingsList>
              <SettingsListItem title="Connection ID">
                <CopyableText>{connection.connection_id}</CopyableText>
              </SettingsListItem>
              <DefaultAppDetails connection={connection} />
            </SettingsList>
          </SettingsSection>
          <SettingsSection title="IdP Values">
            <SettingsList>
              {type === 'saml' && (
                <>
                  {editing && !manualConfiguration ? (
                    <SettingsListItem title={idp.metadataUrlLabel}>
                      <Input
                        placeholder={`Enter ${idp.metadataUrlLabel}`}
                        value={localState.metadataUrl || ''}
                        onChange={handleMetadataUrlChange}
                      />
                    </SettingsListItem>
                  ) : (
                    <>
                      <SettingsListItem title={idp.idpSsoUrlLabel}>
                        {editing ? (
                          <Input
                            placeholder={`Enter ${idp.idpSsoUrlLabel}`}
                            value={localState.ssoUrl || ''}
                            onChange={handleSsoUrlChange}
                          />
                        ) : (
                          <Typography variant="body2">{connection.idp_sso_url || '–'}</Typography>
                        )}
                      </SettingsListItem>
                      <SettingsListItem title={idp.idpEntityIdLabel}>
                        {editing ? (
                          <Input
                            placeholder={`Enter ${idp.idpEntityIdLabel}`}
                            value={localState.entityId || ''}
                            onChange={handleEntityIdChange}
                          />
                        ) : (
                          <Typography variant="body2">{connection.idp_entity_id || '–'}</Typography>
                        )}
                      </SettingsListItem>
                    </>
                  )}
                  <SettingsListItem title={idp.x509CertificateLabel}>
                    <CertificateTable
                      editing={editing}
                      remoteState={connection.verification_certificates}
                      localState={localState}
                      setLocalState={setLocalState}
                      manualConfiguration={manualConfiguration}
                    />
                  </SettingsListItem>
                  {editing && !idpRequiresManualConfig && (
                    <Button
                      compact
                      variant="ghost"
                      onClick={() => {
                        setManualConfiguration(!manualConfiguration);
                      }}
                    >
                      {manualConfiguration ? `Configure using ${idp.metadataUrlLabel}` : 'Configure manually'}
                    </Button>
                  )}
                </>
              )}
              {type === 'oidc' && (
                <>
                  <SettingsListItem title={idp.clientIdLabel}>
                    {editing ? (
                      <Input
                        placeholder={`Enter ${idp.clientIdLabel}`}
                        value={localState.clientId || ''}
                        onChange={handleClientIdChange}
                      />
                    ) : (
                      <Typography variant="body2">{connection.client_id || '–'}</Typography>
                    )}
                  </SettingsListItem>
                  <SettingsListItem title={idp.clientSecretLabel}>
                    {editing ? (
                      <Input
                        placeholder={`Enter ${idp.clientSecretLabel}`}
                        value={localState.clientSecret || ''}
                        onChange={handleClientSecretChange}
                      />
                    ) : (
                      <Typography variant="body2">{connection.client_secret || '–'}</Typography>
                    )}
                  </SettingsListItem>
                  {idp.issuerDerivedLabel ? (
                    <SettingsListItem title={idp.issuerDerivedLabel}>
                      {editing ? (
                        <Input
                          placeholder={`Enter ${idp.issuerDerivedLabel}`}
                          value={localState.issuerDerivedValue || ''}
                          onChange={handleIssuerDerivedValueChange}
                        />
                      ) : (
                        <Typography variant="body2">
                          {idp.extractIssuerFromInput?.(connection.issuer) || '–'}
                        </Typography>
                      )}
                    </SettingsListItem>
                  ) : (
                    <SettingsListItem title={idp.issuerLabel}>
                      {editing ? (
                        <Input placeholder="URL" value={localState.issuer || ''} onChange={handleIssuerChange} />
                      ) : (
                        <Typography variant="body2">{connection.issuer || '–'}</Typography>
                      )}
                    </SettingsListItem>
                  )}
                  {editing && (
                    <>
                      {manualConfiguration && (
                        <>
                          <SettingsListItem title="Authorization URL">
                            <Input
                              placeholder="Enter Authorization URL"
                              value={localState.authorizationUrl || ''}
                              onChange={handleAuthorizationUrlChange}
                            />
                          </SettingsListItem>
                          <SettingsListItem title="Token URL">
                            <Input
                              placeholder="Enter Token URL"
                              value={localState.tokenUrl || ''}
                              onChange={handleTokenUrlChange}
                            />
                          </SettingsListItem>
                          <SettingsListItem title="User info URL">
                            <Input
                              placeholder="Enter User info URL"
                              value={localState.userInfoUrl || ''}
                              onChange={handleUserInfoUrlChange}
                            />
                          </SettingsListItem>
                          <SettingsListItem title="JWKS URL">
                            <Input
                              placeholder="Enter JWKS URL"
                              value={localState.jwksUrl || ''}
                              onChange={handleJwksUrlChange}
                            />
                          </SettingsListItem>
                        </>
                      )}
                      <Button
                        compact
                        variant="ghost"
                        onClick={() => {
                          setManualConfiguration(!manualConfiguration);
                        }}
                      >
                        {manualConfiguration
                          ? `Configure using ${idp.issuerDerivedLabel ?? idp.issuerLabel}`
                          : 'Configure manually'}
                      </Button>
                    </>
                  )}
                </>
              )}
            </SettingsList>
          </SettingsSection>
        </>
      )}
      {type === 'saml' && (
        <SettingsSection title={idp.attributeMappingLabel}>
          <AttributeMappingTable
            editing={editing}
            localState={localState}
            remoteState={remoteState}
            setLocalState={setLocalState}
          />
        </SettingsSection>
      )}
    </FlexBox>
  );
};

export const DetailsSection = ({
  canUpdateConnection,
  connection: connectionProp,
}: {
  canUpdateConnection: boolean;
  connection: TaggedConnection;
}) => {
  const { idp, connection, type } = getIdpAndConnectionInfo(connectionProp);

  const remoteState = useMemo<DetailsFormState>(
    () => ({
      displayName: connection.display_name,
      identityProvider: 'identity_provider' in connection ? connection.identity_provider : undefined,
      attributeMapping: 'attribute_mapping' in connection ? connection.attribute_mapping : {},
      manualConfiguration: false,
      authorizationUrl: 'authorization_url' in connection ? connection.authorization_url : undefined,
      clientId: 'client_id' in connection ? connection.client_id : undefined,
      clientSecret: 'client_secret' in connection ? connection.client_secret : undefined,
      entityId: 'idp_entity_id' in connection ? connection.idp_entity_id : undefined,
      issuer: 'issuer' in connection ? connection.issuer : undefined,
      issuerDerivedValue: type === 'oidc' ? idp.extractIssuerFromInput?.(connection.issuer) : undefined,
      jwksUrl: 'jwks_url' in connection ? connection.jwks_url : undefined,
      ssoUrl: 'idp_sso_url' in connection ? connection.idp_sso_url : undefined,
      tokenUrl: 'token_url' in connection ? connection.token_url : undefined,
      userInfoUrl: 'userinfo_url' in connection ? connection.userinfo_url : undefined,
    }),
    [connection, idp, type],
  );

  const { localState, setLocalState, editing, handleSetEditing } = useFormState({ remoteState });

  const { mutate } = useMutateSsoConnection(type);
  const { mutate: deleteCertificate } = useDeleteSsoConnectionCert();
  const { mutate: mutateByUrl } = useMutateSsoConnectionByUrl();

  const handleSave = useCallback(async () => {
    const baseOptions = {
      connection_id: connection.connection_id,
    };

    const mutatedProperties: Partial<
      B2BSSOOIDCUpdateConnectionOptions & B2BSSOSAMLUpdateConnectionOptions & B2BSSOUpdateExternalConnectionOptions
    > = {};

    if (remoteState.displayName !== localState.displayName) {
      mutatedProperties.display_name = localState.displayName;
    }
    if (remoteState.identityProvider !== localState.identityProvider) {
      mutatedProperties.identity_provider = localState.identityProvider;
    }

    const idpRequiresManualConfig = type === 'saml' && idp.metadataUrlLabel === false;
    const isManualConfig = localState.manualConfiguration || idpRequiresManualConfig;

    if (type === 'saml') {
      if (localState.deletedCertificateIds?.length) {
        for (const certificateId of localState.deletedCertificateIds) {
          try {
            await deleteCertificate({
              connection_id: connection.connection_id,
              certificate_id: certificateId,
            });
          } catch (e) {
            // If certificate was not found, we can ignore the error since we
            // were trying to delete it anyway
            if (e instanceof StytchSDKAPIError && e.error_type === 'sso_verification_key_not_found') {
              return;
            }
            throw e;
          }

          // Update local state to reflect that the certificate was deleted, in
          // case a later operation fails
          setLocalState((state) => {
            return {
              ...state,
              deletedCertificateIds: state.deletedCertificateIds?.filter((id) => id !== certificateId),
            };
          });
        }
      }

      if (isManualConfig) {
        if (localState.ssoUrl !== remoteState.ssoUrl) {
          mutatedProperties.idp_sso_url = localState.ssoUrl;
        }
        if (localState.entityId !== remoteState.entityId) {
          mutatedProperties.idp_entity_id = localState.entityId;
        }
        if (localState.certificate) {
          mutatedProperties.x509_certificate = localState.certificate;
        }
      } else if (localState.metadataUrl) {
        await mutateByUrl({
          connection_id: connection.connection_id,
          metadata_url: localState.metadataUrl,
        });
      }

      if (!deepEqual(remoteState.attributeMapping, localState.attributeMapping)) {
        mutatedProperties.attribute_mapping = localState.attributeMapping;
      }
    } else if (type === 'oidc') {
      if (localState.clientId !== remoteState.clientId) {
        mutatedProperties.client_id = localState.clientId;
      }
      if (localState.clientSecret !== remoteState.clientSecret) {
        mutatedProperties.client_secret = localState.clientSecret;
      }

      if (isManualConfig) {
        if (localState.authorizationUrl !== remoteState.authorizationUrl) {
          mutatedProperties.authorization_url = localState.authorizationUrl;
        }
        if (localState.tokenUrl !== remoteState.tokenUrl) {
          mutatedProperties.token_url = localState.tokenUrl;
        }
        if (localState.userInfoUrl !== remoteState.userInfoUrl) {
          mutatedProperties.userinfo_url = localState.userInfoUrl;
        }
        if (localState.jwksUrl !== remoteState.jwksUrl) {
          mutatedProperties.jwks_url = localState.jwksUrl;
        }
      }

      const getIssuer = () => {
        if (localState.issuerDerivedValue !== undefined) {
          // If we failed to extract derived value from the remote connection's
          // issuer, and we the new derived value is empty, leave the field
          // alone
          if (!localState.issuerDerivedValue && !remoteState.issuerDerivedValue) {
            return undefined;
          }

          return idp.transformInputToIssuer?.(localState.issuerDerivedValue);
        }

        return localState.issuer;
      };
      const issuer = getIssuer();

      if (issuer !== undefined && issuer !== remoteState.issuer) {
        mutatedProperties.issuer = issuer;
      }
    }

    if (Object.keys(mutatedProperties).length > 0) {
      await mutate({
        ...baseOptions,
        ...mutatedProperties,
      });
    }
  }, [
    connection.connection_id,
    deleteCertificate,
    idp,
    localState.attributeMapping,
    localState.authorizationUrl,
    localState.certificate,
    localState.clientId,
    localState.clientSecret,
    localState.deletedCertificateIds,
    localState.displayName,
    localState.entityId,
    localState.identityProvider,
    localState.issuer,
    localState.issuerDerivedValue,
    localState.jwksUrl,
    localState.manualConfiguration,
    localState.metadataUrl,
    localState.ssoUrl,
    localState.tokenUrl,
    localState.userInfoUrl,
    mutate,
    mutateByUrl,
    remoteState.attributeMapping,
    remoteState.authorizationUrl,
    remoteState.clientId,
    remoteState.clientSecret,
    remoteState.displayName,
    remoteState.entityId,
    remoteState.identityProvider,
    remoteState.issuer,
    remoteState.issuerDerivedValue,
    remoteState.jwksUrl,
    remoteState.ssoUrl,
    remoteState.tokenUrl,
    remoteState.userInfoUrl,
    setLocalState,
    type,
  ]);

  const { useBlockNavigation } = useSsoRouterController();

  return (
    <SettingsContainer
      title="Details"
      hasCTA={canUpdateConnection}
      onSave={handleSave}
      useBlockNavigation={useBlockNavigation}
      editing={editing}
      setEditing={handleSetEditing}
    >
      <DetailsSectionBody
        connection={connection}
        localState={localState}
        remoteState={remoteState}
        setLocalState={setLocalState}
      />
    </SettingsContainer>
  );
};
