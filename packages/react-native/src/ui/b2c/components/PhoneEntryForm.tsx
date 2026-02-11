import React, { useState, useEffect } from 'react';
import { Text, TouchableWithoutFeedback, View, TouchableOpacity } from 'react-native';
import { useUpdateUserPhoneNumber } from '../hooks/updateUserPhoneNumber';
import { useGlobalReducer, useTheme } from '../ContextProvider';
import { StytchInput } from './StytchInput';
import { StytchButton } from './StytchButton';
import { CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js';
import { CountryPicker, ItemTemplateProps, ListHeaderComponentProps } from 'react-native-country-codes-picker';
import { useFonts } from '../hooks/useFonts';
import { COUNTRIES_LIST } from '@stytch/core';

type PhoneEntryFormProps = {
  onValidPhoneNumberEntered(): void;
};

export const PhoneEntryForm = (props: PhoneEntryFormProps) => {
  const theme = useTheme();
  const [state] = useGlobalReducer();
  const { setUserPhoneNumber } = useUpdateUserPhoneNumber();
  const { getFontFor } = useFonts();
  const [phoneNumberIsValid, setPhoneNumberIsValid] = useState<boolean | undefined>();
  const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCode>('US');
  const onPhoneNumberChanged = (phoneNumber: string | undefined) => {
    const formattedPhoneNumber = phoneNumber
      ? parsePhoneNumberFromString(phoneNumber, selectedCountryCode)?.formatNational()
      : '';
    setUserPhoneNumber(state.userState.phoneNumber.countryCode, phoneNumber, formattedPhoneNumber);
  };
  const onCountryCodeChanged = (countryCode: CountryCode, dialCode: string) => {
    const formattedPhoneNumber = state.userState.phoneNumber.phoneNumber
      ? parsePhoneNumberFromString(state.userState.phoneNumber.phoneNumber, countryCode)?.formatNational()
      : '';
    setSelectedCountryCode(countryCode);
    setUserPhoneNumber(dialCode, state.userState.phoneNumber.phoneNumber, formattedPhoneNumber);
  };
  useEffect(() => {
    if (state.userState.phoneNumber.phoneNumber == undefined || state.userState.phoneNumber.phoneNumber == '') {
      return;
    }
    setPhoneNumberIsValid(
      parsePhoneNumberFromString(state.userState.phoneNumber.phoneNumber, selectedCountryCode)?.isValid(),
    );
  }, [state.userState.phoneNumber.phoneNumber, selectedCountryCode]);

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
            {state.userState.phoneNumber.countryCode}
          </Text>
        </TouchableWithoutFeedback>
        <View style={{ width: '67%' }}>
          <StytchInput
            onChangeText={onPhoneNumberChanged}
            value={state.userState.phoneNumber.formattedPhoneNumber}
            placeholder="(123) 456-7890"
            keyboardType="phone-pad"
            autoComplete="tel"
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
