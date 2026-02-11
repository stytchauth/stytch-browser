import { useLingui } from '@lingui/react/macro';
import { COUNTRIES_LIST, CountryCode, ParsedPhoneNumberResponse } from '@stytch/core';
import React, { useRef, useState } from 'react';

import { Chevron } from '../../../assets';
import { ClientsideServicesProvider } from '../../../ClientsideServicesProvider';
import { useErrorProps } from '../../../utils/accessibility';
import { formatNumber } from '../../../utils/handleParsePhoneNumber';
import { passwordManagerDisableAutofillProps } from '../../../utils/passwordManagerDisableAutofillProps';
import ErrorText from './ErrorText';
import Input from './Input';
import styles from './PhoneInput.module.css';

// What the library returns by default for the US
const DEFAULT_TEL_PLACEHOLDER = '(201) 555-0123';

export const getPhoneNumberProps = (
  clientsideServices: ClientsideServicesProvider,
): Pick<PhoneInputProps, 'getExampleNumber' | 'parsePhoneNumber'> => ({
  getExampleNumber: (countryCode: CountryCode) =>
    clientsideServices.getExamplePhoneNumber({ regionCode: countryCode }).then((res) => res.phoneNumber),

  parsePhoneNumber: (phoneNumber: string, countryCode?: CountryCode) =>
    clientsideServices.parsedPhoneNumber({
      phoneNumber,
      regionCode: countryCode,
    }),
});

export type PhoneInputProps = {
  phone: string;
  setPhone: (phone: string) => void;
  country: CountryCode;
  setCountry: (country: CountryCode) => void;
  parsePhoneNumber: (phoneNumber: string, countryCode?: CountryCode) => Promise<ParsedPhoneNumberResponse>;
  getExampleNumber: (countryCode: CountryCode) => Promise<string | undefined>;
  hasPasskeys?: boolean;
  error?: string;
};

const PhoneInput = ({
  phone,
  setPhone,
  country,
  setCountry,
  parsePhoneNumber,
  getExampleNumber,
  hasPasskeys,
  // Handle error ourselves instead of delegating down to <Input>
  // since the layout would be wrong in that case (it would appear to the right of the <select>)
  error,
  ...additionalProps
}: PhoneInputProps) => {
  const { t } = useLingui();

  const inputProps = useErrorProps(error);
  const countryFormatter = new Intl.DisplayNames(['en'], { type: 'region' });
  const [placeholder, setPlaceholder] = useState(DEFAULT_TEL_PLACEHOLDER);
  const inputRef = useRef<HTMLInputElement>(null);
  const [phoneValue, setPhoneValue] = useState(phone);

  return (
    <div className={styles.container}>
      <select
        aria-label={t({ id: 'formField.countryCode.label', message: 'Country code' })}
        className={styles.select}
        autoComplete="tel-country-code"
        value={country}
        onChange={async (e) => {
          const userInput = e.target.value as CountryCode;
          setCountry(userInput);
          inputRef.current?.focus();

          const newPlaceholder = await Promise.race([
            getExampleNumber(country), //
            new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 100)),
          ]);

          if (userInput !== e.target.value) return;
          setPlaceholder(newPlaceholder ?? DEFAULT_TEL_PLACEHOLDER);
        }}
      >
        {Object.entries(COUNTRIES_LIST).map(([code, number]) => (
          <option key={code} value={code}>
            {/* Hide the name of the selected country so it doesn't show up in the <select> */}
            {code !== country ? `+${number} ${countryFormatter.of(code)}` : `+${number}`}
          </option>
        ))}
      </select>

      <Chevron className={styles.chevron} role="presentation" />

      <Input
        id="phone-input"
        label={t({ id: 'formField.phone.label', message: 'Phone number' })}
        hideLabel
        ref={inputRef}
        type="tel"
        autoComplete={hasPasskeys ? 'username webauthn' : 'tel-national'}
        containerClassName={styles.phone}
        value={phoneValue}
        placeholder={placeholder}
        onChange={async (e) => {
          const userInput = e.target.value;
          setPhoneValue(userInput);

          const national = await formatNumber({
            parsePhoneNumber,
            phoneNumber: userInput,
            country,
          });

          // Disregard stale results
          if (userInput !== e.target.value) {
            return;
          }

          setPhone(national);
          setPhoneValue(national);
        }}
        required
        {...inputProps.input}
        // We want to block 1PW's autofill when passkeys is enabled for now
        // (it is breaking to our integration)
        {...(hasPasskeys ? passwordManagerDisableAutofillProps : {})}
        {...additionalProps}
      />

      {error && (
        <div className={styles.error}>
          <ErrorText {...inputProps.error}>{error}</ErrorText>
        </div>
      )}
    </div>
  );
};

export default PhoneInput;
