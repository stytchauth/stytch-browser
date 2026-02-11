import React from 'react';

import { MenuItemCore, MenuItemCoreProps } from '../shared/components/MenuItem';
import { Typography } from './Typography';

export type { MenuItemFields } from '../shared/components/MenuItem';

type MenuItemProps = MenuItemCoreProps;

export const MenuItem = (props: MenuItemProps): JSX.Element => {
  return <MenuItemCore {...props} TypographyComponent={Typography} />;
};
