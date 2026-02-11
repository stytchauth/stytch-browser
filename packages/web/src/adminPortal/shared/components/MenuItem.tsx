import { MenuItem as MUIMenuItem, styled } from '@mui/material';
import React, { MouseEventHandler, ReactNode } from 'react';

import { FlexBox } from '../../components/FlexBox';
import { InjectedComponents } from './componentInjection';
import { OptionItem, Prettify } from './types';

const TextContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  textWrap: 'wrap',
});

const IconContainer = styled('div')<{ visible?: boolean }>(({ visible, theme }) => ({
  display: 'flex',
  marginRight: theme.spacing(1),
  visibility: visible ? 'visible' : 'hidden',
}));

const StyledMenuItem = styled(MUIMenuItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  flex: 1,
}));

export type MenuItemFields = Prettify<
  OptionItem & {
    /**
     * Subtext for the menu item.
     */
    subtext?: string;
    /**
     * Function to call when the menu item is clicked.
     */
    onClick?: MouseEventHandler<HTMLLIElement>;
  }
>;

export type MenuItemCoreProps = MenuItemFields & {
  /**
   * Icon to show on the left of the menu item
   */
  Icon?: ReactNode;
  /**
   * Whether the menu item is selected. Controls whether the icon shows.
   */
  selected?: boolean;
  /**
   * This prop is only used for the MUI Select component since the Select handles the onClick and selected props.
   * For other cases use the 'selected' prop instead.
   */
  forceSelected?: boolean;
};

export const MenuItemCore = ({
  Icon,
  disabled,
  forceSelected,
  label,
  onClick,
  selected,
  subtext,
  TypographyComponent: Typography,
}: MenuItemCoreProps & InjectedComponents<'Typography'>): JSX.Element => {
  return (
    <FlexBox alignItems="center" justifyContent="space-between">
      <StyledMenuItem data-value={label} disabled={disabled} onClick={onClick}>
        {Icon && <IconContainer visible={selected || forceSelected}>{Icon}</IconContainer>}
        <TextContainer>
          <Typography variant="body2">{label}</Typography>
          <Typography variant="caption">{subtext}</Typography>
        </TextContainer>
      </StyledMenuItem>
    </FlexBox>
  );
};
