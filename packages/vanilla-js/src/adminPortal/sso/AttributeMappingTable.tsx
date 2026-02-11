import { Add } from '@mui/icons-material';
import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { FlexBox } from '../components/FlexBox';
import { Input } from '../components/Input';
import { ListEditor } from '../components/ListEditor';
import { Modal, useModalState } from '../components/Modal';
import { Select } from '../components/Select';
import { Typography } from '../components/Typography';
import { TableItemRenderer } from '../shared/components/types';
import { collator } from '../utils/collator';
import { StateProps } from '../utils/useFormState';

export const nameKeys = new Set(['full_name', 'first_name', 'last_name']);
export const requiredKeys = new Set([...nameKeys, 'email']);

export interface AttributeMappingState {
  attributeMapping: Record<string, string>;
}

export interface AttributeMappingTableProps<TState> extends StateProps<TState> {
  editing: boolean;
}

type AttributeMapping = {
  key: string;
  value: string;
};

export const attributeMappingItemRenderer: TableItemRenderer<AttributeMapping>[] = [
  {
    title: 'Key',
    getValue: ({ key }) => {
      const isRequiredKey = requiredKeys.has(key);
      const label = key;
      return (
        <Typography variant="body2">
          {label}
          {isRequiredKey && (
            <>
              {' '}
              <Typography component="span" color="error">
                *
              </Typography>
            </>
          )}
        </Typography>
      );
    },
  },
  { title: 'Value', getValue: ({ value }) => <Typography variant="body2">{value}</Typography> },
];

export const attributeMappingKeyExtractor = ({ key }: { key: string; value: string }): string => key;

