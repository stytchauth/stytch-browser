import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../ContextProvider';
import { useFonts } from '../hooks/useFonts';

export type PageTitleProps = {
  title: string;
  color?: string;
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify' | undefined;
};

export const PageTitle = (props: PageTitleProps) => {
  const theme = useTheme();
  const { getFontFor } = useFonts();
  return (
    <Text
      testID="PageTitle"
      style={{
        fontFamily: getFontFor('IBMPlexSans_SemiBold'),
        fontSize: 24,
        lineHeight: 32,
        marginBottom: 32,
        textAlign: props.textAlign ?? 'left',
        color: props.color ?? theme.primaryTextColor,
      }}
    >
      {props.title}
    </Text>
  );
};
