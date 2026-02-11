import React from 'react';

import { ListEditorCore, ListEditorCoreProps } from '../shared/components/ListEditor';
import { Button } from './Button';
import { EmbeddedTable } from './EmbeddedTable';
import { Modal } from './Modal';
import { Typography } from './Typography';

export { ADD_NEW_BUTTON_TEXT, type AddModalProps } from '../shared/components/ListEditor';

export type ListEditorProps<T> = ListEditorCoreProps<T>;

export const ListEditor = <T extends Record<string, unknown> | string>(props: ListEditorProps<T>): JSX.Element => {
  return (
    <ListEditorCore
      {...props}
      ButtonComponent={Button}
      EmbeddedTableComponent={EmbeddedTable<T>}
      ModalComponent={Modal}
      TypographyComponent={Typography}
    />
  );
};
