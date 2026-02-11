import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Theme,
  styled,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React, { FC, ReactNode, useState } from 'react';
import { ModalStateType } from '../shared/components/Modal';
import { Button } from './Button';
import { FlexBox } from './FlexBox';
import { Typography } from './Typography';
import { useUniqueId } from '../../utils/uniqueId';

export { useModalState, type ModalStateType } from '../shared/components/Modal';

const useAsyncState = useState;

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
}));

export type ModalProps = Omit<ModalStateType, 'open'> & {
  cancelButtonText?: string;
  description?: string;
  confirmButtonText?: string;
  disableConfirm?: boolean;
  warning?: boolean;
  title: string;
  showLoadingOnConfirm?: boolean;
  noCancelButton?: boolean;
  keepOpenOnConfirm?: boolean;
  children?: ReactNode;
};

export const Modal: FC<ModalProps> = ({
  cancelButtonText,
  children,
  description,
  confirmButtonText,
  disableConfirm,
  warning,
  close,
  confirm,
  title,
  showLoadingOnConfirm,
  noCancelButton,
  isOpen,
  keepOpenOnConfirm,
}) => {
  const [confirming, setConfirming] = useAsyncState(false);
  const isXsScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('xs'));

  const descriptionId = useUniqueId('confirmation-modal-description');
  const titleId = useUniqueId('confirmation-modal-title');

  const handleConfirm: React.FormEventHandler = async (e) => {
    e.preventDefault();
    setConfirming(true);
    try {
      return await confirm();
    } finally {
      setConfirming(false);
      if (!keepOpenOnConfirm) {
        close();
      }
    }
  };

  const onClose = () => {
    close();
  };

  const confirmDisabled = confirming || disableConfirm;

  return (
    <Dialog
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      fullScreen={isXsScreen}
      onClose={onClose}
      open={isOpen}
    >
      {isXsScreen && !noCancelButton && (
        <CloseButton onClick={onClose} size="large">
          <CloseIcon fontSize="small" />
        </CloseButton>
      )}
      <DialogTitle id={titleId}>
        <Typography variant="h2">{title}</Typography>
      </DialogTitle>
      <form onSubmit={handleConfirm}>
        <DialogContent>
          {description && <Typography>{description}</Typography>}
          {children && <FlexBox flexDirection="column">{children}</FlexBox>}
        </DialogContent>
        <DialogActions>
          {!noCancelButton && (
            <Button autoFocus={warning} disabled={confirming} onClick={onClose} variant="ghost" compact>
              {cancelButtonText ?? `Cancel`}
            </Button>
          )}
          <Button
            autoFocus={!warning}
            disabled={confirmDisabled}
            type="submit"
            variant="primary"
            warning={warning}
            compact
          >
            {confirming && showLoadingOnConfirm ? <CircularProgress size={18} /> : (confirmButtonText ?? 'Ok')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
