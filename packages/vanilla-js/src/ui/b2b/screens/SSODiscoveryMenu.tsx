import * as React from 'react';
import { SSOActiveConnection } from '@stytch/core/public';
import { Flex } from '../../components/Flex';
import { Text } from '../../components/Text';
import { useGlobalReducer } from '../GlobalContextProvider';
import { useLingui } from '@lingui/react/macro';
import { arrayUtils } from '@stytch/core';
import { SSOButton } from '../components/SSOButton';
import BackArrow from '../../../assets/backArrow';
import { getSsoMethodKey, extractConnectionId } from '../types/authMethodKeys';
import { useLastUsedAuthMethod } from '../hooks/useLastUsedAuthMethod';

const SSOButtons = ({ availableConnections }: { availableConnections: SSOActiveConnection[] }) => {
  const { t } = useLingui();
  const [lastUsedMethod, setLastUsedMethod] = useLastUsedAuthMethod();
  const lastUsedSso = extractConnectionId(lastUsedMethod);

  const [connections, foundLastUsed] = arrayUtils.moveToFront(
    availableConnections,
    (connection) => connection.connection_id === lastUsedSso,
  );

  return (
    <Flex direction="column" gap={8} className="oauth-buttons">
      {connections.map((provider, index) => {
        const button = (
          <SSOButton
            key={provider.display_name}
            connection={provider}
            onStart={(connection) => setLastUsedMethod(getSsoMethodKey(connection))}
          />
        );

        if (foundLastUsed && index === 0) {
          return (
            <div key={provider.display_name}>
              <Text size="helper" color="secondary" align="right">
                {t({ id: 'provider.lastUsed', message: 'Last used' })}
              </Text>
              {button}
            </div>
          );
        }

        return button;
      })}
    </Flex>
  );
};

export const SSODiscoveryMenu = () => {
  const [state, dispatch] = useGlobalReducer();
  const { t } = useLingui();

  const handleBack = () => {
    dispatch({ type: 'navigate_back' });
  };

  return (
    <Flex direction="column" gap={24}>
      <BackArrow onClick={handleBack} />
      <Text size="header">{t({ id: 'ssoDiscovery.title', message: 'Select a connection to continue' })}</Text>
      <SSOButtons availableConnections={state.formState.ssoDiscoveryState.connections} />
    </Flex>
  );
};
