import SearchIcon from '@mui/icons-material/Search';
import { styled, SxProps, Theme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { Keys } from '../utils/keys';
import { InjectedComponents } from './componentInjection';
import { InputCoreProps } from './Input';

const SearchBarContainer = styled('div')({
  position: 'relative',
  width: '100%',
});

const IconContainer = styled('div')(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  position: 'absolute',
  bottom: 0,
  marginBottom: theme.spacing(1),
}));

const SearchIconContainer = styled(IconContainer)(({ theme }) => ({
  padding: theme.spacing(0.5, 1, 0, 1),
}));

const SlashIconContainer = styled(IconContainer)(({ theme }) => ({
  bottom: -2,
  right: 0,
  display: 'flex',
  position: 'absolute',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  justifyContent: 'center',
  marginRight: theme.spacing(1),
}));

const SlashIcon = styled('div')(({ theme }) => ({
  border: '1px solid',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0, 1),
}));

const SearchInputContainer = styled('div')(({ theme }) => ({
  '& input': {
    paddingLeft: `${theme.spacing(4)} !important`,
    paddingRight: `${theme.spacing(6)} !important`,
  },
  '&:hover': {
    cursor: 'pointer',
  },
}));

export type SearchBarCoreProps = Pick<InputCoreProps, 'label' | 'id' | 'onChange' | 'placeholder' | 'value'>;

export const SearchBarCore = ({
  InputComponent: Input,
  searchIconContainerSx,
  slashIconSx,
  slashIconContainerSx,
  ...inputProps
}: SearchBarCoreProps &
  InjectedComponents<'Input'> & {
    searchIconContainerSx?: SxProps<Theme>;
    slashIconSx?: SxProps<Theme>;
    slashIconContainerSx?: SxProps<Theme>;
  }): JSX.Element => {
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const [focused, setFocused] = useState(false);
  const onFocus = useCallback(() => setFocused(true), []);
  const onBlur = useCallback(() => setFocused(false), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (inputRef && !focused) {
        if ((e.metaKey && e.key === Keys.K) || e.key === Keys.ForwardSlash) {
          e.stopPropagation();
          inputRef.focus();
          if (e.key === Keys.ForwardSlash) {
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKey);

    return () => document.removeEventListener('keydown', handleKey);
  }, [inputRef, focused]);

  return (
    <SearchBarContainer>
      <SearchIconContainer sx={searchIconContainerSx}>
        <SearchIcon fontSize="small" />
      </SearchIconContainer>
      <SlashIconContainer sx={slashIconContainerSx}>
        <SlashIcon sx={slashIconSx}>/</SlashIcon>
      </SlashIconContainer>
      <SearchInputContainer>
        <Input {...inputProps} fullWidth inputRef={setInputRef} onBlur={onBlur} onFocus={onFocus} />
      </SearchInputContainer>
    </SearchBarContainer>
  );
};
