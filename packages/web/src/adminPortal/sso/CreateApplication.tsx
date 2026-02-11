import { adminPortalAssets } from '@stytch/internal-assets';
import React from 'react';

import { Instruction } from '../components/Instruction';
import { InstructionSet } from '../components/InstructionSet';
import { PaddedContainer } from '../components/PaddedContainer';
import { Screenshot } from '../shared/components/Screenshot';
import { useProjectName } from '../utils/useProjectName';
import { getIdpAndConnectionInfo } from './IdpInfo';
import { TaggedConnection } from './TaggedConnection';

const OktaSamlInstructions = () => {
  const projectName = useProjectName();

  return (
    <InstructionSet>
      <Instruction>
        In the Okta Admin Dashboard navigate to <b>Applications</b> on the left hand side, and select{' '}
        <b>Create App Integration</b>.
      </Instruction>
      <Screenshot src={adminPortalAssets.oktaCreateAppIntegration} alt="Okta Create App Integration" />
      <Instruction>
        Select <b>SAML 2.0</b> and continue to the the General Settings form, setting {projectName} or similar as the
        name of the application before continuing on to the <b>Configure SAML</b> page.
      </Instruction>
    </InstructionSet>
  );
};

const EntraSamlInstructions = () => {
  const projectName = useProjectName();

  return (
    <InstructionSet>
      <Instruction>
        Log into the <b>Microsoft Entra Admin Center</b> and navigate to <b>Applications → Enterprise applications</b>{' '}
        on the left hand navigation bar.
      </Instruction>
      <Screenshot src={adminPortalAssets.entraCreateNewApplication} alt="Entra Create New Application" />
      <Instruction>
        Within the All Applications tab, select <b>New Application</b> and then from within the Microsoft Entra Gallery
        page select the <b>Create your own application</b> option.
      </Instruction>
      <Screenshot src={adminPortalAssets.entraCreateOwnApp} alt="Entra Create Own App" />
      <Instruction>
        Name your application {projectName} or something similar, and choose{' '}
        <b>Integrate any other application you don&apos;t find in the gallery (Non-gallery)</b> from the toggle options.
      </Instruction>
      <Instruction>
        Click <b>Create</b>.
      </Instruction>
    </InstructionSet>
  );
};

const GoogleSamlInstructions = () => {
  const projectName = useProjectName();

  return (
    <InstructionSet>
      <Instruction>
        In the <b>Google Workspace Admin Console</b> select <b>Apps → Web and mobile apps</b> from the left-hand side
        navigation.
      </Instruction>
      <Screenshot src={adminPortalAssets.googleAppsTab} alt="Google Apps Tab" />
      <Instruction>
        Select <b>Add custom app</b> from the <b>Add app</b> dropdown.
      </Instruction>
      <Screenshot src={adminPortalAssets.googleAddSamlApp} alt="Google Add SAML App" />
      <Instruction>
        Name your application {projectName} or something similar and an optional description. Click <b>Continue</b>.
      </Instruction>
    </InstructionSet>
  );
};

const OktaOidcInstructions = () => {
  return (
    <InstructionSet>
      <div>
        <Instruction>
          In the Okta Admin Dashboard navigate to <b>Applications</b> on the left hand side, and select{' '}
          <b>Create App Integration</b>.
        </Instruction>
        <Screenshot src={adminPortalAssets.oktaCreateAppIntegration} alt="Okta Create App Integration" />
        <Instruction>On the following page, select the following options:</Instruction>
        <PaddedContainer>
          <Instruction>Sign-in method: OIDC - OpenID Connect</Instruction>
          <Instruction>Application type: Web Application</Instruction>
          <Screenshot src={adminPortalAssets.oktaOidcAppType} alt="Okta OIDC app type" />
        </PaddedContainer>
      </div>
      <Instruction>Click Next.</Instruction>
    </InstructionSet>
  );
};

const EntraOidcInstructions = () => {
  const projectName = useProjectName();

  return (
    <InstructionSet>
      <Instruction>
        Log into the <b>Microsoft Entra Admin Center</b> and navigate to <b>Applications → App registrations</b> on the
        left hand navigation bar.
      </Instruction>
      <Instruction>
        Within the App registrations tab, select <b>New Registration</b> from the top navigation.
      </Instruction>
      <Screenshot src={adminPortalAssets.entraOidcAppRegistrations} alt="Entra OIDC App Registrations" />
      <Instruction>
        Name your application {projectName} or something similar, and select{' '}
        <b>Accounts in this organizational directory only (Default Directory only - Single tenant)</b> for{' '}
        <b>Supported account types</b>.
      </Instruction>
      <Screenshot src={adminPortalAssets.entraOidcRegisterApp} alt="Entra OIDC Register App" />
      <Instruction>
        Click <b>Register</b>.
      </Instruction>
    </InstructionSet>
  );
};

export const CreateApplication = ({ connection: connectionProp }: { connection: TaggedConnection }) => {
  const { connection, type } = getIdpAndConnectionInfo(connectionProp);

  if (type === 'saml') {
    switch (connection.identity_provider) {
      case 'okta':
        return <OktaSamlInstructions />;
      case 'microsoft-entra':
        return <EntraSamlInstructions />;
      case 'google-workspace':
        return <GoogleSamlInstructions />;
    }
  }

  if (type === 'oidc') {
    switch (connection.identity_provider) {
      case 'okta':
        return <OktaOidcInstructions />;
      case 'microsoft-entra':
        return <EntraOidcInstructions />;
    }
  }

  return <></>;
};
