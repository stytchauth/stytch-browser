import CheckIcon from '@mui/icons-material/CheckRounded';
import Close from '@mui/icons-material/Close';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
  IconButton,
  Autocomplete as MuiAutocomplete,
  OutlinedTextFieldProps,
  TextField,
  Typography,
  autocompleteClasses,
  inputBaseClasses,
  outlinedInputClasses,
  styled,
} from '@mui/material';
import React, { MouseEventHandler, ReactNode, useState } from 'react';
import { SelectContainer } from '../shared/components/Select';
import { FlexBox } from './FlexBox';
import { Label } from './Label';
import { Tag } from './Tag';
import { useUniqueId } from '../../utils/uniqueId';

const StyledAutocomplete = styled(MuiAutocomplete)(({ theme }) => ({
  [`& .${inputBaseClasses.root}`]: {
    padding: theme.spacing(1),
    gap: theme.spacing(0.5),
    color: theme.styleConfig.inputs.textColor,
  },
  [`& .${outlinedInputClasses.input}.${autocompleteClasses.input}`]: {
    padding: 0,
    height: 24,
    '&::placeholder': {
      color: theme.styleConfig.inputs.placeholderColor,
      opacity: 1,
    },
    '&:hover': {
      borderColor: theme.styleConfig.inputs.textColor,
    },
  },
  [`& .${outlinedInputClasses.notchedOutline}`]: {
    border: '1px solid',
    borderRadius: theme.styleConfig.inputs.borderRadius,
    borderColor: theme.styleConfig.inputs.borderColor,
  },
  [`&:hover .${outlinedInputClasses.root} .${outlinedInputClasses.notchedOutline}, .${outlinedInputClasses.root}.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline}`]:
    {
      borderWidth: 1,
      borderColor: theme.styleConfig.inputs.textColor,
    },
  [`& .${autocompleteClasses.tag}`]: {
    margin: 0,
  },
})) as typeof MuiAutocomplete;

interface AutocompleteTagReceivedProps {
  className?: string;
  ['data-tag-index']?: number;
  disabled?: boolean;
  onDelete?: MouseEventHandler<HTMLElement>;
  tabIndex?: number;
}

interface AutocompleteTagProps extends AutocompleteTagReceivedProps {
  children: ReactNode;
}

const StyledIconButton = styled(IconButton)({
  padding: '3px',
});

const AutocompleteTag = ({ children, onDelete, ...props }: AutocompleteTagProps) => {
  return (
    <Tag {...props} size="small" hasTopAndBottomPadding={false}>
      <FlexBox gap={0.5} alignItems="center">
        {children}
        {onDelete && (
          <StyledIconButton size="small" onClick={onDelete}>
            <Close fontSize="small" />
          </StyledIconButton>
        )}
      </FlexBox>
    </Tag>
  );
};

const Input = (props: Omit<OutlinedTextFieldProps, 'variant'>) => {
  return <TextField {...props} variant="outlined" />;
};

export interface AutocompleteProps<TSelectItem> {
  caption?: string;
  fullWidth?: boolean;
  getOptionDescription?: (item: TSelectItem) => string | undefined;
  getOptionDisabled?: (item: TSelectItem) => boolean;
  getOptionLabel?: (item: TSelectItem) => string;
  id?: string;
  label?: ReactNode;
  menuAnchorHorizontal?: 'left' | 'right' | 'center';
  selectItems: TSelectItem[];
  onChange?: (value: TSelectItem[]) => void;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  value: TSelectItem[];
}

const defaultGetOptionLabel = <T,>(item: T) => item as string;

export const Autocomplete = <TSelectItem,>({
  caption,
  fullWidth,
  getOptionDescription,
  getOptionDisabled,
  getOptionLabel = defaultGetOptionLabel,
  id,
  label,
  onChange,
  placeholder,
  required,
  selectItems,
  value,
}: AutocompleteProps<TSelectItem>) => {
  const selectId = useUniqueId(id);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SelectContainer fullWidth={fullWidth}>
      {label && (
        <Label htmlFor={selectId} required={required} variant="caption" labelColor="secondary">
          {label}
        </Label>
      )}
      <StyledAutocomplete
        popupIcon={<ExpandMore />}
        fullWidth
        id={selectId}
        multiple
        onChange={(_, newValue, reason) => {
          if (onChange) {
            if (reason === 'clear' && getOptionDisabled) {
              // Retain any selected values that are also disabled (i.e., should
              // not be clearable)
              onChange(value.filter((item) => getOptionDisabled(item)));
            } else {
              onChange(newValue);
            }
          }
        }}
        onClose={() => setIsOpen(false)}
        onOpen={() => setIsOpen(true)}
        open={isOpen}
        value={value}
        options={selectItems}
        getOptionDisabled={getOptionDisabled}
        getOptionLabel={getOptionLabel}
        renderOption={(props, option, state) => {
          const description = getOptionDescription?.(option);
          return (
            <li {...props}>
              <FlexBox gap={0.5} alignItems="center">
                <CheckIcon
                  fontSize="small"
                  style={{ visibility: state.selected ? 'visible' : 'hidden' }}
                  aria-hidden={!state.selected}
                />
                <div>
                  {getOptionLabel(option)}
                  {description && <Typography variant="body2">{description}</Typography>}
                </div>
              </FlexBox>
            </li>
          );
        }}
        renderInput={(params) => <Input {...params} placeholder={placeholder} />}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const { onDelete, ...tagProps } = getTagProps({ index });
            return (
              <AutocompleteTag {...tagProps} onDelete={getOptionDisabled?.(option) ? undefined : onDelete}>
                {getOptionLabel(option)}
              </AutocompleteTag>
            );
          })
        }
      />
      {caption && <Typography variant="body2">{caption}</Typography>}
    </SelectContainer>
  );
};
