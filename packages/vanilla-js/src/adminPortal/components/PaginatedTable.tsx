import { SxProps, Theme, iconButtonClasses, tablePaginationClasses } from '@mui/material';
import React from 'react';
import { PaginatedTableCore, PaginatedTableCoreProps } from '../shared/components/PaginatedTable';
import { Table } from './Table';
import { Typography } from './Typography';

const tablePaginationSx: SxProps<Theme> = {
  [`.${tablePaginationClasses.toolbar}`]: {
    color: (theme) => theme.styleConfig.colors.primary,
  },
  [`.${tablePaginationClasses.selectIcon}`]: {
    color: (theme) => theme.styleConfig.colors.primary,
  },
  [`.${tablePaginationClasses.actions} .${iconButtonClasses.disabled}`]: {
    color: (theme) => theme.styleConfig.colors.secondary,
  },
};

export type PaginatedTableProps<T extends object> = Omit<PaginatedTableCoreProps<T>, 'keepConsistentContentHeight'>;

export const PaginatedTable = <T extends object>(props: PaginatedTableProps<T>): JSX.Element => {
  return (
    <PaginatedTableCore
      {...props}
      keepConsistentContentHeight={false}
      TableComponent={Table<T>}
      TypographyComponent={Typography}
      tablePaginationSx={tablePaginationSx}
    />
  );
};
