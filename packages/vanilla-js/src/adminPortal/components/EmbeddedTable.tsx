import { SxProps, Theme } from '@mui/material';
import React from 'react';
import { EmbeddedTableCore, EmbeddedTableCoreProps } from '../shared/components/EmbeddedTable';
import { TableActions } from './TableActions';
import { Typography, TypographyProps } from './Typography';

export type EmbeddedTableProps<T> = EmbeddedTableCoreProps<T>;

const TypographyCustom = (props: TypographyProps) => <Typography {...props} variant="caption" color="secondary" />;

const tableHeaderSx: SxProps<Theme> = (theme) => ({
  borderBottomColor: theme.styleConfig.colors.subtle,
});

export const EmbeddedTable = <T extends Record<string, unknown> | string>(
  props: EmbeddedTableProps<T>,
): JSX.Element => {
  return (
    <EmbeddedTableCore
      {...props}
      TableActionsComponent={TableActions}
      TypographyComponent={TypographyCustom}
      tableHeaderSx={tableHeaderSx}
    />
  );
};
