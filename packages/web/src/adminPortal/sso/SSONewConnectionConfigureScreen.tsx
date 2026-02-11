import { ChevronLeft } from '@mui/icons-material';
import { B2BSSOOIDCUpdateConnectionOptions, B2BSSOSAMLUpdateConnectionOptions } from '@stytch/core/public';
import { adminPortalAssets } from '@stytch/internal-assets';
import React, { useCallback, useMemo, useState } from 'react';

import { extractErrorMessage } from '../../utils/extractErrorMessage';
import { Accordion, AccordionDetails, AccordionSummary } from '../components/Accordion';
import { Button } from '../components/Button';
import { FlexBox } from '../components/FlexBox';
import { Input } from '../components/Input';
import { Instruction } from '../components/Instruction';
import { Modal } from '../components/Modal';
import { PaddedContainer } from '../components/PaddedContainer';
import { useToast } from '../components/Toast';
import { Typography } from '../components/Typography';
import { Screenshot } from '../shared/components/Screenshot';
import { useMutateSsoConnection, useMutateSsoConnectionByUrl } from '../utils/useMutateSsoConnection';
import { useOrgInfo } from '../utils/useOrgInfo';
import { AppDetails } from './AppDetails';
import { AttributeMappingState } from './AttributeMappingTable';
import { CreateApplication } from './CreateApplication';
import { DetailedAttributeMappingTable } from './DetailedAttributeMappingTable';
import { getIdpAndConnectionInfo, SamlIdpValue, SamlSetupStep, TaggedIdpInfo, typeToUserFriendlyName } from './IdpInfo';
import { useSsoRouterController } from './SSORouter';
import { OIDCTaggedConnection, SAMLTaggedConnection } from './TaggedConnection';

const useManualConfigurationState = ({ idp, type }: TaggedIdpInfo) => {
  const [manualConfigurationState, setManualConfigurationState] = useState(false);
  const idpRequiresManualConfig = type === 'saml' && idp.metadataUrlLabel === false;
  const manualConfiguration = manualConfigurationState || idpRequiresManualConfig;

  return [manualConfiguration, setManualConfigurationState] as const;
};

const getDefaultAttributeMapping = (idpType: string | undefined): Record<string, string> => {
  const baseMapping = {
    email: 'NameID',
    first_name: 'firstName',
    last_name: 'lastName',
    groups: '',
    idp_user_id: '',
  };

  switch (idpType) {
    case 'okta':
      return {
        ...baseMapping,
        idp_user_id: 'id',
      };
    case 'microsoft-entra':
      return {
        ...baseMapping,
        idp_user_id: 'http://schemas.microsoft.com/identity/claims/objectidentifier',
      };
    // Google Workspace and Generic SAML use the base mapping without modifications
    case 'google-workspace':
    case 'generic':
    default:
      return baseMapping;
  }
};

const OktaSamlInstructions = ({
  connection: connectionProp,
  metadataUrl,
  setMetadataUrl,
}: {
  connection: SAMLTaggedConnection;
  metadataUrl: string;
  setMetadataUrl: (value: string) => void;
}) => {
  const { idp } = getIdpAndConnectionInfo(connectionProp);

  const { data } = useOrgInfo();
  const organizationName = data?.organization_name ?? '';

  return (
    <>
      <div>
        <Instruction>
          Within your newly created SAML Application, navigate to <b>Sign On</b> tab and under{' '}
          <b>Settings → SAML 2.0 → Metadata Details</b> copy the provided <b>Metadata URL</b>.
        </Instruction>
        <PaddedContainer>
          <Input
            label={`${idp.metadataUrlLabel}`}
            placeholder={`Enter ${idp.metadataUrlLabel}`}
            value={metadataUrl}
            onChange={setMetadataUrl}
          />
        </PaddedContainer>
        <Screenshot src={adminPortalAssets.oktaSamlGetMetadataUrl} alt="Okta SAML get metadata URL" />
      </div>
      <Instruction>
        Navigate to <b>Assignments</b> and assign users who should be able to access {organizationName} manually or via
        group membership.
      </Instruction>
      <Screenshot src={adminPortalAssets.oktaAssign} alt="Okta assign" />
    </>
  );
};

