import { styled, SxProps, Theme } from '@mui/material';
import React, { FC } from 'react';

import { useUniqueId } from '../../../utils/uniqueId';
import { CODE_HORIZONTAL_PADDING } from './Code';
import { InjectedComponents } from './componentInjection';

const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

const Wrapper = styled('span')<{ noWrap?: boolean; hasCopiedIcon: boolean }>(({ theme, noWrap, hasCopiedIcon }) => [
  {
    '&:hover': {
      marginRight: 0,
      '& svg': {
        display: 'block',
      },
      cursor: 'pointer',
    },
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    height: 'fit-content',
    width: 'fit-content',
    // Make sure when not hovered that the component takes up the same space as with the copy icon
    marginRight: hasCopiedIcon ? 0 : theme.spacing(3.5),
  },
  noWrap ? { wordBreak: 'unset', whiteSpace: 'nowrap' } : {},
  !hasCopiedIcon && {
    '& svg': {
      marginRight: theme.spacing(CODE_HORIZONTAL_PADDING),
      display: 'none',
    },
  },
]);

const CopyIconWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  '& svg': {
    marginRight: theme.spacing(CODE_HORIZONTAL_PADDING),
  },
}));

export type CopyableTextCoreProps = {
  children?: string;
  textToCopy?: string;
  noWrap?: boolean;
  id?: string;
  label?: string;
  wrapperSx?: SxProps<Theme>;
};

export const CopyableTextCore = ({
  children,
  textToCopy,
  noWrap,
  id,
  label,
  wrapperSx,
  CodeComponent: Code,
  LabelComponent: Label,
  TypographyComponent: Typography,
  useClickToCopy,
}: CopyableTextCoreProps & InjectedComponents<'Code' | 'Label' | 'Typography' | 'useClickToCopy'>): JSX.Element => {
  const inputId = useUniqueId(id);

  if (children && typeof children !== 'string') {
    throw new Error('CopyableText children must be a string');
  }

  const childrenString = typeof children === 'string' ? children : '';
  const { copied, copyToClipboard, CopyIcon } = useClickToCopy({
    text: textToCopy ?? childrenString,
  });

  return (
    <Container>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      {!children && <Typography>–</Typography>}
      {children && (
        <Wrapper hasCopiedIcon={copied} noWrap={noWrap} onClick={copyToClipboard} sx={wrapperSx}>
          <Code>{children}</Code>
          <CopyIconWrapper>{CopyIcon}</CopyIconWrapper>
        </Wrapper>
      )}
    </Container>
  );
};

export interface CopyableTruncatedIdCoreProps {
  children: string;
}

export const CopyableTruncatedIdCore: FC<CopyableTruncatedIdCoreProps & InjectedComponents<'CopyableText'>> = ({
  children,
  CopyableTextComponent,
}) => {
  const truncatedId = children.length < 9 ? children : `${children.slice(0, 4)}...${children.slice(-4)}`;
  return (
    <CopyableTextComponent noWrap textToCopy={children}>
      {truncatedId}
    </CopyableTextComponent>
  );
};
