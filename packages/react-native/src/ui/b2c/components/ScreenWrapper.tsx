import React, { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { Watermark } from '../../shared/components/Watermark';
import { useBootStrapData, useGlobalReducer, useTheme } from '../ContextProvider';
import { Screen } from '../screens';
import { BackButton } from './BackButton';
import { ErrorResponseComponent } from './ErrorResponseComponent';

type ScreenWrapperProps = {
  testID: string;
  children: ReactNode;
};

export const ScreenWrapper = (props: ScreenWrapperProps) => {
  const [state] = useGlobalReducer();
  const theme = useTheme();
  const bootstrapData = useBootStrapData();
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingStart: 0,
        paddingTop: 64,
        paddingEnd: 0,
        paddingBottom: 0,
      }}
      style={{
        backgroundColor: theme.backgroundColor,
        flex: 1,
        flexGrow: 1,
      }}
      testID={props.testID}
    >
      <View style={{ paddingStart: 32, paddingEnd: 32, flex: 1, flexGrow: 1 }}>
        {state.screen != Screen.Main && state.screen != Screen.Success && <BackButton />}
        {props.children}
        {state.screenState.error && <ErrorResponseComponent error={state.screenState.error} />}
      </View>
      {bootstrapData.displayWatermark && <Watermark />}
    </ScrollView>
  );
};
