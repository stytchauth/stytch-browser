import { ChevronLeft } from '@mui/icons-material';
import React, { useCallback, useState } from 'react';
import { useSWRConfig } from 'swr';

import { extractErrorMessage } from '../../utils/extractErrorMessage';
import { Button } from '../components/Button';
import { FlexBox } from '../components/FlexBox';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { useToast } from '../components/Toast';
import { Typography } from '../components/Typography';
import { useRevalidateConnectionList } from '../utils/useRevalidateConnectionList';
import { useStytchClient } from '../utils/useStytchClient';
import { idpOptions, idpSelectItems, IdpSelectValue } from './IdpSelect';
import { useSsoRouterController } from './SSORouter';
import { OIDCTaggedConnection, SAMLTaggedConnection } from './TaggedConnection';

export const SSONewConnectionScreen = () => {
  const { navigate } = useSsoRouterController();
  const { openToast } = useToast();

  const [displayName, setDisplayName] = useState('');

  const [isExternalConnection, setIsExternalConnection] = useState(false);

  const [idp, setIdp] = useState<IdpSelectValue>();

  const [sourceOrgId, setSourceOrgId] = useState('');
  const [sourceConnectionId, setSourceConnectionId] = useState('');

  const isNewConnectionReadyToCreate = !!idp;
  const isExternalConnectionReadyToCreate = sourceOrgId && sourceConnectionId;

  const isReadyToCreate =
    displayName && (isExternalConnection ? isExternalConnectionReadyToCreate : isNewConnectionReadyToCreate);

  const client = useStytchClient();
  const { mutate } = useSWRConfig();
  const revalidateConnectionList = useRevalidateConnectionList();
  const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    async (e) => {
      e.preventDefault();

      if (isExternalConnection) {
        if (!isExternalConnectionReadyToCreate) {
          return;
        }

        const response = await mutate('sso_create', async () => {
          try {
            return await client.sso.external.createConnection({
              display_name: displayName,
              external_organization_id: sourceOrgId,
              external_connection_id: sourceConnectionId,
            });
          } catch (e) {
            const message = extractErrorMessage(e);
            openToast({ text: message || 'Unable to create connection', type: 'error' });
          }
        });

        if (response) {
          await revalidateConnectionList();
          navigate({
            screen: 'connectionsList',
          });
        }
      } else {
        if (!isNewConnectionReadyToCreate) {
          return;
        }

        const { idpName, type } = idpOptions[idp];

        const response = await mutate('sso_create', async () => {
          const params = { display_name: displayName, identity_provider: idpName };

          try {
            if (type === 'oidc') {
              return await client.sso.oidc.createConnection(params);
            }
            if (type === 'saml') {
              return await client.sso.saml.createConnection(params);
            }
          } catch (e) {
            const message = extractErrorMessage(e);
            openToast({ text: message || 'Unable to create connection', type: 'error' });
          }
        });

        if (response) {
          await revalidateConnectionList();
          navigate({
            screen: 'newConnectionConfigure',
            params: {
              connection: {
                ...response.connection,
                connectionType: type,
              } as SAMLTaggedConnection | OIDCTaggedConnection,
            },
          });
        }
      }
    },
    [
      isExternalConnection,
      isExternalConnectionReadyToCreate,
      mutate,
      client.sso.external,
      client.sso.oidc,
      client.sso.saml,
      displayName,
      sourceOrgId,
      sourceConnectionId,
      openToast,
      revalidateConnectionList,
      navigate,
      isNewConnectionReadyToCreate,
      idp,
    ],
  );

  return (
    <form onSubmit={handleSubmit}>
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
        <Typography variant="h2">New SSO Connection</Typography>
        <FlexBox flexDirection="column" gap={1}>
          <Typography>Set a display name for your connection.</Typography>
          <Input
            placeholder="Text"
            value={displayName}
            onChange={setDisplayName}
            caption="You will be able to edit this again in the future."
          />
        </FlexBox>
        <FlexBox flexDirection="column" gap={1}>
          {isExternalConnection ? (
            <>
              <Typography>
                Add an existing SSO connection from another organization by inputting the Source Organization ID and
                desired SSO Connection ID.
              </Typography>
              <FlexBox gap={1}>
                <Input
                  label="Source Organization ID"
                  placeholder="organization-live-12345678-9012-3456-7890-123456789012"
                  value={sourceOrgId}
                  onChange={setSourceOrgId}
                />
                <Input
                  label="Source Connection ID"
                  placeholder="abcd-connection-live-12345678-9012-3456-7890-123456789012"
                  value={sourceConnectionId}
                  onChange={setSourceConnectionId}
                />
              </FlexBox>
            </>
          ) : (
            <>
              <Typography>
                Select your identity provider or choose to configure a custom SAML / OIDC connection.
              </Typography>
              <Select placeholder="Select" selectItems={idpSelectItems} value={idp} onChange={setIdp} />
            </>
          )}
          <Button variant="ghost" onClick={() => setIsExternalConnection(!isExternalConnection)}>
            {isExternalConnection ? 'Add connection by IdP' : 'Add an external connection'}
          </Button>
        </FlexBox>
        <Typography>
          Once you click “Create” the SSO connection will be created. If you need to change the connection type after
          this, you will need to start over.
        </Typography>
        <FlexBox justifyContent="space-between">
          <Button
            variant="ghost"
            onClick={() => {
              navigate({ screen: 'connectionsList' });
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!isReadyToCreate}>
            Create
          </Button>
        </FlexBox>
      </FlexBox>
    </form>
  );
};
