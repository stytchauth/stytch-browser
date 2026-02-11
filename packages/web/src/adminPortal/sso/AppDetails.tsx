import { adminPortalAssets } from '@stytch/internal-assets';
import React from 'react';

import { CopyableText } from '../components/CopyableText';
import { IdpField } from '../components/IdpField';
import { Instruction } from '../components/Instruction';
import { InstructionSet } from '../components/InstructionSet';
import { PaddedContainer } from '../components/PaddedContainer';
import { SettingsList } from '../components/SettingsList';
import { Screenshot } from '../shared/components/Screenshot';
import { useOrgInfo } from '../utils/useOrgInfo';
import { getIdpAndConnectionInfo } from './IdpInfo';
import { OIDCTaggedConnection, SAMLTaggedConnection, TaggedConnection } from './TaggedConnection';

const OktaSamlInstructions = ({ connection: connectionProp }: { connection: SAMLTaggedConnection }) => {
  const { connection, idp } = getIdpAndConnectionInfo(connectionProp);

  return (
    <InstructionSet>
      <Instruction>
        Under <b>SAML Settings → General</b> within the app setup flow, input the following values:
      </Instruction>
      <PaddedContainer>
        <SettingsList>
          <IdpField title={idp.acsUrlLabel} value={connection.acs_url} isCopyable={true} />
          <IdpField title="Single sign-on URL (as both Recipient and Destination URL)" value="selected" />
          <IdpField title={idp.audienceUriLabel} value={connection.audience_uri} isCopyable={true} />
          <IdpField title={idp.nameIdFormatLabel} value="EmailAddress" />
          <IdpField title="Application username" value="Email" />
          <IdpField title="Update application username on" value="Create and update" />
        </SettingsList>
      </PaddedContainer>
    </InstructionSet>
  );
};

const EntraSamlInstructions = ({ connection: connectionProp }: { connection: SAMLTaggedConnection }) => {
  const { connection, idp } = getIdpAndConnectionInfo(connectionProp);

  return (
    <InstructionSet>
      <Instruction>
        Within your new application navigate to the <b>Single Sign-On</b> page in the left-hand navigation of the
        application view, and select <b>SAML</b>.
      </Instruction>
      <Instruction>
        Within the <b>Set up Single Sign-On with SAML page</b>, select the <b>Edit</b> button on Step 1:{' '}
        <b>Basic SAML Configuration</b> and add the following values:
      </Instruction>
      <PaddedContainer>
        <SettingsList>
          <IdpField title={idp.audienceUriLabel} value={connection.audience_uri} isCopyable={true} />
          <IdpField title={idp.acsUrlLabel} value={connection.acs_url} isCopyable={true} />
        </SettingsList>
      </PaddedContainer>
      <Screenshot src={adminPortalAssets.entraSetupSso} alt="Entra Setup SSO" />
      <Screenshot src={adminPortalAssets.entraBasicSamlConfig} alt="Entra Basic SAML Config" />
      <Instruction>
        Leave the <b>Optional</b> fields empty (Sign on URL, Relay State, and Logout URL) and click <b>Save</b>.
      </Instruction>
    </InstructionSet>
  );
};

const GoogleSamlInstructions = ({ connection: connectionProp }: { connection: SAMLTaggedConnection }) => {
  const { connection, idp } = getIdpAndConnectionInfo(connectionProp);

  return (
    <InstructionSet>
      <div>
        <Instruction>
          Under <b>Service provider details</b> input the following:
        </Instruction>
        <PaddedContainer>
          <SettingsList>
            <IdpField title={idp.acsUrlLabel} value={connection.acs_url} isCopyable={true} />
            <IdpField title={idp.audienceUriLabel} value={connection.audience_uri} isCopyable={true} />
          </SettingsList>
        </PaddedContainer>
      </div>
      <Instruction>
        Under <b>Name ID → Name ID format</b> select <b>EMAIL</b> from the dropdown.
      </Instruction>
      <Instruction>
        Under <b>Name ID</b> select <b>Basic information → Primary email</b> from the dropdown.
      </Instruction>
      <Screenshot src={adminPortalAssets.googleSamlSpDetails} alt="Google SAML SP Details" />
      <Instruction>
        Click <b>Continue</b>.
      </Instruction>
    </InstructionSet>
  );
};

