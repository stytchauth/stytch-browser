import React from 'react';
import { FlexBox } from '../components/FlexBox';
import { SettingsContainer } from '../components/SettingsContainer';
import { useScimRouterController } from './SCIMRouter';
import { SCIMConnection } from '@stytch/core/public';
import { Typography } from '../components/Typography';
import { DetailsSection } from './SCIMConnectionDetailsSection';
import { RoleAssignmentsSection } from './SCIMConnectionRoleAssignmentsSection';
import { TokenRotationSection } from './SCIMConnectionTokenRotationSection';
import { DangerZoneSection } from './SCIMConnectionDangerZoneSection';

export const SCIMConnectionDetailsScreen = ({ connection }: { connection: SCIMConnection }) => {
  const { useBlockNavigation } = useScimRouterController();

  return (
    <FlexBox gap={3} flexDirection="column">
      <Typography variant="h1">SCIM</Typography>
      <SettingsContainer title="Details" hasCTA={false} useBlockNavigation={useBlockNavigation}>
        <DetailsSection connection={connection} />
      </SettingsContainer>
      <RoleAssignmentsSection connection={connection} useBlockNavigation={useBlockNavigation} />
      <SettingsContainer title="Token Rotation" hasCTA={false} useBlockNavigation={useBlockNavigation}>
        <TokenRotationSection connection={connection} />
      </SettingsContainer>
      <DangerZoneSection connection={connection} />
    </FlexBox>
  );
};
