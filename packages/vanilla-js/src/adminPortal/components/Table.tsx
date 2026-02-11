import { SxProps, Theme, tableCellClasses } from '@mui/material';
import React from 'react';
import { TableCore, TableCoreProps } from '../shared/components/Table';
import { TableActions } from './TableActions';
import { Typography } from './Typography';

export type TableProps<T> = TableCoreProps<T>;

const tableCellSx: SxProps<Theme> = {
  borderBottomColor: (theme) => theme.styleConfig.colors.subtle,
  color: (theme) => theme.styleConfig.colors.primary,
  backgroundColor: (theme) => theme.styleConfig.container.backgroundColor,
};

const tableActionsCellSx = {
  minWidth: 0,
  [`&.${tableCellClasses.head}`]: {
    textAlign: 'center',
  },
};

const tableRowSxWithoutBottomBorder = {
  '&:last-child th, &:last-child td': {
    borderBottom: 0,
  },
};

const expandMoreCellSx: SxProps<Theme> = {
  padding: (theme) => theme.spacing(0.5, 0),
  width: (theme) => theme.spacing(2),
};

const expandedContentContainerSx: SxProps<Theme> = {
  padding: (theme) => theme.spacing(1, 2, 1, 2),
};

export const Table = <T extends object>(props: TableProps<T>): JSX.Element => {
  return (
    <TableCore
      {...props}
      TableActionsComponent={TableActions}
      TypographyComponent={Typography}
      tableCellSx={tableCellSx}
      tableActionsCellSx={tableActionsCellSx}
      tableRowSx={props.disableBottomBorder ? tableRowSxWithoutBottomBorder : undefined}
      expandMoreCellSx={expandMoreCellSx}
      expandedContentContainerSx={expandedContentContainerSx}
    />
  );
};
