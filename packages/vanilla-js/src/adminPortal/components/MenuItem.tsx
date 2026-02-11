import React from 'react';
import { Typography } from './Typography';
import { MenuItemCore, MenuItemCoreProps } from '../shared/components/MenuItem';

export type { MenuItemFields } from '../shared/components/MenuItem';

type MenuItemProps = MenuItemCoreProps;

export const MenuItem = (props: MenuItemProps): JSX.Element => {
  return <MenuItemCore {...props} TypographyComponent={Typography} />;
};
