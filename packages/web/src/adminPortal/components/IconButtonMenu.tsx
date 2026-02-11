import { IconButton, Menu, MenuItem, MenuItemProps, PopoverOrigin, styled } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { useUniqueId } from '../../utils/uniqueId';
import { FlexBox } from './FlexBox';
import { Typography, TypographyProps } from './Typography';

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1),
  '& svg': {
    height: 16,
    width: 16,
  },
}));

const StyledIconButton = styled(IconButton)({
  padding: '3px',
});

const anchorOrigin = { horizontal: 'center', vertical: 'bottom' } as const;
const transformOrigin = { horizontal: 'right', vertical: 'top' } as const;

export interface Action<T> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  isDangerous?: boolean;
  isVisible?: boolean | ((item: T) => boolean);
}

interface ActionMenuItemProps<T> extends Omit<MenuItemProps, 'button' | 'onClick'> {
  children: React.ReactNode;
  onClick: (item: T) => void;
  onClose: (() => void) | undefined;
  icon?: React.ReactNode;
  color?: TypographyProps['color'];
  item: T;
}

const ActionMenuItem = <T,>({ children, onClick, onClose, color, icon, item, ...rest }: ActionMenuItemProps<T>) => {
  const handleClick = useCallback(() => {
    onClick(item);
    onClose?.();
  }, [item, onClick, onClose]);

  return (
    <StyledMenuItem {...rest} disableRipple onClick={handleClick}>
      <Typography variant="body2" color={color}>
        <FlexBox alignItems="center">
          {icon}
          {children}
        </FlexBox>
      </Typography>
    </StyledMenuItem>
  );
};

interface IconButtonMenuProps<T> {
  actions: readonly Readonly<Action<T>>[];
  anchorEl?: HTMLElement;
  closeOnClick?: boolean;
  item: T;
  idPrefix: string;
  icon: React.ReactNode;
  menuAnchorOrigin?: PopoverOrigin;
  menuTransformOrigin?: PopoverOrigin;
  onOpen?: () => void;
  onClose?: () => void;
}

export const IconButtonMenu = <T,>({
  actions,
  anchorEl: anchorElProp,
  closeOnClick = true,
  icon,
  item,
  idPrefix,
  menuAnchorOrigin = anchorOrigin,
  menuTransformOrigin = transformOrigin,
  onClose,
  onOpen,
}: IconButtonMenuProps<T>) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();

  const handleClose = useCallback(() => {
    setAnchorEl(undefined);
    onClose?.();
  }, [onClose]);

  const handleOpen = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      onOpen?.();
      setAnchorEl(anchorElProp ?? e.currentTarget);
    },
    [anchorElProp, onOpen],
  );

  const id = useUniqueId(idPrefix);

  const children = useMemo(() => {
    return actions.map(({ key, label, onClick, icon, isDangerous, isVisible = true }) => {
      if (!isVisible || (typeof isVisible === 'function' && !isVisible(item))) {
        return null;
      }

      return (
        <ActionMenuItem
          key={key}
          item={item}
          onClick={onClick}
          onClose={closeOnClick ? handleClose : undefined}
          color={isDangerous ? 'error' : undefined}
          icon={icon}
        >
          {label}
        </ActionMenuItem>
      );
    });
  }, [actions, closeOnClick, handleClose, item]);

  const isOpen = !!anchorEl;

  return (
    <>
      <StyledIconButton
        disableTouchRipple
        aria-label="actions"
        color="inherit"
        onClick={handleOpen}
        aria-controls={id}
        aria-haspopup
        size="small"
      >
        {icon}
      </StyledIconButton>
      <Menu
        id={id}
        open={isOpen}
        anchorEl={anchorEl}
        variant="menu"
        anchorOrigin={menuAnchorOrigin}
        transformOrigin={menuTransformOrigin}
        onClose={handleClose}
      >
        {children}
      </Menu>
    </>
  );
};
