import { MoreVert } from '@mui/icons-material';
import { styled } from '@mui/material';
import React, { useCallback } from 'react';

import { TableActionCoreProps } from '../shared/components/TableActions';
import { Action, IconButtonMenu } from './IconButtonMenu';

export { type Action } from './IconButtonMenu';

export interface ActionMenuProps<T> {
  actions: readonly Readonly<Action<T>>[];
  item: T;
  idPrefix: string;
}

const StyledDiv = styled('div')({ display: 'flex', width: '100%', justifyContent: 'center' });

export const ActionMenu = <T,>({ actions, item, idPrefix }: ActionMenuProps<T>) => {
  return <IconButtonMenu actions={actions} item={item} idPrefix={idPrefix} icon={<MoreVert fontSize="large" />} />;
};

interface UseActionMenuParams<T> {
  actions: readonly Readonly<Action<T>>[];
  idPrefix: string;
  getId: (item: T) => string;
}

export const useActionMenu = <T,>({ actions, idPrefix, getId }: UseActionMenuParams<T>) => {
  const getItemActionProps = useCallback(
    (item: T): TableActionCoreProps => {
      const hasVisibleActions = actions.some(({ isVisible = true }) =>
        typeof isVisible === 'function' ? isVisible(item) : isVisible,
      );

      if (!hasVisibleActions) {
        return {};
      }

      return {
        customAction: (
          <StyledDiv>
            <ActionMenu actions={actions} item={item} idPrefix={`${idPrefix}-action-menu-${getId(item)}`} />
          </StyledDiv>
        ),
      };
    },
    [actions, getId, idPrefix],
  );

  return { getItemActionProps };
};
