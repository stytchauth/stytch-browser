import { OutlinedInput, OutlinedInputProps, styled, SxProps, Theme } from '@mui/material';
import React, { ChangeEventHandler, useEffect, useState } from 'react';

import { useUniqueId } from '../../../utils/uniqueId';
import { InjectedComponents } from './componentInjection';
import { DEFAULT_GRID_COLUMN_WIDTH, DEFAULT_MAX_ITEM_WIDTH } from './constants';

const InputContainer = styled('div')<{
  isMultiline?: boolean;
  isReadOnly?: boolean;
  fullWidth?: boolean;
}>(({ isMultiline, isReadOnly, fullWidth, theme }) => [
  {
    [theme.breakpoints.down('md')]: {
      width: '100%',
      minWidth: 'unset',
      flex: 1,
    },
    width: DEFAULT_GRID_COLUMN_WIDTH,
    minWidth: DEFAULT_GRID_COLUMN_WIDTH,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
  isMultiline && {
    width: '100%',
    maxWidth: DEFAULT_MAX_ITEM_WIDTH,
  },
  isReadOnly && {
    // Need this to wrap text and ellipsis after two lines
    display: '-webkit-box',
    '-webkit-line-clamp': '2',
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
    overflowWrap: 'break-word',
  },
  fullWidth && {
    width: '100%',
  },
]);

const FileUploadContainer = styled('label')(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  marginBottom: theme.spacing(0.5),
  gap: theme.spacing(0.5),
}));

const FileUploadHidden = styled('input')({ display: 'none' });

export type InputCoreProps = {
  caption?: string;
  copyable?: boolean;
  disabled?: boolean;
  error?: string;
  fileUpload?: boolean;
  fullWidth?: boolean;
  id?: string;
  inputProps?: OutlinedInputProps['inputProps'];
  inputRef?: OutlinedInputProps['inputRef'];
  label?: string;
  multiline?: boolean;
  onBlur?: () => void;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onKeyDown?: OutlinedInputProps['onKeyDown'];
  placeholder?: string;
  readOnly?: boolean;
  readOnlyConcealed?: boolean;
  required?: boolean;
  type?: OutlinedInputProps['type'];
  value?: string;
  inputSx?: SxProps<Theme>;
};

const FILE_UPLOAD_ID = 'file-upload';
type FileReaderProps = Pick<InputCoreProps, 'onChange' | 'readOnly'> & {
  filename: string | null;
  setFilename: (fileName: string | null) => void;
};

const FileUpload = ({
  onChange,
  readOnly,
  filename,
  setFilename,
  ButtonComponent: Button,
  TypographyComponent: Typography,
}: FileReaderProps & InjectedComponents<'Button' | 'Typography'>): JSX.Element => {
  const [fileReader] = useState(new FileReader());
  // Need random id to map between multiple fileInputs with potentially the same value.
  const fileInputKey = Math.floor(Math.random() * 10000);

  useEffect(() => {
    const onLoad = () => {
      if (typeof fileReader.result === 'string') {
        onChange?.(fileReader.result);
      }
    };
    fileReader.addEventListener('load', onLoad);
    return () => fileReader.removeEventListener('load', onLoad);
  }, [fileReader, onChange]);

  useEffect(() => {
    setFilename(null);
  }, [readOnly, setFilename]);

  const onFileUpload: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files ? event.target.files[0] : null;
    const filename = file?.name ? file.name.replace('C:\\fakepath\\', '') : null;
    setFilename(filename);
    if (file) {
      fileReader.readAsText(file);
    }
  };

  // The file input onChange handler won't get called if the user tries to upload the same file again.
  // This method resets the file value to be empty so that the same file can be read again.
  const resetFileUpload = () => {
    const inputElement = document.querySelector('input[type=file]') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = '';
    }
  };

  // The input value always starts with C:\\fakepath\\, so remove it from filename
  const uploadedFilename = filename ?? 'No file chosen';
  const fileInputId = `${FILE_UPLOAD_ID}-${fileInputKey}`;

  return (
    <FileUploadContainer htmlFor={fileInputId}>
      <FileUploadHidden id={fileInputId} onChange={onFileUpload} onClick={resetFileUpload} type="file" />
      {/* The above input is set to display: none so we can use custom component styling below */}
      {/* Button must be set to component="span" for this to work */}
      <Button compact component="span" variant="ghost">
        Choose file
      </Button>
      <Typography>{uploadedFilename}</Typography>
    </FileUploadContainer>
  );
};

export const InputCore = ({
  caption,
  copyable,
  disabled,
  error,
  fileUpload,
  fullWidth,
  id,
  inputProps,
  inputRef,
  label,
  multiline,
  onBlur,
  onChange,
  onFocus,
  onKeyDown,
  placeholder,
  readOnly,
  readOnlyConcealed,
  required,
  type,
  value,
  inputSx,
  ButtonComponent,
  CopyableTextComponent: CopyableText,
  LabelComponent: Label,
  TypographyComponent: Typography,
}: InputCoreProps & InjectedComponents<'Button' | 'CopyableText' | 'Label' | 'Typography'>): JSX.Element => {
  const inputId = useUniqueId(id);
  const [filename, setFilename] = useState<string | null>(null);

  const handleOnChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange?.(e.target.value);

    if (fileUpload && filename) {
      setFilename(null);
    }
  };
  const showCaption = !!caption && !error;
  const concealedValue = value?.length ? '•'.repeat(Math.min(25, value.length)) : '';
  const visibleValue = readOnlyConcealed ? concealedValue : value;
  const shouldDisable = disabled && !readOnly;
  const showCopyableText = readOnly && copyable && !!visibleValue;
  const showPlainText = readOnly && (!copyable || !visibleValue);
  return (
    <InputContainer fullWidth={fullWidth} isMultiline={multiline} isReadOnly={readOnly}>
      {label && (
        <Label variant="caption" disabled={shouldDisable} htmlFor={inputId} required={required}>
          {label}
        </Label>
      )}
      {showPlainText && <Typography>{visibleValue || '–'}</Typography>}
      {showCopyableText && <CopyableText textToCopy={value}>{visibleValue}</CopyableText>}
      {!readOnly && (
        <>
          {fileUpload && (
            <FileUpload
              ButtonComponent={ButtonComponent}
              TypographyComponent={Typography}
              filename={filename}
              onChange={onChange}
              readOnly={shouldDisable}
              setFilename={setFilename}
            />
          )}
          <OutlinedInput
            sx={inputSx}
            disabled={shouldDisable}
            error={!!error}
            fullWidth
            id={inputId}
            inputProps={inputProps}
            inputRef={inputRef}
            multiline={multiline}
            onBlur={onBlur}
            onChange={handleOnChange}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            required={required}
            rows={3}
            type={type}
            value={value}
          />
          {showCaption && (
            <Typography disabled={shouldDisable} variant="caption" color="secondary">
              {caption}
            </Typography>
          )}
          {error && (
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          )}
        </>
      )}
    </InputContainer>
  );
};
