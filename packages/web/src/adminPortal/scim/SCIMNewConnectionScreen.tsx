import { Organization } from '@stytch/core/public';
import React, { useCallback, useState } from 'react';
import { useSWRConfig } from 'swr';

import { Button } from '../components/Button';
import { FlexBox } from '../components/FlexBox';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Typography } from '../components/Typography';
import { organizationGetKey } from '../utils/organizationGetKey';
import { useStytchClient } from '../utils/useStytchClient';
import { KnownSCIMIdp, scimIdpMap } from './scimInfo';
import { useScimRouterController } from './SCIMRouter';

const idpSelectItems = Object.entries(scimIdpMap).map(([idp, { displayName }]) => ({
  value: idp,
  label: displayName,
}));
export const SCIMNewConnectionScreen = () => {
  const { navigate } = useScimRouterController();
  const [idp, setIdp] = useState<KnownSCIMIdp>();
  const [displayName, setDisplayName] = useState<string>('');
  const canCreate = displayName && idp;

  const client = useStytchClient();
  const { mutate } = useSWRConfig();

  const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    async (e) => {
      e.preventDefault();

      if (!canCreate) {
        return;
      }

      const response = await mutate('scim_create', async () => {
        const params = { display_name: displayName, identity_provider: idp };
        const result = await client.scim.createConnection(params);
        const connection = result.connection;

        mutate(organizationGetKey(connection.organization_id), async (org?: Organization | null) => {
          if (org) {
            return {
              ...org,
              scim_active_connection: {
                connection_id: connection.connection_id,
                display_name: connection.display_name,
              },
            };
          }
        });
        return connection;
      });

      if (response) {
        navigate({
          screen: 'newConnectionConfigure',
          params: {
            connection: response,
          },
        });
      }
    },
    [canCreate, client.scim, displayName, idp, mutate, navigate],
  );

  return (
    <form onSubmit={handleSubmit}>
      <FlexBox flexDirection="column" gap={3}>
        <Typography variant="h2">Create SCIM Connection</Typography>
        <FlexBox flexDirection="column">
          <Typography>Select your IdP.</Typography>
          <Select
            width={360}
            placeholder="Select"
            value={idp}
            selectItems={idpSelectItems}
            onChange={(value) => setIdp(value)}
          />
        </FlexBox>
        <FlexBox flexDirection="column">
          <Typography>Enter a display name for your SCIM connection.</Typography>
          <Input value={displayName} onChange={(value) => setDisplayName(value)} placeholder="Display name" />
        </FlexBox>
        <Typography>
          Once you click “Create” the SCIM connection will be created. If you need to change your IdP after this, you
          will need to delete the connection and recreate.
        </Typography>
        <FlexBox flexDirection="row" gap={2}>
          <Button
            variant="ghost"
            onClick={() => {
              navigate({ screen: 'scimConnection' });
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!canCreate}>
            Create
          </Button>
        </FlexBox>
      </FlexBox>
    </form>
  );
};
