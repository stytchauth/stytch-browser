import React from 'react';
import { FlexBox } from '../components/FlexBox';
import { OrgSettingsDetailsSection } from './OrgSettingsDetailsSection';
import { useOrgInfo } from '../utils/useOrgInfo';
import { PageLoadingIndicator } from '../components/PageLoadingIndicator';
import { OrgSettingsAuthenticationSettingsSection } from './OrgSettingsAuthenticationSettingsSection';
import { OrgSettingsRoleAssignmentsSection } from './OrgSettingsRoleAssignmentsSection';
import { OrgSettingsUserOnboardingSection } from './OrgSettingsUserOnboardingSection';
import { extractErrorMessage } from '../../utils/extractErrorMessage';
import { Alert } from '../components/Alert';
import { Typography } from '../components/Typography';

export const OrgSettingsScreen = () => {
  const { isLoading, error, data: orgInfo } = useOrgInfo();
  if (isLoading) {
    return <PageLoadingIndicator />;
  }
  if (error) {
    return <Alert>{extractErrorMessage(error)}</Alert>;
  }

  return (
    <FlexBox flexDirection="column" gap={3}>
      <Typography variant="h1">Authentication &amp; Access Settings</Typography>
      {orgInfo && (
        <>
          <OrgSettingsDetailsSection orgInfo={orgInfo} />
          <OrgSettingsAuthenticationSettingsSection orgInfo={orgInfo} />
          <OrgSettingsUserOnboardingSection orgInfo={orgInfo} />
          <OrgSettingsRoleAssignmentsSection orgInfo={orgInfo} />
        </>
      )}
    </FlexBox>
  );
};
