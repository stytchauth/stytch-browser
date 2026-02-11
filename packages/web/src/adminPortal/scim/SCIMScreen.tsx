import Add from '@mui/icons-material/Add';
import React from 'react';

import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { FlexBox } from '../components/FlexBox';
import { PageLoadingIndicator } from '../components/PageLoadingIndicator';
import { Typography } from '../components/Typography';
import { useRbac } from '../utils/useRbac';
import { useScimConnection } from '../utils/useScimConnection';
import { SCIMConnectionDetailsScreen } from './SCIMConnectionDetailsScreen';
import { useScimRouterController } from './SCIMRouter';

const NewSCIMConnection = () => {
  const { navigate } = useScimRouterController();
  const { data: canCreateScim } = useRbac('stytch.scim', 'create');

  if (canCreateScim === undefined) {
    return <PageLoadingIndicator />;
  }

  return (
    <FlexBox gap={3} flexDirection="column">
      <Typography variant="h1">SCIM</Typography>
      <FlexBox flexDirection="column" gap={2}>
        <Typography variant="body2">Set up a SCIM connection to sync from an IdP.</Typography>
        {canCreateScim ? (
          <Button
            type="submit"
            variant="ghost"
            startIcon={<Add />}
            onClick={() => navigate({ screen: 'newConnection' })}
          >
            Create
          </Button>
        ) : (
          <Alert>
            You do not have permission to create SCIM Connections. Please contact your admin if you think this is a
            mistake.
          </Alert>
        )}
      </FlexBox>
    </FlexBox>
  );
};

export const SCIMScreen = () => {
  const { data: connection, isLoading, error } = useScimConnection({ shouldFetch: true });

  if (error) {
    return <Alert>There was an error loading the SCIM connection.</Alert>;
  }
  if (isLoading) {
    return <PageLoadingIndicator />;
  }

  return connection ? <SCIMConnectionDetailsScreen connection={connection} /> : <NewSCIMConnection />;
};
