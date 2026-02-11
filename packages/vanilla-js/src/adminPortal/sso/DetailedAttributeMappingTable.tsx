import React, { useState } from 'react';
import { useOrgInfo } from '../utils/useOrgInfo';
import { Table } from '../components/Table';
import { Switch } from '../components/Switch';
import { SamlSupportedAttributeMappingIdp, getIdpAndConnectionInfo } from './IdpInfo';
import { StateProps } from '../utils/useFormState';
import { SAMLTaggedConnection } from './TaggedConnection';
import { AttributeMappingState, AttributeMappingTable } from './AttributeMappingTable';
import { TableItemRenderer } from '../shared/components/types';
import { Instruction } from '../components/Instruction';
import { Typography } from '../components/Typography';
import { InstructionSet } from '../components/InstructionSet';
import { adminPortalAssets } from '@stytch/internal-assets';
import { Screenshot } from '../shared/components/Screenshot';

export interface DetailedAttributeMappingTableProps<TState> extends StateProps<TState> {
  connection: SAMLTaggedConnection;
}

type IdpInstructionProps = {
  isGroupInfoIncluded: boolean;
  handleIncludeGroupInfoChange: (value: boolean) => void;
};

const createAttributeItems = (attributeMap: Record<string, string>) => {
  return Object.entries(attributeMap).map(([key, value]) => ({ key, value }));
};

const AttributeTable = ({
  itemsMap,
  itemRenderer,
}: {
  itemsMap: Record<string, string>;
  itemRenderer: TableItemRenderer<{
    key: string;
    value: string;
  }>[];
}) => {
  const items = createAttributeItems(itemsMap);

  return (
    <Table titleVariant="caption" rowKeyExtractor={({ key }) => key} itemRenderer={itemRenderer} items={items}></Table>
  );
};

const OktaSamlInstructions = ({ isGroupInfoIncluded, handleIncludeGroupInfoChange }: IdpInstructionProps) => {
  const { data } = useOrgInfo();
  const organizationName = data?.organization_name ?? '';

  return (
    <InstructionSet>
      <Instruction>
        Under <b>Attribute Statements (optional)</b> add the following attributes to send to {organizationName} as part
        of the SAML Assertion with the <b>Basic</b> name format:
      </Instruction>
      <AttributeTable
        itemsMap={{
          firstName: 'user.firstName',
          lastName: 'user.lastName',
          id: 'user.id',
        }}
        itemRenderer={[
          {
            title: 'Name',
            getValue: ({ key }) => <Typography variant="body2">{key}</Typography>,
          },
          { title: 'Value', getValue: ({ value }) => <Typography variant="body2">{value}</Typography> },
        ]}
      />
      <Switch
        label="Include group info in the SAML Assertion."
        checked={isGroupInfoIncluded}
        onChange={handleIncludeGroupInfoChange}
      />
      {isGroupInfoIncluded && (
        <>
          <Instruction>
            Under <b>Group Attribute Statements</b> add a mapping with the <b>Basic</b> name format:
          </Instruction>
          <AttributeTable
            itemsMap={{
              groups: 'Matches regex',
            }}
            itemRenderer={[
              {
                title: 'Name',
                getValue: ({ key }) => <Typography variant="body2">{key}</Typography>,
              },
              { title: 'Filter', getValue: ({ value }) => <Typography variant="body2">{value}</Typography> },
              { title: 'Value', getValue: () => <Typography variant="body2">.*</Typography> },
            ]}
          />
          <Instruction>
            Save and continue, selecting <b>internal</b> as the <b>App Type</b>.
          </Instruction>
        </>
      )}
      <Instruction>Your configuration page should look like the following:</Instruction>
      <Screenshot src={adminPortalAssets.oktaSamlSettingsConfig} alt="Okta SAML settings config" />
    </InstructionSet>
  );
};

