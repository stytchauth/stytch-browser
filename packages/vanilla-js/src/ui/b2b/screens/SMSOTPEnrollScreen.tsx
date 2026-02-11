import { B2BSMSSendResponse, StytchAPIError, StytchSDKError } from '@stytch/core/public';
import React, { FormEvent } from 'react';
import { COUNTRIES_LIST, CountryCode } from '@stytch/core';
import { readB2BInternals } from '../../../utils/internal';
import { ErrorText } from '../../components/ErrorText';
import { Flex } from '../../components/Flex';
import { PhoneInput } from '../../components/PhoneInput';
import { SubmitButton } from '../../components/SubmitButton';
import { Text } from '../../components/Text';
import { useConfig, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { StytchMutationKey, useMutate } from '../utils';
import { formatNumberToIncludeCountryCode } from '../../../utils/handleParsePhoneNumber';
import { useLingui } from '@lingui/react/macro';
import { getTranslatedError } from '../../../utils/getTranslatedError';
import { useErrorProps } from '../../../utils/accessibility';
import BackArrow from '../../../assets/backArrow';
import { canGoBack } from '../reducer/navigation';

// eslint-disable-next-line lingui/no-unlocalized-strings
const DEFAULT_COUNTRY_CODE = 'US' satisfies CountryCode;

/**
 * Thrown when the user provides a phone number that cannot be parsed.
 */
class InvalidPhoneNumberError extends StytchSDKError {
  constructor() {
    // eslint-disable-next-line lingui/no-unlocalized-strings
    super('InvalidPhoneNumberError', 'Invalid phone number');
  }
}

export const SMSOTPEnrollScreen = () => {
  const stytchClient = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const { t } = useLingui();
  const { smsOtpOptions } = useConfig();
  const {
    mfa: {
      smsOtp: { isSending, sendError, enrolledNumber },
    },
  } = state;

  // This screen should only be shown if primary info is available
  const { memberId, organizationId } = state.mfa.primaryInfo!;

  const [countryCode, setCountryCode] = React.useState<CountryCode>(
    enrolledNumber?.countryCode ?? DEFAULT_COUNTRY_CODE,
  );
  const [phoneNumber, setPhoneNumber] = React.useState(enrolledNumber?.phoneNumber ?? '');

  const errorMessage = React.useMemo(() => {
    if (!sendError) return undefined;

    if (sendError instanceof InvalidPhoneNumberError) {
      return t({
        id: 'error.invalidPhoneNumber',
        message: 'Phone number format is invalid. Ensure the phone number is in the E.164 format.',
      });
    }

    return getTranslatedError(sendError as StytchAPIError, t);
  }, [sendError, t]);

  const phoneProps = useErrorProps(errorMessage);
  const phoneInputLabel = t({ id: 'formField.phone.label', message: 'Phone number' });

  const parsePhoneNumber = (phoneNumber: string, countryCode?: CountryCode) => {
    return readB2BInternals(stytchClient).clientsideServices.parsedPhoneNumber({
      phoneNumber,
      regionCode: countryCode,
    });
  };

  const { trigger: sendSms } = useMutate<
    B2BSMSSendResponse,
    unknown,
    StytchMutationKey,
    { parsedNumber: string; locale?: string }
  >(
    'stytch.otps.sms.send',
    async (_: string, { arg: { parsedNumber, locale } }: { arg: { parsedNumber: string; locale?: string } }) => {
      return stytchClient.otps.sms.send({
        mfa_phone_number: parsedNumber,
        member_id: memberId,
        organization_id: organizationId,
        locale: locale,
      });
    },
    {
      onSuccess: (response) => {
        dispatch({
          type: 'sms_otp/send_success',
          response,
          countryCode,
          phoneNumber,
          formattedPhoneNumber: `+${COUNTRIES_LIST[countryCode]} ${phoneNumber}`,
        });
      },
      onError: (error) => {
        dispatch({
          type: 'sms_otp/send_error',
          error,
        });
      },
    },
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    dispatch({ type: 'sms_otp/send' });
    try {
      // We parse the phone number here (rather than inside `sendSms`) because we
      // don't want validation errors to be surfaced through the global error
      // callback

      const parsedNumber = await formatNumberToIncludeCountryCode({
        parsePhoneNumber,
        phoneNumber,
        country: countryCode,
      });

      if (!parsedNumber.isValid) {
        throw new InvalidPhoneNumberError();
      }

      await sendSms({ parsedNumber: parsedNumber.number, locale: smsOtpOptions?.locale });
    } catch (error) {
      dispatch({
        type: 'sms_otp/send_error',
        error,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap={24}>
        {canGoBack(state) && <BackArrow onClick={() => dispatch({ type: 'navigate_back' })} />}
        <Text size="header">
          {t({
            id: 'mfa.smsEnrollment.title',
            message: 'Enter your phone number to set up Multi-Factor Authentication',
          })}
        </Text>
        <Text>
          {t({
            id: 'mfa.smsEnrollment.content',
            message: 'Your organization requires an additional form of verification to make your account more secure.',
          })}
        </Text>
        <Flex direction="column">
          <PhoneInput
            country={countryCode}
            setCountry={setCountryCode}
            phone={phoneNumber}
            setPhone={setPhoneNumber}
            parsePhoneNumber={parsePhoneNumber}
            aria-label={phoneInputLabel}
            {...phoneProps.input}
          />
          {errorMessage && <ErrorText errorMessage={errorMessage} {...phoneProps.error} />}
        </Flex>
        <SubmitButton
          text={t({ id: 'button.continue', message: 'Continue' })}
          isSubmitting={isSending}
          disabled={!phoneNumber}
        />
      </Flex>
    </form>
  );
};