const EntraSamlInstructions = ({
  connection: connectionProp,
  metadataUrl,
  setMetadataUrl,
}: {
  connection: SAMLTaggedConnection;
  metadataUrl: string;
  setMetadataUrl: (value: string) => void;
}) => {
  const { idp } = getIdpAndConnectionInfo(connectionProp);

  return (
    <>
      <div>
        <Instruction>
          Within <b>Step 3: SAML Certificates</b> you will see the <b>App Federation Metadata Url</b> value. Copy to
          clipboard and paste below:
        </Instruction>
        <PaddedContainer>
          <Input
            label="App Federation Metadata Url"
            placeholder={`Enter ${idp.metadataUrlLabel}`}
            value={metadataUrl}
            onChange={setMetadataUrl}
          />
        </PaddedContainer>
        <Screenshot src={adminPortalAssets.entraSamlMetadataUrl} alt="Entra SAML Metadata URL" />
        <Instruction>
          You can add users to your application in Entra by navigating to <b>Users and groups</b> in the left-hand
          navigation and selecting <b>Add user/group</b> from the top.
        </Instruction>
        <Screenshot src={adminPortalAssets.entraAddUsersAndGroups} alt="Entra Add Users and Groups" />
      </div>
    </>
  );
};

type OidcInstructionProps = {
  connection: OIDCTaggedConnection;
  clientId: string;
  setClientId: (value: string) => void;
  clientSecret: string;
  setClientSecret: (value: string) => void;
  issuer: string;
  setIssuer: (value: string) => void;
  issuerDerivedValue: string;
  setIssuerDerivedValue: (value: string) => void;
};

const TransformInputToIssuer = ({
  connection: connectionProp,
  issuer,
  setIssuer,
  issuerDerivedValue,
  setIssuerDerivedValue,
}: {
  connection: OIDCTaggedConnection;
  issuer: string;
  setIssuer: (value: string) => void;
  issuerDerivedValue: string;
  setIssuerDerivedValue: (value: string) => void;
}) => {
  const { idp } = getIdpAndConnectionInfo(connectionProp);

  return idp.transformInputToIssuer ? (
    <Input
      label={idp.issuerDerivedLabel}
      labelVariant="body1"
      placeholder={`Enter ${idp.issuerDerivedLabel}`}
      value={issuerDerivedValue}
      onChange={setIssuerDerivedValue}
    />
  ) : (
    <Input
      label={idp.issuerLabel}
      labelVariant="body1"
      placeholder={`Enter ${idp.issuerLabel}`}
      value={issuer}
      onChange={setIssuer}
    />
  );
};

const OktaOidcInstructions = ({
  connection: connectionProp,
  clientId,
  setClientId,
  clientSecret,
  setClientSecret,
  issuer,
  setIssuer,
  issuerDerivedValue,
  setIssuerDerivedValue,
}: OidcInstructionProps) => {
  const { idp } = getIdpAndConnectionInfo(connectionProp);

  return (
    <>
      <div>
        <Instruction>
          Within the <b>General</b> tab for your newly created OIDC Application, copy over the ClientID provided:
        </Instruction>
        <PaddedContainer>
          <Input
            label={idp.clientIdLabel}
            labelVariant="body1"
            placeholder={`Enter ${idp.clientIdLabel}`}
            value={clientId}
            onChange={setClientId}
          />
        </PaddedContainer>
      </div>
      <div>
        <Instruction>
          Ensure that <b>Client authentication</b> is set to <b>Client secret</b> and generate and copy a Client Secret:
        </Instruction>
        <PaddedContainer>
          <Input
            label={idp.clientSecretLabel}
            labelVariant="body1"
            placeholder={`Enter ${idp.clientSecretLabel}`}
            value={clientSecret}
            onChange={setClientSecret}
          />
        </PaddedContainer>
      </div>
      <div>
        <Screenshot src={adminPortalAssets.oktaClientSecret} alt="Okta client secret" />
      </div>
      <div>
        <Instruction>
          Input your Okta URL (Issuer), which can be found in the far right-hand dropdown in the top navigation bar
          under your email. It should look like {`https://<tenant_name>.okta.com`}.
        </Instruction>
        <PaddedContainer>
          <TransformInputToIssuer
            connection={connectionProp}
            issuer={issuer}
            setIssuer={setIssuer}
            issuerDerivedValue={issuerDerivedValue}
            setIssuerDerivedValue={setIssuerDerivedValue}
          />
        </PaddedContainer>
      </div>
    </>
  );
};

