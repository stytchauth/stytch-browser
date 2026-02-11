import { ReactNode } from 'react';

import { useToast } from './Toast';
import { useToggleState } from '../utils/useToggleState';
import { extractErrorMessage } from '../../../utils/extractErrorMessage';

export type ModalStateType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  confirm: () => Promise<void>;
};

export const useModalState = (confirmAction?: () => unknown): ModalStateType => {
  const { isOpen, open, close } = useToggleState();
  const { openToast } = useToast();

  const confirm = async () => {
    try {
      await confirmAction?.();
    } catch (e: unknown) {
      const message = extractErrorMessage(e);
      if (message) {
        openToast({ text: message, type: 'error' });
      }
    }
  };

  return { isOpen, open, close, confirm };
};

export type ModalCoreProps = Omit<ModalStateType, 'open'> & {
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
