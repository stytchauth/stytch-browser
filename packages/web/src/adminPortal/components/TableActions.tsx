import React from 'react';

import { TableActionCoreProps, TableActionsCore } from '../shared/components/TableActions';
import { Button } from './Button';

export { TABLE_ACTIONS_HEADER } from '../shared/components/TableActions';

export type TableActionProps = TableActionCoreProps;

export const TableActions = (props: TableActionProps): JSX.Element => {
  return <TableActionsCore {...props} ButtonComponent={Button} />;
};
