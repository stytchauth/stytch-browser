import { COUNTRIES_LIST } from '@stytch/core';
import { CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { CountryPicker, ItemTemplateProps, ListHeaderComponentProps } from 'react-native-country-codes-picker';

import { useGlobalReducer, useTheme } from '../ContextProvider';
import { useUpdateMemberPhoneNumber } from '../hooks/updateMemberPhoneNumber';
import { useFonts } from '../hooks/useFonts';
import { StytchButton } from './StytchButton';
import { StytchInput } from './StytchInput';

type PhoneEntryFormProps = {
  onValidPhoneNumberEntered(): void;
};

export const PhoneEntryForm = (props: PhoneEntryFormProps) => {
  const theme = useTheme();
  const [state] = useGlobalReducer();
  const { setMemberPhoneNumber } = useUpdateMemberPhoneNumber();
  const { getFontFor } = useFonts();
  const [phoneNumberIsValid, setPhoneNumberIsValid] = useState<boolean | undefined>();
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState<string | undefined>();
  const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCode>('US');
  const onPhoneNumberChanged = (phoneNumber: string | undefined) => {
    setMemberPhoneNumber(state.mfaState.smsOtp.enrolledNumber?.countryCode ?? '', phoneNumber);
  };
  const onCountryCodeChanged = (countryCode: CountryCode, dialCode: string) => {
    setSelectedCountryCode(countryCode);
    setMemberPhoneNumber(dialCode, state.mfaState.smsOtp.enrolledNumber?.phoneNumber);
  };
  useEffect(() => {
    if (
      state.mfaState.smsOtp.enrolledNumber?.phoneNumber == undefined ||
      state.mfaState.smsOtp.enrolledNumber?.phoneNumber == ''
    ) {
      setFormattedPhoneNumber(state.mfaState.smsOtp.enrolledNumber?.phoneNumber);
      return;
    }
    const phoneNumber = parsePhoneNumberFromString(state.mfaState.smsOtp.enrolledNumber?.phoneNumber, {
      defaultCountry: selectedCountryCode,
      extract: false,
    });
    const formatted = phoneNumber?.formatNational() ?? state.mfaState.smsOtp.enrolledNumber?.phoneNumber;
    setFormattedPhoneNumber(phoneNumber?.isValid() ? formatted : state.mfaState.smsOtp.enrolledNumber?.phoneNumber);
    setPhoneNumberIsValid(phoneNumber?.isValid());
  }, [
    state.mfaState.smsOtp.enrolledNumber?.countryCode,
    state.mfaState.smsOtp.enrolledNumber?.phoneNumber,
    selectedCountryCode,
  ]);

  const [showCountryCodePicker, setShowCountryCodePicker] = useState(false);
  return (
    <View testID="PhoneEntryForm">
      <View
        style={{
          flexDirection: 'row',
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableWithoutFeedback testID="CountryCodePicker" onPress={() => setShowCountryCodePicker(true)}>
          <Text
            style={{
              backgroundColor: theme.inputBackgroundColor,
              borderColor: theme.inputBorderColor,
              borderWidth: 1,
              borderRadius: theme.inputBorderRadius,
              fontFamily: getFontFor('IBMPlexSans_Regular'),
              fontSize: 18,
              color: theme.inputTextColor,
              marginBottom: 12,
              paddingVertical: 0,
              paddingHorizontal: 16,
              width: '30%',
              height: 50,
              lineHeight: 50,
              textAlign: 'center',
            }}
          >
            {state.mfaState.smsOtp.enrolledNumber?.countryCode}
          </Text>
        </TouchableWithoutFeedback>
        <View style={{ width: '67%' }}>
          <StytchInput
            onChangeText={onPhoneNumberChanged}
            value={formattedPhoneNumber}
            placeholder="(123) 456-7890"
            keyboardType="phone-pad"
            autoComplete="tel"
            onSubmitEditing={() => {
              if (phoneNumberIsValid) {
                props.onValidPhoneNumberEntered();
              }
            }}
          />
        </View>
      </View>
      <StytchButton enabled={phoneNumberIsValid == true} text="Continue" onPress={props.onValidPhoneNumberEntered} />
      <CountryPicker
        lang="en"
        popularCountries={['US', 'CA', 'GB']}
        show={showCountryCodePicker}
        pickerButtonOnPress={(item) => {
          onCountryCodeChanged(item.code as CountryCode, item.dial_code);
          setShowCountryCodePicker(false);
        }}
        ListHeaderComponent={ListHeaderComponent}
        itemTemplate={CountryButton}
        showOnly={Object.keys(COUNTRIES_LIST)}
        style={{ modal: { height: '50%' } }}
        onBackdropPress={() => setShowCountryCodePicker(false)}
      />
    </View>
  );
};

const CountryButton = ({ item, name, style, ...rest }: ItemTemplateProps) => {
  return (
    <TouchableOpacity
      style={{
        paddingVertical: 10,
        backgroundColor: '#f5f5f5',
        width: '100%',
        height: 50,
        paddingHorizontal: 25,
        alignItems: 'center',
        marginVertical: 2,
        flexDirection: 'row',
        borderRadius: 10,
      }}
      testID="countryCodesPickerCountryButton"
      {...rest}
    >
      <Text
        style={[
          {
            flex: 0.2,
          },
          style?.flag,
        ]}
      >
        {item?.flag}
      </Text>
      <Text
        style={[
          {
            flex: 0.3,
          },
          style?.dialCode,
        ]}
      >
        {item?.dial_code}
      </Text>
      <Text
        style={[
          {
            flex: 1,
          },
          style?.countryName,
        ]}
        numberOfLines={1}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
};

function ListHeaderComponent({ countries, onPress }: ListHeaderComponentProps) {
  return (
    <View>
      {countries?.map((country, index) => {
        return (
          <CountryButton key={index} item={country} name={country?.name?.['en']} onPress={() => onPress(country)} />
        );
      })}
    </View>
  );
}
