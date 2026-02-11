import React from 'react';
import { Image, View } from 'react-native';

import { useBootStrapData, useTheme } from '../ContextProvider';
import { CaptionText } from './CaptionText';

type LUDSFeedbackProps = {
  missingComplexity: number;
  missingCharacters: number;
};

export const LUDSFeedback = (props: LUDSFeedbackProps) => {
  const theme = useTheme();
  const bootstrapData = useBootStrapData();
  const minimumLength = bootstrapData.passwordConfig?.ludsMinimumCount ?? 0;
  const minimumComplexity = bootstrapData.passwordConfig?.ludsComplexity ?? 0;
  const isValidLength = props.missingCharacters == 0;
  const isValidComplexity = props.missingComplexity == 0;
  return (
    <View style={{ marginBottom: 16 }} testID="LUDSFeedback">
      <View
        style={{
          flexDirection: 'row',
          alignContent: 'flex-start',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
        }}
      >
        <View style={{ width: 16, height: 16, marginEnd: 4 }}>
          {(isValidLength && <Image testID="ValidLength" source={require('../../assets/check.png')} />) || (
            <Image testID="InvalidLength" source={require('../../assets/cross.png')} />
          )}
        </View>
        <CaptionText
          marginBottom={8}
          color={(isValidLength && theme.successColor) || theme.errorColor}
          text={`Must be at least ${minimumLength} characters long`}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignContent: 'flex-start',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
        }}
      >
        <View style={{ width: 16, height: 16, marginEnd: 4 }}>
          {(isValidComplexity && <Image testID="ValidComplexity" source={require('../../assets/check.png')} />) || (
            <Image testID="InvalidComplexity" source={require('../../assets/cross.png')} />
          )}
        </View>
        <CaptionText
          marginBottom={0}
          color={(isValidComplexity && theme.successColor) || theme.errorColor}
          text={`Must contain ${minimumComplexity} of the following: uppercase letter, lowercase letter, number, symbol`}
        />
      </View>
    </View>
  );
};