const EntraSamlInstructions = () => (
  <InstructionSet>
    <Instruction>
      Next select <b>Edit</b> on Step 2 of the setup <b>Attributes & Claims</b>.
    </Instruction>
    <Instruction>
      Under <b>Required Claims</b> click on <b>Unique User Identifier (Name ID)</b> and set the following values and
      save:
    </Instruction>
    <AttributeTable
      itemsMap={{
        'Email address': 'user.primaryauthoritativeemail',
      }}
      itemRenderer={[
        {
          title: 'Name Identifier Format',
          getValue: ({ key }) => <Typography variant="body2">{key}</Typography>,
        },
        { title: 'Source attribute', getValue: ({ value }) => <Typography variant="body2">{value}</Typography> },
      ]}
    />
    <Screenshot src={adminPortalAssets.entraEditNameidClaim} alt="Entra Edit NameID Claim" />
    <Instruction>
      After saving the Name ID claim, under <b>Additional Claims</b> edit the following claims to match the below
      format:
    </Instruction>
    <AttributeTable
      itemsMap={{
        firstName: 'user.givenname',
        lastName: 'user.surname',
        id: 'user.objectid',
      }}
      itemRenderer={[
        {
          title: 'Name',
          getValue: ({ key }) => <Typography variant="body2">{key}</Typography>,
        },
        { title: 'Source Attribute', getValue: ({ value }) => <Typography variant="body2">{value}</Typography> },
      ]}
    />
    <Screenshot src={adminPortalAssets.entraAttributesAndClaims} alt="Entra Attributes and Claims" />
    <Instruction>
      Click <b>Save</b> and close out of the <b>Attributes & Claims</b> page.
    </Instruction>
  </InstructionSet>
);

const GoogleSamlInstructions = ({ isGroupInfoIncluded, handleIncludeGroupInfoChange }: IdpInstructionProps) => {
  return (
    <InstructionSet>
      <Instruction>
        On the <b>Attributes</b> page select <b>Add Mapping</b> and select the following fields for the Google Directory
        attribute mapping to the provided string for the App attribute input:
      </Instruction>
      <AttributeTable
        itemsMap={{
          'First Name': 'firstName',
          'Last Name': 'lastName',
        }}
        itemRenderer={[
          {
            title: 'Google Directory attribute: Basic Information',
            getValue: ({ key }) => <Typography variant="body2">{key}</Typography>,
          },
          { title: 'App attributes', getValue: ({ value }) => <Typography variant="body2">{value}</Typography> },
        ]}
      />
      <Switch
        label="Include group info in Google Groups."
        checked={isGroupInfoIncluded}
        onChange={handleIncludeGroupInfoChange}
      />
      {isGroupInfoIncluded && (
        <>
          <Instruction>
            Under Group membership select the groups that you wish to include information about and set the App
            attribute input to:
          </Instruction>
          <AttributeTable
            itemsMap={{
              groups: 'groups',
            }}
            itemRenderer={[{ title: 'App attribute', getValue: () => <Typography variant="body2">groups</Typography> }]}
          />
          <Instruction>
            Click <b>Finish</b>.
          </Instruction>
        </>
      )}
      <Instruction>
        On the app page under <b>User Access</b> click on <b>OFF for everyone</b> to open the <b>Service status</b> to{' '}
        <b>ON for everyone</b>, or search for specific Groups on the left hand navigation in order to selectively enable
        for particular Google Groups.
      </Instruction>
      <Screenshot src={adminPortalAssets.googleUserAccess} alt="Google User Access" />
      <Screenshot src={adminPortalAssets.googleAccessOn} alt="Google Access ON" />
    </InstructionSet>
  );
};

export const DetailedAttributeMappingTable = <TState extends AttributeMappingState>({
  connection: connectionProp,
  localState,
  setLocalState,
  remoteState,
}: DetailedAttributeMappingTableProps<TState>) => {
  const { connection } = getIdpAndConnectionInfo(connectionProp);

  const [isGroupInfoIncluded, setIsGroupInfoIncluded] = useState(false);

  const handleIncludeGroupInfoChange = (value: boolean) => {
    setIsGroupInfoIncluded(value);
    setLocalState((prevState) => {
      return {
        ...prevState,
        attributeMapping: {
          ...prevState.attributeMapping,
          groups: value ? 'groups' : '',
        },
      };
    });
  };

  const samlMap: Record<SamlSupportedAttributeMappingIdp, React.ReactNode> = {
    okta: (
      <OktaSamlInstructions
        isGroupInfoIncluded={isGroupInfoIncluded}
        handleIncludeGroupInfoChange={handleIncludeGroupInfoChange}
      />
    ),
    'microsoft-entra': <EntraSamlInstructions />,
    'google-workspace': (
      <GoogleSamlInstructions
        isGroupInfoIncluded={isGroupInfoIncluded}
        handleIncludeGroupInfoChange={handleIncludeGroupInfoChange}
      />
    ),
  };

  return connection.identity_provider in samlMap ? (
    samlMap[connection.identity_provider as SamlSupportedAttributeMappingIdp]
  ) : (
    <AttributeMappingTable editing localState={localState} setLocalState={setLocalState} remoteState={remoteState} />
  );
};
