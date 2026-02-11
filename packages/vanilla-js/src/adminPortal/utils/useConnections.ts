import { useMemo } from 'react';
import { useOrgInfo } from './useOrgInfo';
import { useSsoConnections } from './useSsoConnections';
import { Connection } from './Connection';
import { collator } from './collator';

export const useConnections = (canGetSso: boolean) => {
  const ssoConnections = useSsoConnections({ shouldFetch: canGetSso });

  const orgInfo = useOrgInfo();
  const defaultConnectionId = orgInfo.data?.sso_default_connection_id;

  const connections = useMemo(() => {
    return ssoConnections.data
      ? [
          ...ssoConnections.data.saml_connections.map((c) => ({
            connectionType: 'saml' as const,
            ...c,
          })),
          ...ssoConnections.data.oidc_connections.map((c) => ({
            connectionType: 'oidc' as const,
            ...c,
          })),
          ...ssoConnections.data.external_connections.map((c) => ({
            connectionType: 'external' as const,
            ...c,
          })),
        ]
          .map((connection) => {
            return {
              displayName: connection.display_name,
              idp: 'identity_provider' in connection ? connection.identity_provider : undefined,
              connectionType: connection.connectionType,
              status: connection.status,
              id: connection.connection_id,
              isDefault: connection.connection_id === defaultConnectionId,
            } satisfies Connection;
          })
          .sort((a, b) => collator.compare(a.displayName, b.displayName))
      : [];
  }, [defaultConnectionId, ssoConnections.data]);

  return { connections, isLoading: ssoConnections.isLoading };
};
