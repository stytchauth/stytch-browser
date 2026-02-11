import {
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  styled,
} from '@mui/material';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { getTableCellValue, validateRowKey } from '../utils/tableUtils';
import { TABLE_ACTIONS_HEADER, TableActionCoreProps, TableActionsContainer } from './TableActions';
import { InjectedComponents } from './componentInjection';
import { TableItemRenderer } from './types';

const StyledTable = styled(Table)<{ hasActions: boolean }>(({ hasActions }) => [
  // For some reason with position sticky, the table is 2px wider than the container
  hasActions && { width: 'calc(100% - 2px)' },
]);

const StyleTabledCell = styled(TableCell)<{ isActions?: boolean; isBottomAction?: boolean }>(
  ({ isActions, isBottomAction }) => [
    {
      '& > p': {
        whiteSpace: 'normal',
      },
    },
    isActions && {
      position: 'sticky',
      right: 0,
      width: '1%',
    },
    isBottomAction && {
      borderBottom: 'none',
    },
  ],
);

export type EmbeddedTableCoreProps<T> = {
  itemRenderer: TableItemRenderer<T>[];
  items: T[];
  rowKeyExtractor?(item: T): string;
  getItemActionProps?: (
    item: T,
    setState: (state: Record<string, unknown>) => void,
    state?: Record<string, unknown>,
  ) => TableActionCoreProps;
  readOnly?: boolean;
  initialItemState?: Record<string, unknown>;
  bottomAction?: ReactNode;
  tableHeaderSx?: SxProps<Theme>;
};

export const EmbeddedTableCore = <T extends Record<string, unknown> | string>({
  itemRenderer,
  items,
  rowKeyExtractor,
  getItemActionProps,
  readOnly,
  bottomAction,
  initialItemState,
  tableHeaderSx,
  TableActionsComponent: TableActions,
  TypographyComponent: Typography,
}: EmbeddedTableCoreProps<T> & InjectedComponents<'TableActions' | 'Typography'>): JSX.Element => {
  validateRowKey(items, rowKeyExtractor);

  const getId = useCallback(
    (item: T) => (rowKeyExtractor ? rowKeyExtractor(item) : typeof item === 'string' ? item : (item.id as string)),
    [rowKeyExtractor],
  );

  const itemState = initialItemState ?? {};
  const [itemsState, setItemsState] = useState<Record<string, Record<string, unknown>>>(
    items.reduce((acc, item) => ({ ...acc, [getId(item)]: itemState }), {}),
  );

  const setItemState = (item: T, state: Record<string, unknown>) => {
    const id = getId(item);
    setItemsState((prevState) => ({ ...prevState, [id]: state }));
  };

  useEffect(() => {
    setItemsState(items.reduce((acc, item) => ({ ...acc, [getId(item)]: itemsState[getId(item)] ?? itemState }), {}));
  }, [items, getId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TableContainer>
      <StyledTable hasActions={Boolean(getItemActionProps)}>
        <TableHead>
          <TableRow>
            {itemRenderer.map((column) => (
              <StyleTabledCell key={`col-header-${column.title}`} sx={tableHeaderSx}>
                <Typography variant="body2">{column.title}</Typography>
              </StyleTabledCell>
            ))}
            {!readOnly && getItemActionProps && (
              <StyleTabledCell isActions sx={tableHeaderSx}>
                <Typography variant="body2">{TABLE_ACTIONS_HEADER}</Typography>
              </StyleTabledCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => {
            const id = getId(item);
            return (
              <TableRow key={id}>
                {itemRenderer.map((column, i) => {
                  const children = column.getValue(item, itemsState[id]);
                  const value = getTableCellValue(children);

                  return (
                    <StyleTabledCell key={`col-${column.title}-${i}`}>
                      {typeof value === 'string' ? <Typography variant="body2">{value}</Typography> : value}
                    </StyleTabledCell>
                  );
                })}
                {!readOnly && getItemActionProps && (
                  <StyleTabledCell isActions>
                    <TableActions
                      {...getItemActionProps(item, (state) => state && setItemState(item, state), itemsState[id])}
                    />
                  </StyleTabledCell>
                )}
              </TableRow>
            );
          })}
          {!readOnly && bottomAction && (
            <TableRow>
              <StyleTabledCell
                colSpan={getItemActionProps ? itemRenderer.length : itemRenderer.length - 1}
                isBottomAction
              />
              <StyleTabledCell isActions isBottomAction>
                <TableActionsContainer>{bottomAction}</TableActionsContainer>
              </StyleTabledCell>
            </TableRow>
          )}
        </TableBody>
      </StyledTable>
    </TableContainer>
  );
};
