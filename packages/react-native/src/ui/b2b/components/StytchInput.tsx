import React, { LegacyRef } from 'react';
import { DimensionValue, KeyboardTypeOptions, ReturnKeyTypeOptions, TextInput, TextInputProps } from 'react-native';

import { useTheme } from '../ContextProvider';
import { useFonts } from '../hooks/useFonts';

export type StytchInputProps = {
  onChangeText(text: string): void;
  placeholder?: string | undefined;
  value?: string | undefined;
  keyboardType?: KeyboardTypeOptions;
  editable?: boolean;
  secureTextEntry?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  autoCorrect?: boolean;
  width?: DimensionValue | undefined;
  height?: DimensionValue | undefined;
  padding?: number | undefined;
  autoFocus?: boolean;
  maxLength?: number;
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify' | undefined;
  reference?: LegacyRef<TextInput>;
};

export const StytchInput = (props: TextInputProps & StytchInputProps) => {
  const theme = useTheme();
  const { getFontFor } = useFonts();
  return (
    <TextInput
      testID="StytchInput"
      ref={props.reference}
      style={{
        backgroundColor: theme.inputBackgroundColor,
        borderColor: theme.inputBorderColor,
        borderWidth: 1,
        borderRadius: theme.inputBorderRadius,
        fontFamily: getFontFor('IBMPlexSans_Regular'),
        fontSize: 18,
        color: theme.inputTextColor,
        marginBottom: 12,
        paddingVertical: props.padding ?? 0,
        paddingHorizontal: props.padding ?? 16,
        width: props.width,
        height: props.height ?? 50,
        textAlign: props.textAlign,
      }}
      placeholder={props.placeholder}
      placeholderTextColor={theme.inputPlaceholderTextColor}
      onChangeText={props.onChangeText}
      keyboardType={props.keyboardType}
      value={props.value}
      editable={props.editable}
      secureTextEntry={props.secureTextEntry}
      multiline={false}
      returnKeyType={props.returnKeyType}
      autoComplete={props.autoComplete}
      autoCorrect={props.autoCorrect}
      autoCapitalize="none"
      autoFocus={props.autoFocus}
      maxLength={props.maxLength}
      onBlur={props.onBlur}
      onSubmitEditing={props.onSubmitEditing}
      onKeyPress={props.onKeyPress}
    />
  );
};
