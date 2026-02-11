import { SCIMConnection } from '@stytch/core/public';
import React from 'react';
import { useSWRConfig } from 'swr';

import { Button } from '../components/Button';
import { FlexBox } from '../components/FlexBox';
import { Modal, useModalState } from '../components/Modal';
import { SettingsContainer } from '../components/SettingsContainer';
import { Typography } from '../components/Typography';
import { useMutateWithToast } from '../utils/useMutateWithToast';
import { useRbac } from '../utils/useRbac';
import { scimGetConnectionKey } from '../utils/useScimConnection';
import { useStytchClient } from '../utils/useStytchClient';
import { useScimRouterController } from './SCIMRouter';

export const DangerZoneSection = ({ connection }: { connection: SCIMConnection }) => {
  const client = useStytchClient();
  const { mutate: mutateSWR } = useSWRConfig();
  const { useBlockNavigation } = useScimRouterController();
  const { navigate } = useScimRouterController();
  const { data: canDeleteScim } = useRbac('stytch.scim', 'delete');

  const { mutate: deleteScimConnection } = useMutateWithToast(async (connectionId: string) => {
    return await mutateSWR(
      scimGetConnectionKey(connectionId),
      async () => {
        await client.scim.deleteConnection(connectionId);
      },
      {
        populateCache: true,
        revalidate: false,
      },
    );
  });

  const deleteConnectionModalProps = useModalState(async () => {
    await deleteScimConnection(connection.connection_id);
    navigate({ screen: 'scimConnection' });
  });

  const handleActionClick = () => {
    deleteConnectionModalProps.open();
  };

  return canDeleteScim ? (
    <SettingsContainer title="Danger zone" useBlockNavigation={useBlockNavigation}>
      <FlexBox flexDirection="column" gap={2}>
        <Modal
          {...deleteConnectionModalProps}
          title="Delete SCIM connection?"
          confirmButtonText="Delete connection"
          warning
        >
          <Typography variant="body2">
            Once deleted, the connection cannot be restored. All associated SCIM groups, member registrations, and group
            role assignments will be deleted.
          </Typography>
        </Modal>
        <Typography variant="body2">
          Once deleted, the connection cannot be restored. All associated SCIM groups, member registrations, and group
          role assignments will be deleted. To create a new SCIM connection, delete the existing connection first.
        </Typography>
        <Button compact variant="ghost" warning onClick={handleActionClick}>
          Delete Connection
        </Button>
      </FlexBox>
    </SettingsContainer>
  ) : null;
};
