import React, { useEffect, useRef } from 'react';
import { useLingui } from '@lingui/react/macro';
import Button from '../../../components/Button';
import { Flex } from '../../../components/Flex';
import styled from 'styled-components';
import { Checkmark } from '../../../../assets/checkmark';
import { Pencil } from '../../../../assets/pencil';
import { Trash } from '../../../../assets/trash';
import { Input } from '../../../components/Input';
import { Cancel } from '../../../../assets/cancel';
import { IconColorOverride } from '../../../components/IconColorOverride';

export type EditableRowState =
  | { type: 'viewing' } //
  | { type: 'editing'; id: string; newName: string }
  | { type: 'deleting'; id: string };

const BaseIconButton = styled(Button).attrs({
  variant: 'text',
})`
  flex: 0 0 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;
`;

type IconButtonProps = {
  label: string;
  icon: React.ReactNode;
  type?: 'button' | 'submit';
  onClick?: () => void;
};

const IconButton = ({ type = 'button', icon, onClick, label }: IconButtonProps) => (
  <BaseIconButton aria-label={label} onClick={onClick} type={type}>
    <IconColorOverride themeColor="primary">{icon}</IconColorOverride>
  </BaseIconButton>
);

export const RowInput = styled(Input)<{ isEditing: boolean; othersEditing: boolean }>`
  flex: 1 1 auto;
  background-color: transparent;
  border-color: ${(props) => (props.isEditing ? props.theme.inputs.borderColor : 'transparent')};
  {(props) => props.theme.typography.body}

  &:disabled {
    border-color: transparent;
    background: transparent;
    color: ${(props) => (props.othersEditing ? props.theme.colors.disabledText : props.theme.colors.primary)};
  }
`;

type Props = {
  id: string;
  name: string;
  state: EditableRowState;
  updateState: (newState: EditableRowState) => void;
  handleEdit: (id: string, newName: string) => void;
};

export const EditableRow = ({ id, name, state, updateState, handleEdit }: Props) => {
  const { t } = useLingui();

  const isEditing = isEditingRow(id, state);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  return (
    <Flex
      as="form"
      direction="row"
      gap={2}
      alignItems="center"
      width="100%"
      onSubmit={(evt) => {
        evt.preventDefault();
        if (isEditing) {
          handleEdit(id, state.newName);
        }
      }}
      data-testid={testId(id)}
    >
      <RowInput
        ref={inputRef}
        disabled={!isEditing}
        isEditing={isEditing}
        othersEditing={state.type !== 'viewing' && state.id !== id}
        value={isEditing ? state.newName : name}
        onChange={(e) => {
          if (isEditing) {
            updateState({ ...state, newName: e.target.value });
          }
        }}
        aria-label={t({ id: 'passkey.editing.label', message: 'Passkey name' })}
      />

      {(() => {
        switch (state.type) {
          case 'viewing':
            return (
              <>
                <IconButton
                  // key required to workaround a Preact issue
                  key="edit"
                  onClick={() => updateState({ type: 'editing', id, newName: name })}
                  icon={<Pencil />}
                  label={t({ id: 'button.edit', message: 'Edit' })}
                />
                <IconButton
                  onClick={() => updateState({ type: 'deleting', id })}
                  icon={<Trash />}
                  label={t({ id: 'button.delete', message: 'Delete' })}
                />
              </>
            );

          case 'editing':
            if (state.id !== id) return null;

            return (
              <>
                <IconButton
                  key="submit"
                  type="submit"
                  icon={<Checkmark />}
                  label={t({ id: 'button.save', message: 'Save' })}
                />
                <IconButton
                  onClick={() => updateState({ type: 'viewing' })}
                  icon={<Cancel />}
                  label={t({ id: 'button.cancel', message: 'Cancel' })}
                />
              </>
            );

          case 'deleting':
            return null;
        }
      })()}
    </Flex>
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
