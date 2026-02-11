import { styled } from '@mui/material';
import React, { createContext, FC, ReactNode, useContext, useState } from 'react';

import { extractErrorMessage } from '../../utils/extractErrorMessage';
import { UseBlockNavigation } from '../Router';
import { noop } from '../shared/utils/noop';
import { Button } from './Button';
import { FlexBox } from './FlexBox';
import { Modal, useModalState } from './Modal';
import { useToast } from './Toast';
import { Typography } from './Typography';

const Container = styled('div')(({ theme }) => ({
  border: '1px solid',
  borderColor: theme.styleConfig.colors.subtle,
  borderRadius: theme.styleConfig.borderRadius,
  backgroundColor: theme.styleConfig.container.backgroundColor,
}));

const TitleContainer = styled('div')(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
  },
  padding: theme.spacing(1.5, 2),
  borderBottom: '1px solid',
  borderBottomColor: theme.styleConfig.colors.subtle,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const ContentContainer = styled('div')(({ theme }) => ({ padding: theme.spacing(2) }));

type SettingsContextType = {
  editing: boolean;
  setEditing: (editing: boolean) => void;
};

const DEFAULT_STATE: SettingsContextType = {
  editing: false,
  setEditing: noop,
};

const SettingsContext = createContext<SettingsContextType>(DEFAULT_STATE);

export const useSettingsContainer = (): SettingsContextType => useContext(SettingsContext);

type Props = {
  hasCTA?: boolean;
  onCancel?: () => void;
  onSave?: () => Promise<void>;
  title: string;
  canEdit?: boolean;
  disableSave?: boolean;
  customCTA?: ReactNode;
  creating?: boolean;
  editing?: boolean;
  setEditing?: (value: boolean) => void;
  modalDescription?: string;
  children: ReactNode;
  useBlockNavigation: UseBlockNavigation;
};

export const SettingsContainer: FC<Props> = ({
  canEdit = true,
  disableSave,
  children,
  hasCTA,
  onCancel,
  onSave,
  title,
  customCTA,
  creating,
  editing: externalEditing,
  setEditing: externalSetEditing,
  modalDescription,
  useBlockNavigation,
}) => {
  const [internalEditing, internalSetEditing] = useState(creating ?? false);
  const [isSaving, setIsSaving] = useState(false);
  const { openToast, closeToast } = useToast();

  const shouldUseExternalEditing = externalEditing !== undefined && !!externalSetEditing;

  const editing = shouldUseExternalEditing ? externalEditing : internalEditing;
  const setEditing = shouldUseExternalEditing ? externalSetEditing : internalSetEditing;

  const { allowNavigation, blocked, cancelNavigation } = useBlockNavigation(editing && !isSaving);

  const edit = () => {
    setEditing(true);
  };

  const cancel = () => {
    onCancel?.();
    closeToast();
    setEditing(false);
  };

  const save = async () => {
    setIsSaving(true);
    try {
      await onSave?.();
      setEditing(false);
    } catch (e) {
      const message = extractErrorMessage(e);
      if (message) {
        openToast({ type: 'error', text: message });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const modalState = useModalState(save);

  if (!modalDescription) {
    modalDescription = 'Double check before saving your changes.';
  }

  return (
    <SettingsContext.Provider
      value={{
        editing,
        setEditing,
      }}
    >
      <Modal
        {...modalState}
        confirmButtonText="Save changes"
        description={modalDescription}
        title="Save changes?"
        warning
      />
      <Modal
        isOpen={blocked}
        close={cancelNavigation}
        confirm={() => {
          allowNavigation();
          return Promise.resolve();
        }}
        confirmButtonText="Navigate without saving"
        cancelButtonText="Keep editing"
        description={'Your changes are unsaved – are you sure you want to navigate away?'}
        title="Save changes?"
        warning
      />
      <Container>
        <TitleContainer>
          <Typography variant="h3">{title}</Typography>

          <FlexBox alignItems="center" gap={1}>
            {hasCTA && (
              <>
                {editing ? (
                  <>
                    <Button compact onClick={cancel} variant="ghost">
                      Cancel
                    </Button>
                    <Button compact disabled={disableSave} onClick={modalState.open}>
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    {customCTA
                      ? customCTA
                      : canEdit && (
                          <Button compact onClick={edit} variant="ghost">
                            Edit
                          </Button>
                        )}
                  </>
                )}
              </>
            )}
          </FlexBox>
        </TitleContainer>
        <ContentContainer>{children}</ContentContainer>
      </Container>
    </SettingsContext.Provider>
  );
};
