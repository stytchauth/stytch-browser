import React from 'react';
import { useTheme } from '../ContextProvider';
import { Text, TouchableWithoutFeedback } from 'react-native';

type DialogButtonProps = {
  text: string;
  onPress(): void;
};

export const DialogButton = (props: DialogButtonProps) => {
  const theme = useTheme();
  return (
    <TouchableWithoutFeedback onPress={props.onPress} testID="DialogButton">
      <Text
        style={{
          fontSize: 14,
          lineHeight: 20,
          letterSpacing: 0.1,
          color: theme.dialogTextColor,
        }}
      >
        {props.text}
      </Text>
    </TouchableWithoutFeedback>
  );
};