const EntraOidcInstructions = ({
  connection: connectionProp,
  clientId,
  setClientId,
  clientSecret,
  setClientSecret,
  issuer,
  setIssuer,
  issuerDerivedValue,
  setIssuerDerivedValue,
}: OidcInstructionProps) => {
  const { idp } = getIdpAndConnectionInfo(connectionProp);

  return (
    <>
      <div>
        <Instruction>
          Navigate to <b>App registration → Overview</b> and under <b>Essentials</b> copy over the following values:
        </Instruction>
        <PaddedContainer>
          <Input
            label={idp.clientIdLabel}
            labelVariant="body1"
            placeholder={`Enter ${idp.clientIdLabel}`}
            value={clientId}
            onChange={setClientId}
          />
          <TransformInputToIssuer
            connection={connectionProp}
            issuer={issuer}
            setIssuer={setIssuer}
            issuerDerivedValue={issuerDerivedValue}
            setIssuerDerivedValue={setIssuerDerivedValue}
          />
        </PaddedContainer>
        <Screenshot src={adminPortalAssets.entraOidcClientIdAndIssuer} alt="Entra OIDC Client ID and Issuer" />
      </div>
      <Instruction>
        Navigate to <b>Certificates & secrets</b> from the left-hand navigation and select <b>New client secrets</b>{' '}
        from the <b>Client secrets</b> section. Add a description, select an expiry, and click <b>Add</b>. Your new
        secret will now be listed in the client secrets table.
      </Instruction>
      <Screenshot src={adminPortalAssets.entraOidcNewClientSecret} alt="Entra OIDC New Client Secret" />
      <div>
        <Instruction>
          Copy the secret from the <b>Value</b> column and input below:
        </Instruction>
        <PaddedContainer>
          <Input
            label={idp.clientSecretLabel}
            labelVariant="body1"
            placeholder={`Enter ${idp.clientSecretLabel}`}
            value={clientSecret}
            onChange={setClientSecret}
          />
        </PaddedContainer>
        <Screenshot src={adminPortalAssets.entraOidcSecretValue} alt="Entra OIDC Secret Value" />
      </div>
    </>
  );
};

const OktaSamlManualConfigurationInstructions = ({
  connection: connectionProp,
  idpValueInputs,
}: {
  connection: SAMLTaggedConnection;
  idpValueInputs: Record<SamlIdpValue, React.ReactNode> | undefined;
}) => {
  const { idp } = getIdpAndConnectionInfo(connectionProp);

  const { data } = useOrgInfo();
  const organizationName = data?.organization_name ?? '';

  return (
    <>
      <div>
        <Instruction>
          Expand <b>More details</b> within the <b>Metadata Details</b> and copy over the following information:
        </Instruction>
        <PaddedContainer>
          {idpValueInputs
            ? idp.idpValueOrder.map((key) => <React.Fragment key={key}>{idpValueInputs[key]}</React.Fragment>)
            : undefined}
        </PaddedContainer>
      </div>
      <Instruction>
        Navigate to <b>Assignments</b> and assign users who should be able to access {organizationName} manually or via
        group membership.
      </Instruction>
      <Screenshot src={adminPortalAssets.oktaAssign} alt="Okta assign" />
    </>
  );
};

const EntraSamlManualConfigurationInstructions = ({
  connection: connectionProp,
  x509Certificate,
  setX509Certificate,
  ssoUrl,
  setSsoUrl,
  entityId,
  setEntityId,
}: {
  connection: SAMLTaggedConnection;
  x509Certificate: string;
  setX509Certificate: (value: string) => void;
  ssoUrl: string;
  setSsoUrl: (value: string) => void;
  entityId: string;
  setEntityId: (value: string) => void;
}) => {
  const { idp } = getIdpAndConnectionInfo(connectionProp);

  const { data } = useOrgInfo();
  const organizationName = data?.organization_name ?? '';

  return (
    <>
      <div>
        <Instruction>
          Click <b>Edit</b> on the <b>SAML Certificate</b> section, and select <b>PEM Certificate download</b> on the
          right hand action toggle for the currently Active certificate, open the Certificate and copy below:
        </Instruction>
        <PaddedContainer>
          <Input
            label={idp.x509CertificateLabel}
            labelVariant="body1"
            placeholder={`Enter ${idp.x509CertificateLabel}`}
            value={x509Certificate}
            onChange={setX509Certificate}
          />
        </PaddedContainer>
      </div>
      <div>
        <Instruction>
          Close the SAML Certificate section, and under Step 4: Set up {organizationName} copy over the following
          values:
        </Instruction>
        <PaddedContainer>
          <Input
            label={idp.idpSsoUrlLabel}
            labelVariant="body1"
            placeholder={`Enter ${idp.idpSsoUrlLabel}`}
            value={ssoUrl}
            onChange={setSsoUrl}
          />
          <Input
            label={idp.idpEntityIdLabel}
            labelVariant="body1"
            placeholder={`Enter ${idp.idpEntityIdLabel}`}
            value={entityId}
            onChange={setEntityId}
          />
        </PaddedContainer>
      </div>
      <Instruction>
        Click <b>Save</b>.
      </Instruction>
      <Instruction>
        You can add users to your application in Entra by navigating to <b>Users and groups</b> in the left-hand
        navigation and selecting <b>Add user/group</b> from the top.
      </Instruction>
      <Screenshot src={adminPortalAssets.entraAddUsersAndGroups} alt="Entra Add Users and Groups" />
    </>
  );
};

