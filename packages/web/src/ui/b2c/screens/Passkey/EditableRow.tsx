import { useLingui } from '@lingui/react/macro';
import classNames from 'classnames';
import React, { useEffect, useRef } from 'react';

import Button from '../../../components/atoms/Button';
import Typography from '../../../components/atoms/Typography';
import Input from '../../../components/molecules/Input';
import styles from './EditableRow.module.css';

export type EditableRowState =
  | { type: 'viewing' } //
  | { type: 'editing'; id: string; newName: string }
  | { type: 'deleting'; id: string };

const commonButtonProps = {
  block: false,
  variant: 'ghost',
} as const;

type Props = {
  id: string;
  name: string;
  className?: string;
  state: EditableRowState;
  updateState: (newState: EditableRowState) => void;
  handleEdit: (id: string, newName: string) => void;
};

export const EditableRow = ({ id, name, className, state, updateState, handleEdit }: Props) => {
  const { t } = useLingui();

  const isEditing = isEditingRow(id, state);
  const othersEditing = state.type !== 'viewing' && state.id !== id;

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  return (
    <form
      className={classNames(styles.row, className)}
      onSubmit={(evt) => {
        evt.preventDefault();
        if (isEditing) {
          handleEdit(id, state.newName);
        }
      }}
      data-testid={testId(id)}
    >
      <div className={styles.input}>
        {isEditing ? (
          <Input
            id={`passkey-name-${id}`}
            ref={inputRef}
            label={t({ id: 'passkey.editing.label', message: 'Passkey name' })}
            hideLabel
            value={isEditing ? state.newName : name}
            onChange={(e) => {
              if (isEditing) {
                updateState({ ...state, newName: e.target.value });
              }
            }}
          />
        ) : (
          <Typography color="muted">{name}</Typography>
        )}
      </div>

      {(() => {
        if (state.type === 'deleting') return null;

        if (isEditing) {
          return (
            <div className={styles.actions}>
              <Button key="submit" type="submit" {...commonButtonProps}>
                {t({ id: 'button.save', message: 'Save' })}
              </Button>
              <Button onClick={() => updateState({ type: 'viewing' })} {...commonButtonProps}>
                {t({ id: 'button.cancel', message: 'Cancel' })}
              </Button>
            </div>
          );
        }

        if (state.type === 'viewing' || othersEditing) {
          return (
            <div className={styles.actions}>
              <Button
                // key required to workaround a React/Preact issue when button type is updated on re-render
                key="edit"
                onClick={() => updateState({ type: 'editing', id, newName: name })}
                disabled={othersEditing}
                {...commonButtonProps}
              >
                {t({ id: 'button.edit', message: 'Edit' })}
              </Button>
              <Button
                onClick={() => updateState({ type: 'deleting', id })}
                disabled={othersEditing}
                {...commonButtonProps}
              >
                {t({ id: 'button.delete', message: 'Delete' })}
              </Button>
            </div>
          );
        }
      })()}
    </form>
  );
};

export function isEditingRow(
  id: string,
  state: EditableRowState,
): state is Extract<EditableRowState, { type: 'editing' }> {
  return state.type === 'editing' && state.id === id;
}

export function testId(id: string) {
  return `editable-row-${id}`;
}
