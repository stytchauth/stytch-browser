import { CountryCode, COUNTRIES_LIST, ParsedPhoneNumberResponse } from '@stytch/core';

type ParsePhoneNumber = (phoneNumber: string, countryCode?: CountryCode) => Promise<ParsedPhoneNumberResponse>;

type ParsePhoneParams = {
  parsePhoneNumber: ParsePhoneNumber;
  phoneNumber: string;
  country?: CountryCode;
};

// Attempts to format the number in the following format (XXX) XXX-XXXX.
export const formatNumber = async ({ parsePhoneNumber, phoneNumber, country }: ParsePhoneParams): Promise<string> => {
  try {
    const parsedPhoneNumber = await Promise.race([
      parsePhoneNumber(phoneNumber, country),
      new Promise<undefined>((done) => setTimeout(() => done(undefined), 10000)),
    ]);

    if (!parsedPhoneNumber) {
      return phoneNumber;
    }

    return parsedPhoneNumber.national;
  } catch {
    return phoneNumber;
  }
};

// Attempts to format the number in the following format +1XXXXXXXXXX.
export const formatNumberToIncludeCountryCode = async ({
  parsePhoneNumber,
  phoneNumber,
  country,
}: Required<ParsePhoneParams>): Promise<{
  isValid: boolean;
  number: string;
}> => {
  const code = COUNTRIES_LIST[country];

  const fallbackNumber = `+${code}${phoneNumber}`;

  const fallback = {
    isValid: true,
    number: fallbackNumber,
  };
  try {
    const parsedPhoneNumber = await Promise.race([
      parsePhoneNumber(phoneNumber, country),
      new Promise<undefined>((done) => setTimeout(() => done(undefined), 2000)),
    ]);

    if (!parsedPhoneNumber) {
      return fallback;
    }

    return parsedPhoneNumber;
  } catch {
    return fallback;
  }
};