const GoogleSamlManualConfigurationInstructions = ({
  connection: connectionProp,
  idpValueInputs,
}: {
  connection: SAMLTaggedConnection;
  idpValueInputs: Record<SamlIdpValue, React.ReactNode> | undefined;
}) => {
  const { idp } = getIdpAndConnectionInfo(connectionProp);

  return (
    <>
      <div>
        <Instruction>
          From <b>Option 2: Copy the SSO URL, entity ID and certificate</b> copy over the following values:
        </Instruction>
        <PaddedContainer>
          {idpValueInputs
            ? idp.idpValueOrder.map((key) => <React.Fragment key={key}>{idpValueInputs[key]}</React.Fragment>)
            : undefined}
        </PaddedContainer>
        <Screenshot src={adminPortalAssets.googleSamlConfigInfo} alt="Google SAML Config Info" />
      </div>
      <Instruction>
        Click <b>Continue</b>.
      </Instruction>
    </>
  );
};

export const SSONewConnectionConfigureScreen = ({
  connection: connectionProp,
}: {
  connection: SAMLTaggedConnection | OIDCTaggedConnection;
}) => {
  const { navigate } = useSsoRouterController();

  const info = getIdpAndConnectionInfo(connectionProp);
  const { connection, idp, type } = info;

  const connectionDisplayName = connection.display_name;

  const { mutate } = useMutateSsoConnection(type);
  const { mutate: mutateByUrl } = useMutateSsoConnectionByUrl();

  const { useBlockNavigation } = useSsoRouterController();
  const [block, setBlock] = useState(true);
  const { allowNavigation, blocked, cancelNavigation } = useBlockNavigation(block);

  const [manualConfiguration, setManualConfiguration] = useManualConfigurationState(info);
  const [metadataUrl, setMetadataUrl] = useState('');
  const [ssoUrl, setSsoUrl] = useState('');
  const [entityId, setEntityId] = useState('');
  const [x509Certificate, setX509Certificate] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issuerDerivedValue, setIssuerDerivedValue] = useState('');
  const [authorizationUrl, setAuthorizationUrl] = useState('');
  const [tokenUrl, setTokenUrl] = useState('');
  const [userInfoUrl, setUserInfoUrl] = useState('');
  const [jwksUrl, setJwksUrl] = useState('');

  const [attributeMappingState, setAttributeMappingState] = useState<AttributeMappingState>(() => ({
    attributeMapping: getDefaultAttributeMapping(connection.identity_provider),
  }));

  const attributeMapping = useMemo(
    // Strip attributes that are not mapped to a value (e.g., the default `groups` attribute)
    () => Object.fromEntries(Object.entries(attributeMappingState.attributeMapping).filter(([, value]) => value)),
    [attributeMappingState.attributeMapping],
  );

  const { openToast } = useToast();

  const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    async (e) => {
      e.preventDefault();

      if (!connection) {
        return;
      }

      try {
        if (type === 'saml') {
          if (manualConfiguration) {
            await mutate({
              connection_id: connection.connection_id,
              idp_sso_url: ssoUrl,
              idp_entity_id: entityId,
              x509_certificate: x509Certificate,
              attribute_mapping: attributeMapping,
            } satisfies B2BSSOSAMLUpdateConnectionOptions);
          } else {
            await mutate({
              connection_id: connection.connection_id,
              attribute_mapping: attributeMapping,
            } satisfies B2BSSOSAMLUpdateConnectionOptions);
            if (metadataUrl) {
              await mutateByUrl({ connection_id: connection.connection_id, metadata_url: metadataUrl });
            }
          }
        } else {
          const options: B2BSSOOIDCUpdateConnectionOptions = {
            connection_id: connection.connection_id,
            client_id: clientId,
            client_secret: clientSecret,
          };

          if (idp.transformInputToIssuer) {
            if (issuerDerivedValue) {
              options.issuer = idp.transformInputToIssuer(issuerDerivedValue);
            }
          } else {
            options.issuer = issuer;
          }

          if (manualConfiguration) {
            options.authorization_url = authorizationUrl;
            options.token_url = tokenUrl;
            options.userinfo_url = userInfoUrl;
            options.jwks_url = jwksUrl;
          }
          await mutate(options);
        }

        setBlock(false);
        navigate({ screen: 'connectionsList' });
      } catch (e) {
        const message = extractErrorMessage(e);
        openToast({ text: message || 'Unable to save connection', type: 'error' });
      }
    },
    [
      connection,
      type,
      navigate,
      manualConfiguration,
      mutate,
      ssoUrl,
      entityId,
      x509Certificate,
      attributeMapping,
      metadataUrl,
      mutateByUrl,
      clientId,
      clientSecret,
      idp,
      issuerDerivedValue,
      issuer,
      authorizationUrl,
      tokenUrl,
      userInfoUrl,
      jwksUrl,
      openToast,
    ],
  );

  const renderSamlConfiguration = () => {
    if (type !== 'saml') return;

    const idpValueInputs: Record<SamlIdpValue, React.ReactNode> = {
      ssoUrl: (
        <Input
          label={idp.idpSsoUrlLabel}
          labelVariant="body1"
          placeholder={`Enter ${idp.idpSsoUrlLabel}`}
          value={ssoUrl}
          onChange={setSsoUrl}
        />
      ),
      entityId: (
        <Input
          label={idp.idpEntityIdLabel}
          labelVariant="body1"
          placeholder={`Enter ${idp.idpEntityIdLabel}`}
          value={entityId}
          onChange={setEntityId}
        />
      ),
      certificate: (
        <Input
          label={idp.x509CertificateLabel}
          labelVariant="body1"
          placeholder={`Enter ${idp.x509CertificateLabel}`}
          value={x509Certificate}
          onChange={setX509Certificate}
        />
      ),
    };

    if (manualConfiguration) {
      switch (connection.identity_provider) {
        case 'okta':
          return <OktaSamlManualConfigurationInstructions connection={connection} idpValueInputs={idpValueInputs} />;
        case 'microsoft-entra':
          return (
            <EntraSamlManualConfigurationInstructions
              connection={connection}
              x509Certificate={x509Certificate}
              setX509Certificate={setX509Certificate}
              ssoUrl={ssoUrl}
              setSsoUrl={setSsoUrl}
              entityId={entityId}
              setEntityId={setEntityId}
            />
          );
        case 'google-workspace':
          return <GoogleSamlManualConfigurationInstructions connection={connection} idpValueInputs={idpValueInputs} />;
      }
    }

    switch (connection.identity_provider) {
      case 'okta':
        return (
          <OktaSamlInstructions connection={connection} metadataUrl={metadataUrl} setMetadataUrl={setMetadataUrl} />
        );
      case 'microsoft-entra':
        return (
          <EntraSamlInstructions connection={connection} metadataUrl={metadataUrl} setMetadataUrl={setMetadataUrl} />
        );
    }

    return manualConfiguration ? (
      idpValueInputs ? (
        idp.idpValueOrder.map((key) => <React.Fragment key={key}>{idpValueInputs[key]}</React.Fragment>)
      ) : undefined
    ) : (
      <div>
        <Instruction>Enter the {idp.metadataUrlLabel} to configure your connection automatically.</Instruction>
        <Input
          placeholder={`Enter ${idp.metadataUrlLabel}`}
          caption={`If you don’t know your ${idp.metadataUrlLabel}, you can configure your connection manually.`}
          value={metadataUrl}
          onChange={setMetadataUrl}
        />
      </div>
    );
  };

  const renderOidcConfiguration = () => {
    if (type !== 'oidc') return;
    if (!manualConfiguration) {
      switch (connection.identity_provider) {
        case 'okta':
          return (
            <OktaOidcInstructions
              connection={connection}
              clientId={clientId}
              setClientId={setClientId}
              clientSecret={clientSecret}
              setClientSecret={setClientSecret}
              issuer={issuer}
              setIssuer={setIssuer}
              issuerDerivedValue={issuerDerivedValue}
              setIssuerDerivedValue={setIssuerDerivedValue}
            />
          );
        case 'microsoft-entra':
          return (
            <EntraOidcInstructions
              connection={connection}
              clientId={clientId}
              setClientId={setClientId}
              clientSecret={clientSecret}
              setClientSecret={setClientSecret}
              issuer={issuer}
              setIssuer={setIssuer}
              issuerDerivedValue={issuerDerivedValue}
              setIssuerDerivedValue={setIssuerDerivedValue}
            />
          );
      }
    }

    return (
      <>
        <Input
          label={idp.clientIdLabel}
          labelVariant="body1"
          placeholder={`Enter ${idp.clientIdLabel}`}
          value={clientId}
          onChange={setClientId}
        />
        <Input
          label={idp.clientSecretLabel}
          labelVariant="body1"
          placeholder={`Enter ${idp.clientSecretLabel}`}
          value={clientSecret}
          onChange={setClientSecret}
        />
        <TransformInputToIssuer
          connection={connection}
          issuer={issuer}
          setIssuer={setIssuer}
          issuerDerivedValue={issuerDerivedValue}
          setIssuerDerivedValue={setIssuerDerivedValue}
        />
        {manualConfiguration && (
          <>
            <Input
              label="Authorization URL"
              labelVariant="body1"
              placeholder="Enter Authorization URL"
              value={authorizationUrl}
              onChange={setAuthorizationUrl}
            />
            <Input
              label="Token URL"
              labelVariant="body1"
              placeholder="Enter Token URL"
              value={tokenUrl}
              onChange={setTokenUrl}
            />
            <Input
              label="User Info URL"
              labelVariant="body1"
              placeholder="Enter User Info"
              value={userInfoUrl}
              onChange={setUserInfoUrl}
            />
            <Input
              label="JWKS URL"
              labelVariant="body1"
              placeholder="Enter JWKS URL"
              value={jwksUrl}
              onChange={setJwksUrl}
            />
          </>
        )}
      </>
    );
  };

  const stepMap: Record<SamlSetupStep, React.ReactNode> = {
    createApplication: (
      <Accordion>
        <AccordionSummary>
          <Typography>Create {typeToUserFriendlyName(type)} Application.</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <CreateApplication connection={connection} />
        </AccordionDetails>
      </Accordion>
    ),
    copyToIdp: (
      <Accordion>
        <AccordionSummary>
          <Typography>Copy the following App values to {idp.copyToOrFromIdpDisplayName}.</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AppDetails connection={connection} />
        </AccordionDetails>
      </Accordion>
    ),
    copyFromIdp: (
      <Accordion>
        <AccordionSummary>
          <Typography>Enter the following from {idp.copyToOrFromIdpDisplayName}.</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FlexBox flexDirection="column" gap={2}>
            <>
              {type === 'saml' && (
                <>
                  {renderSamlConfiguration()}
                  {!!idp.metadataUrlLabel && (
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
                  {renderOidcConfiguration()}
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
          </FlexBox>
        </AccordionDetails>
      </Accordion>
    ),
    attributeMapping: type === 'saml' && (
      <Accordion>
        <AccordionSummary>
          <Typography>Set your {idp.attributeMappingLabel}.</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <DetailedAttributeMappingTable
            connection={connection}
            localState={attributeMappingState}
            setLocalState={setAttributeMappingState}
            remoteState={attributeMappingState}
          />
        </AccordionDetails>
      </Accordion>
    ),
  };

  const steps = idp.setupOrder.map((step) => <React.Fragment key={step}>{stepMap[step]}</React.Fragment>);

  return (
    <form onSubmit={handleSubmit}>
      <Modal
        isOpen={block && blocked}
        close={cancelNavigation}
        confirm={() => {
          allowNavigation();
          return Promise.resolve();
        }}
        title={`Save ${connectionDisplayName}?`}
        confirmButtonText="Save and complete later"
        description={
          'Your SSO connection is not fully configured. It will remain pending until you complete all necessary configuration steps. You can save your progress and complete later or cancel to finish configuration.'
        }
      />
      <FlexBox flexDirection="column" gap={3}>
        <Button
          variant="ghost"
          compact
          onClick={() => {
            navigate({ screen: 'connectionsList' });
          }}
          startIcon={<ChevronLeft />}
        >
          Back to all SSO connections
        </Button>
        <Typography variant="h2">Configure {connectionDisplayName}</Typography>
        <div>{steps}</div>
        <FlexBox justifyContent="flex-end">
          <Button type="submit">Create</Button>
        </FlexBox>
      </FlexBox>
    </form>
  );
};
