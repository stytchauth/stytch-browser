import React, { useCallback, useState } from 'react';

import { Modal, useModalState } from '../components/Modal';
import { Typography } from '../components/Typography';
import { Connection } from '../utils/Connection';
import { ConnectionType } from '../utils/ConnectionType';
import { useDeleteSsoConnection } from '../utils/useMutateSsoConnection';

interface DeleteConnectionModalProps {
  connectionName: string | undefined;
  connectionType: ConnectionType | undefined;
  isOpen: boolean;
  close: () => void;
  confirm: () => Promise<void>;
}

export const DeleteConfirmModal = ({ connectionName, connectionType, ...modalProps }: DeleteConnectionModalProps) => {
  return (
    <Modal {...modalProps} title={`Delete ${connectionName || 'connection'}?`} confirmButtonText="Delete" warning>
      <Typography>
        {connectionType === 'external'
          ? 'Once deleted, the SSO connection will be removed. Any members assigned automatic roles via this connection, as well as members allowed to JIT provision via this SSO connection, will lose access immediately.'
          : 'Once deleted, the SSO connection cannot be restored. Any members assigned automatic roles via this connection, as well as members allowed to JIT provision via this SSO connection, will lose access immediately.'}
      </Typography>
    </Modal>
  );
};

const useMutateDeleteConnection = () => {
  const { mutate } = useDeleteSsoConnection();

  const deleteConnection = ({ connectionId }: { connectionId: string }) => mutate({ connection_id: connectionId });

  return { deleteConnection };
};

export const useDeleteConnection = ({ onConfirm }: { onConfirm?: () => void } = {}) => {
  const [connection, setConnection] = useState<Pick<Connection, 'connectionType' | 'displayName' | 'id'>>();

  const { deleteConnection } = useMutateDeleteConnection();
  const handleConfirm = async () => {
    if (connection) {
      try {
        await deleteConnection({ connectionId: connection.id });
      } catch {
        // Throw a new error to provide specific user-facing verbiage
        throw new Error(`Failed to delete ${connection.displayName}`);
      }
      onConfirm?.();
    }
  };
  const { close, confirm, isOpen, open } = useModalState(handleConfirm);

  const handleRequestDelete = useCallback(
    (connection: Pick<Connection, 'connectionType' | 'displayName' | 'id'>) => {
      setConnection(connection);
      open();
    },
    [open],
  );

  return {
    handleRequestDelete,
    modalProps: {
      connectionName: connection?.displayName,
      connectionType: connection?.connectionType,
      isOpen,
      close,
      confirm,
    } satisfies DeleteConnectionModalProps,
  };
};
