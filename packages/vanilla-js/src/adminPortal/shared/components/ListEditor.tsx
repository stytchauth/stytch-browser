import AddIcon from '@mui/icons-material/AddRounded';
import React, { ReactNode } from 'react';

import { InjectedComponents } from './componentInjection';
import { ContentSpacingCore } from './ContentSpacing';
import { EmbeddedTableCoreProps } from './EmbeddedTable';
import { ModalCoreProps, useModalState } from './Modal';

export const ADD_NEW_BUTTON_TEXT = 'Add new';

export type AddModalProps = Pick<
  ModalCoreProps,
  'title' | 'description' | 'confirmButtonText' | 'confirm' | 'disableConfirm' | 'noCancelButton' | 'keepOpenOnConfirm'
> & {
  close?(): void;
  content?: ReactNode;
};

export type ListEditorCoreProps<T> = EmbeddedTableCoreProps<T> & {
  hideAddButton?: boolean;
  title?: string;
  description?: string;
  emptyText?: string;
  limit?: number;
  addModalProps?: AddModalProps;
  addButtonText?: string;
  onAdd?(): void;
};

export const ListEditorCore = <T extends Record<string, unknown> | string>({
  title,
  description,
  emptyText,
  limit,
  addModalProps,
  hideAddButton,
  onAdd,
  addButtonText,
  ButtonComponent: Button,
  EmbeddedTableComponent: EmbeddedTable,
  ModalComponent: Modal,
  TypographyComponent: Typography,
  ...embeddedTableProps
}: ListEditorCoreProps<T> &
  InjectedComponents<'Button' | 'Modal' | 'Typography'> & {
    EmbeddedTableComponent: React.ComponentType<EmbeddedTableCoreProps<T>>;
  }): JSX.Element => {
  if (!addModalProps && !onAdd) {
    throw new Error('Either addModalProps or onAdd prop must be provided');
  }
  addButtonText = addButtonText || ADD_NEW_BUTTON_TEXT;
  const modalState = useModalState(addModalProps?.confirm);
  const { items, readOnly } = embeddedTableProps;

  const onClose = () => {
    addModalProps?.close?.();
    modalState.close();
  };

  const addNew = addModalProps ? modalState.open : onAdd;

  return (
    <ContentSpacingCore>
      {addModalProps && (
        <Modal {...addModalProps} {...modalState} close={onClose}>
          {addModalProps.content}
        </Modal>
      )}
      {(title || description) && (
        <div>
          {title && <Typography variant="h4">{title}</Typography>}
          {description && <Typography>{description}</Typography>}
        </div>
      )}
      {items && items.length > 0 ? (
        <EmbeddedTable
          {...embeddedTableProps}
          bottomAction={
            !hideAddButton &&
            (!limit || items.length < limit) && (
              <Button compact onClick={addNew} startIcon={<AddIcon />} variant="text">
                {addButtonText}
              </Button>
            )
          }
        />
      ) : (
        emptyText && <Typography variant="body2">{emptyText}</Typography>
      )}
      {!hideAddButton && !readOnly && !items.length && (
        <Button compact onClick={addNew} startIcon={<AddIcon />} variant="ghost">
          {addButtonText}
        </Button>
      )}
    </ContentSpacingCore>
  );
};
