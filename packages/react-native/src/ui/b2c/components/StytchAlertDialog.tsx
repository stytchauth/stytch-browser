import React from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../ContextProvider';
import { PageTitle } from './PageTitle';
import { DialogButton } from './DialogButton';

type StytchAlertDialogProps = {
  onDismiss(): void;
  title: string;
  body: string;
  cancelText?: string;
  acceptText: string;
  onAccept(): void;
};

export const StytchAlertDialog = (props: StytchAlertDialogProps) => {
  const theme = useTheme();
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
        top: 0,
      }}
      testID="AlertDialog"
    >
      <TouchableWithoutFeedback onPress={props.onDismiss} testID="DialogShade">
        <View
          style={{
            width: '100%',
            height: '100%',
            flex: 1,
            position: 'absolute',
            left: 0,
            top: 0,
            opacity: 0.5,
            backgroundColor: '#000000',
          }}
        />
      </TouchableWithoutFeedback>
      <View style={{ borderRadius: 28, backgroundColor: '#ffffff', padding: 24 }}>
        <PageTitle title={props.title} color={theme.dialogTextColor} textAlign="left" />
        <Text
          style={{
            fontSize: 14,
            lineHeight: 20,
            letterSpacing: 0.1,
            color: theme.dialogTextColor,
            marginBottom: 32,
          }}
        >
          {props.body}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
          {props.cancelText && (
            <>
              <DialogButton onPress={props.onDismiss} text={props.cancelText} />
              <View style={{ width: 16 }} />
            </>
          )}
          <DialogButton text={props.acceptText} onPress={props.onAccept} />
        </View>
      </View>
    </View>
  );
};
