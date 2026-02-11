import React, { useCallback, useMemo } from 'react';
import { SettingsContainer, useSettingsContainer } from '../components/SettingsContainer';
import { useOrgSettingsRouterController } from './AdminPortalOrgRouter';
import { SettingsListItem } from '../components/SettingsListItem';
import { Input } from '../components/Input';
import { Typography } from '../components/Typography';
import { useStateSliceSetter } from '../utils/useStateSliceSetter';
import { useFormState } from '../utils/useFormState';
import { useMutateOrganization } from '../utils/useMutateOrganization';
import { FlexBox } from '../components/FlexBox';
import { SettingsList } from '../components/SettingsList';
import { useRbac } from '../utils/useRbac';
import { FormSectionBody } from '../utils/FormSectionBody';
import { isEmptyObject } from '../utils/isEmptyObject';
import { Organization } from '@stytch/core/public';

interface OrgDetailsFormState {
  organizationName: string;
  organizationSlug: string;
}
interface OrgSettingsDetailsBodyProps extends FormSectionBody<OrgDetailsFormState> {
  canSetName: boolean | undefined;
  canSetSlug: boolean | undefined;
}

export const useMutateOrgSettingsDetails = () => {
  const { mutate } = useMutateOrganization();

  const setOrgDetails = ({
    organizationName,
    organizationSlug,
  }: {
    organizationName?: string;
    organizationSlug?: string;
  }) => {
    return mutate(
      {
        ...(organizationName && { organization_name: organizationName }),
        ...(organizationSlug && { organization_slug: organizationSlug }),
      },
      {
        errorMessage: 'Failed to update details.',
      },
    );
  };

  return { setOrgDetails };
};

export const OrgSettingsDetailsBody = ({
  canSetName,
  canSetSlug,
  remoteState,
  localState,
  setLocalState,
}: OrgSettingsDetailsBodyProps) => {
  const handleNameChange = useStateSliceSetter(setLocalState, 'organizationName');
  const handleSlugChange = useStateSliceSetter(setLocalState, 'organizationSlug');

  const { editing } = useSettingsContainer();

  return (
    <FlexBox flexDirection="column" gap={2}>
      <SettingsList>
        <SettingsListItem title="Name">
          {editing && canSetName ? (
            <Input placeholder="Enter Name" value={localState.organizationName} onChange={handleNameChange} />
          ) : (
            <Typography variant="body2">{remoteState.organizationName}</Typography>
          )}
        </SettingsListItem>
        <SettingsListItem title="Slug">
          {editing && canSetSlug ? (
            <Input placeholder="Enter Slug" value={localState.organizationSlug} onChange={handleSlugChange} />
          ) : (
            <Typography variant="body2">{remoteState.organizationSlug}</Typography>
          )}
        </SettingsListItem>
      </SettingsList>
    </FlexBox>
  );
};

export const OrgSettingsDetailsSection = ({ orgInfo }: { orgInfo: Organization }) => {
  const { data: canSetName } = useRbac('stytch.organization', 'update.info.name');
  const { data: canSetSlug } = useRbac('stytch.organization', 'update.info.slug');
  const remoteState = useMemo<OrgDetailsFormState>(
    () => ({
      organizationName: orgInfo.organization_name,
      organizationSlug: orgInfo.organization_slug,
    }),
    [orgInfo],
  );
  const { localState, setLocalState, editing, handleSetEditing } = useFormState({ remoteState });

  const { useBlockNavigation } = useOrgSettingsRouterController();
  const { setOrgDetails } = useMutateOrgSettingsDetails();

  const findMutatedProperties = useCallback(() => {
    const mutatedProperties: Partial<OrgDetailsFormState> = {};

    if (remoteState.organizationName !== localState.organizationName && localState.organizationName.length > 0) {
      mutatedProperties.organizationName = localState.organizationName;
    }
    if (remoteState.organizationSlug !== localState.organizationSlug && localState.organizationSlug.length > 0) {
      mutatedProperties.organizationSlug = localState.organizationSlug;
    }
    return mutatedProperties;
  }, [
    localState.organizationName,
    localState.organizationSlug,
    remoteState.organizationName,
    remoteState.organizationSlug,
  ]);
  const handleSave = useCallback(async () => {
    const mutatedProperties = findMutatedProperties();

    if (!isEmptyObject(mutatedProperties)) {
      await setOrgDetails({
        organizationName: mutatedProperties.organizationName,
        organizationSlug: mutatedProperties.organizationSlug,
      });
    }

    return;
  }, [setOrgDetails, findMutatedProperties]);

  const disableSave = isEmptyObject(findMutatedProperties());

  return (
    <SettingsContainer
      title="Details"
      hasCTA={canSetName || canSetSlug}
      onSave={handleSave}
      useBlockNavigation={useBlockNavigation}
      editing={editing}
      setEditing={handleSetEditing}
      disableSave={disableSave}
    >
      <OrgSettingsDetailsBody
        canSetName={canSetName}
        canSetSlug={canSetSlug}
        localState={localState}
        remoteState={remoteState}
        setLocalState={setLocalState}
      />
    </SettingsContainer>
  );
};
