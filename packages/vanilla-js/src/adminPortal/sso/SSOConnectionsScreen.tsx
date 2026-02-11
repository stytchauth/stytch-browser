import { Add, DeleteOutlined, EditOutlined, Tune, VisibilityOutlined } from '@mui/icons-material';
import React, { useCallback, useMemo, useState } from 'react';
import { Action, useActionMenu } from '../components/ActionMenu';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { DeleteConfirmModal, useDeleteConnection } from '../components/DeleteConnection';
import { FlexBox } from '../components/FlexBox';
import { PaginatedTable } from '../components/PaginatedTable';
import { SearchBar } from '../components/SearchBar';
import { SetDefaultConfirmModal, useSetDefaultConnection } from '../components/SetDefaultConnection';
import { Tag } from '../components/Tag';
import { Typography } from '../components/Typography';
import { TableItemRenderer } from '../shared/components/types';
import { Connection } from '../utils/Connection';
import { NO_VALUE } from '../utils/noValue';
import { useAdminPortalConfig } from '../utils/useAdminPortalConfig';
import { useDisplayPagination } from '../utils/useDisplayPagination';
import { useRbac } from '../utils/useRbac';
import { getIdpInfo } from './IdpInfo';
import { useSsoRouterController } from './SSORouter';
import { getDisplayStatus } from '../utils/getDisplay';
import { useConnections } from '../utils/useConnections';

const itemRenderer: TableItemRenderer<Connection>[] = [
  {
    title: 'Display Name',
    getValue: ({ displayName, isDefault }) => {
      return isDefault ? (
        <Typography variant="body2">
          {displayName} <Tag size="small">Default</Tag>
        </Typography>
      ) : (
        displayName
      );
    },
  },
  {
    title: 'IdP',
    getValue: ({ idp, connectionType }) => {
      return idp ? getIdpInfo(idp, connectionType).idp.displayName : NO_VALUE;
    },
    width: 200,
  },
  {
    title: 'Status',
    getValue: ({ status }) => getDisplayStatus(status),
    width: 150,
  },
];

const useSearchFilter = <T,>({ data, searchKeys }: { data: T[]; searchKeys: (keyof T)[] }) => {
  const [filterText, setFilterText] = useState('');

  const filteredData = useMemo(() => {
    if (!filterText) {
      return data;
    }
    const filterTextLower = filterText.toLowerCase();
    return data.filter((item) => {
      return searchKeys.some((key) => {
        return String(item[key]).toLowerCase().includes(filterTextLower);
      });
    });
  }, [data, filterText, searchKeys]);

  return {
    filteredData,
    filterText,
    setFilterText,
  };
};

const useCanProjectCreateSsoConnection = () => {
  const { data } = useAdminPortalConfig({ shouldFetch: true });
  return data?.sso_config.can_create_oidc_connection && data.sso_config.can_create_saml_connection;
};

const getConnectionId = (connection: Connection) => connection.id;

export const SSOConnectionsScreen = () => {
  const { navigate } = useSsoRouterController();

  const canProjectCreateSsoConnection = useCanProjectCreateSsoConnection();
  const { data: canGetConnection } = useRbac('stytch.sso', 'get');
  const { data: canCreatePermission } = useRbac('stytch.sso', 'create');
  const { data: canDeleteConnection } = useRbac('stytch.sso', 'delete');
  const { data: canUpdateConnection } = useRbac('stytch.sso', 'update');
  const { data: canSetDefaultConnection } = useRbac('stytch.organization', 'update.settings.default-sso-connection');
  const canCreateConnection = canCreatePermission && canProjectCreateSsoConnection;

  const { connections, isLoading } = useConnections(!!canGetConnection);

  const { filterText, setFilterText, filteredData } = useSearchFilter({
    data: connections,
    searchKeys: ['displayName'],
  });
  const pagination = useDisplayPagination({
    items: filteredData,
    viewId: 'adminPortalSsoConnections',
  });

  const tableProps = {
    ...pagination,
    onRowClick: (id: string) => navigate({ screen: 'connectionDetails', params: { connectionId: id } }),
  };

  const defaultConnectionName = useMemo(
    () => connections.find((connection) => connection.isDefault)?.displayName,
    [connections],
  );

  const { modalProps: setDefaultModalProps, handleRequestSetDefault: handleSetDefault } = useSetDefaultConnection({
    defaultConnectionName,
  });

  const { modalProps: deleteModalProps, handleRequestDelete: handleDelete } = useDeleteConnection();

  const handleEdit = useCallback(
    (connection: Connection) => {
      navigate({ screen: 'connectionDetails', params: { connectionId: connection.id } });
    },
    [navigate],
  );

  const handleNewConnectionClick = useCallback(() => {
    navigate({ screen: 'newConnection' });
  }, [navigate]);

  const hasExactlyOneConnection = connections.length === 1;

  const actions = useMemo(
    () =>
      [
        {
          key: 'view',
          label: 'View connection',
          icon: <VisibilityOutlined />,
          onClick: handleEdit,
          isVisible: !canUpdateConnection,
        },
        {
          key: 'edit',
          label: 'Edit connection',
          icon: <EditOutlined />,
          onClick: handleEdit,
          isVisible: !!canUpdateConnection,
        },
        {
          key: 'set-default',
          label: 'Set as default',
          icon: <Tune />,
          onClick: handleSetDefault,
          isVisible: (connection) => !connection.isDefault && !!canSetDefaultConnection,
        },
        {
          key: 'delete',
          label: 'Delete',
          icon: <DeleteOutlined />,
          onClick: handleDelete,
          isDangerous: true,
          isVisible: (connection) => (!connection.isDefault || hasExactlyOneConnection) && !!canDeleteConnection,
        },
      ] satisfies Action<Connection>[],
    [
      canDeleteConnection,
      canSetDefaultConnection,
      canUpdateConnection,
      handleDelete,
      handleEdit,
      handleSetDefault,
      hasExactlyOneConnection,
    ],
  );

  const { getItemActionProps } = useActionMenu<Connection>({
    actions,
    idPrefix: 'connection',
    getId: getConnectionId,
  });

  return (
    <>
      <FlexBox flexDirection="column" gap={3}>
        {canCreatePermission && !canCreateConnection && (
          <Alert>
            You’ve reached the maximum number of allowed connections. Delete an existing connection in order to add a
            new one.
          </Alert>
        )}
        <FlexBox alignItems="center" justifyContent="space-between">
          <Typography variant="h1">SSO Connections</Typography>
          {canCreateConnection && (
            <Button compact variant="primary" startIcon={<Add />} onClick={handleNewConnectionClick}>
              New connection
            </Button>
          )}
        </FlexBox>
        <SearchBar placeholder="Search" value={filterText} onChange={setFilterText} />
        <PaginatedTable<Connection>
          {...tableProps}
          itemRenderer={itemRenderer}
          isLoading={isLoading}
          titleVariant="h4"
          getItemActionProps={getItemActionProps}
        />
      </FlexBox>
      <SetDefaultConfirmModal {...setDefaultModalProps} />
      <DeleteConfirmModal {...deleteModalProps} />
    </>
  );
};