export const AttributeMappingTable = <TState extends AttributeMappingState>({
  editing,
  localState,
  remoteState,
  setLocalState,
}: AttributeMappingTableProps<TState>) => {
  const { attributeMapping } = editing ? localState : remoteState;

  const attributeMappingItems = useMemo(
    () =>
      Object.entries(attributeMapping)
        .map(([key, value]) => ({ key, value }))
        .sort((a, b) => collator.compare(a.key, b.key)),
    [attributeMapping],
  );

  const [pendingAttributeMapping, setPendingAttributeMapping] = useState<[key: string, value: string][]>([['', '']]);

  const [editMode, setEditMode] = useState<'key' | 'name'>('key');
  const [editedAttributeMappingKey, setEditedAttributeMappingKey] = useState('');
  const [editedAttributeMappingValue, setEditedAttributeMappingValue] = useState('');
  const [editedAttributeMappingLastNameValue, setEditedAttributeMappingLastNameValue] = useState('');

  const editAttributeMappingModalProps = useModalState(() => {
    const editedMapping: Record<string, string> =
      editMode === 'name' && editedAttributeMappingKey === 'first_name'
        ? {
            first_name: editedAttributeMappingValue,
            last_name: editedAttributeMappingLastNameValue,
          }
        : {
            [editedAttributeMappingKey]: editedAttributeMappingValue,
          };

    setLocalState((state) => {
      const mergedMapping = {
        ...state.attributeMapping,
        ...editedMapping,
      };

      if (editMode === 'name') {
        if (editedAttributeMappingKey === 'full_name') {
          delete mergedMapping.first_name;
          delete mergedMapping.last_name;
        }
        if (editedAttributeMappingKey === 'first_name') {
          delete mergedMapping.full_name;
        }
      }
      return {
        ...state,
        attributeMapping: mergedMapping,
      };
    });
  });

  const hasFirstAndLastNameKeys = !!(attributeMapping.first_name && attributeMapping.last_name);
  const hasFullNameKey = !!attributeMapping.full_name;

  const handleEditAttributeMapping = useCallback(
    (key: string) => {
      if (
        (key === 'full_name' && !attributeMapping.first_name && !attributeMapping.last_name) ||
        ((key === 'first_name' || key === 'last_name') && !hasFullNameKey)
      ) {
        setEditMode('name');

        const effectiveKey = key === 'full_name' ? 'full_name' : 'first_name';

        setEditedAttributeMappingKey(effectiveKey);
        setEditedAttributeMappingValue(attributeMapping[effectiveKey] ?? '');
        setEditedAttributeMappingLastNameValue(attributeMapping.last_name ?? '');
      } else {
        setEditMode('key');
        setEditedAttributeMappingKey(key);
        setEditedAttributeMappingValue(attributeMapping[key] ?? '');
      }

      editAttributeMappingModalProps.open();
    },
    [attributeMapping, editAttributeMappingModalProps, hasFullNameKey],
  );

  const deleteAttributeMapping = useCallback(
    (key: string) => {
      setLocalState((state) => {
        const { [key]: _, ...rest } = state.attributeMapping;
        return {
          ...state,
          attributeMapping: rest,
        };
      });
    },
    [setLocalState],
  );

  const deleteAttributeMappingModalProps = useModalState(() => {
    if (pendingDeleteAttributeMappingKey) {
      deleteAttributeMapping(pendingDeleteAttributeMappingKey);
    }
  });
  const [pendingDeleteAttributeMappingKey, setPendingDeleteAttributeMappingKey] = useState<string>();
  const handleRequestDeleteAttributeMapping = useCallback(
    (key: string) => {
      if (key !== 'groups') {
        deleteAttributeMapping(key);
      } else {
        setPendingDeleteAttributeMappingKey(key);
        deleteAttributeMappingModalProps.open();
      }
    },
    [deleteAttributeMapping, deleteAttributeMappingModalProps],
  );

  return (
    <>
      <Modal {...editAttributeMappingModalProps} title="Edit custom mapping" confirmButtonText="Save">
        <FlexBox flexDirection="column" gap={1}>
          {editMode === 'name' ? (
            <Select
              selectItems={[
                { label: 'Full Name', value: 'full_name' },
                { label: 'First Name, Last Name', value: 'first_last_name' },
              ]}
              fullWidth
              caption="You can change the format of the key."
              value={editedAttributeMappingKey === 'full_name' ? 'full_name' : 'first_last_name'}
              onChange={(value) => {
                setEditedAttributeMappingKey(value === 'full_name' ? 'full_name' : 'first_name');
              }}
            />
          ) : (
            <Input label="Key" fullWidth value={editedAttributeMappingKey} onChange={setEditedAttributeMappingKey} />
          )}
          {editMode === 'name' &&
          (editedAttributeMappingKey === 'first_name' || editedAttributeMappingKey === 'last_name') ? (
            <>
              <FlexBox gap={2}>
                <Input
                  label="First Name"
                  fullWidth
                  value={editedAttributeMappingValue}
                  onChange={setEditedAttributeMappingValue}
                />
                <Input
                  label="Last Name"
                  fullWidth
                  value={editedAttributeMappingLastNameValue}
                  onChange={setEditedAttributeMappingLastNameValue}
                />
              </FlexBox>
            </>
          ) : (
            <Input
              label="Value"
              fullWidth
              value={editedAttributeMappingValue}
              onChange={setEditedAttributeMappingValue}
            />
          )}
        </FlexBox>
      </Modal>
      <Modal {...deleteAttributeMappingModalProps} title="Delete mapping?" confirmButtonText="Delete" warning>
        <Typography>
          Deleting the Groups attribute mapping will also disable any Group Role assignments you have added above. They
          will not be deleted, but you must add a Groups mapping to make edits.
        </Typography>
      </Modal>
      <ListEditor
        items={attributeMappingItems}
        itemRenderer={attributeMappingItemRenderer}
        rowKeyExtractor={attributeMappingKeyExtractor}
        addModalProps={{
          confirm: () => {
            setLocalState((state) => {
              return {
                ...state,
                attributeMapping: {
                  ...state.attributeMapping,
                  ...Object.fromEntries(
                    pendingAttributeMapping.filter(([key, value]) => key && value && !state.attributeMapping[key]),
                  ),
                },
              };
            });

            return Promise.resolve();
          },
          title: 'Add custom mapping',
          content: (
            <FlexBox flexDirection="column" gap={1}>
              {pendingAttributeMapping.map(([key, value], i) => (
                <FlexBox gap={1} key={i}>
                  <Input
                    label="Key"
                    fullWidth
                    value={key}
                    onChange={(value) => {
                      setPendingAttributeMapping((state) =>
                        state.map((item, index) => (index === i ? [value, item[1]] : item)),
                      );
                    }}
                  />
                  <Input
                    label="Value"
                    fullWidth
                    value={value}
                    onChange={(value) => {
                      setPendingAttributeMapping((state) =>
                        state.map((item, index) => (index === i ? [item[0], value] : item)),
                      );
                    }}
                  />
                </FlexBox>
              ))}
              <Button
                variant="text"
                startIcon={<Add />}
                fullWidth
                onClick={() => {
                  setPendingAttributeMapping((state) => [...state, ['', '']]);
                }}
              >
                Add custom mapping
              </Button>
            </FlexBox>
          ),
        }}
        hideAddButton={!editing}
        getItemActionProps={
          editing
            ? (item) => ({
                action:
                  // Only allow editing email if its value is not expected
                  item.key === 'email' && item.value === 'NameID'
                    ? undefined
                    : {
                        text: 'Edit',
                        onClick: () => {
                          handleEditAttributeMapping(item.key);
                        },
                      },
                warningAction:
                  // Never allow deleting email; allow deleting name-related fields only if they are superfluous
                  item.key === 'email' || (nameKeys.has(item.key) && !(hasFirstAndLastNameKeys && hasFullNameKey))
                    ? undefined
                    : {
                        text: 'Delete',
                        onClick: () => {
                          handleRequestDeleteAttributeMapping(item.key);
                        },
                      },
              })
            : undefined
        }
      />
    </>
  );
};
