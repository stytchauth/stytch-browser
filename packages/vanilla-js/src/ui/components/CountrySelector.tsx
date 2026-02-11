import React from 'react';
import styled from 'styled-components';
import { CountryCode, COUNTRIES_LIST } from '@stytch/core';
import { useLingui } from '@lingui/react/macro';

const Select = styled.select`
  background-color: ${(props) => props.theme.inputs.backgroundColor};
  border: 1px solid ${(props) => props.theme.inputs.borderColor};
  border-radius: ${(props) => props.theme.inputs.borderRadius};
  height: 47px;
  box-sizing: border-box;
  padding: 0 8px;
  color: ${(props) => props.theme.inputs.textColor};
  font-family: ${(props) => props.theme.typography.fontFamily};
  width: 80px;
  font-size: 18px;
`;

const CountrySelector = ({
  country,
  setCountry,
}: {
  country: CountryCode;
  setCountry: (country: CountryCode) => void;
}) => {
  const { t } = useLingui();
  const countryFormatter = new Intl.DisplayNames(['en'], { type: 'region' });

  return (
    <Select
      data-testid="select-test-id"
      name="country-select"
      aria-label={t({ id: 'formField.countryCode.label', message: 'Country code' })}
      value={country}
      onChange={(e) => {
        setCountry(e.target.value as CountryCode);
      }}
    >
      {Object.entries(COUNTRIES_LIST).map(([countryCode, countryNumber]) => (
        <option key={countryCode} value={countryCode}>
          {countryCode !== country ? `+${countryNumber} ${countryFormatter.of(countryCode)}` : `+${countryNumber}`}
        </option>
      ))}
    </Select>
  );
};

export default CountrySelector;
