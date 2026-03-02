import { useLingui } from '@lingui/react/macro';
import { arrayUtils } from '@stytch/core';
import { SSOActiveConnection } from '@stytch/core/public';
import * as React from 'react';

import Button from '../../components/atoms/Button';
import Column from '../../components/atoms/Column';
import Typography from '../../components/atoms/Typography';
import LastUsed from '../../components/molecules/LastUsed';
import { SSOButton } from '../components/SSOButton';
import { useGlobalReducer } from '../GlobalContextProvider';
import { useLastUsedAuthMethod } from '../hooks/useLastUsedAuthMethod';
import { extractConnectionId, getSsoMethodKey } from '../types/authMethodKeys';

const SSOButtons = ({ availableConnections }: { availableConnections: SSOActiveConnection[] }) => {
  const [lastUsedMethod, setLastUsedMethod] = useLastUsedAuthMethod();
  const lastUsedSso = extractConnectionId(lastUsedMethod);

  const [connections, foundLastUsed] = arrayUtils.moveToFront(
    availableConnections,
    (connection) => connection.connection_id === lastUsedSso,
  );

  return (
    <Column gap={2}>
      {connections.map((provider, index) => {
        const button = (
          <SSOButton
            key={provider.display_name}
            connection={provider}
            onStart={(connection) => setLastUsedMethod(getSsoMethodKey(connection))}
          />
        );

        return foundLastUsed && index === 0 ? <LastUsed key={provider.display_name}>{button}</LastUsed> : button;
      })}
    </Column>
  );
};

export const SSODiscoveryMenu = () => {
  const [state, dispatch] = useGlobalReducer();
  const { t } = useLingui();

  const handleBack = () => {
    dispatch({ type: 'navigate_back' });
  };

  return (
    <Column gap={6}>
      <Typography variant="header">
        {t({ id: 'ssoDiscovery.title', message: 'Select a connection to continue' })}
      </Typography>

      <Column gap={4}>
        <SSOButtons availableConnections={state.formState.ssoDiscoveryState.connections} />

        <Button variant="ghost" onClick={handleBack}>
          {t({ id: 'button.goBack', message: 'Go back' })}
        </Button>
      </Column>
    </Column>
  );
};
