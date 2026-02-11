import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../ContextProvider';
import { CaptionText } from './CaptionText';

type ZXCVBNFeedbackProps = {
  score: number;
  suggestions: string[];
};

export const ZXCVBNFeedback = (props: ZXCVBNFeedbackProps) => {
  const theme = useTheme();
  const emptyColor = theme.inputBorderColor;
  let filledColor: string;
  let text: string;
  if (props.score < 3) {
    filledColor = theme.errorColor;
    text = props.suggestions.join(', ');
  } else {
    filledColor = theme.successColor;
    text = 'Great job! This is a strong password.';
  }
  return (
    <View style={{ marginBottom: 24, width: '100%' }} testID="ZXCVBNFeedback">
      <View
        style={{
          flex: 1,
          flexGrow: 1,
          flexDirection: 'row',
          alignContent: 'space-between',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
          width: '100%',
        }}
      >
        {[...Array(4)].map((e, i) => {
          let boxColor;
          if (props.score >= i) {
            boxColor = filledColor;
          } else {
            boxColor = emptyColor;
          }
          return (
            <View
              testID="ZXCVBNCell"
              key={`box-${i}`}
              style={{ flex: 0.24, height: 4, backgroundColor: boxColor }}
            ></View>
          );
        })}
      </View>
      <CaptionText text={text} color={filledColor} />
    </View>
  );
};