const OktaOidcInstructions = ({ connection: connectionProp }: { connection: OIDCTaggedConnection }) => {
  const { connection, idp } = getIdpAndConnectionInfo(connectionProp);

  const { data } = useOrgInfo();
  const organizationName = data?.organization_name ?? '';

  return (
    <InstructionSet>
      <Instruction>
        Under <b>General Settings</b> name your application {organizationName}.
      </Instruction>
      <Instruction>
        Select <b>Authorization code</b> as the <b>Grant Type</b>.
      </Instruction>
      <Screenshot src={adminPortalAssets.oktaGrantType} alt="Okta grant type" />
      <div>
        <Instruction>
          Add the following value as a <b>{idp.redirectUrlLabel}</b>:
        </Instruction>
        <PaddedContainer>
          <CopyableText>{connection.redirect_url}</CopyableText>
        </PaddedContainer>
      </div>
      <div>
        <Instruction>
          Under <b>Assignments</b> specify whether you want to allow everyone in application to access, or only a subset
          of your users. You can change this value later.
        </Instruction>
        <PaddedContainer>
          <Instruction>
            If you want all users to be able to access {organizationName} make sure to also enable Just-in-Time
            Provisioning via this SSO Connection.
          </Instruction>
        </PaddedContainer>
      </div>
      <Screenshot src={adminPortalAssets.oktaAccessType} alt="Okta access type" />
      <Instruction>Click save.</Instruction>
    </InstructionSet>
  );
};

const EntraOidcInstructions = ({ connection: connectionProp }: { connection: OIDCTaggedConnection }) => {
  const { connection, idp } = getIdpAndConnectionInfo(connectionProp);

  return (
    <InstructionSet>
      <Instruction>
        Within the App Registration page, navigate to the <b>Authentication</b> page from the left-hand navigation and
        under <b>Platform configurations</b> select <b>Add a platform</b> and choose <b>Web</b> as the platform type.
      </Instruction>
      <Screenshot src={adminPortalAssets.entraOidcAuthSetup} alt="Entra OIDC Auth Setup" />
      <div>
        <Instruction>
          In the <b>Configure web</b> page, enter the following value as the <b>Redirect URI</b>:
        </Instruction>
        <PaddedContainer>
          <SettingsList>
            <IdpField title={idp.redirectUrlLabel} value={connection.redirect_url} isCopyable={true} />
          </SettingsList>
        </PaddedContainer>
        <Screenshot src={adminPortalAssets.entraOidcConfigureRedirectUri} alt="Entra OIDC Configure Redirect URI" />
      </div>
      <Instruction>
        Leave all other fields blank and click <b>Configure</b> to save.
      </Instruction>
    </InstructionSet>
  );
};

export const DefaultAppDetails = ({ connection: connectionProp }: { connection: TaggedConnection }) => {
  const { connection, idp, type } = getIdpAndConnectionInfo(connectionProp);

  return (
    <SettingsList>
      {type === 'saml' && (
        <>
          <IdpField title={idp.acsUrlLabel} value={connection.acs_url} isCopyable={true} />
          <IdpField title={idp.audienceUriLabel} value={connection.audience_uri} isCopyable={true} />
          <IdpField title={idp.nameIdFormatLabel} value={idp.nameIdFormatValue} />
        </>
      )}
      {type === 'oidc' && <IdpField title={idp.redirectUrlLabel} value={connection.redirect_url} isCopyable={true} />}
    </SettingsList>
  );
};

export const AppDetails = ({ connection: connectionProp }: { connection: TaggedConnection }) => {
  const { connection, type } = getIdpAndConnectionInfo(connectionProp);

  if (type === 'saml') {
    switch (connection.identity_provider) {
      case 'okta':
        return <OktaSamlInstructions connection={connection} />;
      case 'microsoft-entra':
        return <EntraSamlInstructions connection={connection} />;
      case 'google-workspace':
        return <GoogleSamlInstructions connection={connection} />;
    }
  }

  if (type === 'oidc') {
    switch (connection.identity_provider) {
      case 'okta':
        return <OktaOidcInstructions connection={connection} />;
      case 'microsoft-entra':
        return <EntraOidcInstructions connection={connection} />;
    }
  }

  return <DefaultAppDetails connection={connection} />;
};
