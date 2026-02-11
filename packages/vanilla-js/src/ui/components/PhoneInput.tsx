import React from 'react';

import { CountryCode, ParsedPhoneNumberResponse } from '@stytch/core';
import styled from 'styled-components';
import { passwordManagerDisableAutofillProps } from '../../utils/passwordManagerDisableAutofillProps';
import CountrySelector from './CountrySelector';
import { Flex } from './Flex';
import { Input } from './Input';
import { formatNumber } from '../../utils/handleParsePhoneNumber';
import { InputLabelProps } from '../../utils/accessibility';

const PhoneStyledInput = styled(Input)`
  flex-grow: 1;
  min-width: 100px;
`;

export const PhoneInput = ({
  phone,
  setPhone,
  country,
  setCountry,
  parsePhoneNumber,
  hasPasskeys,
  ...additionalProps
}: {
  phone: string;
  setPhone: (phone: string) => void;
  country: CountryCode;
  setCountry: (country: CountryCode) => void;
  parsePhoneNumber: (phoneNumber: string, countryCode?: CountryCode) => Promise<ParsedPhoneNumberResponse>;
  hasPasskeys?: boolean;
} & InputLabelProps) => {
  return (
    <Flex direction="row" wrap="nowrap" justifyContent="flex-start" alignContent="stretch" alignItems="center" gap={8}>
      <CountrySelector country={country} setCountry={setCountry} />
      <PhoneStyledInput
        name="phoneNumber"
        placeholder="(123) 456-7890"
        id="phone-input"
        autoComplete={hasPasskeys ? 'username webauthn' : undefined}
        value={phone}
        type="text"
        onChange={async (e) => {
          const userInput = e.target.value;
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
        }}
        required
        // We want to block 1PW's autofill when passkeys is enabled for now
        // (it is breaking to our integration)
        {...(hasPasskeys ? passwordManagerDisableAutofillProps : {})}
        {...additionalProps}
      />
    </Flex>
  );
};
