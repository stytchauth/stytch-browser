import { useLingui } from '@lingui/react/macro';
import { COUNTRIES_LIST, CountryCode } from '@stytch/core';
import { B2BSMSSendResponse, StytchAPIError, StytchSDKError } from '@stytch/core/public';
import React, { FormEvent } from 'react';

import { getTranslatedError } from '../../../utils/getTranslatedError';
import { formatNumberToIncludeCountryCode } from '../../../utils/handleParsePhoneNumber';
import { readB2BInternals } from '../../../utils/internal';
import Button from '../../components/atoms/Button';
import Column from '../../components/atoms/Column';
import Typography from '../../components/atoms/Typography';
import ButtonColumn from '../../components/molecules/ButtonColumn';
import PhoneInput, { getPhoneNumberProps } from '../../components/molecules/PhoneInput';
import { useConfig, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { canGoBack } from '../reducer/navigation';
import { StytchMutationKey, useMutate } from '../utils';

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

  const { parsePhoneNumber, getExampleNumber } = getPhoneNumberProps(readB2BInternals(stytchClient).clientsideServices);

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
    <Column as="form" gap={6} onSubmit={handleSubmit}>
      <Typography variant="header">
        {t({
          id: 'mfa.smsEnrollment.title',
          message: 'Enter your phone number to set up Multi-Factor Authentication',
        })}
      </Typography>

      <Typography variant="body">
        {t({
          id: 'mfa.smsEnrollment.content',
          message: 'Your organization requires an additional form of verification to make your account more secure.',
        })}
      </Typography>

      <PhoneInput
        country={countryCode}
        setCountry={setCountryCode}
        phone={phoneNumber}
        setPhone={setPhoneNumber}
        parsePhoneNumber={parsePhoneNumber}
        getExampleNumber={getExampleNumber}
        error={errorMessage}
      />

      <ButtonColumn>
        <Button variant="primary" loading={isSending} type="submit" disabled={!phoneNumber || isSending}>
          {t({ id: 'button.continue', message: 'Continue' })}
        </Button>
        {canGoBack(state) && (
          <Button variant="ghost" onClick={() => dispatch({ type: 'navigate_back' })}>
            {t({ id: 'button.goBack', message: 'Go back' })}
          </Button>
        )}
      </ButtonColumn>
    </Column>
  );
};
