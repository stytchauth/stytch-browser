import React, { useCallback, useState } from 'react';
import { Modal } from '../components/Modal';
import { Typography } from '../components/Typography';
import { useToggleState } from '../shared/utils/useToggleState';
import { Connection } from '../utils/Connection';
import { useMutateOrganization } from '../utils/useMutateOrganization';

interface SetDefaultConnectionModalProps {
  connectionName: string | undefined;
  defaultConnectionName: string | undefined;
  isOpen: boolean;
  close: () => void;
  confirm: () => Promise<void>;
}

export const SetDefaultConfirmModal = ({
  connectionName,
  defaultConnectionName,
  ...modalProps
}: SetDefaultConnectionModalProps) => {
  return (
    <Modal {...modalProps} title={`Set ${connectionName || ''} as default?`} confirmButtonText="Set as default">
      <Typography>
        This will be the default SSO connection used to automatically initiate authentication for your Members.
      </Typography>
      {defaultConnectionName && (
        <Typography color="error">This will replace {defaultConnectionName} as your default SSO connection.</Typography>
      )}
    </Modal>
  );
};

export const useMutateDefaultConnection = () => {
  const { mutate } = useMutateOrganization();

  const setDefault = async ({ connectionId, connectionName }: { connectionId: string; connectionName: string }) => {
    try {
      await mutate(
        { sso_default_connection_id: connectionId },
        { errorMessage: `Failed to set ${connectionName} as default connection` },
      );
    } catch {
      // no-op; error toast is handled by `mutate` call above
    }
  };

  return { setDefault };
};

export const useSetDefaultConnection = ({ defaultConnectionName }: { defaultConnectionName: string | undefined }) => {
  const [connection, setConnection] = useState<Pick<Connection, 'displayName' | 'id'>>();
  const [cachedDefaultConnectionName, setCachedDefaultConnectionName] = useState<string | undefined>(
    defaultConnectionName,
  );
  const { isOpen, open, close } = useToggleState();

  const handleRequestSetDefault = useCallback(
    (connection: Pick<Connection, 'displayName' | 'id'>) => {
      setConnection(connection);
      setCachedDefaultConnectionName(defaultConnectionName);
      open();
    },
    [defaultConnectionName, open],
  );

  const { setDefault } = useMutateDefaultConnection();
  const confirm = async () => {
    if (connection) {
      setDefault({ connectionId: connection.id, connectionName: connection.displayName });
    }

    return Promise.resolve();
  };

  return {
    handleRequestSetDefault,
    modalProps: {
      connectionName: connection?.displayName,
      defaultConnectionName: cachedDefaultConnectionName,
      isOpen,
      close,
      confirm,
    } satisfies SetDefaultConnectionModalProps,
  };
};
