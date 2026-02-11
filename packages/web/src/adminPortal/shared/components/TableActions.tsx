import { styled } from '@mui/material';
import React, { ReactNode } from 'react';

import { InjectedComponents } from './componentInjection';

export const TableActionsContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  margin: theme.spacing(0, -1.25),
}));

export const TABLE_ACTIONS_HEADER = 'Actions';

type TableAction = {
  onClick: () => void;
  text: string;
};

export type TableActionCoreProps = {
  warningAction?: TableAction;
  action?: TableAction;
  customAction?: ReactNode;
};

export const TableActionsCore = ({
  warningAction,
  action,
  customAction,
  ButtonComponent: Button,
}: TableActionCoreProps & InjectedComponents<'Button'>): JSX.Element => {
  return (
    <TableActionsContainer>
      {action && (
        <Button compact onClick={action.onClick} variant="text">
          {action.text}
        </Button>
      )}
      {warningAction && (
        <Button compact onClick={warningAction.onClick} variant="text" warning>
          {warningAction.text}
        </Button>
      )}
      {customAction}
    </TableActionsContainer>
  );
};
