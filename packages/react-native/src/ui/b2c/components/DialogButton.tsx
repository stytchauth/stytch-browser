import React from 'react';
import { Text, TouchableWithoutFeedback } from 'react-native';

import { useTheme } from '../ContextProvider';

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
