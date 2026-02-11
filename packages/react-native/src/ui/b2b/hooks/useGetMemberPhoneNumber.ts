import parsePhoneNumberFromString, { format, ParsedNumber, parseNumber } from 'libphonenumber-js';
import { useGlobalReducer } from '../ContextProvider';

export const useGetMemberPhoneNumber = () => {
  const [state] = useGlobalReducer();

  const getParsedNumber = (): ParsedNumber | object => {
    const {
      primaryInfo,
      smsOtp: { enrolledNumber },
    } = state.mfaState;
    if (primaryInfo?.memberPhoneNumber && primaryInfo?.memberPhoneNumber != '') {
      return parseNumber(primaryInfo?.memberPhoneNumber);
    }
    const parsedNumberOnly = parseNumber(`${enrolledNumber?.phoneNumber}`);
    const parsedNumberAndCountryCode = parseNumber(`${enrolledNumber?.countryCode} ${enrolledNumber?.phoneNumber}`);
    if ('phone' in (parsedNumberOnly as ParsedNumber)) {
      return parsedNumberOnly;
    }
    return parsedNumberAndCountryCode;
  };

  const getE164Number = () => format(getParsedNumber() as ParsedNumber, 'E.164');

  const getNationalNumberAsString = () => {
    const {
      primaryInfo,
      smsOtp: { enrolledNumber },
    } = state.mfaState;
    const phoneNumber = (): string => {
      if (primaryInfo?.memberPhoneNumber && primaryInfo?.memberPhoneNumber != '') return primaryInfo?.memberPhoneNumber;
      return `${enrolledNumber?.countryCode}${enrolledNumber?.phoneNumber}`;
    };
    return parsePhoneNumberFromString(phoneNumber())?.formatNational();
  };

  return { getE164Number, getParsedNumber, getNationalNumberAsString };
};
