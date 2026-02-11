import { ChevronLeft } from '@mui/icons-material';
import React, { useCallback, useMemo } from 'react';
import { Button } from '../components/Button';
import { DeleteConfirmModal, useDeleteConnection } from '../components/DeleteConnection';
import { FlexBox } from '../components/FlexBox';
import { PageLoadingIndicator } from '../components/PageLoadingIndicator';
import { Tag } from '../components/Tag';
import { Typography } from '../components/Typography';
import { useOrgInfo } from '../utils/useOrgInfo';
import { useRbac } from '../utils/useRbac';
import { useSsoConnections } from '../utils/useSsoConnections';
import { DetailsSection } from './DetailsSection';
import { OrganizationUpdatesSection } from './OrganizationUpdatesSection';
import { RoleAssignmentsSection } from './RoleAssignmentsSection';
import { useSsoRouterController } from './SSORouter';
import { useStytchClient } from '../utils/useStytchClient';
import { useAdminPortalSSOUIConfig } from '../StytchClientContext';

export const SSOConnectionDetailsScreen = ({ connectionId }: { connectionId: string }) => {
  const { navigate } = useSsoRouterController();
  const client = useStytchClient();
  const uiConfig = useAdminPortalSSOUIConfig();

  const { data: canGetConnection } = useRbac('stytch.sso', 'get');
  const { data: canDeleteConnection } = useRbac('stytch.sso', 'delete');
  const { data: canUpdateConnection } = useRbac('stytch.sso', 'update');

  const { data: connections, isLoading } = useSsoConnections({ shouldFetch: !!canGetConnection });
  const { data: orgInfo } = useOrgInfo();
  const defaultConnectionId = orgInfo?.sso_default_connection_id;
  const defaultConnectionName = useMemo(
    () =>
      connections
        ? [...connections.oidc_connections, ...connections.saml_connections].find(
            (connection) => connection.connection_id === defaultConnectionId,
          )?.display_name
        : undefined,
    [connections, defaultConnectionId],
  );

  const connection = useMemo(() => {
    const oidcMatch = connections?.oidc_connections?.find(({ connection_id }) => connection_id === connectionId);
    if (oidcMatch) {
      return { ...oidcMatch, connectionType: 'oidc' as const };
    }

    const samlMatch = connections?.saml_connections?.find(({ connection_id }) => connection_id === connectionId);
    if (samlMatch) {
      return { ...samlMatch, connectionType: 'saml' as const };
    }

    const externalMatch = connections?.external_connections?.find(
      ({ connection_id }) => connection_id === connectionId,
    );
    if (externalMatch) {
      return { ...externalMatch, connectionType: 'external' as const };
    }

    return null;
  }, [connectionId, connections?.external_connections, connections?.oidc_connections, connections?.saml_connections]);

  const connectionType = connection?.connectionType;
  const connectionName = connection?.display_name;

  const isDefaultConnection = connection?.connection_id === defaultConnectionId;

  const isOnlyConnection =
    (connections?.oidc_connections.length ?? 0) + (connections?.saml_connections.length ?? 0) === 1;

  const connectionSupportsRoleAssignments = connectionType === 'saml' || connectionType === 'external';

  const { handleRequestDelete, modalProps } = useDeleteConnection({
    onConfirm: () => {
      navigate({ screen: 'connectionsList' });
    },
  });

  const handleDeleteClick = useCallback(() => {
    if (connectionId && connectionName && connectionType) {
      handleRequestDelete({ id: connectionId, displayName: connectionName, connectionType });
    }
  }, [connectionId, connectionName, connectionType, handleRequestDelete]);

  const handleTestClick = useCallback(() => {
    if (connection?.connection_id) {
      try {
        client.sso.start({
          connection_id: connection.connection_id,
          login_redirect_url: uiConfig?.testLoginRedirectURL,
          signup_redirect_url: uiConfig?.testSignupRedirectURL,
        });
      } catch {
        // noop
      }
    }
  }, [client.sso, connection?.connection_id, uiConfig?.testLoginRedirectURL, uiConfig?.testSignupRedirectURL]);

  const isActive = connection?.status === 'active';

  return (
    <FlexBox flexDirection="column" gap={3}>
      <Button
        compact
        variant="ghost"
        onClick={() => {
          navigate({ screen: 'connectionsList' });
        }}
        startIcon={<ChevronLeft />}
      >
        Back to all SSO connections
      </Button>
      <DeleteConfirmModal {...modalProps} />
      {connection ? (
        <>
          <FlexBox alignItems="center" justifyContent="space-between">
            <FlexBox alignItems="center" justifyContent="flex-start" gap={1}>
              <Typography variant="h2">{connectionName}</Typography>
              {isDefaultConnection && <Tag size="small">Default</Tag>}
            </FlexBox>
            {isActive && <Button onClick={handleTestClick}>Test connection</Button>}
          </FlexBox>
          <FlexBox flexDirection="column" gap={3}>
            <OrganizationUpdatesSection
              connection={connection}
              defaultConnectionName={defaultConnectionName}
              isDefaultConnection={isDefaultConnection}
            />
            {connectionSupportsRoleAssignments && (
              <RoleAssignmentsSection canUpdateConnection={!!canUpdateConnection} connection={connection} />
            )}
            <DetailsSection canUpdateConnection={!!canUpdateConnection} connection={connection} />
          </FlexBox>
          {canDeleteConnection && (!isDefaultConnection || isOnlyConnection) && (
            <Button compact variant="ghost" warning onClick={handleDeleteClick}>
              Delete connection
            </Button>
          )}
        </>
      ) : (
        isLoading && <PageLoadingIndicator />
      )}
    </FlexBox>
  );
};
